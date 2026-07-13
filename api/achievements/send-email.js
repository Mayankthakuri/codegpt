const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const BADGE_COLORS = {
  'first-lesson': { primary: '#6366f1', secondary: '#818cf8', medal: 'Bronze' },
  'five-lessons': { primary: '#6366f1', secondary: '#818cf8', medal: 'Silver' },
  'ten-lessons': { primary: '#6366f1', secondary: '#818cf8', medal: 'Gold' },
  'twenty-lessons': { primary: '#6366f1', secondary: '#818cf8', medal: 'Platinum' },
  'first-quiz': { primary: '#22c55e', secondary: '#4ade80', medal: 'Bronze' },
  'five-quizzes': { primary: '#22c55e', secondary: '#4ade80', medal: 'Silver' },
  'ten-quizzes': { primary: '#22c55e', secondary: '#4ade80', medal: 'Gold' },
  'perfect-score': { primary: '#eab308', secondary: '#facc15', medal: 'Diamond' },
  'streak-3': { primary: '#f97316', secondary: '#fb923c', medal: 'Bronze' },
  'streak-7': { primary: '#ef4444', secondary: '#f87171', medal: 'Gold' },
};

function generateCertificateHTML(name, achievement, date, certId) {
  const colors = BADGE_COLORS[achievement.id] || { primary: '#6366f1', secondary: '#818cf8', medal: 'Bronze' };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Certificate Card -->
    <div style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);border-radius:16px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;">
      <!-- Header Badge -->
      <div style="background:linear-gradient(135deg,${colors.primary},${colors.secondary});padding:32px;text-align:center;">
        <div style="width:80px;height:80px;margin:0 auto 16px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:40px;">${achievement.icon}</span>
        </div>
        <div style="color:rgba(255,255,255,0.9);font-size:12px;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">Certificate of Achievement</div>
        <div style="color:#fff;font-size:24px;font-weight:700;">${achievement.title}</div>
        <div style="display:inline-block;margin-top:8px;padding:4px 12px;background:rgba(255,255,255,0.2);border-radius:20px;color:#fff;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">${colors.medal} Medal</div>
      </div>

      <!-- Body -->
      <div style="padding:32px;text-align:center;">
        <div style="color:#94a3b8;font-size:13px;margin-bottom:8px;">Awarded to</div>
        <div style="color:#f1f5f9;font-size:22px;font-weight:600;margin-bottom:24px;">${name}</div>

        <div style="color:#94a3b8;font-size:14px;line-height:1.6;margin-bottom:24px;">
          ${achievement.description}
        </div>

        <!-- Stats Row -->
        <div style="display:flex;justify-content:center;gap:32px;margin-bottom:24px;">
          <div>
            <div style="color:#6366f1;font-size:20px;font-weight:700;">${date}</div>
            <div style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Date Earned</div>
          </div>
          <div>
            <div style="color:#6366f1;font-size:20px;font-weight:700;">${certId.slice(0, 8).toUpperCase()}</div>
            <div style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Certificate ID</div>
          </div>
        </div>

        <!-- Verify Button -->
        <a href="https://code-gpt-one.vercel.app/profile" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,${colors.primary},${colors.secondary});color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">View in Profile</a>
      </div>

      <!-- Footer -->
      <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
        <div style="color:#475569;font-size:11px;">CodeGPT Learning Platform</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, name, achievement } = req.body;

  if (!email || !name || !achievement) {
    return res.status(400).json({ error: 'Missing required fields: email, name, achievement' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  try {
    const certId = `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const html = generateCertificateHTML(name, achievement, date, certId);

    const { data, error } = await resend.emails.send({
      from: 'CodeGPT <onboarding@resend.dev>',
      to: email,
      subject: `🏆 Achievement Unlocked: ${achievement.title}!`,
      html,
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ success: true, emailId: data?.id, certId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
