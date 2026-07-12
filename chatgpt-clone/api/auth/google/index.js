const jwt = require('jsonwebtoken');
const supabase = require('../../lib/supabase');

module.exports = async function handler(req, res) {
  const { code } = req.query;

  if (!code) return res.status(400).json({ error: 'No code provided' });

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/auth/google`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (tokens.error) throw new Error(tokens.error_description || tokens.error);

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userRes.json();

    // Find or create user
    let { data: user } = await supabase.from('users').select('*').eq('google_id', googleUser.id).single();

    if (!user) {
      const { data: existing } = await supabase.from('users').select('*').eq('email', googleUser.email).single();

      if (existing) {
        const { data } = await supabase.from('users').update({ google_id: googleUser.id, avatar: googleUser.picture || existing.avatar }).eq('id', existing.id).select().single();
        user = data;
      } else {
        const { data } = await supabase.from('users').insert({
          google_id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.picture || '',
          provider: 'google',
        }).select().single();
        user = data;
      }
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`/?token=${token}`);
  } catch (error) {
    res.redirect(`/?error=${encodeURIComponent(error.message)}`);
  }
}
