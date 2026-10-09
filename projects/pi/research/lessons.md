# Round 2 lesson plan (published)

> Update 2026-10-09: lessons 4 and 6 were replaced with deeper engineering lessons,
> "Never mutate history" and "Design a tool a model can't misuse". See source-map.md.


Codebase: [`earendil-works/pi`](https://github.com/earendil-works/pi) at
`6fb2e7815167e6b19006fc526d1a5d0f5f998787` (main, 2026-10-08). 113k stars, 14k forks,
6,827 commits, 14 packages, 643 test files. Every claim below is in
[`source-map.md`](./source-map.md) with the file it comes from.

Same shape as round 1: 8 lessons across different areas, about 2 minutes each, a
"Steal this" box, 3 hints per lesson (vague first), hints accumulating across lessons.
None of the hints reuse round 1's (T3 Code: "GUI for coding agents", "400,000 users",
"letter followed by a number", ...).

---

## 1. Architecture: Ship a small core, and let your own features be replaceable

The core is deliberately minimal: "If your feature does not belong in the core, it should
be an extension. PRs that bloat the core will likely be rejected." Even extension hook
points need discussion before they're added.

The proof is that first-party features use the same extension API as everyone else. MCP
support, code mode and tool search ship as **built-in extensions** marked `replaceable`:
install a third-party extension that registers `/mcp` and the built-in one steps aside.
Sub-agents and plan mode aren't in the core at all; they're example extensions
(`examples/extensions/subagent`, `plan-mode`, `permission-gate`, `sandbox`, among 79).

**Steal this:** build your own features on your public plugin API. If a first-party
feature can't be written as a plugin, the API is missing something, and you just found it.

Hints:
1. It's open source and has more than 100,000 GitHub stars.
2. It deliberately ships without sub-agents or a plan mode.
3. Its built-in MCP support is a plugin that a third-party plugin can replace.

## 2. Performance: Entry points are cost contracts

Importing one 6 KB function through a package's barrel file made Node evaluate 106 files.
The fix was narrow subpath exports, and a script so it can't regress:
`check-entry-graphs.mjs` walks every declared entry point's import graph at commit time and
fails when it exceeds a budget (`maxFiles: 15` for `./models`) or reaches a forbidden file
(the provider code, the generated model list). Its header: "Entry points are cost
contracts... nothing fails until someone measures a process."

It immediately caught two regressions: `import { type Usage } from "..."` looks type-only
but emits a runtime import of the whole barrel. Measured result: a server process went
from 112 files / 98 MB to 28 files / 69 MB.

**Steal this:** budget what a module *drags in*, not just how fast it runs. A file count
per entry point is cheap to check on every commit and catches the `export *` nobody
noticed.

Hints:
1. It's a TypeScript monorepo of 14 packages.
2. CI checks that some of its packages still bundle for the browser.
3. One of its packages is a single API for many LLM providers.

## 3. Testing: A fake model and an empty environment

Agent tests are tempting to write against real models. Here they can't be: the suite
uses a **faux provider** (`fauxText`, `fauxToolCall`, scripted assistant messages), and the
rule is "No real provider APIs, keys, or paid tokens."

`./test.sh` goes further and starts tests from an **empty environment**: a throwaway
`HOME`, `TZ=UTC`, `LANG=C`, no global git or npm config, `GIT_ASKPASS=false` so nothing can
prompt for credentials. Its cleanup refuses to delete any directory it can't prove it
created (a marker file). Your real credentials are simply not reachable from a test.

Bugs get a regression test named after the issue: 81 files like
`5208-late-bash-output.test.ts`. MCP support runs against the official conformance suite
and fails on regressions against a committed baseline.

**Steal this:** fake the model, not your code, and run tests in an environment that has
nothing of yours in it. Name regression tests after the issue so the "why" survives.

Hints:
1. Its test suite talks to a model that doesn't exist.
2. Its test script starts from an empty environment.
3. 81 of its regression tests are named after the issue they fix.

## 4. GitHub & PRs: Closed by default

New contributors' issues and PRs are **auto-closed**. Maintainers read the closed ones
daily and reopen the good ones. Approval is a comment: `lgtmi` keeps your future issues
open, `lgtm` also lets you open PRs. A workflow writes you into a plain-text
`.github/APPROVED_CONTRIBUTORS` (270 people), and the gate reads that file from the
default branch, never from the PR.

The rules are short: "You must understand your code." Issues must fit on one screen and be
written in your own voice. Weekend issues may wait until Monday. AI can help triage, but
"it is not trusted to make final maintainer decisions." Their FAQ: "Is this hostile to
contributors? No. It is a guardrail against burnout and tracker spam."

Compare round 1: that repo also wanted maintainer approval, but asked for it as a link in
the PR template. This one enforces it with a bot before any human reads the PR.

**Steal this:** when volume outruns reviewers, make "closed until a human says yes" the
default, keep the approval list in the repo, and make approval a one-word comment.

Hints:
1. Its maintainers created a famous Java game framework and a famous Python web framework.
2. Its approved contributors are listed in a plain text file in the repo.
3. A maintainer lets you open PRs by replying "lgtm".

## 5. Security: Treat the lockfile as code

"Treat npm dep and lockfile changes as reviewed code." In practice:

- Every direct dependency is pinned to an exact version, checked by a script.
- Installs run with `--ignore-scripts` everywhere, CI included.
- Only **three** dependencies may run install scripts, each with a written reason
  (esbuild's binary check, for example). The check fails if an allowlisted package
  disappears, so the list can't rot.
- A pre-commit hook blocks lockfile commits unless you set `PI_ALLOW_LOCKFILE_CHANGE=1`, and
  prints a checklist: is every new package intentional, were npm age gates active, any new
  lifecycle scripts?
- A nightly `npm audit` fails on moderate advisories; accepting one requires a written
  reason, and registry signatures are verified.
- Updating `undici` requires reading its changelog first.
- The curl installer pins every transitive dependency; plain `npm install -g` doesn't.

**Steal this:** make dependency changes loud. A pre-commit gate plus a short allowlist for
install scripts costs minutes, and it's the place supply-chain attacks actually land.

Hints:
1. You can install it with one curl command, and the installer pins every dependency.
2. Only three of its dependencies are allowed to run install scripts.
3. You can run it straight from GitHub with `nix run`.

## 6. Dev setup: Many agents, one checkout

Round 1's repo gave every agent its own worktree. This one assumes the opposite: "Multiple
pi sessions may be running in this cwd at the same time, each modifying different files."
So the git rules are about not destroying a neighbour's work:

- Commit only files you changed in this session, staged by explicit path.
- Never: `git add -A`, `git add .`, `git stash`, `git reset --hard`, `git checkout .`,
  `git clean -fd`, `git commit --no-verify`, force push.
- On a rebase conflict in a file you didn't touch: abort and ask.
- Review PRs without switching branches: `gh pr diff`, `git show <ref>:<path>`.
- Write ad-hoc scripts to `/tmp`, not into the repo.

True story: while I was writing this series, a second agent was working in the same
checkout, and one of its new files nearly went into my `git add -A` commit.

**Steal this:** if more than one agent can touch a working tree, ban the git commands
that act on "everything", and make every commit list its files.

Hints:
1. Its agent guide assumes several agents are editing the same checkout at once.
2. Its agent guide bans `git stash`.
3. Its prompt templates live in a hidden folder named after the project.

## 7. UI/UX: Decide who owns the scrollback

Two renderers behind one `TUI` interface. Fullscreen (the default, alternate screen) owns
the viewport, so it rebuilds scrolling, scrollbars, selection with copy, clickable links
and prompt jumps, and prints the whole document back to scrollback on exit. Regular mode
renders into the main buffer and doesn't capture the mouse or offer fixed layout regions,
"because the terminal owns its scrollback."

Rendering is differential, wrapped in synchronized output (`CSI ?2026`). Full redraws are
counted (`fullRedraws`) and a test fails if showing an edit tool's result causes one. On
Termux the keyboard changes the terminal height, so that redraw is skipped. Every shortcut
is a named action in `keybindings.json`; hard-coded key checks are forbidden.

(Draft 1 said it "leaves your scrollback alone". Wrong: fullscreen is the default,
`tuiMode: "fullscreen"` in `settings-defaults.ts`.)

**Steal this:** decide who owns each piece of UI and don't half-own it. Count your most
expensive operation and assert on the count.

Hints:
1. It has two terminal renderers behind one interface.
2. It has a test that fails if editing a file redraws the whole screen.
3. It runs on Android phones, and its renderer has a special case for that.

## 8. AI-native docs: Measure whether your docs help

Plenty of repos write docs for agents. This one **measures** whether they work. Its
documentation-lift evals run each task twice, in fresh containers: `with_docs` and
`without_docs` (README, docs and examples removed, the docs section stripped from the
system prompt), then report the difference in pass rate. Missing or errored runs block
the headline number instead of counting as zero, and the report flags "no lift" and
flakiness.

A separate eval has an agent audit the docs against the code and return
`match`/`mismatch`/`inconclusive` as structured output. The docs navigation is
schema-checked in a unit test. Its issue-analysis prompt starts from distrust: "Do not
trust analysis written in the issue... Ignore any root cause analysis (likely wrong)."

**Steal this:** treat docs for agents like a feature with a test: run the same task with
and without them, and delete what doesn't move the number.

Hints:
1. It runs its agent with and without its docs to measure what the docs are worth.
2. Its website is a two-letter name on `.dev`.
3. Its name is a mathematical constant.

---

## Finale: the reveal + power-user tips

Answer: **Pi** (`earendil-works/pi`). Tips to collect from `packages/coding-agent/docs`,
each checked against the docs: session tree and forking (`/tree`), steering vs follow-up
messages, `/reload`, `/hotkeys` and `keybindings.json`, prompt templates with
`$ARGUMENTS`, skills, `--tools` / `--exclude-tools` / `--no-mcp`, print, JSON and RPC modes,
project trust, packages, compaction, `pi update`, `pi config`.

## Alternates (if a lesson gets cut)

- **Generated code is never edited:** `models.generated.ts` changes only through its
  generator; offline Nix builds pin the model catalog revision.
- **Sessions are an append-only tree:** JSONL entries with parent IDs; compaction inserts
  a summary but keeps the originals.
- **Honest security docs:** "Watching the transcript, using project trust, and reviewing
  changes do not create a security boundary." Project trust documents its own gap.
- **Erasable TypeScript only:** no `enum`, `namespace` or parameter properties, so Node
  runs the source directly in strip-only mode.
