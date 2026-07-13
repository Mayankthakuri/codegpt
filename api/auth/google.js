const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Missing credential' });

  try {
    const payload = JSON.parse(Buffer.from(credential.split('.')[1], 'base64url').toString());
    const { sub: googleId, email, name, picture } = payload;

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ error: 'Token expired' });

    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    // Find existing user by google_id
    let { data: user } = await supabase.from('users').select('*').eq('google_id', googleId).single();

    if (!user) {
      // Try by email
      const { data: existing } = await supabase.from('users').select('*').eq('email', email).single();
      if (existing) {
        const { data, error } = await supabase.from('users').update({ google_id: googleId, avatar: picture || existing.avatar }).eq('id', existing.id).select().single();
        if (error) throw error;
        user = data;
      } else {
        // Create with UUID
        const userId = crypto.randomUUID();
        const { data, error } = await supabase.from('users').insert({
          id: userId, google_id: googleId, email, name, avatar: picture || '', provider: 'google',
          stats: {}, achievements: [], progress: []
        }).select().single();
        if (error) throw error;
        user = data;
      }
    }

    // Create auth user
    const { error: authErr } = await supabase.auth.admin.createUser({
      id: user.id, email, email_confirm: true,
      user_metadata: { full_name: name, avatar_url: picture }
    });

    // Generate magic link for session
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink', email
    });

    if (linkErr) throw linkErr;

    if (linkData?.properties?.action_link) {
      const token = new URL(linkData.properties.action_link).searchParams.get('token');
      if (token) {
        return res.json({
          token,
          email,
          user: {
            id: user.id, email: user.email, name: user.name, avatar: user.avatar,
            provider: user.provider, stats: user.stats || {}, achievements: user.achievements || [],
            progress: user.progress || [], created_at: user.created_at
          }
        });
      }
    }

    return res.status(500).json({ error: 'Failed to generate session' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
