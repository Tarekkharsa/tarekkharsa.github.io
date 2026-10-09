# Agent notes

Personal site built with Remix 3 (`remix` package) and deployed to GitHub Pages as static
files. Use the `remix` skill in `.agents/skills/remix/` for Remix APIs; read the installed
docs (`node_modules/remix/INDEX.md`) rather than relying on memory.

## Constraints

- **Static output only.** GitHub Pages serves files, so nothing may depend on request-time
  server behavior (sessions, POST actions, cookies, redirects, streaming). `scripts/build.ts`
  fetches every path from `app/static-pages.ts` once and writes the responses to `dist/`.
  A new route needs an entry there or it will not be published.
- **No framework JavaScript in the browser.** Pages ship only `public/assets/site.js`
  (progressive enhancement; pages must work without it). Do not add `clientEntry()`,
  hydration or the asset server without discussing it first. The one third-party script is
  GoatCounter analytics (`site.analytics`, async, cookie-free); pages must not depend on it.
- **URLs are public and must not change.** Posts live at `/posts/<slug>` (written to
  `dist/posts/<slug>.html`, which Pages serves at both `/posts/<slug>` and the old
  `/posts/<slug>.html`). Link to the clean URL. Feed entry IDs stay on the old `.html`
  URLs on purpose: changing them makes readers show every post again.
- **No guessing game on the site.** The site names every codebase up front and links lessons
  to their sources. #GuessTheCodebase runs on X only (`projects/<name>/tweets.ts`): post a
  lesson there without the name, reveal it later. The series hub keeps its first URL,
  `/posts/guess-the-codebase`, because it's already shared.

## Where things live

- `app/routes.ts`: URL contract. `app/actions/controller.tsx`: route handlers.
  `app/router.tsx`: middleware and 404.
- `app/content/rounds/<repo>.ts`: one round of lessons each (codebase, lessons, power-user
  tips `finale`), built with `defineRound()` from `app/content/series.ts`. Never change a
  published round's slugs. If a round will be teased on X before the site names it, plan it
  on a local branch that is never pushed: the repo is public.
- `app/content/posts.ts`: all post metadata. The head tags, JSON-LD, series nav, source links,
  pager, share links, home page, feed and sitemap are generated from it.
- `content/posts/<slug>.html`: the hand-written post body, inserted verbatim.
- `app/pages/`, `app/ui/`: page components and shared pieces (`remix/component` JSX, not React).
- `public/`: copied to `dist/` unchanged (`site.css`, `site.js`, icons, OG images).
- `public/assets/demos.js`: interactive lesson demos in plain JS (no framework). `site.js`
  loads it only on pages with a `[data-demo]` element, and every demo replaces a static
  fallback paragraph, so lessons read fine without JavaScript.
- Lesson format: `problem` and `idea` (the "In short" card) and `prompt` (the "Use it in
  your code" card) live in the round file; the body has an optional demo, then `.flow` step
  cards and `.compare-grid` comparisons, then "Steal this". The "Read the source" box is
  generated from `sources`. Lessons must teach real engineering from the repo, verified in
  its source. Prompts describe the idea, not the repo, so they work in any codebase.
- Replaced lessons: add `old-slug -> new-slug` to `movedPosts` in `app/content/posts.ts`;
  the old URL becomes a forwarding page.

## Verify

```sh
npm run typecheck
npm test          # every route renders, no broken internal links, feed/sitemap rules
npm run build     # must succeed; CI deploys dist/ on push to main
npx remix doctor
```

For visual changes, `npm run preview` serves `dist/` like GitHub Pages on port 44101.
