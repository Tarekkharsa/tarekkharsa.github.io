# Source map: where each claim comes from

Paths are relative to [`pingdotgg/t3code`](https://github.com/pingdotgg/t3code) at `main`
(October 2026). Re-check a claim here before reusing it in a new post; the repo moves fast.

## Lesson 1: decide, commit, then act

- Pure orchestrator, one-transaction event sink, effect worker after commit:
  `docs/internals/overview.md` ("Durable intent and side effects"),
  `apps/server/src/orchestration-v2/{Orchestrator,EventSink,EffectWorker}.ts`
- "A command acknowledgement therefore means the intent committed": `docs/internals/overview.md`
- Persisted events must stay decodable on replay; lost-process effects are retired on
  recovery: `docs/internals/overview.md`
- Checkpoints as hidden git refs: `AGENTS.md` ("How it works"),
  `apps/server/src/checkpointing/CheckpointStore.ts`

## Lesson 2: performance budgets

- `toBeLessThanOrEqual(0.02)` / `(0.1)` payload ratios:
  `apps/server/src/orchestration-v2/ThreadTransportPerformance.test.ts`
- 75 rows / ~1 MiB cold open, 128 events / 1 MiB catch-up, old v1 fixtures "reassuring
  timings": `docs/internals/performance-regressions.md`
- PRs: #15265 (`:has()` one-liner), #15274 (lint rule `no-unscoped-has`), #16270 (~90% fewer
  GitHub points via fingerprint), #16760 (one query per sweep), #12600 (PATH once per command),
  #16682 (no snapshot per streamed chunk), #15266 (virtualized palette), #15397 (pause hidden
  timers), #16033 (diff headers re-render)
- Jittered backoff capped at 5 minutes: `docs/internals/connection-runtime.md`
- No continuously repainting animations: `AGENTS.md` ("Taste")

## Lesson 3: testing

- Allowed and forbidden substitutes, replay transcripts, TestClock/Random, restart by
  rebuilding layers: `docs/orchestration-v2/testing-strategy.md`
- "A test that needs a timeout to pass is wrong": `AGENTS.md` ("Verifying")
- Drain semantics: `packages/shared/src/DrainableWorker.ts`
- Real-data dev DB, duplicate migration slot check: `apps/server/scripts/migrate-dev-db.ts`
- `no-test-in-loop`: `oxlint-plugin-t3code/rules/no-test-in-loop.ts`

## Lesson 4: PR process

- Template sections, "Tests pass alone is insufficient", model + harness footer:
  `.github/pull_request_template.md`
- One problem per PR, triage loads policy from main's SHA, closure rules, "not … whether we
  think an agent wrote the PR": `CONTRIBUTING.md`
- Size labels excluding tests, `pull_request_target` comment: `.github/workflows/pr-size.yml`
- Native fingerprint label: `.github/workflows/mobile-fingerprint-check.yml`
- UI reviewer ("All clear", budgets): `.macroscope/check-run-agents/ui-consistency.md`
- Product defaults and suppressions need a human: `.macroscope/approvability.md`
- CI rejects `.github/pr-assets`: `.github/workflows/ci.yml`
- 1,000+ AI co-author trailers: `git log --format=%b | grep -c "Co-authored-by: Claude\|Co-authored-by: Codex\|cursoragent"` (1,062 at the time)

## Lesson 5: lint rules

- 14 rules: `oxlint-plugin-t3code/rules/*.ts` (excluding tests)
- Tooltip exceptions (`embed`, `frame`, `iframe`, `math`, `object`):
  `oxlint-plugin-t3code/rules/no-native-title-tooltip.ts`
- Suppression reasons: `oxlint-plugin-t3code/rules/require-suppression-reason.ts`
- `shadcn/no-restyle`, variants over className: `AGENTS.md` ("Taste"), `docs/internals/web-ui.md`
- knip in CI: `.github/workflows/ci.yml`, `package.json` (`knip:check`)

## Lesson 6: dev setup

- Hashed ports, Fetch bad-ports list, loopback-only probing: `scripts/dev-runner.ts`
- Per-worktree state, `--share`, single origin: `docs/operations/development.md`, `AGENTS.md`
- Never kill by pattern: `AGENTS.md` ("The three ways to hurt yourself")
- Worktree setup script: `t3.json`, `scripts/setup-worktree.ts`
- Vendored `.repos/`: `AGENTS.md` ("Where code lives")
- Parallel CI jobs, background apt, sparse checkout: `.github/workflows/ci.yml`

## Lesson 7: honest UI

- Transport health vs. data freshness, cached data rules: `docs/internals/connection-runtime.md`
- "Lying spinner", "one-way door is a bug", "Hit every surface": `AGENTS.md`
- Server-owned settlement: `docs/internals/overview.md`,
  `apps/server/src/orchestration-v2/ThreadSettlementService.ts`
- Slot composition: `apps/web/src/components/chat/ComposerBanner.tsx`, `docs/internals/web-ui.md`

## Lesson 8: docs for agents

- "Most T3 Code contributions will come from T3 Code itself", the note from Theo, the
  documentation rules, the escape hatch: `AGENTS.md`
- Glossary: `docs/internals/glossary.md`

## Finale: power-user tips

All from `docs/user/`: `keybindings.md`, `composer.md`, `thread-sidebar.md`,
`remote-access.md`, `outside-agents.md`, `project-settings.md`, `snap-shot.md`,
`html-renders.md`, `portable-handoffs.md`, `source-control.md`, `devices.md`, `usage.md`.

## 2026-10-09 rewrite: lessons 4 and 8 (same titles, deeper engineering)

Checked against `pingdotgg/t3code` at `101f8b2f5` (2026-10-09).

- Lesson 4, `pull_request_target` rule ("may fetch untrusted PR commits only as passive git
  data ... use pull_request plus workflow_run for that pattern instead"), size by
  `git diff --numstat` with test pathspecs excluded: `.github/workflows/pr-size.yml`
- Lesson 4, native fingerprint computed for PR and base in one job, base re-synced to the
  base lockfile, "the signal has to fire before merge, not after":
  `.github/workflows/mobile-fingerprint-check.yml`
- Lesson 8, "The three ways to hurt yourself" (kill by pattern, live install, baked
  origins), test data seeding ("Copy in, never symlink"), verification budget, bot
  babysitting, mobile client as a build step, founder note, rule-conflict escape hatch:
  `AGENTS.md`
