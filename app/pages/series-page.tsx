import type { Handle } from 'remix/component'

import { postPath, roundPosts, rounds, seriesIndex, type Round } from '../content/posts.ts'
import { Document } from '../ui/document.tsx'
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
          <Crumbs trail={[{ label: 'lessons' }]} />
          <PostHeader
            post={post}
            extra={`${rounds.length} codebases · ${rounds.length * lessonCount} lessons`}
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
    let { codebase } = round
    let id = `round-${round.number}`

    return (
      <section aria-labelledby={id}>
        <h2 id={id}>{latest ? `${codebase.name} (new)` : codebase.name}</h2>
        <p class="round-intro">
          <a href={codebase.url}>
            <code>{codebase.repo}</code>
          </a>
          , {codebase.blurb}. {round.pitch}
        </p>
        <ul class="posts">
          {roundPosts(round).map((entry) => (
            <li>
              <a class="row" href={postPath(entry)}>
                <span class="t">
                  <span class="tag">
                    {entry.kind === 'lesson' ? `${entry.lesson} · ${entry.tag}` : 'tips'}
                  </span>
                  {entry.kind === 'lesson' ? entry.title : entry.teaser}
                </span>
                <span class="d">{`${entry.readMinutes} min`}</span>
                <span class="s">{entry.subtitle}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    )
  }
}
