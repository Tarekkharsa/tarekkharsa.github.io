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

## 4. Bound what the model sees (replaced "A lab notebook for speed" on 2026-10-09)

- `MAX_LINES = 2_000`, `MAX_BYTES = 50 * 1024`, `RETENTION = 7 days`, head/tail preview,
  byte-safe `takePrefix`/`takeSuffix`, marker reserved inside the limit, files written with
  flag `wx` and an ascending ID, `tool_output.max_lines`/`max_bytes` config:
  `packages/core/src/tool-output-store.ts`
- The registry bounds every tool result and returns typed `outputPaths`:
  `packages/core/src/tool/registry.ts`
- Model Tool Output, Managed Tool Output File, one aggregate limit, provider-independent,
  head and tail kept, structured result unchanged: `CONTEXT.md`

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

## 8. Compact before you overflow (replaced "Ban the synonyms" on 2026-10-09)

- Trigger `estimate(system, messages, tools) > context - max(output, buffer)`,
  `DEFAULT_BUFFER = 20_000`, `DEFAULT_KEEP_TOKENS = 8_000`, tool results trimmed to 2,000
  characters, summary prompt must fit in `context - summaryOutput`, summary template,
  update/merge instructions, failed or empty summary returns without cutover:
  `packages/core/src/session/compaction.ts`
- Durable start, live-only progress, cutover only from a completed summary, continue the
  pending turn after compaction: `specs/v2/schema-changelog.md` (2026-06-05 entry)
- Fresh baseline after compaction: `packages/core/src/session/context-epoch.ts`, `CONTEXT.md`

## Finale tips

All in `packages/web/src/content/docs/`: Tab between Build and Plan, `@general` and child
sessions (`agents.mdx`); `@` files, `!` commands, leader `ctrl+x`, `/undo` `/redo` with git,
`/editor`, `/export`, `/init`, `/share`, `ctrl+t` variants (`tui.mdx`, `keybinds.mdx`); custom
commands, `$ARGUMENTS`, ``!`cmd` `` (`commands.mdx`); permission rules, `--auto`
(`permissions.mdx`); `run`, `--format json`, `serve`, `run --attach`, `attach`, `pr`, `stats`
(`cli.mdx`); `opencode github install`, `/opencode` (`github.mdx`).
