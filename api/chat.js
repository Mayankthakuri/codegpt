const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array required' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const systemMessage = {
    role: 'system',
    content: 'You are CodeGPT, an AI assistant specialized in coding, programming, and software development. You help with code explanations, debugging, writing code, and technical concepts. Be concise, helpful, and format code blocks properly.'
  };

  const fullMessages = [systemMessage, ...messages];

  const requestBody = JSON.stringify({
    model: 'deepseek/deepseek-v4-flash',
    messages: fullMessages,
    stream: true,
    max_tokens: 4096
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
      'HTTP-Referer': 'https://code-gpt-one.vercel.app',
      'X-Title': 'CodeGPT'
    }
  };

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  return new Promise((resolve) => {
    const apiReq = https.request(options, (apiRes) => {
      let buffer = '';

      apiRes.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
            res.end();
            return resolve();
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch (e) { /* skip */ }
        }
      });

      apiRes.on('end', () => {
        if (buffer.startsWith('data: ') && buffer.slice(6).trim() === '[DONE]') {
          res.write('data: [DONE]\n\n');
        }
        res.end();
        resolve();
      });
    });

    apiReq.on('error', (error) => {
      try {
        res.write(`data: ${JSON.stringify({ content: `Error: ${error.message}` })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (e) {}
      resolve();
    });

    apiReq.setTimeout(60000, () => {
      apiReq.destroy();
      try {
        res.write(`data: ${JSON.stringify({ content: 'Request timed out. Please try again.' })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (e) {}
      resolve();
    });

    apiReq.write(requestBody);
    apiReq.end();
  });
}
