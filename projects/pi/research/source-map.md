# Source map: where each claim comes from

Paths are relative to [`earendil-works/pi`](https://github.com/earendil-works/pi) at
`6fb2e7815167e6b19006fc526d1a5d0f5f998787` (2026-10-08). Re-check before publishing; the
repo moves fast (520 commits in the month before this snapshot).

## Repo facts

- 113,633 stars, 14,448 forks, created 2025-08-09: GitHub API, 2026-10-09
- 6,827 commits; top authors Mario Zechner (3,868, `badlogicgames`), Armin Ronacher (863):
  `git log --format=%an | sort | uniq -c`
- 14 packages: `ls packages`; 643 test files: `git ls-files '*.test.ts' '*.test.mjs'`
- Mario Zechner created libGDX (Badlogic Games); Armin Ronacher created Flask: public
  record, not from this repo

## 1. Small, replaceable core

- "If your feature does not belong in the core, it should be an extension. PRs that bloat
  the core will likely be rejected." and "Even hook points for extensions however should be
  well considered and discussed": `CONTRIBUTING.md` ("Philosophy")
- "skips features like sub-agents and plan mode": `README.md`
- Built-in extensions, `replaceable: true` for codemode, tool-search, mcp:
  `packages/coding-agent/src/extensions/index.ts`
- A third-party extension registering `/mcp` replaces the built-in support:
  `packages/coding-agent/docs/mcp.md` ("Replace the built-in MCP support")
- Example extensions (79 + README) incl. `subagent`, `plan-mode`, `permission-gate`,
  `sandbox`: `packages/coding-agent/examples/extensions/`

## 2. Entry points are cost contracts

- Script, header quote, budgets (`./models` maxFiles 15, forbidden paths):
  `scripts/check-entry-graphs.mjs`
- 6 KB function -> 106 files; `import { type Usage }` emitting a runtime import; server
  112 files / 98 MB -> 28 files / 69 MB: commit `5507d76ee` (2026-08-26), "add narrow
  subpath exports so clients skip the barrel"
- Browser bundling check: `scripts/check-browser-smoke.mjs`, `.husky/pre-commit`

## 3. Fake model, empty environment

- Faux provider: `packages/ai/src/providers/faux.ts` (`fauxText`, `fauxToolCall`,
  `fauxAssistantMessage`)
- Suite rules ("Do not use real provider APIs, real API keys, network calls, or paid
  tokens"): `packages/coding-agent/test/suite/README.md`; `AGENTS.md` ("Commands")
- Empty environment (`env -i` with an allowlist, temp HOME, `TZ=UTC`, `LANG=C`,
  `GIT_CONFIG_GLOBAL=/dev/null`, `GIT_ASKPASS=false`), marker-file cleanup: `test.sh`
- 81 issue-numbered regression tests: `packages/coding-agent/test/suite/regressions/`;
  rule to comment the issue number: `AGENTS.md`
- MCP conformance against a baseline: `.github/workflows/ci.yml` (`mcp-conformance`),
  `packages/coding-agent/test/mcp-conformance/baseline.json`

## 4. Never mutate history (replaced "Closed by default" on 2026-10-09)

- JSONL entries with `id`/`parentId`, leaf, branching, versions v1→v3 migrated on load,
  compaction (`summary`, `firstKeptEntryId`, `tokensBefore`, system checkpoint),
  `context_edit` (branch-relative, latest wins, raw history unchanged), `branch_summary`,
  system messages as patches, usage entries, context building steps:
  `packages/coding-agent/docs/session-format.md`
- Entry types and `SessionManager`: `packages/coding-agent/src/core/session-manager.ts`
- Compaction keeps the original entries: `packages/coding-agent/docs/sessions.md`,
  `packages/coding-agent/docs/compaction.md`
- libGDX/Flask hint: carried over from the original lesson 4 (see "Repo facts")

## 5. Lockfile as code

- "Treat npm dep and lockfile changes as reviewed code", undici changelog rule,
  `--ignore-scripts`: `AGENTS.md` ("Dependency and Install Security")
- Exact pins: `scripts/check-pinned-deps.mjs`
- Three install-script packages with reasons, stale-entry check:
  `scripts/generate-coding-agent-install-lock.mjs` (`allowedInstallScriptPackages`)
- Lockfile pre-commit gate and checklist: `.husky/pre-commit`,
  `scripts/check-lockfile-commit.mjs`
- Nightly audit, accepted advisories need reasons, signatures:
  `.github/workflows/npm-audit.yml`, `scripts/npm-audit.mjs`
- CI installs with `--ignore-scripts`: `.github/workflows/ci.yml`
- Installer pins all dependencies; npm install does not: `README.md` ("Getting started")
- `nix run github:earendil-works/pi/stable`: `README.md` ("Run with Nix")

## 6. Design a tool a model can't misuse (replaced "Many agents, one checkout" on 2026-10-09)

- LF normalization, BOM stripped before matching and restored on write:
  `packages/coding-agent/src/core/tools/edit.ts`
- Exact then fuzzy matching (NFKC, trailing whitespace, smart quotes, dashes, special
  spaces), all edits matched against the original, duplicate and overlap errors, untouched
  lines copied back in fuzzy mode: `packages/coding-agent/src/core/tools/edit-diff.ts`
  (`normalizeForFuzzyMatch`, `applyEditsToNormalizedContent`,
  `applyReplacementsPreservingUnchangedLines`)
- Per-file queue keyed by `realpath`: `packages/coding-agent/src/core/tools/file-mutation-queue.ts`
- Failure kinds and edit "inflation" from real sessions: `scripts/edit-tool-stats.mjs`
  (`classifyErrorKind`, `analyzeToolArguments`)
- Fix history: `git log -- packages/coding-agent/src/core/tools/edit-diff.ts` (#713 fuzzy
  matching, BOM handling, "preserve untouched lines in fuzzy edit")

## 7. Don't fight the terminal

- Main screen keeps scrollback; no mouse capture "because the terminal owns its
  scrollback": `packages/tui/README.md`
- Differential rendering, `?2026` synchronized output, full-redraw triggers, Termux
  exception, `fullRedrawCount`: `packages/tui/src/tui-main-screen.ts`
- Full-redraw test: `packages/coding-agent/test/edit-tool-no-full-redraw.test.ts`
- `/tui` redraw stats: `.pi/extensions/redraws.ts`
- Named, rebindable actions: `packages/coding-agent/docs/keybindings.md`; no hard-coded key
  checks: `AGENTS.md` ("Code Quality")
- Termux support: `packages/coding-agent/docs/termux.md`
- Fullscreen is the default: `packages/coding-agent/src/core/settings-defaults.ts` (`tuiMode`),
  `packages/coding-agent/docs/usage.md`; alt-screen prints the final document on exit:
  `packages/tui/README.md`

## 8. Measure whether your docs help

- `with_docs` / `without_docs` containers, blocked pairs, lift report:
  `packages/evals/README.md`; harness added in `eafe11fb9` (#7085)
- Documentation audit eval with structured verdict:
  `packages/evals/evals/documentation-audit.eval.ts`
- Docs navigation checks: `packages/coding-agent/test/documentation.test.ts`
- "Do not trust analysis written in the issue": `.pi/prompts/is.md`
- `pi.dev`: `README.md`

## Finale: 20 power-user tips

All in `packages/coding-agent/docs/`:

- Steering vs follow-up (`Enter`, `Alt+Enter`, `Alt+Up`, `Esc`), `Ctrl+G`, `@` and `Tab`,
  `Ctrl+O`, `Ctrl+T`, `Shift+Tab`, `Ctrl+L`, `!` and `!!`, `Ctrl+X`: `usage.md`
- `Ctrl+P` cycles scoped models, tree `Shift+L` / `Ctrl+U`, `keybindings.json`, `[]` to
  disable: `keybindings.md`
- `/tree`, `/fork`, `/clone`, branch summaries, `--continue`, `--resume`, `/name`,
  `/compact [instructions]`, `--no-session`: `sessions.md`, `slash-commands.md`
- `--print` with piped stdin, `--mode json`, `--mode rpc`, `--tools`, `+name/-name`: `cli.md`
- Prompt templates and `$1` / `$ARGUMENTS` / `${1:-default}`: `prompt-templates.md`
- Skills load full instructions on demand: `skills.md`
- `pi -e npm:...`, `pi install`, review packages first: `packages.md`
- `subagent` and `plan-mode` examples: `packages/coding-agent/examples/extensions/`
