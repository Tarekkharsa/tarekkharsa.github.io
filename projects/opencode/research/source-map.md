# Source map: where each claim comes from

Paths are relative to [`anomalyco/opencode`](https://github.com/anomalyco/opencode) (formerly
`sst/opencode`) at `388406238bd5ca15564a762840a2362c3a45bd9c` on `dev` (2026-10-08). V2 was
unreleased at the time (latest release `v1.18.35`), so lesson links are pinned to that commit:
v2 code moves fast and paths may change before release.

## Repo facts

- 212,257 stars; default branch `dev`; `sst/opencode` redirects to `anomalyco/opencode`:
  GitHub API, 2026-10-09
- 15,881 commits; top authors Dax Raad (1,981), `opencode-agent[bot]` (1,687, the project's own
  GitHub app, see `packages/web/src/content/docs/github.mdx`), Adam (1,459), Aiden Cline (1,456),
  Kit Langton (1,084): `git log --format=%an | sort | uniq -c`
- 21 README translations: `ls README.*.md`
- Bun 1.3+, TUI in SolidJS with opentui, headless server on port 4096, `opencode attach`:
  `CONTRIBUTING.md`, `packages/web/src/content/docs/cli.mdx`
- New providers go to `anomalyco/models.dev`: `CONTRIBUTING.md`
- SST infra (`sst.config.ts`) in the repo; the org was `sst`
- `packages/slack`, GitHub Action (`github/`, `/opencode` and `/oc` comments), Zen gateway:
  `packages/web/src/content/docs/{github,zen}.mdx`
- Old `2.0` branch: last commit `7a6ce05d0` "2.0 exploration (#22335)", 2026-04-13, 0 ahead and
  4,760 behind `dev`: GitHub compare API

## 1. Admit the prompt first, run it later

- Admitted Prompt, Prompt Promotion, Session Drain, steer vs queue: `CONTEXT.md`
- `sessions.prompt` / `interrupt` / `active` contract, `session_input` inbox, idempotent IDs,
  `resume: false`: `specs/v2/session.md`
- Invariants for agents ("Keep durable prompt admission separate from model execution"):
  `AGENTS.md` ("V2 Session Core")
- Inbox migration: `packages/core/src/database/migration/20260603141458_session_input_inbox.ts`
- Admitted/prompted events simplified on 2026-06-22: `specs/v2/schema-changelog.md`

## 2. Never rewrite the system prompt

- Context Source, Context Epoch, Baseline System Context, Mid-Conversation System Message,
  Safe Provider-Turn Boundary, "sampled and admitted lazily ... never pushed asynchronously",
  combined updates, deterministic order, compaction starts a new epoch: `CONTEXT.md`
- `SystemContext` API (`Key` pattern, `unavailable`, reconcile results, `DuplicateKeyError`):
  `packages/core/src/system-context/index.ts`
- Epoch persistence: `packages/core/src/session/context-epoch.ts`

## 3. Record once, replay forever

- Cassettes, CI fails on missing cassettes, no overwrite mode, redaction defaults, WebSocket
  chronology, published as `@opencode-ai/http-recorder@beta`: `packages/http-recorder/README.md`
- Used by recorded tests in core, llm and opencode, e.g.
  `packages/core/test/session-runner-recorded.test.ts`, `packages/llm/test/recorded-test.ts`
- "Avoid mocks as much as possible": `AGENTS.md` ("Testing")

## 4. A lab notebook for speed

- Goal, single metric line, hypothesis table, dead ends, full-suite 225s / 187s / 202s:
  `perf/test-suite.md`
- `bench:test`, `profile:test`: `packages/opencode/package.json`

## 5. One API, even in-process

- Embedded client: real router via `HttpRouter.toWebHandler`, a `fetch` that calls it, base URL
  on a local hostname: `packages/sdk-next/src/opencode.ts`
- OpenCode Client, Embedded OpenCode, SDK Contract IR, Page: `CONTEXT.md`
- Generated clients, never edit `src/generated`, dependency direction: `AGENTS.md`

## 6. Rebuild on the main branch

- 28 dated entries, each with why and compatibility: `specs/v2/schema-changelog.md`
- Field-by-field review, 12 keep / 14 remove / 13 redesign, `logLevel` removed because "no
  config consumer exists", `config.json` dropped: `specs/v2/config.md`
- "ok we need to work towards a launch of v2 so we can get out of this rebuild phase", post-Hono
  cleanup: `specs/v2/todo.md`
- Option comparison kept as history: `specs/v2/catalog-config-plugin-lifecycle.md`

## 7. Configured is not allowed

- Config vs policy, last match wins, user over repo, future `plugin.load` / `mcp.connect`,
  non-goals: `specs/v2/provider-policy.md`
- `findLast` evaluation, `allow` / `deny`: `packages/core/src/policy.ts`
- User docs: `packages/web/src/content/docs/policies.mdx`

## 8. Ban the synonyms

- 24 terms, 9 with `_Avoid_`: `CONTEXT.md`
- Good/Bad style rules written for agents: `AGENTS.md`

## Finale tips

All in `packages/web/src/content/docs/`: Tab between Build and Plan, `@general` and child
sessions (`agents.mdx`); `@` files, `!` commands, leader `ctrl+x`, `/undo` `/redo` with git,
`/editor`, `/export`, `/init`, `/share`, `ctrl+t` variants (`tui.mdx`, `keybinds.mdx`); custom
commands, `$ARGUMENTS`, ``!`cmd` `` (`commands.mdx`); permission rules, `--auto`
(`permissions.mdx`); `run`, `--format json`, `serve`, `run --attach`, `attach`, `pr`, `stats`
(`cli.mdx`); `opencode github install`, `/opencode` (`github.mdx`).
