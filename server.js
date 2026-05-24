import express from 'express';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { createInterface } from 'readline';

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessions = new Map();

app.get('/.well-known/oauth-authorization-server', (req, res) => {
  res.json({
    issuer: BASE_URL,
    authorization_endpoint: `${BASE_URL}/authorize`,
    token_endpoint: `${BASE_URL}/token`,
    registration_endpoint: `${BASE_URL}/register`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code'],
    token_endpoint_auth_methods_supported: ['none'],
  });
});

app.get('/.well-known/oauth-protected-resource', (req, res) => {
  res.json({
    resource: BASE_URL,
    authorization_servers: [BASE_URL],
    bearer_methods_supported: ['header'],
  });
});

app.post('/register', (req, res) => {
  res.status(201).json({
    client_id: randomUUID(),
    client_id_issued_at: Math.floor(Date.now() / 1000),
    token_endpoint_auth_method: 'none',
    grant_types: ['authorization_code'],
    response_types: ['code'],
    redirect_uris: req.body.redirect_uris || [],
  });
});

app.get('/authorize', (req, res) => {
  const { redirect_uri, state } = req.query;
  const code = randomUUID();
  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set('code', code);
  if (state) redirectUrl.searchParams.set('state', state);
  res.redirect(redirectUrl.toString());
});

app.post('/token', (req, res) => {
  res.json({
    access_token: GITHUB_TOKEN,
    token_type: 'Bearer',
    expires_in: 31536000,
  });
});

app.get('/sse', (req, res) => {
  const sessionId = randomUUID();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.write(`event: endpoint\ndata: ${BASE_URL}/message?sessionId=${sessionId}\n\n`);

  const mcpProcess = spawn('npx', ['-y', '@modelcontextprotocol/server-github'], {
    env: { ...process.env, GITHUB_PERSONAL_ACCESS_TOKEN: GITHUB_TOKEN },
  });

  sessions.set(sessionId, { res, mcpProcess });

  const rl = createInterface({ input: mcpProcess.stdout });
  rl.on('line', (line) => {
    if (line.trim()) {
      res.write(`event: message\ndata: ${line}\n\n`);
    }
  });

  mcpProcess.stderr.on('data', (data) => {
    console.error('[MCP]', data.toString());
  });

  req.on('close', () => {
    sessions.delete(sessionId);
    mcpProcess.kill();
  });
});

app.post('/message', (req, res) => {
  const { sessionId } = req.query;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  session.mcpProcess.stdin.write(JSON.stringify(req.body) + '\n');
  res.status(202).json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`MCP OAuth server on port ${PORT}`);
  console.log(`Base URL: ${BASE_URL}`);
});
