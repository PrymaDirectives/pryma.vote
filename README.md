# PRYMA Constitutional Poll

A privacy-first, anonymous polling form that gathers foundational input for PRYMA governance decisions. No logins, no cookies, no third-party tracking.

## Features
- **Tarot Cards of Tech**: ten themed sections combining single-choice, multi-choice, and matrix questions.
- **Privacy defaults**: no trackers, no persistent IP storage, minimal metadata.
- **Integrity options**: pseudonymous keys, optional signed message, optional proof-of-work, duplicate heuristics without identity.
- **Client-side controls**: preview, local-only save, optional local encryption before submission.
- **Transparency**: `/api/transparency` endpoint, dedicated transparency page, sample dataset.

## Running locally
```bash
npm install
npm run dev
```
The server starts on `http://localhost:3000` and serves the static poll and JSON API.

## Deployment notes
- Uses only Express and static assets; deploy on any Node 18+ environment.
- Store `data/responses.json` outside of public web roots. The file is ignored by git and auto-created on first submission.
- Behind a reverse proxy, preserve `X-Forwarded-For` if you want rate-limiting to respect the original client address.
- No database is required. For serverless, swap the flat-file writes in `server.js` with your provider’s KV/blob store.

## Data handling
- Answers and optional metadata are stored in `data/responses.json` as structured JSON with metadata separated from answers.
- Optional client-side encryption stores ciphertext only; automated aggregates skip unreadable entries.
- Soft rate-limit uses in-memory hashed IPs with a rolling window; nothing persisted.

## Aggregation
Run the lightweight aggregator to summarize stored responses:
```bash
npm run aggregate
```
The script reads `data/responses.json` (auto-creates if missing) and prints simple counts for key questions.

## Files of interest
- `public/index.html` – poll UI
- `public/app.js` – logic, optional PoW/encryption/local save
- `server.js` – API endpoint, rate-limit, dedupe and storage
- `docs/THREAT_MODEL.md` – privacy and threat analysis
- `data/sample-responses.json` – fake responses for testing and demos

## Optional enhancements included
- Client-side encryption toggle (AES-GCM, PBKDF2 key derivation)
- Proof-of-work endpoint and client helper
- Save/preview without network submission
- Transparency & sample pages for external review
