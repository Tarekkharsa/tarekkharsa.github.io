import { latestDate, modifiedDate, postUrl, posts } from './content/posts.ts'
import { absoluteUrl, site } from './site.ts'
import { isoTimestamp } from './ui/document.tsx'

function xml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const indexedPosts = () => posts.filter((post) => post.indexed)

export function atomFeed(): string {
  let home = absoluteUrl('/')
  let entries = indexedPosts().map((post) => {
    let url = postUrl(post)
    let feed = post.feed ?? { title: post.title, summary: post.description }
    return `  <entry>
    <title>${xml(feed.title)}</title>
    <link href="${xml(url)}"/>
    <id>${xml(url)}</id>
    <published>${isoTimestamp(post.date)}</published>
    <updated>${isoTimestamp(modifiedDate(post))}</updated>
    <summary>${xml(feed.summary)}</summary>
  </entry>`
  })

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${xml(site.name)}</title>
  <link href="${home}"/>
  <link rel="self" href="${absoluteUrl('/feed.xml')}"/>
  <id>${home}</id>
  <updated>${isoTimestamp(latestDate())}</updated>
  <author>
    <name>${xml(site.name)}</name>
    <uri>${home}</uri>
  </author>
${entries.join('\n')}
</feed>
`
}

export function sitemap(): string {
  let urls = [
    { loc: absoluteUrl('/'), lastmod: latestDate() },
    ...indexedPosts().map((post) => ({ loc: postUrl(post), lastmod: modifiedDate(post) })),
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, lastmod }) => `  <url>
    <loc>${xml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>
`
}
