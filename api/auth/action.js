const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, email, password, name, token } = req.body;

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  try {
    if (action === 'register') {
      // Create user with admin API (auto-confirms email)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name }
      });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      // Create user profile
      const { error: profileError } = await supabase.from('users').upsert({
        id: authData.user.id,
        email,
        name,
        provider: 'local',
        stats: {},
        achievements: [],
        progress: []
      });

      // Sign in to get session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        return res.status(400).json({ error: signInError.message });
      }

      return res.json({
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
        user: {
          id: authData.user.id,
          email,
          name,
          provider: 'local',
          stats: {},
          achievements: [],
          progress: []
        }
      });
    }

    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Get or create user profile
      let { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).single();

      if (!profile) {
        const name = data.user.user_metadata?.full_name || email.split('@')[0];
        await supabase.from('users').upsert({
          id: data.user.id,
          email,
          name,
          provider: 'local',
          stats: {},
          achievements: [],
          progress: []
        });
        profile = { id: data.user.id, email, name, provider: 'local', stats: {}, achievements: [], progress: [] };
      }

      return res.json({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          avatar: profile.avatar,
          provider: profile.provider,
          stats: profile.stats || {},
          achievements: profile.achievements || [],
          progress: profile.progress || [],
          created_at: profile.created_at
        }
      });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
