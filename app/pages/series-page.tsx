import { postPath, postUrl, seriesIndex, seriesPosts } from '../content/posts.ts'
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
            extra={`${lessonCount} lessons + finale`}
            heading={
              <>
                Guess the codebase<span style="color:var(--accent)">?</span>
              </>
            }
          />
          <PostBody slug={post.slug}>
            <h2>The lessons</h2>
            <ul class="posts">
              {seriesPosts.map((entry) => (
                <li>
                  <a class="row" href={postPath(entry)}>
                    <span class="t">
                      <span class="tag">
                        {entry.kind === 'lesson' ? `${entry.lesson} · ${entry.tag}` : 'finale'}
                      </span>
                      {entry.kind === 'lesson' ? entry.title : 'The reveal + 30 power-user tips'}
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
              <p class="callout-kicker">🕵️ Hint zero</p>
              <p>
                It's open source, it has hundreds of thousands of users, and the people building it
                use it to build it.
              </p>
              <div class="game-actions" style="margin:0.8rem 0 0">
                <a
                  class="btn btn-primary"
                  href={tweetIntent(
                    `🕵️ Playing #GuessTheCodebase by @${site.twitterHandle}. My first guess: `,
                    postUrl(post),
                  )}
                  target="_blank"
                  rel="noopener"
                >
                  <XLogo /> Post a first guess
                </a>
                <a class="btn" href={site.social.twitter}>
                  {`Follow @${site.twitterHandle}`}
                </a>
              </div>
            </div>
          </PostBody>
          <ShareBar post={post} />
        </main>
      </Document>
    )
  }
}
