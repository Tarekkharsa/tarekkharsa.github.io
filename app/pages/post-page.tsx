import type { Handle } from 'remix/component'

import {
  author,
  modifiedDate,
  postPath,
  postUrl,
  seriesIndex,
  type GuidePost,
  type SeriesPost,
} from '../content/posts.ts'
import { absoluteUrl } from '../site.ts'
import { Document, isoTimestamp } from '../ui/document.tsx'
import {
  Crumbs,
  GuessCallout,
  lessonCount,
  lessonLabel,
  PostBody,
  PostHeader,
  SeriesNav,
  SeriesPager,
  ShareBar,
} from '../ui/post-parts.tsx'

type ArticlePost = GuidePost | SeriesPost

export function PostPage(handle: Handle<{ post: ArticlePost }>) {
  return () => {
    let { post } = handle.props
    let inSeries = post.kind !== 'guide'

    return (
      <Document
        path={postPath(post)}
        title={`${post.title} — Tarek Kharsa`}
        description={post.description}
        og={{ title: post.title, type: 'article', image: post.image, publishedDate: post.date }}
        jsonLd={blogPosting(post)}
        progress
        nav={inSeries ? 'series' : 'writing'}
      >
        <main id="content">
          <Crumbs
            trail={
              post.kind === 'guide'
                ? [{ label: 'writing' }]
                : [
                    { label: 'guess the codebase', href: postPath(seriesIndex) },
                    { label: lessonLabel(post) },
                  ]
            }
          />
          {/* site.js reads these to count a "read" once the reader reaches the end. */}
          <article data-read-slug={post.slug} data-read-minutes={post.readMinutes}>
            <PostHeader
              post={post}
              extra={
                post.kind === 'lesson'
                  ? `Round ${post.round} · lesson ${post.lesson} of ${lessonCount}`
                  : undefined
              }
            />
            {post.kind !== 'guide' ? <SeriesNav current={post} /> : null}
            <PostBody slug={post.slug}>
              {post.kind === 'lesson' ? <GuessCallout post={post} /> : null}
            </PostBody>
            <ShareBar post={post} />
            {post.kind !== 'guide' ? <SeriesPager current={post} /> : null}
          </article>
        </main>
      </Document>
    )
  }
}

function blogPosting(post: ArticlePost) {
  let url = postUrl(post)
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: (post.kind === 'guide' ? post.headline : undefined) ?? post.title,
    description: post.description,
    image: absoluteUrl(post.image.path),
    datePublished: isoTimestamp(post.date),
    dateModified: isoTimestamp(modifiedDate(post)),
    author,
    ...(post.kind === 'guide'
      ? {}
      : {
          isPartOf: {
            '@type': 'CreativeWorkSeries',
            name: seriesIndex.title,
            url: postUrl(seriesIndex),
          },
        }),
    mainEntityOfPage: url,
    url,
  }
}
