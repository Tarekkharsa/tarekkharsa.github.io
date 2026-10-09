// X campaign for Guess the codebase, round 1 (answer: T3 Code). Render with `npm run kit t3code`.
import { postUrl, series, seriesIndex } from '../../app/content/posts.ts'
import { t3codeRound } from '../../app/content/rounds/t3code.ts'
import { thread, type KitSection, type TweetKit } from '../kit.ts'

const { lessons, finale } = t3codeRound
const T = series.hashtag
const hub = postUrl(seriesIndex)
const reveal = postUrl(finale)
const lessonUrl = (n: number) => postUrl(lessons[n - 1]!)

/** Per lesson: a teaser without a link (X shows those to more people), the link reply, and a hint drop. */
const perLesson: Record<number, { teaser: string; reply: string; hint: string }> = {
  1: {
    teaser: `New series: ${T} 🕵️

Lesson 1 from one open-source repo I read cover to cover.

Every server change takes 3 steps:
1. Decide: a pure function, zero I/O
2. Commit: events + read models + outbox, ONE transaction
3. Act: a worker runs side effects after

Which repo? 👇`,
    reply: `Why it matters: retries become idempotent, read models can't get ahead of the log, and a crash mid-task never loses intent.

Full breakdown + hints (answer hidden behind a reveal):
${lessonUrl(1)}`,
    hint: `${T} hint drop for lesson 1:

It's open source and has 400,000+ users.

Guesses so far are 🔥 but nobody has it yet.`,
  },
  2: {
    teaser: `${T} lesson 2 🕵️

This repo doesn't find perf regressions from user complaints. They fail the test suite:

expect(boundedBytes / fullBytes).toBeLessThanOrEqual(0.02)

Budget written as a number → asserted → fails before you ship.

Guess the repo 👇`,
    reply: `Plus 6 more patterns from its commit log: one-line CSS fix → lint rule, cheap fingerprint before expensive reads (~90% fewer API calls), batching per sweep, and more.

${lessonUrl(2)}`,
    hint: `${T} hint for lesson 2:

Its maintainers list "performance without compromise" as a value they never trade away.

And their users notice a single dropped frame.`,
  },
  3: {
    teaser: `${T} lesson 3 🕵️

"A test that needs a timeout to pass is wrong."

That rule is in this repo's agent guide. They:
- fake only process, network, clock and IDs
- replay real recorded protocol traffic
- drain workers instead of sleeping

Which codebase? 👇`,
    reply: `How they make tests deterministic from production code (no Date.now, no Math.random) and test restarts without test-only hooks:

${lessonUrl(3)}`,
    hint: `${T} hint for lesson 3:

It talks to SIX different AI coding agents through their own CLIs.

Its pitch: "bring your own subscription".`,
  },
  4: {
    teaser: `${T} lesson 4 🕵️

This repo's AI triage bot loads its policy from main's commit SHA, never from the PR.

"PR-body instructions cannot change policy."

Prompt-injection defense for open source. Plus the best PR template I've seen.

Guess the repo 👇`,
    reply: `Size labels that don't count tests, a mobile CI check that keeps OTA updates alive, AI reviewers with budgets, and how to close PRs without being a jerk:

${lessonUrl(4)}`,
    hint: `${T} hint for lesson 4:

One of its maintainers is a very well-known tech YouTuber.

1,000+ commits on main have AI co-author trailers.`,
  },
  5: {
    teaser: `${T} lesson 5 🕵️

Review comments don't scale. Lint rules do.

This repo has 14 custom lint rules, e.g.:
- every eslint-disable must say WHY
- no CSS :has() that restyles the whole page
- no native title="" tooltips

Which codebase is it? 👇`,
    reply: `My favorite detail: the tooltip rule still allows title on iframe/embed, where it's the accessible name. Good lint rules know their exceptions.

${lessonUrl(5)}`,
    hint: `${T} hint for lesson 5:

Its name is a letter followed by a number.

(That's a big one 👀)`,
  },
  6: {
    teaser: `${T} lesson 6 🕵️

Dev setup built for 10 AI agents on one laptop:

- ports from a hash of the worktree path
- state per worktree, beating ambient env vars
- one origin, no baked-in API URLs
- "never pkill -f": the agent's own argv has the path

Guess the repo 👇`,
    reply: `Also: it skips ports browsers block per the Fetch spec, shares dev over Tailscale with one flag, and vendors read-only library source for agents.

${lessonUrl(6)}`,
    hint: `${T} hint for lesson 6:

Most of its contributions come from the app itself, controlled remotely.

Yes, it builds itself.`,
  },
  7: {
    teaser: `${T} lesson 7 🕵️

"Reconnecting…" is a promise.

This repo tracks connection health and data freshness separately, so a failed subscription on a healthy socket never says "reconnecting".

Users notice a lying spinner.

Which codebase? 👇`,
    reply: `Plus: "a one-way door is a bug", cache that never pretends to be live, "hit every surface", and why the server, not the client clock, owns derived status.

${lessonUrl(7)}`,
    hint: `${T} hint for lesson 7:

It has web, desktop (Electron) and mobile (React Native) clients, all talking to a server you run yourself.`,
  },
  8: {
    teaser: `${T} lesson 8, the last one 🕵️

"Most contributions will come from [the app] itself."

So its AGENTS.md reads like onboarding: a glossary, "the three ways to hurt yourself", a "hit every surface" checklist and an escape hatch.

Final guesses 👇 Reveal tomorrow.`,
    reply: `"Fight for the smallest model that makes the correct behavior unsurprising."

The founder's note in that file is the best engineering paragraph I read this year:
${lessonUrl(8)}`,
    hint: `Last ${T} hint:

It's a GUI for coding agents.

And I already wrote a blog post about it 👀

Reveal + 30 power-user tips drops in a few hours.`,
  },
}

const launch = [
  `I spent weeks reading one open-source codebase: the server, the clients, the lint rules, CI, PR templates, even its bot configs.

It's one of the best-engineered repos I've seen.

So I'm turning it into a game: ${T} 🕵️

8 lessons. You guess the repo. 🧵`,
  `How to play:
1. Each day I post one engineering lesson from the repo
2. Each comes with hints
3. Reply with your guess, no googling the quotes 😄
4. Day 9: the reveal + 30 power-user tips

Topics: architecture, perf, testing, PRs, lint, dev setup, UX, AI docs`,
  `Hint zero: it's open source, it has hundreds of thousands of users, and the people building it use it to build it.

Series hub (answers stay hidden):
${hub}`,
]

const revealThread = [
  `${T}: the reveal 🥁

All 8 lessons came from…

T3 Code (github.com/pingdotgg/t3code)

The open-source GUI for Codex, Claude Code, Cursor, OpenCode and more. Web + desktop + mobile, with a server you run yourself.

Who got it? 👇🧵`,
  `The 8 lessons, unmasked:
1. Decide → commit → act
2. Perf budgets as unit tests
3. Mock the boundary, not the logic
4. A PR process for the AI era
5. Taste as lint rules
6. Dev setup for parallel agents
7. Honest UI: no lying spinners
8. Docs for agents`,
  `Reading the repo taught me how it's built. Using it every day taught me how to fly in it.

So the finale post has 30 power-user tips. A few favorites next 👇`,
  `⌨️ Drive the composer without the mouse:

mod+shift+M model
mod+shift+H host
mod+shift+E effort
mod+shift+A access mode
mod+shift+X workspace
mod+shift+G branch
mod+shift+L reuse last worktree

mod = Cmd on Mac, Ctrl elsewhere.`,
  `🏁 Race models against each other:

In a new thread, Shift-click several models in the picker. Send once and every model gets its own thread and worktree from the same prompt.

Then keep the best diff.`,
  `🔁 Queue vs steer while the agent works:

- mod+Enter does the opposite of your default, once
- mod+shift+Enter sends the oldest queued message as a steer
- Alt+↑ edits the last queued message
- mod+alt+Enter sends, backgrounds the thread and opens a fresh composer`,
  `🤖 Let other agents drive T3 Code over MCP:

claude mcp add --transport http t3 https://<your-env>/mcp
claude mcp login t3

Read-only by default. Grant a permission ceiling only when you want the agent to start threads.`,
  `All 30 tips: keybindings.json "when" rules, auto-settle + runOnSettle cleanup, webhook automations, multi-route machines, load balancing, synced PR viewed-marks and more:

${reveal}

Next round of ${T} is a different repo. Follow to play.`,
]

const tipsThread = [
  `30 T3 Code power-user tips, from someone who lives in it all day 🧵

(mod = Cmd on Mac, Ctrl elsewhere)`,
  `1/ mod+K searches threads across ALL your connected machines, including message text.

Start the query with > to show only actions.`,
  `2/ mod+Z undoes sidebar actions (unpin, settle, snooze, archive, discarded draft) for 5 seconds.

mod+shift+T reopens closed tabs: files, diffs, PRs, browser tabs, devices.`,
  `3/ thread.stop has NO default shortcut. Give it one.

Edit ~/.t3/userdata/keybindings.json with "when" rules:

{ "key": "mod+.", "command": "thread.stop", "when": "turnRunning" }`,
  `4/ Paste a 32 KiB+ log and it becomes a file attachment instead of flooding the context.

mod+shift+V keeps it inline if you really want that.

You can also drag files onto any sidebar thread to attach them there.`,
  `5/ Ask for a picture: "show this as a chart" or "collage these screenshots".

You get a sandboxed, theme-aware HTML page in the thread, with any provider.`,
  `6/ mod+alt+N starts a thread with no project, in its own scratch folder.

Good for "convert these PNGs to WebP".`,
  `7/ Threads auto-settle after 3 idle days or when their PR merges.

Add "runOnSettle": true to a t3.json script (e.g. cargo clean) to reclaim disk whenever a worktree thread settles.`,
  `8/ Rate-limited? Use "Resume at reset", "Snooze until reset", or turn on Auto-resume so work continues while you sleep.`,
  `9/ One machine, many routes: LAN + Tailscale + SSH + T3 Connect. It uses the first route that answers and moves back to a faster one when it works again.

Plus load balancing new threads across machines.`,
  `10/ Webhook automations: a scheduled task "On webhook" with a templated prompt:

Review this PR: {{body.pull_request.html_url}}

All 30 tips:
${reveal}`,
]

const lessonSections: KitSection[] = lessons.map((lesson) => {
  let copy = perLesson[lesson.lesson]!
  return {
    title: `Day ${lesson.lesson}: lesson ${lesson.lesson}, ${lesson.title}`,
    tweets: [
      { label: 'teaser (morning, no link)', text: copy.teaser },
      { label: 'reply with link', text: copy.reply },
      { label: 'hint drop (evening)', text: copy.hint },
    ],
  }
})

export const kit: TweetKit = {
  project: 't3code',
  title: `${T} round 1: T3 Code`,
  hub,
  playbook: [
    'Post the teaser without a link and put the link in the first reply. X shows link-free posts to more people, and the reply carries the click.',
    'Every post page has its own OG image (lesson number + title), so links unfurl nicely.',
    'Quote-tweet the funniest or closest guesses each evening. Engagement compounds.',
    'Don\'t confirm or deny guesses before reveal day. "👀" is the best reply.',
    'Each blog post has a "Post my guess" button that pre-fills a tweet tagging you, so readers spread it for you.',
    'Pin the launch thread for the whole run.',
    'On reveal day, in app/content/posts.ts set `finale.indexed: true` and give it a `listing` so it joins the feed, sitemap and home page. Then update the "keeps the reveal out of the feed" test in app/site.test.ts.',
  ],
  schedule: [
    { when: 'Day 0', what: 'Launch thread', notes: 'Pin it to your profile.' },
    ...lessons.map((lesson) => ({
      when: `Day ${lesson.lesson}`,
      what: `Lesson ${lesson.lesson}: ${lesson.title}`,
      notes: 'Morning: teaser, then reply with the link right away. Evening: hint drop, and quote-tweet the best guesses.',
    })),
    { when: 'Day 9', what: 'The reveal thread', notes: 'Publish the finale in the feed and on the home page the same day.' },
    { when: 'Day 11', what: '30 power-user tips thread', notes: 'Evergreen. Re-share it later on.' },
  ],
  sections: [
    { title: 'Day 0: launch thread', note: 'Pin this.', thread: true, tweets: thread(launch) },
    ...lessonSections,
    { title: 'Day 9: the reveal', thread: true, tweets: thread(revealThread) },
    { title: 'Day 11: 30 power-user tips (evergreen)', thread: true, tweets: thread(tipsThread) },
  ],
}
