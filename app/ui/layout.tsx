import type { Handle } from 'remix/component'

import { postPath, seriesIndex } from '../content/posts.ts'
import { routes } from '../routes.ts'
import { site } from '../site.ts'
import { MoonIcon, SunIcon } from './icons.tsx'

export type NavSection = 'writing' | 'series'

export function SiteHeader(handle: Handle<{ current?: NavSection }>) {
  return () => {
    let { current } = handle.props
    let currentFor = (section: NavSection) => (current === section ? 'page' : undefined)

    return (
      <header class="topbar">
        <div class="topbar-inner">
          <a class="brand" href={routes.home.href()}>
            tarek<span class="accent">.</span>kharsa
          </a>
          <nav class="nav" aria-label="Main">
            <a href={`${routes.home.href()}#writing`} aria-current={currentFor('writing')}>
              guides
            </a>
            <a href={postPath(seriesIndex)} aria-current={currentFor('series')}>
              lessons
            </a>
            <button class="theme-toggle" type="button" aria-label="Toggle dark mode">
              <SunIcon />
              <MoonIcon />
            </button>
          </nav>
        </div>
      </header>
    )
  }
}

export function SiteFooter() {
  return () => (
    <footer class="site-footer">
      <span>{`© ${site.copyrightYear} ${site.name}`}</span>
      <nav aria-label="Footer">
        <a href={site.social.github}>github</a>
        <a href={site.social.twitter}>twitter</a>
        <a href={routes.feed.href()}>rss</a>
        <a href={site.sourceUrl}>source</a>
      </nav>
    </footer>
  )
}
