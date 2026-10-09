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
  hydration or the asset server without discussing it first.
- **URLs are public and must not change.** Posts live at `/posts/<slug>.html`.
- **Spoilers:** the #GuessTheCodebase reveal post (`finale`) is `indexed: false`, so it stays
  out of `feed.xml` and `sitemap.xml`. Keep it that way.

## Where things live

- `app/routes.ts`: URL contract. `app/actions/controller.tsx`: route handlers.
  `app/router.tsx`: middleware and 404.
- `app/content/posts.ts`: all post metadata. The head tags, JSON-LD, series nav, hints,
  pager, share links, home list, feed and sitemap are generated from it.
- `content/posts/<slug>.html`: the hand-written post body, inserted verbatim.
- `app/pages/`, `app/ui/`: page components and shared pieces (`remix/component` JSX, not React).
- `public/`: copied to `dist/` unchanged (`site.css`, `site.js`, icons, OG images).

## Verify

```sh
npm run typecheck
npm test          # every route renders, no broken internal links, feed/sitemap rules
npm run build     # must succeed; CI deploys dist/ on push to main
npx remix doctor
```

For visual changes, `npm run preview` serves `dist/` like GitHub Pages on port 44101.
