# Round 1: T3 Code

- **Answer:** [T3 Code](https://github.com/pingdotgg/t3code) (`pingdotgg/t3code`), the
  open-source GUI for coding agents.
- **Studied at:** `main`, early October 2026 (about 5,000 commits).
- **Series hub:** https://tarekkharsa.github.io/posts/guess-the-codebase.html

## Status

| Piece                    | Where                                                    | State                    |
| ------------------------ | -------------------------------------------------------- | ------------------------ |
| 8 lesson posts           | `content/posts/gtc-0*.html`                              | Live, in feed            |
| Series hub               | `content/posts/guess-the-codebase.html`                  | Live, in feed            |
| Finale + 30 tips         | `content/posts/gtc-reveal-t3-code-power-user-tips.html`  | Live but unlisted        |
| OG images                | `public/assets/og/gtc-*.png`                             | Rendered (`npm run og`)  |
| X campaign               | [`tweets.ts`](./tweets.ts) → [`tweet-kit.html`](./tweet-kit.html) | Ready, 46 tweets |

The finale is reachable from the series nav ("?") and the hub, but stays out of the home
page, feed and sitemap until reveal day. See the playbook in `tweet-kit.html`.

## Files

- [`tweets.ts`](./tweets.ts): launch thread, per-lesson teaser/reply/hint, reveal thread,
  power-user tips thread. Links are built from `app/content/posts.ts`, so a renamed slug
  fails `npm test` instead of shipping a dead link.
- [`tweet-kit.html`](./tweet-kit.html): open it in a browser to copy and post. Regenerate
  with `npm run kit -- t3code`.
- [`research/engineering-lessons-bank.html`](./research/engineering-lessons-bank.html):
  the full bank this round was cut from. 60+ single tweets across architecture,
  performance, UI/UX, testing, DX, GitHub/PRs, security and AI-native docs, 5 threads,
  8 blog outlines and a source map. Most of it isn't used in the series yet, so it's good
  material for follow-up posts.
- [`research/source-map.md`](./research/source-map.md): where each claim in the series
  comes from in the T3 Code repo.
- `research/original-drafts.mjs`, `research/original-reveal-draft.mjs`: the first drafts
  of the posts, before they moved into the Remix app. Reference only.
