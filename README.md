# tarekkharsa.github.io

Personal profile site, built with [Remix 3](https://github.com/remix-run/remix) and
published to GitHub Pages as plain static files.

Live at **https://tarekkharsa.github.io/**.

## How it works

GitHub Pages can only serve files, so the Remix app never runs in production.
[`scripts/build.ts`](scripts/build.ts) asks the Remix router for every page once and
writes each response into `dist/`, next to a copy of `public/`.
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs the typecheck, tests
and build on every pull request, and deploys `dist/` on every push to `main`.

Pages ship no framework JavaScript: only `public/assets/site.js` (theme toggle, copy
buttons, heading anchors), and pages work without it.

```
app/
  content/posts.ts   post metadata: titles, dates, tags, hints, sources, feed entries
  actions/           route handlers (controller.tsx)
  pages/             home, post, series and 404 pages
  ui/                document <head>, header/footer, post building blocks
  feeds.ts           feed.xml and sitemap.xml
  router.tsx         the routes, rendered with remix/component
  static-pages.ts    every URL the build writes to dist/
content/posts/       the prose of each post, as HTML
public/              files copied unchanged (CSS, JS, icons, social images)
projects/            per-codebase research, drafts and X campaigns (never deployed)
scripts/             build, preview, tweet kits, OG image rendering
```

## Commands

Requires Node 24.3+.

```sh
npm install
npm run dev        # http://localhost:44100, renders on request
npm test           # renders every page, checks internal links, feed and sitemap
npm run typecheck
npm run build      # writes dist/
npm run preview    # serves dist/ like GitHub Pages, on http://localhost:44101
npm run kit        # renders projects/<name>/tweet-kit.html from projects/<name>/tweets.ts
npm run og         # re-renders the series social images with headless Chrome (local only)
```

## Projects

Each codebase I study gets a folder in [`projects/`](projects/README.md): research notes,
archived drafts, and the X campaign as typed data with a generated, copy-ready tweet kit.
None of it is deployed, but the repository is public. The projects README has the
checklist for starting a new round of Guess the codebase.

## Adding a post

1. Write the body as HTML in `content/posts/<slug>.html`.
2. Register it in `app/content/posts.ts`. Headers, share buttons, the home page list,
   the feed and the sitemap are generated from that entry. Guess-the-codebase lessons
   use `lesson({...})`, which also builds the hints box, the pager and the series nav.
3. Add its social image to `public/assets/og/` (series images: `npm run og`).

## Social preview images

Images live in `public/assets/og/`. To re-render one after editing its HTML source:

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1200,630 \
  --screenshot=public/assets/og/home.png file://$PWD/public/assets/og/og-home.html
```

`og-series.html` is a template for series images: pass `?k=kicker&t=title&s=subtitle`.
