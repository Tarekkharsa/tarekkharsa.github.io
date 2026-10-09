# Round 2: Pi

- **Answer:** [Pi](https://github.com/earendil-works/pi) (`earendil-works/pi`), the minimal,
  extensible agent harness (`@earendil-works/pi-coding-agent`).
- **Studied at:** `6fb2e7815167e6b19006fc526d1a5d0f5f998787` (main, 2026-10-08).
- **Series hub:** https://tarekkharsa.github.io/posts/guess-the-codebase

## Status

| Piece             | Where                                                 | State                    |
| ----------------- | ----------------------------------------------------- | ------------------------ |
| 8 lesson posts    | `content/posts/gtc2-0*.html`                          | Live, in feed            |
| Finale + 20 tips  | `content/posts/gtc2-reveal-power-user-tips.html`   | Live, in feed            |
| Round data        | `app/content/rounds/pi.ts`                            | Sources, finale          |
| OG images         | `public/assets/og/gtc2-*.png`                         | Rendered (`npm run og -- gtc2`) |
| X campaign        | [`tweets.ts`](./tweets.ts) → [`tweet-kit.html`](./tweet-kit.html) | Ready, 42 tweets |

The site names the codebase on every page; the guessing game runs on X only. See the
playbook in `tweet-kit.html`.

## Files

- [`research/lessons.md`](./research/lessons.md): the lesson plan, hints and alternates.
- [`research/source-map.md`](./research/source-map.md): the file behind every claim.
  Re-check claims there before reusing them; the repo moves fast.
- [`tweets.ts`](./tweets.ts): launch thread, per-lesson teaser/reply/hint, reveal thread,
  tips thread. Links are built from `app/content/rounds/pi.ts`.
