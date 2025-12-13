# Privacy and Threat Model

## Goals
- Collect community governance preferences without creating identity trails.
- Provide optional integrity mechanisms that do not require deanonymization.
- Keep storage transparent and reviewable.

## Data collected
- Answers to the poll questions.
- Optional pseudonym key and optional signed message for those who want verifiability.
- Optional proof-of-work receipt (challenge + nonce).
- Timing metadata (ms since page load) and a client-generated salt/entropy to support duplicate detection.

## Data not collected
- No cookies, fingerprinting, analytics, or third-party scripts.
- No long-lived IP addresses; rate limiting hashes IPs in memory with a rotating salt and never persists them.
- No behavioral tracking beyond what you explicitly submit.

## Storage
- Flat JSON file `data/responses.json` outside the web root.
- Metadata is separated from answers. Encrypted submissions store only ciphertext + IV + salt.
- Duplicate detection uses a salted hash of answers and is discarded if the response repeats.

## Integrity & anti-manipulation
- Soft rate-limit: up to 3 submissions per minute per hashed IP; optional PoW bypass.
- Proof-of-work: SHA-256 puzzle with server-issued challenge, difficulty prefix `0000`.
- Duplicate heuristic: hash of answers + client salt. If repeated, stored as a duplicate acknowledgement but not re-written.
- Optional local-only signing/download for respondent auditability.

## Threat considerations
- **Mass scraping or profiling**: mitigated by minimal fields and absence of identifiers.
- **Sybil flooding**: softened via rate limit + PoW; not a hard guarantee by design.
- **Coercion/linkability**: users can encrypt locally and submit via privacy networks; no accounts or long-term IDs.
- **Data breach**: plaintext minimized; encryption option keeps answers unreadable even if storage leaks.
- **Tampering**: flat file can be mirrored; transparency endpoint and sample dataset show expected schema.

## Accessibility & usability
- Mobile-first responsive layout, semantic inputs, keyboard accessible.
- Plain language prompts with optional context details.
- No assumptions about crypto literacy; integrity options are optional and explained inline.
