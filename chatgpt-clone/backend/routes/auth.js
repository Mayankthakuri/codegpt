const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const supabase = require('../supabase');

// Helper to create JWT
function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Helper to get user from token
async function getUserFromToken(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', decoded.userId)
    .single();
  
  if (error) throw error;
  return data;
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        provider: 'local'
      })
      .select()
      .single();

    if (error) throw error;

    const token = createToken(data.id);

    res.json({
      token,
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        provider: data.provider
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (user.provider === 'google') {
      return res.status(400).json({ error: 'Please login with Google' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = createToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = createToken(req.user.id);
    res.redirect(`http://localhost:3000?token=${token}`);
  }
);

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = await getUserFromToken(token);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
        stats: user.stats || {},
        achievements: user.achievements || [],
        progress: user.progress || [],
        created_at: user.created_at
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update progress
router.post('/progress', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = await getUserFromToken(token);
    const { courseId, moduleId, lessonId, completed, quizScore, quizPassed } = req.body;

    let progress = user.progress || [];
    const progressIndex = progress.findIndex(
      p => p.courseId === courseId && p.moduleId === moduleId && p.lessonId === lessonId
    );

    if (progressIndex >= 0) {
      progress[progressIndex].completed = completed;
      progress[progressIndex].completedAt = completed ? new Date().toISOString() : null;
      if (quizScore !== undefined) progress[progressIndex].quizScore = quizScore;
      if (quizPassed !== undefined) progress[progressIndex].quizPassed = quizPassed;
    } else {
      progress.push({
        courseId,
        moduleId,
        lessonId,
        completed,
        completedAt: completed ? new Date().toISOString() : null,
        quizScore: quizScore || null,
        quizPassed: quizPassed || false
      });
    }

    // Update stats
    const stats = user.stats || {};
    stats.lessonsCompleted = progress.filter(p => p.completed).length;
    stats.quizzesPassed = progress.filter(p => p.quizPassed).length;
    stats.lastActive = new Date().toISOString();

    // Check achievements
    const achievements = checkAchievements(progress, stats, user.achievements || []);

    const { error } = await supabase
      .from('users')
      .update({ progress, stats, achievements })
      .eq('id', user.id);

    if (error) throw error;

    res.json({
      user: { progress, stats, achievements }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user progress
router.get('/progress', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = await getUserFromToken(token);

    res.json({
      progress: user.progress || [],
      achievements: user.achievements || [],
      stats: user.stats || {}
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function checkAchievements(progress, stats, existingAchievements) {
  const achievements = [...existingAchievements];
  const newAchievements = [
    { id: 'first-lesson', title: 'First Steps', description: 'Complete your first lesson', icon: '🎯', condition: stats.lessonsCompleted >= 1 },
    { id: 'five-lessons', title: 'Getting Started', description: 'Complete 5 lessons', icon: '📚', condition: stats.lessonsCompleted >= 5 },
    { id: 'ten-lessons', title: 'Dedicated Learner', description: 'Complete 10 lessons', icon: '🎓', condition: stats.lessonsCompleted >= 10 },
    { id: 'twenty-lessons', title: 'Knowledge Seeker', description: 'Complete 20 lessons', icon: '🧠', condition: stats.lessonsCompleted >= 20 },
    { id: 'first-quiz', title: 'Quiz Master', description: 'Pass your first quiz', icon: '✅', condition: stats.quizzesPassed >= 1 },
    { id: 'five-quizzes', title: 'Quiz Champion', description: 'Pass 5 quizzes', icon: '🏆', condition: stats.quizzesPassed >= 5 },
    { id: 'ten-quizzes', title: 'Quiz Legend', description: 'Pass 10 quizzes', icon: '👑', condition: stats.quizzesPassed >= 10 },
    { id: 'perfect-score', title: 'Perfectionist', description: 'Get 100% on a quiz', icon: '💯', condition: progress.some(p => p.quizScore === 100) },
  ];

  newAchievements.forEach(achievement => {
    if (!achievements.find(a => a.id === achievement.id) && achievement.condition) {
      achievements.push({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        earnedAt: new Date().toISOString()
      });
    }
  });

  return achievements;
}

module.exports = router;
