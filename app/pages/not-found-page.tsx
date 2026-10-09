import { postPath, seriesIndex } from '../content/posts.ts'
import { routes } from '../routes.ts'
import { Document } from '../ui/document.tsx'

export function NotFoundPage() {
  return () => (
    <Document title="Not found — Tarek Kharsa" noindex>
      <main id="content" class="hero">
        <p class="prompt">
          <span class="dollar">$</span> cat this-page
        </p>
        <h1>
          404: not found<span class="accent">.</span>
        </h1>
        <p class="lede">
          That page doesn't exist. Try the <a href={routes.home.href()}>home page</a> or the{' '}
          <a href={postPath(seriesIndex)}>lessons from great codebases</a>.
        </p>
      </main>
    </Document>
  )
}
