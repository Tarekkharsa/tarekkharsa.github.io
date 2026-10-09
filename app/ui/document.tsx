import type { Handle, RemixNode } from 'remix/component'
import { unsafeHTML } from 'remix/component'

import { absoluteUrl, site } from '../site.ts'
import { SiteFooter, SiteHeader, type NavSection } from './layout.tsx'

export interface OpenGraph {
  title: string
  type: 'website' | 'article'
  image: { path: string; alt: string }
  /** ISO date (YYYY-MM-DD) for article:published_time. */
  publishedDate?: string
}

export interface DocumentProps {
  /** Site-relative canonical path, e.g. /posts/foo.html. */
  path?: string
  /** Full <title> text. */
  title: string
  description?: string
  og?: OpenGraph
  jsonLd?: object
  noindex?: boolean
  /** Show the reading progress bar. */
  progress?: boolean
  nav?: NavSection
  children?: RemixNode
}

// Applied before first paint so a saved theme never flashes.
const themeScript = `try{const t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch{}`

export function Document(handle: Handle<DocumentProps>) {
  return () => {
    let { path, title, description, og, jsonLd, noindex, progress, nav, children } = handle.props
    let url = path == null ? undefined : absoluteUrl(path)

    return (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{title}</title>
          {noindex ? <meta name="robots" content="noindex" /> : null}
          {description ? <meta name="description" content={description} /> : null}
          {noindex ? null : <meta name="author" content={site.name} />}
          <meta name="color-scheme" content="light dark" />
          {noindex ? null : (
            <>
              <meta name="theme-color" content="#FBFAF7" media="(prefers-color-scheme: light)" />
              <meta name="theme-color" content="#14171B" media="(prefers-color-scheme: dark)" />
            </>
          )}
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          {noindex ? null : <link rel="apple-touch-icon" href="/apple-touch-icon.png" />}
          {url ? <link rel="canonical" href={url} /> : null}
          {noindex ? null : (
            <link rel="alternate" type="application/atom+xml" title={site.name} href="/feed.xml" />
          )}
          {og && url ? <OpenGraphTags og={og} url={url} description={description} /> : null}
          {jsonLd ? <JsonLd value={jsonLd} /> : null}
          <script innerHTML={unsafeHTML(themeScript)} />
          <link rel="stylesheet" href="/assets/site.css" />
          <script src="/assets/site.js" defer />
          <script data-goatcounter={site.analytics.endpoint} async src={site.analytics.script} />
        </head>
        <body>
          <a class="skip" href="#content">
            Skip to content
          </a>
          {progress ? (
            <div class="progress" aria-hidden="true">
              <span />
            </div>
          ) : null}
          <SiteHeader current={nav} />
          {children}
          <SiteFooter />
        </body>
      </html>
    )
  }
}

function OpenGraphTags(handle: Handle<{ og: OpenGraph; url: string; description?: string }>) {
  return () => {
    let { og, url, description } = handle.props
    let image = absoluteUrl(og.image.path)
    return (
      <>
        <meta property="og:site_name" content={site.name} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:title" content={og.title} />
        {description ? <meta property="og:description" content={description} /> : null}
        <meta property="og:type" content={og.type} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={og.image.alt} />
        {og.publishedDate ? (
          <>
            <meta property="article:published_time" content={isoTimestamp(og.publishedDate)} />
            <meta property="article:author" content={absoluteUrl('/')} />
          </>
        ) : null}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content={`@${site.twitterHandle}`} />
        <meta name="twitter:title" content={og.title} />
        {description ? <meta name="twitter:description" content={description} /> : null}
        <meta name="twitter:image" content={image} />
      </>
    )
  }
}

function JsonLd(handle: Handle<{ value: object }>) {
  return () => {
    // Escape "<" so post text can never close the script element early.
    let json = JSON.stringify(handle.props.value, null, 2).replace(/</g, '\\u003c')
    return <script type="application/ld+json" innerHTML={unsafeHTML(json)} />
  }
}

export function isoTimestamp(date: string): string {
  return `${date}T00:00:00Z`
}
