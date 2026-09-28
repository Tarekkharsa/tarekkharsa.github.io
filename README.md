# tarekkharsa.github.io

Personal profile site — a static site (home page plus posts in
`posts/`), no build step.

Live at **https://tarekkharsa.github.io/**. Deployed to GitHub Pages by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push
to `main`. Edit `index.html`, push, done.

Social preview images live in `assets/og/`; to re-render one after editing its
HTML source: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --screenshot=assets/og/home.png file://$PWD/assets/og/og-home.html`.
