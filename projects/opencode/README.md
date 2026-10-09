# Round 3: OpenCode v2

- **Answer:** [OpenCode](https://github.com/anomalyco/opencode) (`anomalyco/opencode`, formerly
  `sst/opencode`), "the open source coding agent". The lessons come from **v2**, the new core
  being built on the default branch, `dev`, before its release.
- **Studied at:** `388406238bd5ca15564a762840a2362c3a45bd9c` (`dev`, 2026-10-08). The latest
  release then was `v1.18.35`. "Where to look" links are pinned to this commit because v2 paths
  may move before release.
- **Series hub:** https://tarekkharsa.github.io/posts/guess-the-codebase

## Status

| Piece             | Where                                                 | State                             |
| ----------------- | ----------------------------------------------------- | --------------------------------- |
| 8 lesson posts    | `content/posts/gtc3-0*.html`                          | Live, in feed                     |
| Finale + 20 tips  | `content/posts/gtc3-reveal-power-user-tips.html`      | Live but unlisted                 |
| Round data        | `app/content/rounds/opencode.ts`                      | Hints, pinned sources, finale     |
| OG images         | `public/assets/og/gtc3-*.png`                         | Rendered (`npm run og -- gtc3`)   |
| X campaign        | [`tweets.ts`](./tweets.ts) → [`tweet-kit.html`](./tweet-kit.html) | Ready               |

The finale's tips describe OpenCode as released today, not v2. When v2 ships, re-check the
lessons against the release and mention it in the reveal.

## Files

- [`research/source-map.md`](./research/source-map.md): the file behind every claim.
- [`tweets.ts`](./tweets.ts): launch thread, per-lesson teaser/reply/hint, reveal and tips
  threads. Links come from `app/content/rounds/opencode.ts`.
