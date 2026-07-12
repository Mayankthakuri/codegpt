require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require('https');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const supabase = require('./supabase');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5001;

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    done(null, data);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists by google_id
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', profile.id)
      .single();

    if (!user) {
      // Check if user exists by email
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', profile.emails[0].value)
        .single();

      if (existingUser) {
        // Link Google account
        const { data } = await supabase
          .from('users')
          .update({
            google_id: profile.id,
            avatar: profile.photos[0]?.value || existingUser.avatar
          })
          .eq('id', existingUser.id)
          .select()
          .single();
        user = data;
      } else {
        // Create new user
        const { data } = await supabase
          .from('users')
          .insert({
            google_id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar: profile.photos[0]?.value || '',
            provider: 'google'
          })
          .select()
          .single();
        user = data;
      }
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.use('/auth', authRoutes);

// Chat API
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY not set in .env' });
  }

  const requestBody = JSON.stringify({
    model: 'deepseek/deepseek-v4-flash',
    messages: messages,
    stream: true
  });

  const options = {
    hostname: 'openrouter.ai',
    port: 443,
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'text/event-stream',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'ChatGPT Clone'
    }
  };

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const apiReq = https.request(options, (apiRes) => {
    let buffer = '';

    apiRes.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
            res.end();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch (e) {
            // skip invalid json
          }
        }
      }
    });

    apiRes.on('end', () => {
      if (buffer.startsWith('data: ')) {
        const data = buffer.slice(6);
        if (data === '[DONE]') {
          res.write('data: [DONE]\n\n');
        }
      }
      res.end();
    });
  });

  apiReq.on('error', (error) => {
    console.error('API error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  });

  apiReq.write(requestBody);
  apiReq.end();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
