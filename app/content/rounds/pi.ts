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
      problem: "Core teams keep adding features to the core, and users who disagree with one have to fork.",
      idea: "Build your own features on your public plugin API so users can replace them. A feature that can't be a plugin exposes a gap in the API.",
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
      prompt: `Check whether this project's built-in features could run on its own extension or plugin API.

The idea: keep the core small, and build first-party features on the same public extension API that third parties use, so users can replace them. If a first-party feature can't be written as a plugin, the API is missing something.

1. Find the extension, plugin or hook API. If there isn't one, tell me and say whether one is worth adding.
2. List the built-in features that sit on top of the core. For each, say whether it uses the public API or reaches into internals.
3. Pick the most self-contained feature that reaches into internals, and describe the minimal API additions it would need to work as a plugin.
4. If the gap is small, refactor that one feature onto the public API with identical behavior, and add a test showing that a replacement plugin can take its place.

Don't add speculative hooks: every new hook needs a real caller. Keep the change small.`,
    },
    {
      slug: 'gtc2-02-entry-points-are-cost-contracts',
      lesson: 2,
      title: 'Entry points are cost contracts',
      subtitle: 'Importing one 6 KB function loaded 106 files. Now a commit check counts them.',
      tag: 'Performance',
      readMinutes: 2,
      problem: "Importing one small function through a barrel file can quietly load a whole package, and nothing fails.",
      idea: "Treat each entry point as a budget: count the files its imports reach, forbid heavy paths, and fail the commit when it grows.",
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
      prompt: `Add a check that limits how much code each of this project's entry points pulls in.

The idea: importing one small function through a barrel file (an index that re-exports everything) can load the whole package. Give each entry point a budget, a file count plus forbidden paths, and fail the check when its import graph grows past it.

1. Find the entry points (package.json "exports", main or module fields, or the app's startup modules) and any barrel files.
2. For each entry point, report how many local files its value imports reach. Note that import { type X } from "..." can still emit a runtime import; only import type { X } is fully erased.
3. Write a small script that walks each entry point's import graph and fails if it exceeds its budget or reaches a forbidden path, such as a heavy provider folder. Start budgets at today's numbers plus a little headroom.
4. Add it to the existing lint or check command, and fix any obvious import { type ... } cases.

Keep the script short and dependency-free, and show me the numbers it found.`,
    },
    {
      slug: 'gtc2-03-fake-model-empty-environment',
      lesson: 3,
      title: 'A fake model and an empty environment',
      subtitle: 'Agent tests with no real models, no real keys, and nothing from your machine.',
      tag: 'Testing',
      readMinutes: 2,
      problem: "Agent tests that call real models are slow, cost money, need keys, and can read your real credentials.",
      idea: "Test against a scripted fake model, in an environment with nothing of yours in it, and name regression tests after their issue.",
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
      prompt: `Make this project's tests independent of real external services and of my machine's environment.

The idea: replace the external dependency (an LLM, a payment API, any third-party service) with a scripted fake that behaves like the real one, and run tests in a clean environment: a temporary HOME, a fixed time zone and locale, no global git or package-manager config, and no credentials.

1. Find tests that call real external services, need API keys, or read from the real home directory, global config or environment variables.
2. For the most important external service, propose a scripted fake that returns exactly what each test asks for, including streaming and errors if the real one has them.
3. Add or update the test script so it runs with an allowlisted environment, for example env -i with PATH, a temporary HOME, TZ=UTC and LANG=C.
4. Move one or two tests onto the fake and the clean environment, and show that they pass without any keys.

Name new regression tests after the issue they fix. Keep the change small.`,
    },
    {
      slug: 'gtc2-04-closed-by-default',
      lesson: 4,
      title: 'Closed by default',
      subtitle: "New contributors' issues and PRs auto-close until a maintainer replies “lgtm”.",
      tag: 'GitHub & PRs',
      readMinutes: 2,
      problem: "Popular repos now get more issues and PRs, many written by agents, than maintainers can read.",
      idea: "Close new contributors' issues and PRs by default, review them daily, and approve people with a one-word comment.",
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
      prompt: `Set up a contributor gate for this GitHub repository, for when issues and PRs outnumber the reviewers.

The idea: issues and PRs from new contributors are closed automatically with a friendly explanation. Maintainers review the closed ones regularly and reopen the good ones. Approval is a one-word maintainer comment, and approved contributors are listed in a plain text file in the repo, always read from the default branch.

1. Look at the existing workflows, issue templates and contributing guide, and summarize the current process.
2. Propose the gate: an APPROVED_CONTRIBUTORS file format, a workflow that closes issues and PRs from unlisted authors with a comment, and a workflow that adds an author when a maintainer with write access replies with an approval word.
3. Make sure the gate reads the approval file from the default branch, never from the PR, and that maintainers and trusted bots are exempt.
4. Update CONTRIBUTING.md to explain the process and why it exists, in a friendly tone.

Ask me before enabling it: it changes how people experience the project.`,
    },
    {
      slug: 'gtc2-05-lockfile-is-code',
      lesson: 5,
      title: 'Treat the lockfile as code',
      subtitle: 'Three packages may run install scripts. Every other dependency change has to ask.',
      tag: 'Security',
      readMinutes: 2,
      problem: "Supply-chain attacks arrive through lockfile changes nobody reads and install scripts that run on every machine.",
      idea: "Pin exact versions, disable install scripts except a short allowlist with reasons, and block lockfile commits unless they're on purpose.",
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
      prompt: `Harden how this project handles dependency changes.

The idea: treat dependency and lockfile changes as reviewed code. Pin exact versions, install without lifecycle scripts, allow only a short documented list of packages to run install scripts, and block lockfile commits unless someone confirms the change is intentional.

1. Check how dependencies are declared (ranges or exact versions), how CI installs them, and whether install scripts run.
2. Find which dependencies actually have install scripts, and for each say whether it needs them and why.
3. Propose and implement: a check that direct dependencies use exact versions; installs with scripts disabled (for npm, --ignore-scripts) plus an allowlist with a reason per package; and a pre-commit check that stops lockfile commits unless an environment variable confirms them, printing what changed.
4. If there's no scheduled audit, add one that fails on moderate or worse advisories and needs a written reason to accept one.

Before changing CI, show me any dependency that breaks without its install script.`,
    },
    {
      slug: 'gtc2-06-many-agents-one-checkout',
      lesson: 6,
      title: 'Many agents, one checkout',
      subtitle: 'The git rules you need when several agents edit the same working tree.',
      tag: 'Dev setup',
      readMinutes: 2,
      problem: "When several agents share one working tree, a single git add -A or git stash can wipe out another agent's work.",
      idea: "Ban the git commands that act on everything, and make every commit list its own files.",
      hints: [
        'Its agent guide assumes several agents are editing the same checkout at once.',
        'Its agent guide bans git stash.',
        'Its prompt templates live in a hidden folder named after the project.',
      ],
      sources: ['AGENTS.md', '.pi/prompts/wr.md', '.pi/prompts/'],
      prompt: `Add git safety rules to this repository's agent guide, for when several agents work in the same checkout.

The idea: when more than one agent edits the same working tree, any git command that acts on "everything" can destroy another agent's work. Each agent commits only its own files, staged by explicit path.

1. Read the existing agent guide (AGENTS.md, CLAUDE.md or similar) and the contributing docs.
2. Add a short "Git" section: commit only files you changed in this session, staged with explicit paths; run git status before committing; never run git add -A, git add ., git stash, git reset --hard, git checkout ., git clean -fd or git commit --no-verify; on a rebase conflict in a file you didn't touch, abort and ask; never force push; review PRs with gh pr diff or git show instead of switching branches; write throwaway scripts to /tmp.
3. If the repo has pre-commit hooks, say which of these rules could be enforced there rather than only written down.

Keep the section short and in the guide's existing tone.`,
    },
    {
      slug: 'gtc2-07-who-owns-the-scrollback',
      lesson: 7,
      title: 'Decide who owns the scrollback',
      subtitle: 'Two terminal renderers, one interface, and a test that counts full redraws.',
      tag: 'UI / UX',
      readMinutes: 2,
      problem: "A terminal UI that half-owns scrolling, or redraws the whole screen, flickers, loses scrollback and breaks selection.",
      idea: "Decide who owns the scrollback in each mode, redraw only what changed, and count full redraws in tests.",
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
      prompt: `Find this UI's most expensive operation, count it, and add a test that keeps it rare.

The idea: decide clearly who owns each piece of UI behavior, and don't half-own it. Then count the expensive operation (full re-renders, full redraws, forced layouts, refetches) and assert on that count in tests. A counter catches regressions a screenshot never will.

1. Look at how this UI renders and updates, and identify the most expensive operation it does often, such as re-rendering a whole list, refetching a whole page or redrawing the whole screen.
2. Add a cheap counter for it, as a debug-only metric or test hook, with no behavior change.
3. Write a test for a common interaction asserting that the count doesn't go up when it shouldn't, for example editing one row doesn't re-render the whole list.
4. Point out anywhere the app half-owns something the platform already does (scrolling, focus, selection, history), and suggest whether to own it fully or leave it to the platform.

Keep the change small and explain the number you assert on.`,
    },
    {
      slug: 'gtc2-08-measure-your-docs',
      lesson: 8,
      title: 'Measure whether your docs help',
      subtitle: 'Run the agent with and without the docs, and keep what moves the number.',
      tag: 'AI-native engineering',
      readMinutes: 2,
      problem: "Everyone writes docs for agents, but almost nobody knows whether they help.",
      idea: "Run the same tasks with and without the docs, and keep what moves the pass rate.",
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
      prompt: `Measure whether this repository's docs actually help an AI agent do real tasks.

The idea: run the same tasks with and without the docs, in clean, isolated environments, and compare the pass rates. Keep the docs that move the number.

1. Pick three to five realistic tasks a new contributor or agent would do here, such as adding an API endpoint, writing an extension or fixing a typical bug. Each needs an automatic pass/fail check.
2. Propose a small eval harness: each task runs in a fresh copy of the repo, once with the docs (README, docs folder, agent guide) and once with them removed, using the same model and tools.
3. Report the pass rate for each variant and the difference. Count crashed or missing runs as blocked, not failed, and say when there are too few runs to trust the result.
4. Separately, have an agent check one docs page against the code and report clear contradictions with file and line.

Start with the plan and one task end to end before building the rest.`,
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
