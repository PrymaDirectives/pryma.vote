# PRYMA Constitutional Poll

A privacy-first, anonymous polling form that gathers foundational input for PRYMA governance decisions. No logins, no cookies, no third-party tracking.

## Features
- **Tarot Cards of Tech**: ten themed sections combining single-choice, multi-choice, and matrix questions.
- **Privacy defaults**: no trackers, no persistent IP storage, minimal metadata.
- **Integrity options**: pseudonymous keys, optional signed message, optional proof-of-work, duplicate heuristics without identity.
- **Client-side controls**: preview, local-only save, optional local encryption before submission.
- **Transparency**: Dedicated transparency page and sample dataset, no hidden network calls.

## Running locally
No npm installs are needed. Open `public/index.html` directly in your browser or serve the folder with any static file server:
```bash
cd public
python -m http.server 3000
```
Then visit `http://localhost:3000`.

## Deployment notes
- Pure static HTML/CSS/JS—drop the `public/` folder onto any static host (GitHub Pages, S3, Netlify, etc.).
- Responses are saved only in each visitor’s browser via `localStorage`; exporting is explicit and client-controlled.
- Optional proof-of-work, client-side encryption, and local signing still work entirely in-browser.

## Data handling
- Answers and optional metadata are stored locally in `localStorage` as structured JSON with metadata separated from answers.
- Optional client-side encryption stores ciphertext only; unreadable without the passphrase you keep.
- Soft rate-limiting is removed in static mode; you can still attach a proof-of-work receipt for transparency.

## Aggregation
Use the sample dataset page (`/sample.html`) to view fabricated responses and see counts. Locally saved submissions are also displayed there for quick inspection and export.

## Files of interest
- `public/index.html` – poll UI
- `public/app.js` – logic, optional PoW/encryption/local save
- `docs/THREAT_MODEL.md` – privacy and threat analysis
- `data/sample-responses.json` – fake responses for testing and demos

## Optional enhancements included
- Client-side encryption toggle (AES-GCM, PBKDF2 key derivation)
- Proof-of-work endpoint and client helper
- Save/preview without network submission
- Transparency & sample pages for external review
