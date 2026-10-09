import { postPath, posts, rounds, seriesIndex } from '../content/posts.ts'
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

const latestRound = rounds[0]!

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
              Full-stack software engineer working on <strong>AI infrastructure</strong>. Years of
              shipping <strong>TypeScript</strong>: React front-ends, Node back-ends, and the
              occasional detour through PHP, Java and Flutter. These days I build the plumbing for
              coding agents: multi-agent orchestration, and the tooling that makes them reliable to
              run.
            </p>
            <p class="now">
              <span class="dot" aria-hidden="true" />
              <span>
                now: reading great codebases and posting{' '}
                <a href={postPath(seriesIndex)}>#GuessTheCodebase</a>
              </span>
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
            <figcaption>usually with coffee, reading someone else's code</figcaption>
          </figure>
        </section>

        <section class="section" aria-labelledby="series-h">
          <h2 class="section-title" id="series-h">
            Featured series
          </h2>
          <a class="feature" href={postPath(seriesIndex)}>
            <p class="kicker">
              <span>🕵️ #GuessTheCodebase</span>
              <span class="live">{`round ${latestRound.number} is live`}</span>
            </p>
            <h3>8 new lessons from a different open-source repo. Guess which one.</h3>
            <p>{latestRound.pitch}</p>
            <div class="steps" aria-hidden="true">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <span>{String(n)}</span>
              ))}
              <span class="final">reveal</span>
            </div>
            <span class="cta">Start playing →</span>
          </a>
        </section>

        <section class="section" id="writing" aria-labelledby="writing-h">
          <h2 class="section-title" id="writing-h">
            Writing
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
