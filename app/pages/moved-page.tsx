import type { Handle } from 'remix/component'
import { unsafeHTML } from 'remix/component'

import { postPath, type Post } from '../content/posts.ts'
import { absoluteUrl } from '../site.ts'
import { Document } from '../ui/document.tsx'

/**
 * Stands in for a lesson that was replaced after it was published. GitHub Pages can't
 * redirect, so this forwards with a meta refresh and points search engines at the new URL.
 */
export function MovedPage(handle: Handle<{ to: Post }>) {
  return () => {
    let { to } = handle.props
    let target = postPath(to)
    return (
      <Document title={`Moved: ${to.title} — Tarek Kharsa`} noindex head={<MovedHead target={target} />}>
        <main id="content" class="hero">
          <p class="prompt">
            <span class="dollar">$</span> mv old-lesson new-lesson
          </p>
          <h1>
            This lesson was replaced<span class="accent">.</span>
          </h1>
          <p class="lede">
            It's now <a href={target}>{to.title}</a>, a deeper lesson in the same spot of the series.
          </p>
        </main>
      </Document>
    )
  }
}

function MovedHead(handle: Handle<{ target: string }>) {
  return () => (
    <>
      <link rel="canonical" href={absoluteUrl(handle.props.target)} />
      <meta http-equiv="refresh" content={`0; url=${handle.props.target}`} />
      <script innerHTML={unsafeHTML(`location.replace(${JSON.stringify(handle.props.target)}+location.hash)`)} />
    </>
  )
}
