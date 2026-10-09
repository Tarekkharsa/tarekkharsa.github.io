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
  pitch:
    'Architecture, performance budgets, testing without sleeps, PR processes for the AI era, lint rules as taste, and more. Each post ends with hints.',
  lessons: [
    {
      slug: 'gtc-01-decide-commit-then-act',
      lesson: 1,
      title: 'Decide, commit, then act',
      subtitle:
        'The three-step server pattern that keeps AI agents from leaving your app in a weird state.',
      tag: 'Architecture',
      readMinutes: 2,
      problem: "When a request saves data and then calls another service, a crash or retry in between leaves the app in a state nobody planned for.",
      idea: "Decide with a pure function, commit the facts and the intended side effects in one transaction, then run the side effects afterwards.",
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
      prompt: `Apply the "decide, commit, then act" pattern to this codebase.

The idea: every state change goes through three steps. Decide: a pure function turns (current state, command) into the changes to make, with no I/O. Commit: one database transaction writes those changes together with a record of the side effects still to run (an outbox). Act: a worker runs the side effects after the commit and reports results back as new commands.

1. Find one workflow where a crash, timeout or retry could leave things half-done, for example saving a record and then calling an external API or sending an email in the same request. Show me the code path.
2. Tell me whether this pattern fits it. If it doesn't, say why and stop.
3. If it fits, propose the smallest version: a pure decide function, one transaction that also inserts an outbox row, and a worker that processes outbox rows with retries. Make retries idempotent, for example with a command ID.
4. Implement it, with tests for the decide function alone, a retry of the same command, and a crash between commit and act.

Don't introduce an event-sourcing framework. Keep the change small and tell me how you verified it.`,
    },
    {
      slug: 'gtc-02-performance-budgets-as-tests',
      lesson: 2,
      title: 'Performance budgets belong in unit tests',
      subtitle:
        "Seven performance patterns from one repo's commit log, and why their budgets fail the build.",
      tag: 'Performance',
      readMinutes: 2,
      problem: "Most teams find performance regressions when a user complains.",
      idea: "Write each budget down as a number and assert it in a unit test, on the path users actually run.",
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
      prompt: `Turn one of this codebase's performance expectations into a unit test.

The idea: write the budget down as a number (bytes sent, queries per request, items rendered, calls made) and assert it in a normal test, so a regression fails the build instead of reaching users.

1. Find the hot path that matters most to users here: a page load, an API response, a sync, a render. Measure what it does today: payload size, number of queries or calls, or work per item.
2. Propose one or two budgets with concrete numbers and a little headroom, and explain why each number matters. Prefer deterministic counts over wall-clock time.
3. Write the tests against the code path users actually run, not a simplified fixture.
4. Find the most recent performance fix in the git history. If a lint rule or check could stop that whole class of bug, propose it.

Keep the change small and show me the measured numbers.`,
    },
    {
      slug: 'gtc-03-mock-the-boundary',
      lesson: 3,
      title: 'Mock the boundary, not the logic',
      subtitle:
        '“A test that needs a timeout to pass is wrong.” Testing rules from a repo that bans sleeps.',
      tag: 'Testing',
      readMinutes: 2,
      problem: "Tests that mock your own logic, or sleep and hope, pass on your machine and flake or lie everywhere else.",
      idea: "Fake only the true boundaries (network, processes, clock, randomness) and wait for milestones instead of sleeping.",
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
      prompt: `Review this codebase's tests against the rule "fake the boundaries, not the logic."

The idea: replace only true boundaries in tests (network, processes, clock, random IDs, filesystem) and run the real code everywhere else. Time and randomness should be injectable in production code, and tests should wait for milestones instead of sleeping.

1. Find tests that mock our own modules or business logic, and tests that sleep or use timeouts to wait for something. List the worst offenders with file and line.
2. Pick one module. Check whether its clock, random IDs and external calls can be injected. If not, propose the smallest way to make them injectable without changing behavior.
3. Rewrite one or two of its tests: fake only the boundary, and replace sleeps with waiting on an explicit signal (a promise, an event, a drained queue).
4. Run them several times to show they're stable.

Don't rewrite the whole suite. Keep the change small and tell me what you'd do next.`,
    },
    {
      slug: 'gtc-04-pr-process-for-the-ai-era',
      lesson: 4,
      title: 'A PR process for the AI era',
      subtitle:
        'When anyone can generate a 2,000-line PR in ten minutes, review time is what you protect.',
      tag: 'GitHub & PRs',
      readMinutes: 2,
      problem: "Anyone can now open a PR, and PRs can carry code, config and text written to manipulate bots. CI that runs that code with secrets, or bots that read their rules from the PR, can be taken over.",
      idea: "Treat every PR as untrusted input: never run its code where secrets live, load bot policy from a pinned commit on main, and make reviewers' evidence part of the template.",
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
      prompt: `Audit this repository's CI and bots for trust-boundary problems with untrusted pull requests.

The idea: a pull request is untrusted input. Workflows with secrets or a write token must never execute PR code, bots must load their rules from a pinned commit on the default branch (never from the PR), and signals that affect releases must fire before merge.

1. List every workflow that runs on pull requests, with its trigger (pull_request, pull_request_target, workflow_run, issue_comment), its permissions, the secrets it can reach, and whether it checks out or executes code from the PR head.
2. Flag every "pwn request": a pull_request_target or similarly privileged job that checks out the PR's code and runs installs, builds, tests, scripts or caches. For each one, propose the safe split: pull_request with no secrets for running PR code, plus a separate trusted workflow_run job that only consumes its results.
3. Find bots or AI reviewers that read configuration or prompts. Make them resolve the default branch to a commit SHA once per run and load policy from that SHA, so a PR can't edit the rules it's judged by. A missing or malformed policy must leave the PR unresolved, never approve it.
4. Propose a short PR template section for evidence: what was verified, what was seen, what couldn't be checked.

Show me the findings first, worst first, before changing any workflow.`,
    },
    {
      slug: 'gtc-05-taste-as-lint-rules',
      lesson: 5,
      title: 'Turn taste into lint rules',
      subtitle: "Review comments don't scale. A repo with 14 custom lint rules shows what does.",
      tag: 'DX & Tooling',
      readMinutes: 1,
      problem: "The same review comments get written again and again, and still don't stick.",
      idea: "The second time you write a comment, turn it into a lint rule with tests, exceptions, and suppressions that must explain themselves.",
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
      prompt: `Turn repeated review feedback in this codebase into lint rules.

The idea: when you write the same review comment a second time, encode it as a lint rule with tests and documented exceptions. Suppressions must explain themselves.

1. Find candidates: rules mentioned in the style guide, agent guide or contributing docs, recurring fixes in the git history ("use X instead of Y"), and inconsistencies across the code. List the top three with examples.
2. For each, check whether the existing linter already has a rule or option for it. Prefer configuring an existing rule over writing a custom one.
3. Implement the best one: the rule or config, tests or fixtures showing what it flags and what it allows, and its exceptions spelled out.
4. If the linter supports it, require a reason on every suppression comment.

Fix the existing violations, or list them if there are too many. Keep the change small.`,
    },
    {
      slug: 'gtc-06-dev-setup-for-parallel-agents',
      lesson: 6,
      title: 'A dev setup built for ten agents on one laptop',
      subtitle:
        'Ports, databases, processes and URLs: everything shared becomes a collision once agents run in parallel.',
      tag: 'Dev setup',
      readMinutes: 2,
      problem: "Run several agents on one laptop and everything shared collides: ports, databases, processes, URLs.",
      idea: "Derive ports and state from each worktree, keep one origin, and never kill processes by pattern.",
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
      prompt: `Make this project's local dev setup safe for several agents working in parallel, each in its own git worktree or checkout.

The idea: anything shared on one machine becomes a collision when agents run in parallel: ports, databases, caches, background processes, URLs. Derive them from the worktree instead of hard-coding them.

1. Find everything the dev setup shares: fixed ports, a single local database or data directory, global caches, PID files, and scripts that kill processes by name or pattern.
2. Propose a scheme where each worktree gets its own values, for example ports derived from a hash of the worktree path and a gitignored data directory inside the worktree. The same worktree should get the same values on every run.
3. Replace any "kill by pattern" with stopping only the processes this worktree started.
4. Implement it in the dev scripts, print the chosen ports on startup, and document it in the README.

Check that two copies of the repo can run the dev server at the same time. Keep the change small.`,
    },
    {
      slug: 'gtc-07-honest-ui',
      lesson: 7,
      title: 'Lying spinners, stale labels, one-way doors',
      subtitle:
        'UX rules from a repo whose users stare at it all day and notice every lie the UI tells.',
      tag: 'UI / UX',
      readMinutes: 2,
      problem: "Spinners that never stop, “connected” badges that aren't, and actions you can't undo teach users to distrust the UI.",
      idea: "Treat every label as a promise: separate “connected” from “fresh”, never show cache as live, and give every action a way back.",
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
      prompt: `Audit this app's UI for status it can't back up.

The idea: every label is a promise. "Connected" and "up to date" are different states. Cached data must never look live. Every action needs a way back. Derived status should come from one source of truth, not from each client's own clock.

1. Find where the UI shows connection, loading, sync or freshness status, and check what each one is actually based on. A spinner that keeps spinning after an error, or "online" because a socket opened, are typical lies.
2. Find cached or offline data and check whether it can be shown as if it were live, or overwrite newer data on reconnect.
3. Find one-way doors: actions with no undo or reverse, like archive without unarchive or dismiss without restore.
4. Pick the most misleading case and fix it, with a test for the state that used to lie.

Report the rest as a short prioritized list. Keep the change small.`,
    },
    {
      slug: 'gtc-08-write-docs-for-agents',
      lesson: 8,
      title: 'Write docs for your most frequent contributor',
      subtitle:
        'In this repo, the most frequent contributor is an AI agent running inside the app itself.',
      tag: 'AI-native engineering',
      readMinutes: 1,
      problem: "The agent changing this repo usually runs inside the product it's changing, next to real data and other agents. One pkill, one write to the wrong database or one baked-in URL can break the developer's machine.",
      idea: "Write the agent guide as the system's real failure modes, each with the mechanism and the safe alternative, and make data flow one way into sandboxes.",
      hints: [
        'Its agent guide opens with a note from the founder.',
        "It's a GUI for coding agents, and it's used to build itself.",
        "I've already written about it on this blog.",
      ],
      sources: ['AGENTS.md', 'docs/internals/glossary.md', 'CONTRIBUTING.md'],
      prompt: `Write the "ways to hurt yourself" section of this repository's agent guide (AGENTS.md, CLAUDE.md or similar).

The idea: an agent working here runs on a real developer machine, often next to real data, other agents and the developer's own running app. The useful guide isn't a style guide; it's the system's real failure modes, each with the mechanism behind it and the safe command to use instead.

1. Explore how this project runs locally: dev servers, ports, background processes, databases and data directories, caches, environment variables that get baked into builds, and anything that talks to production or a shared service.
2. List the concrete ways an agent could cause damage here. Typical ones: killing processes by name or pattern (the agent's own command line often contains the worktree path), writing to a real or shared database, deleting caches or data directories, baking local URLs or secrets into a bundle, pushing to a shared branch.
3. For each, write three lines: the rule, the mechanism (why it breaks), and the safe alternative with the exact command, for example "kill only the PID you started, or the owner of your port after checking its working directory".
4. If the project needs realistic test data, design a one-way seeding step: copy a read-only snapshot into the agent's sandbox, drop anything that could trigger real side effects (scheduled jobs, pending work, credentials), and never symlink back.

Keep it short and concrete, and show me the draft before writing the file.`,
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
