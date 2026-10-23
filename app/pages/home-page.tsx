import type { Handle } from 'remix/component'

import { LESSONS_PER_ROUND, postPath, posts, rounds, seriesIndex, type Round } from '../content/posts.ts'
import { absoluteUrl, site } from '../site.ts'
import { Document } from '../ui/document.tsx'
import { formatMonth } from '../ui/post-parts.tsx'

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.name,
  url: absoluteUrl('/'),
  jobTitle: site.jobTitle,
  image: absoluteUrl(site.photo.path),
  sameAs: [site.social.github, site.social.twitter],
}

export function HomePage() {
  return () => (
    <Document
      path="/"
      title="Tarek Kharsa — software engineer"
      description={site.description}
      og={{
        title: 'Tarek Kharsa — software engineer',
        type: 'website',
        image: {
          path: '/assets/og/home.png',
          alt: 'Tarek Kharsa — full-stack engineer, AI infrastructure',
        },
      }}
      jsonLd={personJsonLd}
    >
      <main id="content">
        <section class="hero hero-split">
          <div class="hero-head">
            <p class="prompt">
              <span class="dollar">$</span> whoami
            </p>
            <h1>
              Tarek Kharsa<span class="accent">.</span>
            </h1>
          </div>
          <div class="hero-body">
            <p class="lede">
              Full-stack engineer building <strong>infrastructure for coding agents</strong>:
              multi-agent orchestration and the tooling that makes agents reliable. Mostly{' '}
              <strong>TypeScript</strong> and <strong>Effect</strong>, after years of React, Node and
              the odd detour through PHP, Java and Flutter.
            </p>
            <p class="now">
              <span class="dot" aria-hidden="true" />
              <span>now: building agent tooling and sending fixes to Effect</span>
            </p>
            <ul class="links">
              <li>
                <a href={site.social.github}>github</a>
              </li>
              <li>
                <a href={site.social.twitter}>twitter</a>
              </li>
            </ul>
          </div>
          <figure class="portrait">
            <div class="portrait-bar" aria-hidden="true">
              <span class="portrait-dots">
                <span />
                <span />
                <span />
              </span>
              <span class="portrait-name">~/tarek.jpg</span>
            </div>
            <img
              src={site.photo.path}
              alt={site.photo.alt}
              width="400"
              height="400"
              fetchpriority="high"
            />
            <figcaption>on my way to fix what my agent broke</figcaption>
          </figure>
        </section>

        <section class="section" id="lessons" aria-labelledby="lessons-h">
          <h2 class="section-title" id="lessons-h">
            How great agent tools are built
          </h2>
          <p class="section-lede">
            {`Patterns from open-source coding agents, ${LESSONS_PER_ROUND} per codebase: short, checked against the source, with a prompt to apply each one to your own code.`}{' '}
            <a href={postPath(seriesIndex)}>How the lessons work →</a>
          </p>
          <div class="codebases">
            {rounds.map((round, index) => (
              <CodebaseCard round={round} latest={index === 0} />
            ))}
          </div>
        </section>

        <section class="section" id="writing" aria-labelledby="writing-h">
          <h2 class="section-title" id="writing-h">
            Guides
          </h2>
          <ul class="posts">
            {posts.flatMap((post) =>
              post.listing
                ? [
                    <li>
                      <a class="row" href={postPath(post)}>
                        <span class="t">
                          <span class="tag">{post.listing.tag}</span>
                          {post.listing.title}
                        </span>
                        <span class="d">{formatMonth(post.date)}</span>
                        <span class="s">{post.listing.summary}</span>
                      </a>
                    </li>,
                  ]
                : [],
            )}
          </ul>
        </section>
      </main>
    </Document>
  )
}

function CodebaseCard(handle: Handle<{ round: Round; latest: boolean }>) {
  return () => {
    let { round, latest } = handle.props
    let { codebase, lessons, finale } = round
    let id = `codebase-${round.number}`

    return (
      <article class="codebase" aria-labelledby={id}>
        <p class="kicker">
          <span>{codebase.repo}</span>
        </p>
        <div class="codebase-title">
          <h3 id={id}>
            <a href={postPath(lessons[0]!)}>{codebase.name}</a>
          </h3>
          {latest ? <span class="live">new</span> : null}
        </div>
        <p>{round.pitch}</p>
        <p class="codebase-links">
          <a class="cta" href={postPath(lessons[0]!)}>
            {`Read the ${lessons.length} lessons →`}
          </a>
          <a class="cta-quiet" href={postPath(finale)}>
            {`+ ${finale.teaser}`}
          </a>
        </p>
      </article>
    )
  }
}
