# ADR 0002: Distributed SSO Authentication & Redirection Loop Protection

## Status

Accepted

## Context

FinAI operates within a federated micro-frontend ecosystem centered around the DevLab Portal (`localhost:3000`). When users navigate between services or when sessions expire:

1. Applications must securely authenticate cross-domain without exposing long-lived credentials.
2. If an access token expires or signature verification fails, uncoordinated redirects between the consumer app middleware and the central portal can trigger infinite browser redirection loops (ping-pong effect), exhausting network resources and locking out users.

## Decision

We implemented a multi-layered authentication resilience architecture:

1. **Asymmetric Cryptographic Verification:** Tokens issued by DevLab Portal are signed using RS256 private keys and validated by consumers against the public key certificate.
2. **Client-Side Expiry Pre-Checks:** Next.js middleware performs lightweight JWT expiry pre-checks (`isTokenExpired(token)`) before triggering redirects to the central auth authority.
3. **Session Bounce Guard:** When an authentication redirect is initiated, a short-lived timestamped session record is retained. If more than 2 redirects occur within a 5-second window without state change, the loop guard triggers:
   - Halts automatic redirection.
   - Clears stale session cookies.
   - Presents a graceful "Session Expired" re-login notification.

## Consequences

### Positive

- **Resilience:** Completely eliminates infinite redirection loops and browser crash loops.
- **Fast Rejection:** Avoids expensive backend roundtrips when a token is demonstrably expired in browser storage.
- **Clear UX:** Users receive immediate, actionable feedback on authentication state.

### Negative / Tradeoffs

- Requires coordinated redirect parameter standards (`?app=finai&redirect=...`) across all consumer applications.
