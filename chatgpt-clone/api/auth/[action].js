const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../lib/supabase');

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  try {
    if (action === 'register' && req.method === 'POST') {
      const { email, password, name } = req.body;
      if (!email || !password || !name) return res.status(400).json({ error: 'All fields required' });

      const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
      if (existing) return res.status(400).json({ error: 'Email already registered' });

      const hashed = await bcrypt.hash(password, 10);
      const { data, error } = await supabase.from('users').insert({ email, password: hashed, name, provider: 'local' }).select().single();
      if (error) throw error;

      const token = createToken(data.id);
      return res.json({ token, user: { id: data.id, email: data.email, name: data.name, avatar: data.avatar, provider: data.provider } });
    }

    if (action === 'login' && req.method === 'POST') {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

      const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
      if (error || !user) return res.status(400).json({ error: 'Invalid credentials' });
      if (user.provider === 'google') return res.status(400).json({ error: 'Please login with Google' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

      const token = createToken(user.id);
      return res.json({ token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, provider: user.provider } });
    }

    if (action === 'me' && req.method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'No token' });

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { data: user, error } = await supabase.from('users').select('*').eq('id', decoded.userId).single();
      if (error || !user) return res.status(404).json({ error: 'User not found' });

      return res.json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, provider: user.provider, stats: user.stats || {}, achievements: user.achievements || [], progress: user.progress || [], created_at: user.created_at } });
    }

    if (action === 'progress' && req.method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'No token' });

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { data: user, error } = await supabase.from('users').select('progress, achievements, stats').eq('id', decoded.userId).single();
      if (error || !user) return res.status(404).json({ error: 'User not found' });

      return res.json({ progress: user.progress || [], achievements: user.achievements || [], stats: user.stats || {} });
    }

    if (action === 'progress' && req.method === 'POST') {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'No token' });

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { data: user, error: fetchError } = await supabase.from('users').select('*').eq('id', decoded.userId).single();
      if (fetchError || !user) return res.status(404).json({ error: 'User not found' });

      const { courseId, moduleId, lessonId, completed, quizScore, quizPassed } = req.body;
      let progress = user.progress || [];
      const idx = progress.findIndex(p => p.courseId === courseId && p.moduleId === moduleId && p.lessonId === lessonId);

      if (idx >= 0) {
        progress[idx].completed = completed;
        progress[idx].completedAt = completed ? new Date().toISOString() : null;
        if (quizScore !== undefined) progress[idx].quizScore = quizScore;
        if (quizPassed !== undefined) progress[idx].quizPassed = quizPassed;
      } else {
        progress.push({ courseId, moduleId, lessonId, completed, completedAt: completed ? new Date().toISOString() : null, quizScore: quizScore || null, quizPassed: quizPassed || false });
      }

      const stats = user.stats || {};
      stats.lessonsCompleted = progress.filter(p => p.completed).length;
      stats.quizzesPassed = progress.filter(p => p.quizPassed).length;
      stats.lastActive = new Date().toISOString();

      const achievements = checkAchievements(progress, stats, user.achievements || []);

      await supabase.from('users').update({ progress, stats, achievements }).eq('id', user.id);
      return res.json({ user: { progress, stats, achievements } });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

function checkAchievements(progress, stats, existing) {
  const achievements = [...existing];
  const checks = [
    { id: 'first-lesson', title: 'First Steps', description: 'Complete your first lesson', icon: '🎯', cond: stats.lessonsCompleted >= 1 },
    { id: 'five-lessons', title: 'Getting Started', description: 'Complete 5 lessons', icon: '📚', cond: stats.lessonsCompleted >= 5 },
    { id: 'ten-lessons', title: 'Dedicated Learner', description: 'Complete 10 lessons', icon: '🎓', cond: stats.lessonsCompleted >= 10 },
    { id: 'twenty-lessons', title: 'Knowledge Seeker', description: 'Complete 20 lessons', icon: '🧠', cond: stats.lessonsCompleted >= 20 },
    { id: 'first-quiz', title: 'Quiz Master', description: 'Pass your first quiz', icon: '✅', cond: stats.quizzesPassed >= 1 },
    { id: 'five-quizzes', title: 'Quiz Champion', description: 'Pass 5 quizzes', icon: '🏆', cond: stats.quizzesPassed >= 5 },
    { id: 'ten-quizzes', title: 'Quiz Legend', description: 'Pass 10 quizzes', icon: '👑', cond: stats.quizzesPassed >= 10 },
    { id: 'perfect-score', title: 'Perfectionist', description: 'Get 100% on a quiz', icon: '💯', cond: progress.some(p => p.quizScore === 100) },
  ];
  checks.forEach(a => {
    if (!achievements.find(e => e.id === a.id) && a.cond) {
      achievements.push({ id: a.id, title: a.title, description: a.description, icon: a.icon, earnedAt: new Date().toISOString() });
    }
  });
  return achievements;
}
