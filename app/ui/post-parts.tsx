import type { Handle, RemixNode } from 'remix/component'
import { unsafeHTML } from 'remix/component'

import {
  earlierHints,
  LESSONS_PER_ROUND,
  postPath,
  postUrl,
  readPostBody,
  roundOf,
  roundPosts,
  series,
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
  return () => (
    <nav class="series-nav" aria-label="Series">
      <a class="label" href={postPath(seriesIndex)}>
        {`${series.name} · round ${handle.props.current.round}`}
      </a>
      <ol>
        {roundPosts(roundOf(handle.props.current)).map((post) => (
          <li>
            <a
              href={postPath(post)}
              aria-current={post === handle.props.current ? 'page' : undefined}
              title={post.kind === 'lesson' ? post.title : 'The reveal'}
            >
              {post.kind === 'lesson' ? String(post.lesson) : '?'}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function SeriesPager(handle: Handle<{ current: SeriesPost }>) {
  return () => {
    let { prev, next } = seriesNeighbors(handle.props.current)
    let prevLink = prev
      ? { href: postPath(prev), label: prev.title }
      : { href: postPath(seriesIndex), label: 'Series intro & rules' }
    let nextLink = next
      ? { href: postPath(next), label: next.kind === 'finale' ? next.teaser : next.title }
      : { href: postPath(seriesIndex), label: 'Back to the series' }

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

function HintList(handle: Handle<{ hints: string[]; prefix: string }>) {
  return () => (
    <ul class="hints">
      {handle.props.hints.map((hint, index) => (
        <li>
          <details>
            <summary>{`Hint ${handle.props.prefix}${index + 1}`}</summary>
            <p>{hint}</p>
          </details>
        </li>
      ))}
    </ul>
  )
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

/** The #GuessTheCodebase box at the end of each lesson: hints, a guess button and the answer. */
export function GuessCallout(handle: Handle<{ post: LessonPost }>) {
  return () => {
    let { post } = handle.props
    let earlier = earlierHints(post)
    let { answer } = roundOf(post)
    // Round 1 posts were shared before there were rounds, so their guess tweets say "lesson N".
    let which = post.round === 1 ? `lesson ${post.lesson}` : `round ${post.round}, lesson ${post.lesson}`
    let guessText = `🕵️ My ${series.hashtag} guess for ${which} ("${post.title}") by @${site.twitterHandle}: `

    return (
      <section class="callout game" aria-labelledby="game-h">
        <p class="callout-kicker">🕵️ {series.hashtag}</p>
        <p class="callout-title" id="game-h">
          Which open-source codebase did I learn this from?
        </p>
        <p>Open the hints one at a time, then post your guess before you peek.</p>
        <HintList hints={post.hints} prefix="" />
        {earlier.length > 0 ? (
          <details class="hints-earlier">
            <summary>{`+ ${earlier.length} hints from earlier lessons`}</summary>
            <HintList hints={earlier} prefix="E" />
          </details>
        ) : null}
        <div class="game-actions">
          <a
            class="btn btn-primary"
            href={tweetIntent(guessText, postUrl(post))}
            target="_blank"
            rel="noopener"
          >
            <XLogo /> Post my guess
          </a>
        </div>
        <details class="reveal">
          <summary>I give up. Reveal the codebase.</summary>
          <div class="answer">
            <p>
              <strong>
                <a href={answer.url}>{answer.name}</a>
              </strong>{' '}
              (<code>{answer.repo}</code>), {answer.blurb}. Where to look:
            </p>
            <ul>
              {post.sources.map((source) => (
                <li>
                  <a href={`${answer.blobBase}${source}`}>
                    <code>{source}</code>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </details>
      </section>
    )
  }
}

/** "round 2 · lesson 3" or "round 2 · the reveal", for breadcrumbs. */
export function lessonLabel(post: SeriesPost): string {
  return `round ${post.round} · ${post.kind === 'lesson' ? `lesson ${post.lesson}` : 'the reveal'}`
}

export const lessonCount = LESSONS_PER_ROUND
