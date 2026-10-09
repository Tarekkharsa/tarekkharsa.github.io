import { defineRound } from '../series.ts'

/** The commit studied. V2 was unreleased and moving fast, so "where to look" links pin it. */
const STUDIED_AT = '388406238bd5ca15564a762840a2362c3a45bd9c'

/**
 * Round 3, published 2026-10-09. Studied OpenCode v2 on `dev` at 3884062 (2026-10-08).
 * Research and the source of every claim: projects/opencode/research/.
 */
export const opencodeRound = defineRound({
  number: 3,
  date: '2026-10-09',
  slugPrefix: 'gtc3',
  answer: {
    name: 'OpenCode',
    repo: 'anomalyco/opencode',
    url: 'https://github.com/anomalyco/opencode',
    blobBase: `https://github.com/anomalyco/opencode/blob/${STUDIED_AT}/`,
    blurb: 'the open-source coding agent (these lessons are from its upcoming v2)',
  },
  hintZero:
    "It's open source, it's very popular, and it's in the middle of rebuilding its own core.",
  pitch:
    'A durable prompt inbox, a system prompt that never gets rewritten, HTTP cassettes instead of mocks, a lab notebook for speed, and more, from a rewrite in progress.',
  lessons: [
    {
      slug: 'gtc3-01-admit-then-run',
      lesson: 1,
      title: 'Admit the prompt first, run it later',
      subtitle: "A durable inbox between “you pressed Enter” and “the model sees it.”",
      tag: 'Architecture',
      readMinutes: 2,
      hints: [
        "It's open source, and its README is translated into 21 languages.",
        'It runs on Bun.',
        "Its default branch isn't called main.",
      ],
      sources: [
        'CONTEXT.md',
        'specs/v2/session.md',
        'AGENTS.md',
        'packages/core/src/database/migration/20260603141458_session_input_inbox.ts',
      ],
    },
    {
      slug: 'gtc3-02-never-rewrite-the-system-prompt',
      lesson: 2,
      title: 'Never rewrite the system prompt',
      subtitle: 'Freeze the baseline, append what changed, and keep the provider cache warm.',
      tag: 'Performance',
      readMinutes: 2,
      hints: [
        'Its terminal UI is written in SolidJS.',
        'Its headless server listens on port 4096 by default.',
        'Its terminal UI can attach to a server running somewhere else.',
      ],
      sources: [
        'CONTEXT.md',
        'packages/core/src/system-context/index.ts',
        'packages/core/src/session/context-epoch.ts',
      ],
    },
    {
      slug: 'gtc3-03-record-once-replay-forever',
      lesson: 3,
      title: 'Record real HTTP once, replay it forever',
      subtitle: 'Cassettes instead of mocks, and a CI that refuses to record.',
      tag: 'Testing',
      readMinutes: 2,
      hints: [
        'It published its HTTP test recorder as its own npm package.',
        'New model providers are added in a separate open database, not in this repo.',
        'The team behind it also makes an infrastructure-as-code framework.',
      ],
      sources: [
        'packages/http-recorder/README.md',
        'packages/core/test/session-runner-recorded.test.ts',
        'packages/llm/test/recorded-test.ts',
      ],
    },
    {
      slug: 'gtc3-04-lab-notebook-for-speed',
      lesson: 4,
      title: 'Keep a lab notebook for speed work',
      subtitle: 'Every hypothesis gets a before, an after and a decision. Dead ends included.',
      tag: 'DX & Tooling',
      readMinutes: 2,
      hints: [
        'Its full test suite took close to four minutes before the speed-up work.',
        'It has its own curated model gateway.',
        'Its second-busiest committer is its own GitHub app.',
      ],
      sources: ['perf/test-suite.md', 'packages/opencode/package.json'],
    },
    {
      slug: 'gtc3-05-one-api-even-in-process',
      lesson: 5,
      title: 'One API, even in-process',
      subtitle: 'The embedded SDK sends real requests to the real router, without a network.',
      tag: 'API design',
      readMinutes: 2,
      hints: [
        'Its SDK is generated from its HTTP API definition.',
        'It ships an official Slack integration.',
        'You can summon it in a GitHub comment with a slash command.',
      ],
      sources: ['packages/sdk-next/src/opencode.ts', 'CONTEXT.md', 'AGENTS.md'],
    },
    {
      slug: 'gtc3-06-rebuild-on-the-main-branch',
      lesson: 6,
      title: 'Rebuild on the main branch',
      subtitle: 'A new major version grown next to the old one, with a dated log of every contract change.',
      tag: 'Dev process',
      readMinutes: 2,
      hints: [
        'It keeps a dated changelog of every schema change in its next major version.',
        'An old branch called 2.0 is thousands of commits behind.',
        'Its GitHub org was renamed, and the old URL still redirects.',
      ],
      sources: ['specs/v2/schema-changelog.md', 'specs/v2/config.md', 'specs/v2/todo.md'],
    },
    {
      slug: 'gtc3-07-configured-is-not-allowed',
      lesson: 7,
      title: 'Configured is not allowed',
      subtitle: 'Policy is its own layer, and the last matching rule wins.',
      tag: 'Security',
      readMinutes: 2,
      hints: [
        'Its whole provider policy check is one findLast.',
        'It has two built-in primary agents, and one of them asks before every file edit or shell command.',
        'You switch between those two agents with the Tab key.',
      ],
      sources: [
        'specs/v2/provider-policy.md',
        'packages/core/src/policy.ts',
        'packages/web/src/content/docs/policies.mdx',
      ],
    },
    {
      slug: 'gtc3-08-ban-the-synonyms',
      lesson: 8,
      title: 'Ban the synonyms',
      subtitle: 'A glossary that tells humans and agents which words not to use.',
      tag: 'AI-native engineering',
      readMinutes: 2,
      hints: [
        'Its glossary has 24 terms, and 9 of them list words to avoid.',
        'Its config file is named after the product, as .json or .jsonc.',
        'Its name is “code” with the opposite of “closed” in front.',
      ],
      sources: ['CONTEXT.md', 'AGENTS.md'],
    },
  ],
  finale: {
    slug: 'gtc3-reveal-power-user-tips',
    title: 'The reveal: it was OpenCode v2 (plus 20 power-user tips)',
    teaser: 'The reveal + 20 power-user tips',
    description:
      "All eight round-3 #GuessTheCodebase lessons came from OpenCode's upcoming v2. Here's the repo, plus 20 power-user tips for using OpenCode today.",
    subtitle:
      "Round 3's eight lessons came from a rewrite in progress. Here's whose, and how to get the most out of it today.",
    tag: 'Finale',
    readMinutes: 5,
    image: {
      path: '/assets/og/gtc3-reveal.png',
      alt: 'Guess the codebase, round 3: the reveal. It was OpenCode v2.',
    },
    shareText:
      'The #GuessTheCodebase round 3 answer: it was OpenCode v2. 8 engineering lessons, plus 20 power-user tips:',
  },
})
