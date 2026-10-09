import type { Handle } from 'remix/component'

import { postPath, postUrl, roundPosts, rounds, seriesIndex, type Round } from '../content/posts.ts'
import { site, tweetIntent } from '../site.ts'
import { Document } from '../ui/document.tsx'
import { XLogo } from '../ui/icons.tsx'
import { Crumbs, lessonCount, PostBody, PostHeader, ShareBar } from '../ui/post-parts.tsx'

export function SeriesPage() {
  return () => {
    let post = seriesIndex

    return (
      <Document
        path={postPath(post)}
        title={`${post.title} — Tarek Kharsa`}
        description={post.description}
        og={{ title: post.title, type: 'website', image: post.image }}
        nav="series"
      >
        <main id="content">
          <Crumbs trail={[{ label: 'guess the codebase' }]} />
          <PostHeader
            post={post}
            extra={`${rounds.length} rounds · ${lessonCount} lessons each`}
            heading={
              <>
                Guess the codebase<span style="color:var(--accent)">?</span>
              </>
            }
          />
          <PostBody slug={post.slug}>
            {rounds.map((round, index) => (
              <RoundSection round={round} latest={index === 0} />
            ))}
          </PostBody>
          <ShareBar post={post} />
        </main>
      </Document>
    )
  }
}

function RoundSection(handle: Handle<{ round: Round; latest: boolean }>) {
  return () => {
    let { round, latest } = handle.props
    let id = `round-${round.number}`

    return (
      <section aria-labelledby={id}>
        <h2 id={id}>{latest ? `Round ${round.number} (new)` : `Round ${round.number}`}</h2>
        <ul class="posts">
          {roundPosts(round).map((entry) => (
            <li>
              <a class="row" href={postPath(entry)}>
                <span class="t">
                  <span class="tag">
                    {entry.kind === 'lesson' ? `${entry.lesson} · ${entry.tag}` : 'finale'}
                  </span>
                  {entry.kind === 'lesson' ? entry.title : entry.teaser}
                </span>
                <span class="d">
                  {entry.kind === 'lesson' ? `${entry.readMinutes} min` : 'spoilers'}
                </span>
                <span class="s">
                  {entry.kind === 'lesson'
                    ? entry.subtitle
                    : "Only open this once you've made your guess."}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div class="callout game">
          <p class="callout-kicker">{`🕵️ Round ${round.number}, hint zero`}</p>
          <p>{round.hintZero}</p>
          <div class="game-actions" style="margin:0.8rem 0 0">
            <a
              class="btn btn-primary"
              href={tweetIntent(
                round.number === 1
                  ? `🕵️ Playing #GuessTheCodebase by @${site.twitterHandle}. My first guess: `
                  : `🕵️ Playing #GuessTheCodebase round ${round.number} by @${site.twitterHandle}. My first guess: `,
                postUrl(seriesIndex),
              )}
              target="_blank"
              rel="noopener"
            >
              <XLogo /> Post a first guess
            </a>
            {latest ? (
              <a class="btn" href={site.social.twitter}>
                {`Follow @${site.twitterHandle}`}
              </a>
            ) : null}
          </div>
        </div>
      </section>
    )
  }
}
