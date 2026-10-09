import type { Handle, RemixNode } from 'remix/component'
import { unsafeHTML } from 'remix/component'

import {
  LESSONS_PER_ROUND,
  postPath,
  postUrl,
  readPostBody,
  roundOf,
  roundPosts,
  seriesIndex,
  seriesNeighbors,
  type LessonPost,
  type Post,
  type SeriesPost,
} from '../content/posts.ts'
import { routes } from '../routes.ts'
import { site, tweetIntent } from '../site.ts'
import { LinkIcon, XLogo } from './icons.tsx'

const dayFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})
const monthFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

function formatDay(date: string): string {
  return dayFormat.format(new Date(`${date}T00:00:00Z`))
}

export function formatMonth(date: string): string {
  return monthFormat.format(new Date(`${date}T00:00:00Z`))
}

export function Crumbs(handle: Handle<{ trail: { label: string; href?: string }[] }>) {
  return () => {
    let items: RemixNode[] = [<a href={routes.home.href()}>home</a>]
    for (let { label, href } of handle.props.trail) {
      items.push(' / ', href ? <a href={href}>{label}</a> : label)
    }
    return <p class="crumbs">{items}</p>
  }
}

export function PostMeta(handle: Handle<{ post: Post; extra?: string }>) {
  return () => {
    let { post, extra } = handle.props
    return (
      <p class="meta">
        <span class="tag">{post.tag}</span>
        {extra ? <span>{extra}</span> : null}
        <time datetime={post.date}>{formatDay(post.date)}</time>
        {post.updated ? (
          <span>
            Updated <time datetime={post.updated}>{formatDay(post.updated)}</time>
          </span>
        ) : null}
        {post.readMinutes ? <span>{`${post.readMinutes} min read`}</span> : null}
      </p>
    )
  }
}

export function Byline() {
  return () => (
    <p class="byline">
      <span>
        by <a href={routes.home.href()}>{site.name}</a>
        <span aria-hidden="true"> · </span>
        <a href={site.social.twitter}>{`@${site.twitterHandle}`}</a>
      </span>
    </p>
  )
}

export function PostHeader(handle: Handle<{ post: Post; extra?: string; heading?: RemixNode }>) {
  return () => {
    let { post, extra, heading } = handle.props
    return (
      <header class="post-header">
        <PostMeta post={post} extra={extra} />
        <h1>{heading ?? post.heading ?? post.title}</h1>
        <p class="subtitle">{post.subtitle}</p>
        <Byline />
      </header>
    )
  }
}

/** The hand-written prose for a post, inserted verbatim from content/posts/<slug>.html. */
export function PostBody(handle: Handle<{ slug: string; before?: RemixNode; children?: RemixNode }>) {
  return () => (
    <div class="prose">
      {handle.props.before}
      <div class="prose-body" innerHTML={unsafeHTML(readPostBody(handle.props.slug))} />
      {handle.props.children}
    </div>
  )
}

export function SeriesNav(handle: Handle<{ current: SeriesPost }>) {
  return () => {
    let { current } = handle.props
    let round = roundOf(current)
    return (
      <nav class="series-nav" aria-label="Series">
        <a class="label" href={`${postPath(seriesIndex)}#round-${round.number}`}>
          {`Lessons from ${round.codebase.name}`}
        </a>
        <ol>
          {roundPosts(round).map((post) => (
            <li>
              <a
                href={postPath(post)}
                aria-current={post === current ? 'page' : undefined}
                title={post.kind === 'lesson' ? post.title : post.teaser}
                class={post.kind === 'finale' ? 'tips' : undefined}
              >
                {post.kind === 'lesson' ? String(post.lesson) : 'tips'}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    )
  }
}

export function SeriesPager(handle: Handle<{ current: SeriesPost }>) {
  return () => {
    let { prev, next } = seriesNeighbors(handle.props.current)
    let prevLink = prev
      ? { href: postPath(prev), label: prev.title }
      : { href: postPath(seriesIndex), label: 'All lessons' }
    let nextLink = next
      ? { href: postPath(next), label: next.title }
      : { href: postPath(seriesIndex), label: 'More codebases' }

    return (
      <nav class="pager" aria-label="More in this series">
        <a class="prev" href={prevLink.href}>
          <span class="dir">← previous</span>
          <span class="tt">{prevLink.label}</span>
        </a>
        <a class="next" href={nextLink.href}>
          <span class="dir">next →</span>
          <span class="tt">{nextLink.label}</span>
        </a>
      </nav>
    )
  }
}

export function ShareBar(handle: Handle<{ post: Post }>) {
  return () => {
    let { post } = handle.props
    return (
      <div class="share">
        <span class="label">share</span>
        <a class="btn" href={tweetIntent(post.shareText, postUrl(post))} target="_blank" rel="noopener">
          <XLogo /> Post on X
        </a>
        <button class="btn" type="button" data-copy-link>
          <LinkIcon /> Copy link
        </button>
      </div>
    )
  }
}

/** The "In short" card at the top of a lesson: the problem, then the idea. */
export function InShort(handle: Handle<{ post: LessonPost }>) {
  return () => (
    <dl class="tldr">
      <div>
        <dt class="k">Problem</dt>
        <dd>
          <p>{handle.props.post.problem}</p>
        </dd>
      </div>
      <div class="idea">
        <dt class="k">Idea</dt>
        <dd>
          <p>{handle.props.post.idea}</p>
        </dd>
      </div>
    </dl>
  )
}

/** A copyable prompt that applies the lesson to the reader's own codebase. */
export function ApplyPrompt(handle: Handle<{ post: LessonPost }>) {
  return () => (
    <section class="callout apply" aria-labelledby="apply-h">
      <p class="callout-kicker">Use it in your code</p>
      <p class="callout-title" id="apply-h">
        A prompt for your coding agent
      </p>
      <p>
        Run it from the root of your repo. It checks whether the idea fits before it changes
        anything.
      </p>
      <pre class="prompt-text">
        <code>{handle.props.post.prompt}</code>
      </pre>
    </section>
  )
}

/** The end of each lesson: the codebase it came from and the files that back it. */
export function SourceCallout(handle: Handle<{ post: LessonPost }>) {
  return () => {
    let { post } = handle.props
    let { codebase } = roundOf(post)

    return (
      <section class="callout source" aria-labelledby="source-h">
        <p class="callout-kicker">Read the source</p>
        <p class="callout-title" id="source-h">
          Where this comes from
        </p>
        <p>
          <strong>
            <a href={codebase.url}>{codebase.name}</a>
          </strong>{' '}
          (<code>{codebase.repo}</code>), {codebase.blurb}. The files behind this lesson:
        </p>
        <ul>
          {post.sources.map((source) => (
            <li>
              <a href={`${codebase.blobBase}${source}`}>
                <code>{source}</code>
              </a>
            </li>
          ))}
        </ul>
      </section>
    )
  }
}

/** "opencode · lesson 3" or "opencode · tips", for breadcrumbs. */
export function lessonLabel(post: SeriesPost): string {
  let name = roundOf(post).codebase.name.toLowerCase()
  return `${name} · ${post.kind === 'lesson' ? `lesson ${post.lesson}` : 'tips'}`
}

export const lessonCount = LESSONS_PER_ROUND
