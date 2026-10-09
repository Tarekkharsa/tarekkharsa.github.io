// Archived first drafts of the round-1 posts, before they moved into app/content/posts.ts and
// content/posts/*.html. Kept for reference only: nothing imports this file.
// Body for the reveal post. All tips verified against docs/user/*.md in pingdotgg/t3code.
export const revealBody = `
<p>For eight posts I hid the source behind a "reveal" button. If you guessed it from the hints (400k users, six agent CLIs, "bring your own subscription", a name that's a letter plus a number, and the fact that I'd already written about it here), you were right:</p>

<div class="callout callout-big">
  <p class="callout-kicker">The codebase</p>
  <p class="callout-title"><a href="https://github.com/pingdotgg/t3code">T3 Code</a></p>
  <p>An open-source GUI for coding agents (Codex, Claude Code, Cursor, Grok, OpenCode, Antigravity and more), with web, desktop and mobile clients that all talk to a server you run yourself. Built in the open by Theo, Julius and contributors.</p>
</div>

<h2>The eight lessons, unmasked</h2>
<ol class="recap">
  <li><a href="gtc-01-decide-commit-then-act.html">Decide, commit, then act</a>: the pure orchestrator with a transactional outbox.</li>
  <li><a href="gtc-02-performance-budgets-as-tests.html">Performance budgets as unit tests</a>: payload ratios asserted in <code>vp test</code>.</li>
  <li><a href="gtc-03-mock-the-boundary.html">Mock the boundary, not the logic</a>: replayed provider transcripts and drainable workers.</li>
  <li><a href="gtc-04-pr-process-for-the-ai-era.html">A PR process for the AI era</a>: evidence-first templates and injection-proof triage.</li>
  <li><a href="gtc-05-taste-as-lint-rules.html">Taste as lint rules</a>: 14 custom oxlint rules.</li>
  <li><a href="gtc-06-dev-setup-for-parallel-agents.html">A dev setup for parallel agents</a>: hashed ports, per-worktree state, single origin.</li>
  <li><a href="gtc-07-honest-ui.html">Lying spinners and one-way doors</a>: honest status in a multi-device app.</li>
  <li><a href="gtc-08-write-docs-for-agents.html">Docs for your most frequent contributor</a>: an AGENTS.md that onboards.</li>
</ol>

<p>Studying the repo taught me how it's built. Using it every day taught me the tricks below. <code>mod</code> means <kbd>Cmd</kbd> on macOS and <kbd>Ctrl</kbd> everywhere else.</p>

<h2>30 power-user tips</h2>

<h3>Keyboard first</h3>
<ol class="tips">
  <li><strong>Search everything with <kbd>mod</kbd>+<kbd>K</kbd>.</strong> The command palette searches threads across <em>all</em> connected machines, including message text after two characters. Start with <code>&gt;</code> to show only actions.</li>
  <li><strong>Drive the composer without the mouse.</strong> <kbd>mod</kbd>+<kbd>Shift</kbd>+<kbd>M</kbd> model · <kbd>H</kbd> host · <kbd>E</kbd> effort · <kbd>A</kbd> access mode · <kbd>X</kbd> workspace · <kbd>G</kbd> git branch · <kbd>L</kbd> reuse the previous worktree.</li>
  <li><strong>Undo sidebar actions with <kbd>mod</kbd>+<kbd>Z</kbd>.</strong> Unpin, settle, snooze, archive or a discarded draft can be undone for five seconds while no text field is focused.</li>
  <li><strong>Reopen anything with <kbd>mod</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd>.</strong> Files, diffs, PRs, browser tabs and devices reopen in the order you closed them.</li>
  <li><strong>Go back and forward</strong> with <kbd>mod</kbd>+<kbd>[</kbd> and <kbd>mod</kbd>+<kbd>]</kbd>, like a browser.</li>
  <li><strong>Search a whole diff with <kbd>mod</kbd>+<kbd>F</kbd></strong> inside the Diff panel, including folded files and hidden unchanged lines. In a thread, the same key searches the full conversation history.</li>
  <li><strong>Give "stop" a shortcut.</strong> <code>thread.stop</code> has no default binding. Add one in <em>Settings → Keybindings</em>.</li>
  <li><strong>Edit <code>~/.t3/userdata/keybindings.json</code> directly</strong> and use <code>when</code> conditions such as <code>terminalFocus</code>, <code>turnRunning</code>, <code>composerFocus</code> or <code>isDesktop</code>, combined with <code>&amp;&amp;</code>, <code>||</code> and <code>!</code>. The last matching rule wins.
<pre><code>[
  { "key": "mod+j", "command": "terminal.toggle", "when": "terminalOpen &amp;&amp; !terminalFocus" },
  { "key": "mod+.", "command": "thread.stop", "when": "turnRunning" }
]</code></pre></li>
  <li><strong>Want <kbd>mod</kbd>+<kbd>1…9</kbd> thread jumps in the browser too?</strong> They're limited to <code>isDesktop</code> by default so they don't steal tab switching. Remove that condition.</li>
</ol>

<h3>Talking to agents</h3>
<ol class="tips" start="10">
  <li><strong>Queue vs. steer.</strong> Pick a default in <em>Settings → General → Follow-up behavior</em>. <kbd>mod</kbd>+<kbd>Enter</kbd> does the opposite for one message.</li>
  <li><strong>Promote the queue.</strong> <kbd>mod</kbd>+<kbd>Shift</kbd>+<kbd>Enter</kbd> sends the oldest queued message as a steer. <kbd>Alt</kbd>+<kbd>↑</kbd> at the start of the composer edits the last queued one.</li>
  <li><strong>Fire and forget.</strong> <kbd>mod</kbd>+<kbd>Alt</kbd>+<kbd>Enter</kbd> sends, leaves the thread running in the background, and opens a fresh composer. In a new thread, <kbd>mod</kbd>+<kbd>Enter</kbd> does the same.</li>
  <li><strong>Race models against each other.</strong> <kbd>Shift</kbd>-click several models in a new thread's model picker. Each one gets its own thread and worktree from the same prompt.</li>
  <li><strong>Paste huge logs freely.</strong> A paste of 32&nbsp;KiB or more becomes a text-file attachment instead of flooding the context. Use <kbd>mod</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> to keep it inline.</li>
  <li><strong>Drop files on a sidebar row.</strong> Drag files onto any thread in the sidebar: it opens with the files attached.</li>
  <li><strong>Ask for a picture.</strong> "Show this as a chart" or "make a collage of these screenshots" gets you a sandboxed, theme-aware HTML page in the thread, on every provider.</li>
  <li><strong>SnapShots (desktop).</strong> Turn it on in <em>Settings → SnapShots</em>, then press both <kbd>Shift</kbd> keys to capture the window you're in, with its accessibility tree, straight into your draft.</li>
  <li><strong>Switch providers mid-thread.</strong> The context handoff carries recent turns, the original request and command outcomes, and the agent can fetch omitted history itself.</li>
</ol>

<h3>Managing many threads</h3>
<ol class="tips" start="19">
  <li><strong>Scratch threads.</strong> <kbd>mod</kbd>+<kbd>Alt</kbd>+<kbd>N</kbd> starts a thread with no project, in its own folder under <code>~/.t3/scratch</code>. Good for "convert these PNGs".</li>
  <li><strong>Let finished work tidy itself.</strong> Threads auto-settle after three idle days or when their PR merges. Opt a thread out with <em>Auto-settle behavior → Disabled</em>.</li>
  <li><strong>Reclaim disk on settle.</strong> Add <code>"runOnSettle": true</code> to a <code>t3.json</code> script (for example <code>cargo clean</code>) and it runs in a thread's worktree whenever that thread settles.</li>
  <li><strong>Settle in bulk.</strong> Press a thread's <em>Settle</em> button and drag up or down to settle every thread in between. <em>Wake</em> and <em>Un-settle</em> work the same way.</li>
  <li><strong>Rate-limited?</strong> Choose <em>Resume at reset</em>, <em>Snooze until reset</em>, or turn on <em>Auto-resume limited threads</em> so work continues while you sleep.</li>
  <li><strong>Fold busy threads.</strong> <em>Settings → General → Working section (beta)</em> tucks running threads away, and they come back to the top when they need you.</li>
</ol>

<h3>Machines, agents and automation</h3>
<ol class="tips" start="25">
  <li><strong>One machine, many routes.</strong> Add LAN, Tailscale, SSH and T3 Connect routes to the same machine. The app uses the first one that answers and moves back to a faster route when it works again. (My <a href="t3-code-tailscale-home-server.html">home-server setup</a> uses this.)</li>
  <li><strong>Load-balance across machines.</strong> <em>Settings → Connections → Load balancing</em> picks a machine for each new thread. Mark machines <em>Prefer</em>, <em>Less often</em> or <em>Manual only</em>.</li>
  <li><strong>Let outside agents drive T3.</strong> Copy the MCP URL from <em>Settings → Connections</em>, then:
<pre><code>claude mcp add --transport http t3 https://&lt;environment-address&gt;/mcp
claude mcp login t3</code></pre>
  Access is read-only by default. Grant a permission ceiling only when you want the agent to start threads.</li>
  <li><strong>Webhook automations.</strong> Create a scheduled task with the <em>On webhook</em> schedule and template the prompt: <code>Review this PR: {{body.pull_request.html_url}}</code>. A public URL needs T3 Connect.</li>
</ol>

<h3>Git and review</h3>
<ol class="tips" start="29">
  <li><strong>Viewed marks that sync.</strong> Ticking a file as viewed in the PR <em>Code</em> tab uses GitHub's own viewed marks, so your review state matches github.com. <kbd>mod</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd> copies the PR URL and <kbd>mod</kbd>+<kbd>Shift</kbd>+<kbd>K</kbd> copies <code>#number</code>.</li>
  <li><strong>Smarter branch names.</strong> <em>Settings → Source Control → Worktree branch naming</em> can use a model-picked semantic prefix (<code>feat/</code>, <code>fix/</code>) or custom instructions such as "include the Linear issue ID".</li>
</ol>

<p>Bonus for mobile developers: the <strong>Device</strong> panel streams a live iOS Simulator or Android Emulator next to the thread, and agents can drive it through <code>device_*</code> tools. <em>Float device over chat</em> keeps it visible while you review diffs.</p>

<h2>What's next</h2>
<p>The next round of #GuessTheCodebase is another repo. Follow <a href="https://twitter.com/tarekkh1997">@tarekkh1997</a> to play, or subscribe via <a href="../feed.xml">RSS</a>.</p>
`;
