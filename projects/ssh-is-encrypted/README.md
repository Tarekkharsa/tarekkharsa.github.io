# "But SSH is encrypted" essay

- **Post:** https://tarekkharsa.github.io/posts/ssh-is-encrypted-wrong-question.html
- **Prompt:** Theo's tweet, Oct 9, 2026: "Someone tried to tell me t3 code is bad and their
  terminal phone app was better because 'ssh is encrypted'."
- **X campaign:** [`tweets.ts`](./tweets.ts) → [`tweet-kit.html`](./tweet-kit.html)
  (`npm run kit -- ssh-is-encrypted`).

## Claims checked against T3 Code (pingdotgg/t3code, main, Oct 2026)

- Routes and encryption: `docs/user/remote-access.md` (Tailscale HTTPS, T3 Connect,
  desktop-managed SSH); plain HTTP LAN: `docs/internals/remote.md` ("Hosted web is a client").
- Relay never receives the session token; DPoP binding: `docs/internals/t3-connect.md`.
  DPoP is used for T3 Connect connections (`packages/client-runtime/src/connection/resolver.ts`);
  direct pairings use bearer tokens.
- Scopes narrow but never widen; ordinary pairing has no access management:
  `docs/internals/environment-auth.md`.
- Read-only can't start or steer agents: `launchThread` and `dispatchCommand` require
  `orchestration:operate` in `apps/server/src/auth/RpcAuthorization.ts`.
- Per-device revocation and `--scope`: `docs/user/remote-access.md` ("Manage or revoke access").
- Permission modes: `docs/user/permission-modes.md`.
