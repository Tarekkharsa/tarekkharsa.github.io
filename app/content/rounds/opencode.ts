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
    'A durable prompt inbox, a system prompt that never gets rewritten, bounded tool output, compaction before overflow, and more, from a rewrite in progress.',
  lessons: [
    {
      slug: 'gtc3-01-admit-then-run',
      lesson: 1,
      title: 'Admit the prompt first, run it later',
      subtitle: "A durable inbox between “you pressed Enter” and “the model sees it.”",
      tag: 'Architecture',
      readMinutes: 2,
      problem: "In most agents, pressing Enter saves your message and starts the model in one step. After a crash, a retry or a message sent mid-task, nobody can say what the model actually saw.",
      idea: "Save the prompt to a durable inbox first. Move it into the conversation later, at a safe point between model calls.",
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
      prompt: `Check whether this app needs a durable inbox between "the user sent it" and "the work starts".

The idea: save each incoming request (a prompt, a job, a message) as a durable row first, then move it into processing at a safe point. A retry with the same ID returns the same receipt instead of duplicating work. "Steer" (apply to the current task) and "queue" (run after it) are explicit modes. A crash loses only in-flight work, never accepted input.

1. Find where user input or jobs are accepted and processed, and show me whether accepting and processing happen in one step.
2. Tell me whether a crash, retry or concurrent submission could lose, duplicate or reorder input. If not, say so and stop.
3. If it could, propose the smallest inbox: a table keyed by a client-supplied ID, an idempotent insert that returns the existing receipt on retry and fails on a conflicting reuse, and one atomic step that marks a row as consumed when processing picks it up.
4. Implement it, with tests for a duplicate submission, a conflicting ID, and a crash between accepting and processing.

Keep "who is running right now" in memory unless there's a real reason to store it.`,
    },
    {
      slug: 'gtc3-02-never-rewrite-the-system-prompt',
      lesson: 2,
      title: 'Never rewrite the system prompt',
      subtitle: 'Freeze the baseline, append what changed, and keep the provider cache warm.',
      tag: 'Performance',
      readMinutes: 2,
      problem: "Agents re-render the date, branch and rules into the system prompt every turn, which breaks the provider's prompt cache.",
      idea: "Freeze the system prompt for the conversation, and append a short update at the next turn when something changes.",
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
      prompt: `Make this app's LLM requests cache-friendly by never rewriting the start of the conversation.

The idea: providers cache the beginning of a request. Render the system prompt once and keep it byte-for-byte stable. When context changes (time, git branch, files, settings), append a short update message at the next turn instead of editing the system prompt.

1. Find where system prompts and context are built for model calls, and list every value that can change between turns: timestamps, dates, environment details, open files, settings, tool lists.
2. Tell me which of these currently break the provider's prompt cache on every turn, and estimate the cost if you can (tokens re-sent per turn).
3. Propose a structure: a stable baseline rendered once per conversation (and again after compaction), a snapshot of what the model last saw for each changing value, and an appended "context update" message only when a value changes, in a stable order.
4. Implement it for the noisiest value first, with a test that two turns without changes produce an identical prefix.

If the provider reports cache hits, show me the before and after.`,
    },
    {
      slug: 'gtc3-03-record-once-replay-forever',
      lesson: 3,
      title: 'Record real HTTP once, replay it forever',
      subtitle: 'Cassettes instead of mocks, and a CI that refuses to record.',
      tag: 'Testing',
      readMinutes: 2,
      problem: "Hand-written HTTP mocks return what you think the API sends, not what it really sends.",
      idea: "Record real traffic once and replay it forever. Fail in CI when a recording is missing, and redact secrets before saving.",
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
      prompt: `Replace hand-written HTTP mocks in this project's tests with recorded cassettes.

The idea: record real HTTP traffic once, save it as a reviewable file, and replay it in later runs. In CI, a missing recording fails instead of calling the network. To refresh a recording you delete it and rerun the test, and secrets are redacted before anything is written.

1. Find tests that mock HTTP clients or external APIs by hand, and note which would benefit most from real responses: streaming, retries, pagination, error shapes.
2. Check whether the stack already has a record-and-replay tool (for example Polly.js, nock's recorder, VCR.py or go-vcr) and prefer it.
3. Set it up for one test: record only when the cassette is missing and not in CI, replay otherwise, fail on a missing cassette when CI=true, and redact auth headers, tokens and personal data.
4. Commit the cassette and show me its redacted content.

Never record against production with real customer data. Keep the change small.`,
    },
    {
      slug: "gtc3-04-bound-what-the-model-sees",
      lesson: 4,
      title: "Bound what the model sees",
      subtitle: "One size limit per tool result: keep the head and the tail, save the rest to a file.",
      tag: "Context engineering",
      readMinutes: 3,
      problem: "One noisy command can dump megabytes of output into the conversation, filling the context window and burying the part that mattered.",
      idea: "Cap every tool result with one limit, keep its beginning and end, and save the full output to a file the model can open if it needs more.",
      hints: [
        "It caps every tool result at 2,000 lines or 50 KB, whichever comes first.",
        "It has its own curated model gateway.",
        "Its second-busiest committer is its own GitHub app.",
      ],
      sources: [
        "packages/core/src/tool-output-store.ts",
        "packages/core/src/tool/registry.ts",
        "CONTEXT.md",
      ],
      prompt: `Put a hard, central limit on how much tool or command output this app sends to an LLM.

The idea: every tool result goes through one choke point that enforces a single limit (lines or bytes, whichever comes first). Oversized output keeps its beginning and end with a clear marker in between, and the complete output is saved to a file whose path the model can open later. Tools may summarize their own output first, but the central limit always has the final say.

1. Find every place where tool, command, API or file output is added to a model request. Tell me whether there's one central place that limits size, or none.
2. Measure or estimate the worst cases: the largest outputs these tools can produce today.
3. Propose one choke point with a configurable limit (start with 2,000 lines or 50 KB). It keeps the first and last halves, inserts a marker like "... output truncated; full content saved to <path> ...", and writes the full text to a file that is never overwritten and is cleaned up after a few days. Count bytes in UTF-8 and never cut a character in half.
4. Implement it, with tests for: output under the limit (unchanged), over the line limit, over the byte limit with multi-byte characters, and a saved file containing the full output.

Keep structured results unchanged. Only the text the model sees is bounded.`,
    },
    {
      slug: 'gtc3-05-one-api-even-in-process',
      lesson: 5,
      title: 'One API, even in-process',
      subtitle: 'The embedded SDK sends real requests to the real router, without a network.',
      tag: 'API design',
      readMinutes: 2,
      problem: "An embedded SDK that calls internals directly slowly drifts from the HTTP API: different validation, fields and errors.",
      idea: "Send embedded calls through the real router with an in-memory fetch, so both modes share one API.",
      hints: [
        'Its SDK is generated from its HTTP API definition.',
        'It ships an official Slack integration.',
        'You can summon it in a GitHub comment with a slash command.',
      ],
      sources: ['packages/sdk-next/src/opencode.ts', 'CONTEXT.md', 'AGENTS.md'],
      prompt: `Check whether this project's in-process or embedded mode goes through the same API as remote clients.

The idea: if you have both an HTTP API and a local, embedded or SDK mode, run the local mode through the real router and handlers with an in-memory transport (for example a fetch function that calls the handler directly) instead of calling internal functions. Generate clients from the API definition, and don't let client code import server internals.

1. Find every way code reaches the core: HTTP routes, SDKs, CLIs, embedded modes, test helpers. List where they bypass the HTTP layer and call internals directly.
2. For each bypass, note what could drift: validation, auth, error shapes, pagination, defaults.
3. Propose the smallest change that routes one bypass through the real handlers in memory.
4. If clients are generated, check that nobody edits them by hand. If there's a dependency rule such as "clients never import server code", suggest a check that enforces it.

Implement only the first step, with a test that the in-memory and HTTP paths return the same result.`,
    },
    {
      slug: 'gtc3-06-rebuild-on-the-main-branch',
      lesson: 6,
      title: 'Rebuild on the main branch',
      subtitle: 'A new major version grown next to the old one, with a dated log of every contract change.',
      tag: 'Dev process',
      readMinutes: 2,
      problem: "A long-lived v2 branch falls behind, and merging it back becomes the project nobody wants to do.",
      idea: "Build v2 on the main branch next to v1, log every contract change with its data impact, and review every old setting.",
      hints: [
        'It keeps a dated changelog of every schema change in its next major version.',
        'An old branch called 2.0 is thousands of commits behind.',
        'Its GitHub org was renamed, and the old URL still redirects.',
      ],
      sources: ['specs/v2/schema-changelog.md', 'specs/v2/config.md', 'specs/v2/todo.md'],
      prompt: `Plan a rewrite or next major version of part of this project without a long-lived branch.

The idea: build the new version on the main branch next to the old one, behind clear names (v2 folders, flags or modules). Keep a dated log of every contract change (database, events, API, SDK) saying why it changed and what existing data needs. Give every legacy setting a keep, remove or redesign decision before porting it.

1. If it isn't obvious which part is being rewritten, ask me. Then map the old code's public contracts: storage schema, events, API endpoints, config options and SDK surface.
2. Propose a layout for the new version next to the old one, and how both can run during the transition: a bridge, a flag or a read-only adapter.
3. Create a changelog file for contract changes with a short template: date, what changed, why, and compatibility and data impact.
4. Create a config review table that lists every existing option with a proposed keep, remove or redesign decision and a one-line reason.

Don't move any code yet. Deliver the plan, the changelog file and the review table.`,
    },
    {
      slug: 'gtc3-07-configured-is-not-allowed',
      lesson: 7,
      title: 'Configured is not allowed',
      subtitle: 'Policy is its own layer, and the last matching rule wins.',
      tag: 'Security',
      readMinutes: 2,
      problem: "“Enabled” and “disabled” provider lists mix two questions: how do I use this provider, and may I? A company can't forbid a provider a developer has valid keys for.",
      idea: "Keep config and permission apart. Permission is a short list of allow/deny rules, and the last rule that matches wins.",
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
      prompt: `Separate "is it configured?" from "is it allowed?" in this project.

The idea: configuration says how to use something (endpoints, keys, options). Policy says whether you may: an ordered list of allow/deny rules with wildcards, where the last matching rule wins and each caller supplies a default. A configured resource can still be denied.

1. Find enable/disable lists, feature allowlists or permission checks mixed into configuration, for example enabled_providers, disabled_features or allowed_hosts.
2. Tell me whether separating them would help here. If the logic is trivial, say so and stop.
3. If it would, propose a small policy module: rules with an effect, an action and a resource; wildcard matching; and evaluation as "the last match wins, otherwise the caller's default". With no rules, behavior must not change.
4. Move one mixed-in check onto it, with tests for ordering (deny everything, then allow one), wildcards and the default.

No conditions, roles or approval flows for now. Keep the change small.`,
    },
    {
      slug: "gtc3-08-compact-before-you-overflow",
      lesson: 8,
      title: "Compact before you overflow",
      subtitle: "Summarize old turns before the request stops fitting, keep recent ones word for word.",
      tag: "AI-native engineering",
      readMinutes: 3,
      problem: "Many agents compact only after the provider rejects a request as too long, then squash everything into a vague paragraph and lose exact paths, errors and decisions.",
      idea: "Before every model call, check whether the request still fits with room for the reply. If not, summarize only the older turns into a fixed template and keep recent turns verbatim.",
      hints: [
        "Its compaction summaries always follow the same Markdown template.",
        "Its config file is named after the product, as .json or .jsonc.",
        "Its name is “code” with the opposite of “closed” in front.",
      ],
      sources: [
        "packages/core/src/session/compaction.ts",
        "specs/v2/schema-changelog.md",
        "packages/core/src/session/context-epoch.ts",
      ],
      prompt: `Add proactive context compaction to this app's LLM conversations.

The idea: before every model call, estimate the full request (system prompt, messages, tool definitions). If it no longer fits in the context window minus room for the reply, summarize the older turns into a fixed template, keep the most recent turns word for word, and switch to the summary only once it was produced successfully.

1. Find where conversation history is assembled for model calls, and what happens today when it gets too long (a provider error, silent truncation, or nothing).
2. If conversations here never get long, say so and stop.
3. Propose: a pre-call check (estimated request > context window - max(reply budget, safety buffer)); a split that keeps the newest turns up to a token budget verbatim; a summary prompt with fixed sections (objective, important details, work done, active, blocked, next move, relevant files) that must preserve exact paths, commands, errors and identifiers; and merge rules for updating an earlier summary (carry forward, the newer conversation wins on conflicts).
4. Implement it so a failed or empty summary changes nothing, and the original history stays stored. Test: a request just under and just over the limit, a second compaction that merges the first summary, and a failed summarization call.

Keep the estimate cheap. Approximate token counts are fine.`,
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
