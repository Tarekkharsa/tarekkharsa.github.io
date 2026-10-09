import { defineRound } from '../series.ts'

/** Round 1, published 2026-10-09. Its URLs, images and text are already shared: don't change them. */
export const t3codeRound = defineRound({
  number: 1,
  date: '2026-10-09',
  slugPrefix: 'gtc',
  answer: {
    name: 'T3 Code',
    repo: 'pingdotgg/t3code',
    url: 'https://github.com/pingdotgg/t3code',
    blobBase: 'https://github.com/pingdotgg/t3code/blob/main/',
    blurb: 'the open-source GUI for coding agents',
  },
  hintZero:
    "It's open source, it has hundreds of thousands of users, and the people building it use it to build it.",
  lessons: [
    {
      slug: 'gtc-01-decide-commit-then-act',
      lesson: 1,
      title: 'Decide, commit, then act',
      subtitle:
        'The three-step server pattern that keeps AI agents from leaving your app in a weird state.',
      tag: 'Architecture',
      readMinutes: 2,
      hints: [
        "It's open source and has over 400,000 users.",
        'The same server drives a web app, a desktop app and a mobile app.',
        'Its server is event-sourced and written in TypeScript.',
      ],
      sources: [
        'docs/internals/overview.md',
        'apps/server/src/orchestration-v2/Orchestrator.ts',
        'apps/server/src/orchestration-v2/EventSink.ts',
        'apps/server/src/orchestration-v2/EffectWorker.ts',
      ],
    },
    {
      slug: 'gtc-02-performance-budgets-as-tests',
      lesson: 2,
      title: 'Performance budgets belong in unit tests',
      subtitle:
        "Seven performance patterns from one repo's commit log, and why their budgets fail the build.",
      tag: 'Performance',
      readMinutes: 2,
      hints: [
        'Its maintainers list “performance without compromise” as a value they never trade away.',
        'Its users run AI agents all day, and the docs say they notice a single dropped frame.',
        'Its server is built on the Effect library.',
      ],
      sources: [
        'docs/internals/performance-regressions.md',
        'apps/server/src/orchestration-v2/ThreadTransportPerformance.test.ts',
        'oxlint-plugin-t3code/rules/no-unscoped-has.ts',
        'docs/internals/connection-runtime.md',
      ],
    },
    {
      slug: 'gtc-03-mock-the-boundary',
      lesson: 3,
      title: 'Mock the boundary, not the logic',
      subtitle:
        '“A test that needs a timeout to pass is wrong.” Testing rules from a repo that bans sleeps.',
      tag: 'Testing',
      readMinutes: 2,
      hints: [
        'It talks to six different AI coding agents through their own CLIs.',
        'Its pitch: “bring your own subscription”.',
        'Every agent turn ends with a hidden git ref so you can diff and restore.',
      ],
      sources: [
        'docs/orchestration-v2/testing-strategy.md',
        'packages/shared/src/DrainableWorker.ts',
        'apps/server/scripts/migrate-dev-db.ts',
        'oxlint-plugin-t3code/rules/no-test-in-loop.ts',
      ],
    },
    {
      slug: 'gtc-04-pr-process-for-the-ai-era',
      lesson: 4,
      title: 'A PR process for the AI era',
      subtitle:
        'When anyone can generate a 2,000-line PR in ten minutes, review time is what you protect.',
      tag: 'GitHub & PRs',
      readMinutes: 2,
      hints: [
        'One of its maintainers is a well-known tech YouTuber.',
        'Over a thousand commits on main carry AI co-author trailers.',
        'Its AI triage bot loads its rules from main, never from the PR.',
      ],
      sources: [
        'CONTRIBUTING.md',
        '.github/pull_request_template.md',
        '.github/workflows/pr-size.yml',
        '.github/workflows/mobile-fingerprint-check.yml',
        '.macroscope/check-run-agents/ui-consistency.md',
        '.macroscope/approvability.md',
      ],
    },
    {
      slug: 'gtc-05-taste-as-lint-rules',
      lesson: 5,
      title: 'Turn taste into lint rules',
      subtitle: "Review comments don't scale. A repo with 14 custom lint rules shows what does.",
      tag: 'DX & Tooling',
      readMinutes: 1,
      hints: [
        'It ships its own oxlint plugin.',
        'Its name is a letter followed by a number.',
        'Its desktop app wraps the web app in Electron.',
      ],
      sources: [
        'oxlint-plugin-t3code/rules/',
        'oxlint-plugin-t3code/rules/no-native-title-tooltip.ts',
        'oxlint-plugin-t3code/rules/require-suppression-reason.ts',
        'docs/internals/web-ui.md',
        'knip.jsonc',
      ],
    },
    {
      slug: 'gtc-06-dev-setup-for-parallel-agents',
      lesson: 6,
      title: 'A dev setup built for ten agents on one laptop',
      subtitle:
        'Ports, databases, processes and URLs: everything shared becomes a collision once agents run in parallel.',
      tag: 'Dev setup',
      readMinutes: 2,
      hints: [
        'Most of its contributions come from the app itself, controlled remotely.',
        'It creates a git worktree per task.',
        'You can install it with a three-character npx command.',
      ],
      sources: [
        'scripts/dev-runner.ts',
        'scripts/setup-worktree.ts',
        't3.json',
        'docs/operations/development.md',
        '.github/workflows/ci.yml',
      ],
    },
    {
      slug: 'gtc-07-honest-ui',
      lesson: 7,
      title: 'Lying spinners, stale labels, one-way doors',
      subtitle:
        'UX rules from a repo whose users stare at it all day and notice every lie the UI tells.',
      tag: 'UI / UX',
      readMinutes: 2,
      hints: [
        'It shows live status for agents running on other machines.',
        'It reconnects across LAN, Tailscale, SSH and its own tunnel.',
        'Its mobile app is React Native and shares a client runtime with the web app.',
      ],
      sources: [
        'docs/internals/connection-runtime.md',
        'AGENTS.md',
        'docs/internals/web-ui.md',
        'apps/web/src/components/chat/ComposerBanner.tsx',
      ],
    },
    {
      slug: 'gtc-08-write-docs-for-agents',
      lesson: 8,
      title: 'Write docs for your most frequent contributor',
      subtitle:
        'In this repo, the most frequent contributor is an AI agent running inside the app itself.',
      tag: 'AI-native engineering',
      readMinutes: 1,
      hints: [
        'Its agent guide opens with a note from the founder.',
        "It's a GUI for coding agents, and it's used to build itself.",
        "I've already written about it on this blog.",
      ],
      sources: ['AGENTS.md', 'docs/internals/glossary.md', 'CONTRIBUTING.md'],
    },
  ],
  finale: {
    slug: 'gtc-reveal-t3-code-power-user-tips',
    title: 'The reveal: it was T3 Code (plus 30 power-user tips)',
    teaser: 'The reveal + 30 power-user tips',
    description:
      "All eight #GuessTheCodebase lessons came from T3 Code. Here's the repo, plus 30 power-user tips for using it every day.",
    subtitle:
      "All eight lessons came from one open-source repo. Here it is, and here's how to get the most out of it.",
    tag: 'Finale',
    readMinutes: 5,
    image: { path: '/assets/og/gtc-reveal.png', alt: 'Guess the codebase: the reveal. It was T3 Code.' },
    shareText:
      'The #GuessTheCodebase answer: it was T3 Code. 8 engineering lessons, plus 30 power-user tips:',
  },
})
