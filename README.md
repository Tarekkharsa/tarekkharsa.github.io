# tarekkharsa.github.io

Personal profile site: a static site (home page plus posts in `posts/`) with no
build step.

Live at **https://tarekkharsa.github.io/**. Deployed to GitHub Pages by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push
to `main`. Edit, push, done.

- `assets/site.css`: shared design (light/dark tokens, layout, post components).
- `assets/site.js`: small enhancements (theme toggle, copy buttons, heading anchors).
  Pages work without it.
- `feed.xml` / `sitemap.xml`: update both when adding a post.

Social preview images live in `assets/og/`. To re-render one after editing its
HTML source:

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1200,630 \
  --screenshot=assets/og/home.png file://$PWD/assets/og/og-home.html
```

`og-series.html` is a template for series images: pass `?k=kicker&t=title&s=subtitle`.
