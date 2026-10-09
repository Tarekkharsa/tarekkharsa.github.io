// Archived first drafts of the round-1 posts, before they moved into app/content/posts.ts and
// content/posts/*.html. Kept for reference only: nothing imports this file.
// Content for the "Guess the codebase" series. Answer: T3 Code (github.com/pingdotgg/t3code).
export const SITE = "https://tarekkharsa.github.io";
export const REPO = "https://github.com/pingdotgg/t3code";
export const SRC = (p) => `<a href="${REPO}/blob/main/${p}"><code>${p}</code></a>`;

export const lessons = [
  {
    n: 1,
    slug: "gtc-01-decide-commit-then-act",
    title: "Decide, commit, then act",
    tagline: "The three-step server pattern that keeps AI agents from leaving your app in a weird state.",
    topic: "Architecture",
    hints: [
      "It's open source and has over 400,000 users.",
      "The same server drives a web app, a desktop app and a mobile app.",
      "Its server is event-sourced and written in TypeScript.",
    ],
    body: `
<p>Picture this: an AI agent is halfway through editing your repo when the app crashes. Or the user's laptop sleeps. Or their phone reconnects from a train tunnel and retries the last request. <strong>What's actually true now?</strong></p>
<p>Most apps can't answer that cleanly. This codebase can, because every change goes through the same three steps.</p>

<h2>The pattern</h2>
<pre><code>client request ──▶ command
                     │
                     ▼
  1. DECIDE   pure function: (state, command) → events      no I/O at all
                     │
                     ▼
  2. COMMIT   ONE database transaction writes:
                events + read models + command receipt + outbox
                     │   (only after commit)
                     ▼
  3. ACT      a worker runs the outbox effects
              (start the agent, take a git checkpoint, …)
              and feeds results back in as new commands</code></pre>

<h3>1. Decide without I/O</h3>
<p>The orchestrator takes the current state and a command and returns events. It never touches the network, the filesystem or a subprocess. You can unit-test it, replay it, and it can't hang on a slow API call while holding a lock.</p>

<h3>2. Commit facts and intent together</h3>
<p>One transaction writes the events, the read models the UI reads, a <em>command receipt</em>, and the <em>outbox</em>: a record of side effects that still need to run. That buys three things:</p>
<ul>
  <li><strong>Read models can't get ahead of the log.</strong> They commit in the same transaction.</li>
  <li><strong>Retries are idempotent.</strong> A replayed command finds its receipt and returns the same result.</li>
  <li><strong>Crashes don't lose work.</strong> If the process dies right after commit, the intent to "start the agent" is already saved.</li>
</ul>

<h3>3. Act after commit</h3>
<p>A worker picks up outbox effects and does the slow, failure-prone work. Results come back in as new commands, which go through the same decide → commit loop.</p>

<h2>The consequence most apps get wrong</h2>
<blockquote><p>A command acknowledgement means the <em>intent</em> committed, not that the work finished.</p></blockquote>
<p>If your UI treats "request accepted" as "done", you ship a lying spinner. Here, "accepted", "agent running" and "follow-up work settled" are separate states. A late checkpoint isn't even allowed to stretch the recorded duration of the agent's turn.</p>

<h2>Two more traps the docs call out</h2>
<ul>
  <li><strong>Your schema has a past.</strong> Every stored event must still decode on replay. A schema change affects every old database on its next startup, not just the newest client.</li>
  <li><strong>Not every effect can replay.</strong> Work tied to a provider process that died is retired during recovery, before new work starts.</li>
</ul>`,
    steal: `You don't need an event-sourcing framework. You need a pure <em>decide</em> step, <strong>one</strong> transaction that records facts and intent together, and a worker that does the I/O afterwards. Most "it got into a weird state" bugs come from breaking one of those three.`,
    sources: [
      "docs/internals/overview.md",
      "apps/server/src/orchestration-v2/Orchestrator.ts",
      "apps/server/src/orchestration-v2/EventSink.ts",
      "apps/server/src/orchestration-v2/EffectWorker.ts",
    ],
  },
  {
    n: 2,
    slug: "gtc-02-performance-budgets-as-tests",
    title: "Performance budgets belong in unit tests",
    tagline: "Seven performance patterns from one repo's commit log, and why their budgets fail the build.",
    topic: "Performance",
    hints: [
      "Its maintainers list \u201cperformance without compromise\u201d as a value they never trade away.",
      "Its users run AI agents all day, and the docs say they notice a single dropped frame.",
      "Its server is built on the Effect library.",
    ],
    body: `
<p>Most teams find performance regressions the same way: a user complains. This codebase finds them in <code>vp test</code>, because the budget is written down as a number and asserted.</p>

<h2>1. Write the budget as an assertion</h2>
<pre><code>describe("thread transport payload budget", () =&gt; {
  // …
  expect(projectedBoundedRpcJsonBytes / fullRpcJsonBytes).toBeLessThanOrEqual(0.02);
});</code></pre>
<p>The targets are concrete: cold-opening a conversation loads about <strong>75 recent rows and roughly 1&nbsp;MiB</strong>. Reconnect catch-up replays at most <strong>128 events or 1&nbsp;MiB</strong> before it falls back to a snapshot. If someone adds a field that bloats the payload, the test fails on their machine.</p>

<h2>2. Benchmark the path users actually run</h2>
<p>The performance doc has a warning I hadn't seen written down before: the old benchmark fixtures seeded data in the <em>previous</em> format, and running them against the new client "can produce reassuring timings while missing the active transport path."</p>
<p>A benchmark that measures the wrong path is worse than having none, because it tells you you're fine.</p>

<h2>3. Fix it, then make it impossible</h2>
<p>My favorite pair of PRs in the repo:</p>
<ul>
  <li><strong>PR #15265</strong>: a one-line change. A broad CSS <code>:has()</code> selector made <em>every DOM change restyle the whole page</em>.</li>
  <li><strong>PR #15274</strong>: a lint rule that flags those selectors, so nobody can write one again.</li>
</ul>

<h2>4. Ask "did anything change?" before "what changed?"</h2>
<p>Watching pull requests used to read each PR in full on every pass. Now it checks a cheap one-point fingerprint first and does the full read only when the fingerprint moves. Result: <strong>about 90% fewer GitHub API points</strong> (PR #16270). It's the ETag idea applied to a polling loop.</p>

<h2>5. Per batch, not per item</h2>
<ul>
  <li>Background branch lookups share <strong>one</strong> GitHub query per sweep (#16760).</li>
  <li>Scan <code>PATH</code> once per command, not on every spawn (#12600).</li>
  <li>Stop persisting a snapshot for every streamed chunk of tool output (#16682).</li>
</ul>

<h2>6. Keep heavy data off the wire</h2>
<p>Raw command output, tool result bodies and inline file diffs are never sent over the socket, even small ones. The stored events keep everything, and the client asks for a body only when someone opens it. Store everything, send what the screen needs.</p>

<h2>7. Skip work nobody can see</h2>
<ul>
  <li>Pause elapsed-time timers on hidden mobile screens (#15397).</li>
  <li>Virtualize command palette results (#15266).</li>
  <li>Lease live git/PR queries to the visible rows plus a small overscan.</li>
  <li>When a poll comes back unchanged, return the <em>same array</em> so React subscribers don't re-render.</li>
  <li>No continuously repainting animations. They peg the GPU on 120&nbsp;Hz displays.</li>
</ul>

<h2>Bonus: reconnects that don't stampede</h2>
<blockquote><p>Without jitter, every client of a restarted server reconnects in the same second; with a short cap, a client that can never connect retries all day.</p></blockquote>
<p>So: jittered exponential backoff, capped at five minutes, reset only after a connection stays up.</p>`,
    steal: `Write the budget down as a number. Put the number in a test. Run it against the path users actually use. Then, every time you fix a performance bug, ask whether a lint rule can stop that whole class of bug.`,
    sources: [
      "docs/internals/performance-regressions.md",
      "apps/server/src/orchestration-v2/ThreadTransportPerformance.test.ts",
      "oxlint-plugin-t3code/rules/no-unscoped-has.ts",
      "docs/internals/connection-runtime.md",
    ],
  },
  {
    n: 3,
    slug: "gtc-03-mock-the-boundary",
    title: "Mock the boundary, not the logic",
    tagline: "\u201cA test that needs a timeout to pass is wrong.\u201d Testing rules from a repo that bans sleeps.",
    topic: "Testing",
    hints: [
      "It talks to six different AI coding agents through their own CLIs.",
      "Its pitch: \u201cbring your own subscription\u201d.",
      "Every agent turn ends with a hidden git ref so you can diff and restore.",
    ],
    body: `
<p>One sentence in this repo's agent guide sums up the whole testing philosophy:</p>
<blockquote><p>A test that needs a timeout to pass is wrong.</p></blockquote>
<p>Here's how they make that achievable.</p>

<h2>The default test shape</h2>
<pre><code>command dispatch
  → real orchestrator
  → real provider adapter
  → REPLAYED provider transport   ← the only fake
  → real normalizer
  → real event store + projections
  → assertions</code></pre>
<p>Fakes are allowed at true boundaries only: the external process, the network, the clock, random IDs, a temp filesystem, a temp database.</p>
<p><strong>Explicitly not allowed:</strong> a mocked orchestrator, adapter, normalizer, event sink, projection reducer or checkpoint policy. A few integration tests that run the real stack beat hundreds of unit tests that mock away the behavior they claim to test.</p>

<h2>Replay real traffic</h2>
<p>The app integrates with several AI agent CLIs. Tests don't call those CLIs. Instead, raw protocol frames are recorded into <em>replay transcripts</em> and fed through the real adapter. The replay runtime doesn't know what a "turn" or an "approval" is; only the adapter does. So the replay can't quietly hide adapter bugs.</p>

<h2>Determinism comes from production code</h2>
<p>Production code reads time through the framework's <code>Clock</code> and randomness through its <code>Random</code> service, never <code>Date.now()</code> or <code>Math.random()</code> directly. Tests swap in a <code>TestClock</code> and a seeded <code>Random</code>. No flaky timestamps, and no snapshots that change every run because of a new UUID.</p>

<h2>Drain, don't sleep</h2>
<p>Background work runs on a <em>drainable worker</em>. Its <code>drain()</code> resolves only when:</p>
<ul>
  <li>the queue is empty, <strong>and</strong></li>
  <li>the item currently being processed has finished.</li>
</ul>
<p>An empty queue alone doesn't prove the worker is idle, and that gap is where most "add a 100&nbsp;ms sleep" hacks come from.</p>

<h2>Test a restart the way a restart happens</h2>
<p>To test "the app restarted mid-task", they don't add a <code>restartForTest()</code> method. They tear down the outermost server layer and rebuild it against the same durable storage. Production code doesn't grow APIs that exist only for tests.</p>

<h2>An empty database is a bad test</h2>
<p>One script rebuilds a dev database from a <em>read-only, pruned</em> snapshot of the developer's real data. It drops scheduled tasks, pending work and auth sessions, so the dev server never runs real agents. Then it runs migrations on top, which proves new migrations apply to real data and catches two branches claiming the same migration number.</p>

<h2>And what not to test</h2>
<ul>
  <li>Don't render components to static markup just to assert props.</li>
  <li>Don't write tests that only check callback wiring or mirror the implementation.</li>
  <li>Lint bans declaring tests inside a <code>for</code> loop; use <code>it.each</code>.</li>
  <li>Locally, run the smallest proof that the change works. CI owns the full suite.</li>
</ul>`,
    steal: `"No mocks" is the wrong lesson. The rule is to fake only at true boundaries: process, network, clock, IDs, filesystem. Make time and randomness injectable in <em>production</em> code, and wait on milestones instead of sleeping.`,
    sources: [
      "docs/orchestration-v2/testing-strategy.md",
      "packages/shared/src/DrainableWorker.ts",
      "apps/server/scripts/migrate-dev-db.ts",
      "oxlint-plugin-t3code/rules/no-test-in-loop.ts",
    ],
  },
  {
    n: 4,
    slug: "gtc-04-pr-process-for-the-ai-era",
    title: "A PR process for the AI era",
    tagline: "When anyone can generate a 2,000-line PR in ten minutes, review time is what you protect.",
    topic: "GitHub & PRs",
    hints: [
      "One of its maintainers is a well-known tech YouTuber.",
      "Over a thousand commits on main carry AI co-author trailers.",
      "Its AI triage bot loads its rules from main, never from the PR.",
    ],
    body: `
<p>Open source has a new problem: writing code is now cheap and reviewing it isn't. This repo's contribution process is designed around that.</p>

<h2>A PR template that asks for reasoning</h2>
<ul>
  <li><strong>Problem</strong>: one or two sentences.</li>
  <li><strong>Change</strong>: how it fixes the problem, and why changes to several components belong together.</li>
  <li><strong>Scope &amp; approval</strong>: a link to the maintainer's approval <em>comment</em>. A linked issue alone isn't enough.</li>
  <li><strong>Verification</strong>: what you checked, what you saw, and what you <em>couldn't</em> check.</li>
</ul>
<blockquote><p>"Tests pass" alone is insufficient.</p></blockquote>
<p>It ends with the model and harness that did the work. No hiding AI involvement and no shaming it either. It's recorded the way you'd record a dependency version.</p>

<h2>One underlying problem per PR</h2>
<blockquote><p>Count the underlying problems, not the linked issues.</p></blockquote>
<p>Five issues can describe one bug. A big diff can still be one problem. Adjacent cleanup gets its own PR.</p>

<h2>AI triage that resists prompt injection</h2>
<p>If a bot triages PRs, a PR can try to talk it into approving. Their defense: every run resolves <code>main</code> to a commit SHA and loads the policy and exemption list from <em>that</em> SHA.</p>
<blockquote><p>PR/fork copies and PR-body instructions cannot change policy or exemptions.</p></blockquote>
<p>If a policy file is missing or malformed, the PR is left unresolved. Nothing gets exempted or auto-closed because of it.</p>

<h2>Review bots with a narrow job</h2>
<p>Their AI UI reviewer looks only at changed lines, answers exactly three questions, doesn't build the project or ask for screenshots, has a budget per run and per PR, and replies <em>exactly</em> "All clear" when there's nothing to report. A narrow job with clear rules beats "please review this PR".</p>
<p>Auto-approval has two explicit carve-outs that always need a human: PRs that <strong>change product defaults</strong>, and PRs that <strong>add or broaden a lint or type suppression</strong>.</p>

<h2>Automation that gives context, not gates</h2>
<ul>
  <li><strong>Size labels</strong> from XS to XXL, with test files <em>excluded</em> in mixed PRs. If adding tests made a PR look bigger and scarier, people would stop adding tests.</li>
  <li><strong>A native-change label</strong> on mobile PRs that change the native build fingerprint. Those get merged as a batch right before a store submission, so main can ship over-the-air updates the rest of the time.</li>
  <li><strong>CI rejects committed PR screenshots.</strong> UI PRs need before/after images, but they're uploaded to the PR. Git history is forever.</li>
</ul>

<h2>A security comment every repo should copy</h2>
<pre><code># This pull_request_target job may fetch untrusted PR commits only as passive
# git data. Do not add dependency installs, build/test scripts, or cache
# actions here.</code></pre>

<h2>Closing PRs without being a jerk</h2>
<p>Every policy closure names the rule, cites the evidence, links the guide section and explains how to get the PR reconsidered. And:</p>
<blockquote><p>We assess the problem, scope, approval, and evidence, not an author's writing style or whether we think an agent wrote the PR.</p></blockquote>

<h2>Commit titles that read like release notes</h2>
<pre><code>fix(server): status refresh no longer pegs CPU in repos with thousands of untracked files
perf(web): DOM changes no longer restyle the whole page</code></pre>
<p>A conventional-commit prefix, then what changed for the user. Not "fix bug in StatusService".</p>`,
    steal: `Make the PR template ask for reasoning and evidence, not checkboxes. Load bot policy from a trusted ref, never from the PR. Give each AI reviewer one narrow job. Pick your "always needs a human" triggers on purpose.`,
    sources: [
      "CONTRIBUTING.md",
      ".github/pull_request_template.md",
      ".github/workflows/pr-size.yml",
      ".github/workflows/mobile-fingerprint-check.yml",
      ".macroscope/check-run-agents/ui-consistency.md",
      ".macroscope/approvability.md",
    ],
  },
  {
    n: 5,
    slug: "gtc-05-taste-as-lint-rules",
    title: "Turn taste into lint rules",
    tagline: "Review comments don't scale. A repo with 14 custom lint rules shows what does.",
    topic: "DX & Tooling",
    hints: [
      "It ships its own oxlint plugin.",
      "Its name is a letter followed by a number.",
      "Its desktop app wraps the web app in Electron.",
    ],
    body: `
<p>When most of your contributors are AI agents, a review comment is the least scalable thing you have. You write it, the agent fixes it, and the next agent makes the same mistake tomorrow.</p>
<p>This repo puts its taste in a custom lint plugin instead. Fourteen rules, each with its own test file.</p>

<h2>Some of the rules</h2>
<table>
  <thead><tr><th>Rule</th><th>The taste behind it</th></tr></thead>
  <tbody>
    <tr><td><code>require-suppression-reason</code></td><td>Every <code>eslint-disable</code> or <code>@ts-ignore</code> must say <em>why</em></td></tr>
    <tr><td><code>no-unscoped-has</code></td><td>No CSS <code>:has()</code> variants that restyle the whole page</td></tr>
    <tr><td><code>no-native-title-tooltip</code></td><td>Use the styled Tooltip, not <code>title=""</code></td></tr>
    <tr><td><code>no-test-in-loop</code></td><td>Use <code>it.each</code>, not a <code>for</code> loop around <code>it</code></td></tr>
    <tr><td><code>no-rpc-permission-bypass</code></td><td>Client mutations go through permission-checked commands</td></tr>
    <tr><td><code>no-hermes-unsupported-apis</code></td><td>The mobile JS engine can't run every web API</td></tr>
    <tr><td><code>no-inline-schema-compile</code></td><td>Compile schemas once, not on every call</td></tr>
    <tr><td><code>no-raw-mcp-registration</code></td><td>Agent tools must declare who may call them</td></tr>
    <tr><td><code>prefer-catch-tags</code></td><td>Handle typed errors explicitly</td></tr>
  </tbody>
</table>

<h2>Good rules know their exceptions</h2>
<p>The tooltip rule is my favorite example. It bans <code>title</code> as a tooltip on regular elements, but it still allows <code>title</code> on <code>iframe</code>, <code>embed</code>, <code>object</code> and friends, where the attribute is the <em>accessible name</em>, not a tooltip. A blunt rule would have broken accessibility.</p>

<h2>Silencing a tool should cost something</h2>
<ul>
  <li>Lint enforces a reason on every suppression: a <code>-- reason</code> suffix or a comment on the line above.</li>
  <li>Any PR that adds a suppression can't be auto-approved. A human has to look.</li>
</ul>

<h2>Design systems need enforcement too</h2>
<p>A rule called <code>shadcn/no-restyle</code> stops you from restyling a shared <code>&lt;Button&gt;</code> with <code>className</code>. You pick a <code>variant</code> or <code>size</code>. If none fits, you add a variant to the component. Layout classes (width, margin, position) go on the parent. That's how a design system stays consistent with hundreds of contributors.</p>

<h2>Dead code fails CI</h2>
<p><code>knip</code> runs in CI, and an export nobody imports fails the build. No "might need this later" exports, refactors actually delete the old files, and there are no re-export shims.</p>`,
    steal: `Each time you write the same review comment for the second time, write a lint rule instead, with tests and with the exceptions spelled out. Make suppressions explain themselves and need a human to approve.`,
    sources: [
      "oxlint-plugin-t3code/rules/",
      "oxlint-plugin-t3code/rules/no-native-title-tooltip.ts",
      "oxlint-plugin-t3code/rules/require-suppression-reason.ts",
      "docs/internals/web-ui.md",
      "knip.jsonc",
    ],
  },
  {
    n: 6,
    slug: "gtc-06-dev-setup-for-parallel-agents",
    title: "A dev setup built for ten agents on one laptop",
    tagline: "Ports, databases, processes and URLs: everything shared becomes a collision once agents run in parallel.",
    topic: "Dev setup",
    hints: [
      "Most of its contributions come from the app itself, controlled remotely.",
      "It creates a git worktree per task.",
      "You can install it with a three-character npx command.",
    ],
    body: `
<p>Run five AI agents in five git worktrees on one machine and everything that's normally shared starts colliding: ports, databases, processes, even the URLs you send to your phone. This repo's dev tooling assumes that's the normal case.</p>

<h2>Ports from a hash of the worktree path</h2>
<p>The dev runner derives ports from a hash of the worktree path. The same worktree gets the same ports after every restart, and two worktrees almost never collide. Two details I loved:</p>
<ul>
  <li>It skips every port on the <a href="https://fetch.spec.whatwg.org/#port-blocking">Fetch spec's blocked list</a>, the ones <code>curl</code> accepts but browsers refuse.</li>
  <li>It only probes loopback when checking whether a port is free. Probing wildcard addresses made it move away from a free port whenever <code>tailscale serve</code> held the same number on another interface.</li>
</ul>

<h2>State per worktree</h2>
<p>Each worktree gets its own gitignored data directory, and that directory deliberately takes priority over any ambient <code>HOME</code>-style environment variable. You can't end up on shared state by accident. A setup script runs when a worktree is created: it links the shared <code>.env</code> and warms the dependency cache.</p>

<h2>Single-origin dev</h2>
<blockquote><p>Never set <code>VITE_HTTP_URL</code> or <code>VITE_WS_URL</code> for dev.</p></blockquote>
<p>Vite proxies <code>/api</code> and <code>/ws</code>. Baking <code>localhost</code> into the bundle "silently breaks every remote browser." With the proxy, the same build works on localhost, over the LAN and through Tailscale.</p>

<h2>One command to share</h2>
<pre><code>vp run dev --share</code></pre>
<p>This publishes the dev server over the tailnet and prints a pairing URL to open on your phone. When the process exits, the mapping is removed.</p>

<h2>The most underrated line in the agent guide</h2>
<blockquote><p>Never <code>pkill -f</code> … Your own agent process has this worktree's path in its argv.</p></blockquote>
<p>If an agent runs your dev server, <code>pkill -f my-worktree</code> can kill the agent itself. Kill only PIDs you captured when you spawned the process.</p>

<h2>Vendored reference repos</h2>
<p>A gitignored-from-CI <code>.repos/</code> folder holds read-only source of key libraries. Agents read real library code and patterns instead of guessing from training data. The rule: never edit them, never import from them, and re-sync when you bump the dependency.</p>

<h2>CI that doesn't wait in line</h2>
<ul>
  <li>Lint, typecheck, build and tests run as parallel jobs, with one aggregate "Check" gate.</li>
  <li>System packages install in the background while JS dependencies install.</li>
  <li>Sparse checkout skips the vendored repos.</li>
  <li>A new push to a PR cancels its superseded runs.</li>
</ul>`,
    steal: `Design dev tooling as if a dozen strangers share your laptop, because with agents that's roughly true. Derive ports and state from the worktree, keep one origin, and never kill processes by pattern.`,
    sources: [
      "scripts/dev-runner.ts",
      "scripts/setup-worktree.ts",
      "t3.json",
      "docs/operations/development.md",
      ".github/workflows/ci.yml",
    ],
  },
  {
    n: 7,
    slug: "gtc-07-honest-ui",
    title: "Lying spinners, stale labels, one-way doors",
    tagline: "UX rules from a repo whose users stare at it all day and notice every lie the UI tells.",
    topic: "UI / UX",
    hints: [
      "It shows live status for agents running on other machines.",
      "It reconnects across LAN, Tailscale, SSH and its own tunnel.",
      "Its mobile app is React Native and shares a client runtime with the web app.",
    ],
    body: `
<p>One line from this repo's guide stuck with me:</p>
<blockquote><p>Our users drive agents all day and notice a dropped frame, a lying spinner, and a stale label.</p></blockquote>
<p>These are the rules that follow from it.</p>

<h2>"Reconnecting…" is a promise</h2>
<p>Connection health and data freshness are tracked <em>separately</em>. A socket opening doesn't prove the server is usable; the client waits for the initial server config before it calls itself ready. If a data subscription fails on a healthy socket, the UI must not say "reconnecting", because no reconnect is coming.</p>

<h2>Cached isn't live</h2>
<p>Cached data stays readable offline, but it must never</p>
<ul>
  <li>imply a live connection, or</li>
  <li>overwrite newer live data during a reconnect.</li>
</ul>
<p>Showing stale data is fine. Showing stale data as if it were live is the bug.</p>

<h2>No one-way doors</h2>
<blockquote><p>If you added a way in, add the way out and the way to see it. Snooze needs unsnooze. Close needs reopen. A one-way door is a bug.</p></blockquote>
<p>In practice: settle/un-settle, snooze/wake, a five-second Undo after sidebar actions, and a shortcut that reopens the last closed tab.</p>

<h2>Hit every surface</h2>
<blockquote><p>The most common defect in this repo is a change that works on the path you tested and is missing everywhere else.</p></blockquote>
<p>Their checklist: entry points (chat, settings, command palette, keybinding), clients (web, desktop, mobile), each backend integration, AI agents reaching it through tools, reverse states, connection modes (local, remote, tunnel), and docs.</p>

<h2>The server owns derived state</h2>
<p>If three devices show the same item, none of them should work out its status from its own clock. Status such as "this thread is finished and can be tucked away" is evaluated on the server and stored. Clients just render it, so every device agrees.</p>

<h2>Components built from slots</h2>
<p>Their banner component exports small slots (<code>Root</code>, <code>Row</code>, <code>Icon</code>, <code>Content</code>, <code>Actions</code>, <code>Dismiss</code>), and each slot owns its styling. A new banner is a few lines with no classes of its own:</p>
<pre><code>&lt;Banner.Root variant="info"&gt;
  &lt;Banner.Row&gt;
    &lt;Banner.Icon /&gt;
    &lt;Banner.Content&gt;Agent is waiting for approval&lt;/Banner.Content&gt;
    &lt;Banner.Actions&gt;…&lt;/Banner.Actions&gt;
  &lt;/Banner.Row&gt;
&lt;/Banner.Root&gt;</code></pre>

<h2>No GPU-burning shimmer</h2>
<p>No continuously repainting animations. Your 120&nbsp;Hz MacBook user will notice the fan before they notice the shimmer.</p>`,
    steal: `Every label is a promise. Keep "connected" and "fresh" as separate states, never let cache pose as live data, give every action a reverse, and let the server decide derived status so devices agree.`,
    sources: [
      "docs/internals/connection-runtime.md",
      "AGENTS.md",
      "docs/internals/web-ui.md",
      "apps/web/src/components/chat/ComposerBanner.tsx",
    ],
  },
  {
    n: 8,
    slug: "gtc-08-write-docs-for-agents",
    title: "Write docs for your most frequent contributor",
    tagline: "In this repo, the most frequent contributor is an AI agent running inside the app itself.",
    topic: "AI-native engineering",
    hints: [
      "Its agent guide opens with a note from the founder.",
      "It's a GUI for coding agents, and it's used to build itself.",
      "I've already written about it on this blog.",
    ],
    body: `
<blockquote><p>Most … contributions will come from [the app] itself, often controlled remotely.</p></blockquote>
<p>That sentence changes how you write docs. This repo's <code>AGENTS.md</code> reads like onboarding for a sharp new hire who has never seen the codebase and will start shipping in five minutes.</p>

<h2>What's in it</h2>
<ul>
  <li><strong>A glossary.</strong> <em>Environment</em>, <em>project</em>, <em>thread</em>, <em>turn</em>, <em>command</em>, <em>event</em>, <em>projection</em>, <em>outbox</em>: each means exactly one thing. When humans and agents use the same words, half the bugs never get written.</li>
  <li><strong>"The three ways to hurt yourself."</strong> Killing processes by pattern, writing to the live install, baking origins into the bundle. Short, concrete and memorable.</li>
  <li><strong>"Hit every surface."</strong> The checklist from Lesson 7.</li>
  <li><strong>Verification limits.</strong> Run the smallest proof that the change works. No repo-wide checks; CI owns those.</li>
  <li><strong>Safety around real data.</strong> Read the user's real database, copy from it, never write to it.</li>
</ul>

<h2>Rules for the docs themselves</h2>
<ul>
  <li>Internal docs record <strong>decisions, constraints spanning components, and traps</strong> that are hard to find in the source.</li>
  <li>No feature catalogs, no field lists, no narrated control flow. Agents can read the code.</li>
  <li>When a decision changes, <strong>rewrite</strong> the text. Don't append another account of the new behavior.</li>
  <li>Before adding a paragraph, ask: <em>what would a maintainer get wrong without it?</em></li>
</ul>

<h2>The note from the founder</h2>
<blockquote><p>Do not preserve complexity just because it already exists. Do not introduce machinery because it looks architecturally impressive. Understand the real constraint, then fight for the smallest model that makes the correct behavior unsurprising.</p></blockquote>
<p>Channel both "measure twice, cut once" and "YAGNI". I've reread that paragraph more than any other in the repo.</p>

<h2>Rules as guidance, with an escape hatch</h2>
<blockquote><p>If a rule here fights the task in front of you, say so loudly and get a human sign-off before breaking it.</p></blockquote>
<p>Most "rules for AI" files are long lists of MUSTs. This one gives good defaults and says exactly what to do when one of them is wrong.</p>`,
    steal: `Write your agent guide like onboarding for a new hire: shared vocabulary, the few ways to cause real damage, a "did you hit every surface" checklist, and a clear escape hatch. Keep docs for decisions and traps; let the code document itself.`,
    sources: ["AGENTS.md", "docs/internals/glossary.md", "CONTRIBUTING.md"],
  },
];

export const reveal = {
  slug: "gtc-reveal-t3-code-power-user-tips",
  title: "The reveal: it was T3 Code (plus 30 power-user tips)",
  tagline: "All eight lessons came from one open-source repo. Here it is, and here's how to get the most out of it.",
};
