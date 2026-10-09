import { defineRound } from '../series.ts'

/**
 * Round 2, published 2026-10-09. Studied at earendil-works/pi@6fb2e78 (2026-10-08).
 * Research and the source of every claim: projects/pi/research/.
 */
export const piRound = defineRound({
  number: 2,
  date: '2026-10-09',
  slugPrefix: 'gtc2',
  answer: {
    name: 'Pi',
    repo: 'earendil-works/pi',
    url: 'https://github.com/earendil-works/pi',
    blobBase: 'https://github.com/earendil-works/pi/blob/main/',
    blurb: 'the minimal, extensible agent harness',
  },
  hintZero:
    "It's open source, it's small on purpose, and it expects you to bend it to your own workflow.",
  pitch:
    'A core that lets you replace its own features, import budgets, tests with a fake model, PRs closed by default, lockfile gates, and more. Each post ends with hints.',
  lessons: [
    {
      slug: 'gtc2-01-small-replaceable-core',
      lesson: 1,
      title: 'Ship a small core, and make your own features replaceable',
      subtitle:
        "Its MCP support is a plugin, and a third-party plugin can replace it. That's the point.",
      tag: 'Architecture',
      readMinutes: 2,
      hints: [
        "It's open source and has more than 100,000 GitHub stars.",
        'It deliberately ships without sub-agents or a plan mode.',
        'Its built-in MCP support is a plugin that a third-party plugin can replace.',
      ],
      sources: [
        'CONTRIBUTING.md',
        'packages/coding-agent/src/extensions/index.ts',
        'packages/coding-agent/docs/mcp.md',
        'packages/coding-agent/examples/extensions/',
      ],
    },
    {
      slug: 'gtc2-02-entry-points-are-cost-contracts',
      lesson: 2,
      title: 'Entry points are cost contracts',
      subtitle: 'Importing one 6 KB function loaded 106 files. Now a commit check counts them.',
      tag: 'Performance',
      readMinutes: 2,
      hints: [
        "It's a TypeScript monorepo of 14 packages.",
        'CI checks that some of its packages still bundle for the browser.',
        'One of its packages is a single API for many LLM providers.',
      ],
      sources: [
        'scripts/check-entry-graphs.mjs',
        'scripts/check-browser-smoke.mjs',
        '.husky/pre-commit',
      ],
    },
    {
      slug: 'gtc2-03-fake-model-empty-environment',
      lesson: 3,
      title: 'A fake model and an empty environment',
      subtitle: 'Agent tests with no real models, no real keys, and nothing from your machine.',
      tag: 'Testing',
      readMinutes: 2,
      hints: [
        "Its test suite talks to a model that doesn't exist.",
        'Its test script starts from an empty environment.',
        '81 of its regression tests are named after the issue they fix.',
      ],
      sources: [
        'packages/ai/src/providers/faux.ts',
        'packages/coding-agent/test/suite/README.md',
        'test.sh',
        'packages/coding-agent/test/suite/regressions/',
      ],
    },
    {
      slug: 'gtc2-04-closed-by-default',
      lesson: 4,
      title: 'Closed by default',
      subtitle: "New contributors' issues and PRs auto-close until a maintainer replies “lgtm”.",
      tag: 'GitHub & PRs',
      readMinutes: 2,
      hints: [
        'Its maintainers created a famous Java game framework and a famous Python web framework.',
        'Its approved contributors are listed in a plain text file in the repo.',
        'A maintainer lets you open PRs by replying “lgtm”.',
      ],
      sources: [
        'CONTRIBUTING.md',
        '.github/workflows/pr-gate.yml',
        '.github/workflows/approve-contributor.yml',
        '.github/APPROVED_CONTRIBUTORS',
      ],
    },
    {
      slug: 'gtc2-05-lockfile-is-code',
      lesson: 5,
      title: 'Treat the lockfile as code',
      subtitle: 'Three packages may run install scripts. Every other dependency change has to ask.',
      tag: 'Security',
      readMinutes: 2,
      hints: [
        'You can install it with one curl command, and the installer pins every dependency.',
        'Only three of its dependencies are allowed to run install scripts.',
        'You can run it straight from GitHub with nix run.',
      ],
      sources: [
        'AGENTS.md',
        'scripts/check-lockfile-commit.mjs',
        'scripts/generate-coding-agent-install-lock.mjs',
        'scripts/npm-audit.mjs',
        '.github/workflows/npm-audit.yml',
      ],
    },
    {
      slug: 'gtc2-06-many-agents-one-checkout',
      lesson: 6,
      title: 'Many agents, one checkout',
      subtitle: 'The git rules you need when several agents edit the same working tree.',
      tag: 'Dev setup',
      readMinutes: 2,
      hints: [
        'Its agent guide assumes several agents are editing the same checkout at once.',
        'Its agent guide bans git stash.',
        'Its prompt templates live in a hidden folder named after the project.',
      ],
      sources: ['AGENTS.md', '.pi/prompts/wr.md', '.pi/prompts/'],
    },
    {
      slug: 'gtc2-07-who-owns-the-scrollback',
      lesson: 7,
      title: 'Decide who owns the scrollback',
      subtitle: 'Two terminal renderers, one interface, and a test that counts full redraws.',
      tag: 'UI / UX',
      readMinutes: 2,
      hints: [
        'It has two terminal renderers behind one interface.',
        'It has a test that fails if editing a file redraws the whole screen.',
        'It runs on Android phones, and its renderer has a special case for that.',
      ],
      sources: [
        'packages/tui/README.md',
        'packages/tui/src/tui-main-screen.ts',
        'packages/coding-agent/test/edit-tool-no-full-redraw.test.ts',
        'packages/coding-agent/docs/keybindings.md',
      ],
    },
    {
      slug: 'gtc2-08-measure-your-docs',
      lesson: 8,
      title: 'Measure whether your docs help',
      subtitle: 'Run the agent with and without the docs, and keep what moves the number.',
      tag: 'AI-native engineering',
      readMinutes: 2,
      hints: [
        'It runs its agent with and without its docs to measure what the docs are worth.',
        'Its website is a two-letter name on .dev.',
        'Its name is a mathematical constant.',
      ],
      sources: [
        'packages/evals/README.md',
        'packages/evals/evals/documentation-audit.eval.ts',
        'packages/coding-agent/test/documentation.test.ts',
        '.pi/prompts/is.md',
      ],
    },
  ],
  finale: {
    slug: 'gtc2-reveal-power-user-tips',
    title: 'The reveal: it was Pi (plus 20 power-user tips)',
    teaser: 'The reveal + 20 power-user tips',
    description:
      "All eight round-2 #GuessTheCodebase lessons came from Pi. Here's the repo, plus 20 power-user tips for using it every day.",
    subtitle:
      "Round 2's eight lessons came from one open-source agent harness. Here it is, and here's how to get the most out of it.",
    tag: 'Finale',
    readMinutes: 5,
    image: { path: '/assets/og/gtc2-reveal.png', alt: 'Guess the codebase, round 2: the reveal. It was Pi.' },
    shareText:
      'The #GuessTheCodebase round 2 answer: it was Pi. 8 engineering lessons, plus 20 power-user tips:',
  },
})
