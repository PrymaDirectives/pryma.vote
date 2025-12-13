import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'interest-cohort=()');
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { index: 'index.html', cacheControl: true }));

const rateLimitWindowMs = 60 * 1000;
const rateLimitMax = 3;
const rateLimiter = new Map();
const rateLimitSalt = crypto.randomBytes(16).toString('hex');

const responseStorePath = path.join(__dirname, 'data', 'responses.json');

const ensureStore = () => {
  if (!fs.existsSync(responseStorePath)) {
    fs.writeFileSync(responseStorePath, '[]', 'utf-8');
  }
};

const hashIp = (ip) => crypto.createHash('sha256').update(`${rateLimitSalt}:${ip}`).digest('hex');

const verifyPow = (pow) => {
  if (!pow || !pow.challenge || typeof pow.nonce !== 'number') {
    return false;
  }
  const now = Date.now();
  const { challenge, nonce, issuedAt } = pow;
  if (!issuedAt || Math.abs(now - issuedAt) > 10 * 60 * 1000) {
    return false;
  }
  const digest = crypto.createHash('sha256').update(`${challenge}:${nonce}`).digest('hex');
  return digest.startsWith('0000');
};

const dedupeSignature = (payload) => {
  const { answers, metadata } = payload;
  const safeAnswers = answers || {};
  const sortedAnswers = JSON.stringify(safeAnswers, Object.keys(safeAnswers).sort());
  const salt = metadata?.clientSalt || crypto.randomBytes(16).toString('hex');
  return crypto.createHash('sha256').update(`${sortedAnswers}:${salt}`).digest('hex');
};

const trimRateLimit = (key) => {
  const now = Date.now();
  const entries = rateLimiter.get(key) || [];
  const filtered = entries.filter((ts) => now - ts < rateLimitWindowMs);
  rateLimiter.set(key, filtered);
  return filtered;
};

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/pow-challenge', (req, res) => {
  res.json({ challenge: crypto.randomBytes(16).toString('hex'), issuedAt: Date.now(), difficulty: '0000' });
});

app.post('/api/poll', (req, res) => {
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  const hashedIp = hashIp(clientIp);
  const recentHits = trimRateLimit(hashedIp);
  const powValid = verifyPow(req.body.metadata?.pow);
  if (recentHits.length >= rateLimitMax && !powValid) {
    return res.status(429).json({ ok: false, reason: 'soft-rate-limit' });
  }

  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ ok: false, reason: 'invalid-payload' });
  }

  const isEncrypted = Boolean(payload.encryptedPayload);
  if (!isEncrypted && !payload.answers) {
    return res.status(400).json({ ok: false, reason: 'missing-answers' });
  }

  ensureStore();
  const storedAt = new Date().toISOString();
  const responseHash = dedupeSignature(payload);
  const entry = {
    storedAt,
    metadata: {
      clientSalt: payload.metadata?.clientSalt || null,
      pseudonymKey: payload.metadata?.pseudonymKey || null,
      signedMessage: payload.metadata?.signedMessage || null,
      powUsed: powValid,
      encryption: isEncrypted ? { salt: payload.encryptedPayload.salt, iv: payload.encryptedPayload.iv } : null,
      duplicateHint: responseHash,
      timingMs: payload.metadata?.timingMs || null,
      entropy: payload.metadata?.entropy || null
    },
    answers: isEncrypted ? null : payload.answers,
    encryptedPayload: isEncrypted ? payload.encryptedPayload : null
  };

  const dedupeSeen = fs.readFileSync(responseStorePath, 'utf-8');
  const records = JSON.parse(dedupeSeen);
  const already = records.find((r) => r.metadata?.duplicateHint === responseHash);
  if (already) {
    return res.status(202).json({ ok: true, reason: 'duplicate-suspected' });
  }

  records.push(entry);
  fs.writeFileSync(responseStorePath, JSON.stringify(records, null, 2));
  rateLimiter.set(hashedIp, [...recentHits, Date.now()]);

  res.json({ ok: true, storedAt, powAccepted: powValid });
});

app.get('/api/transparency', (req, res) => {
  res.json({
    collects: ['answers', 'optional pseudonym key', 'optional signed message', 'optional encrypted payload'],
    excludes: ['cookies', 'tracking pixels', 'third-party analytics', 'IP storage beyond hashed in-memory rate limiting'],
    storage: 'Flat file data/responses.json with metadata separated from answers; encrypted submissions stored as ciphertext only.'
  });
});

app.listen(PORT, () => {
  console.log(`PRYMA poll listening on port ${PORT}`);
});
