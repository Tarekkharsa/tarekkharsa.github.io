// X campaign for Guess the codebase, round 2 (answer: Pi). Render with `npm run kit -- pi`.
import { postUrl, series, seriesIndex } from '../../app/content/posts.ts'
import { piRound } from '../../app/content/rounds/pi.ts'
import { thread, type KitSection, type TweetKit } from '../kit.ts'

const { lessons, finale } = piRound
const T = series.hashtag
const hub = postUrl(seriesIndex)
const reveal = postUrl(finale)
const lessonUrl = (n: number) => postUrl(lessons[n - 1]!)

/** Per lesson: a teaser without a link (X shows those to more people), the link reply, and a hint drop. */
const perLesson: Record<number, { teaser: string; reply: string; hint: string }> = {
  1: {
    teaser: `${T} round 2 starts now 🕵️

A new repo, 8 new lessons.

Lesson 1: its MCP support ships built in, but as a plugin. Install a third-party MCP plugin and the built-in one steps aside.

First-party features on the public plugin API. Which repo? 👇`,
    reply: `If a first-party feature can't be written as a plugin, your plugin API is missing something.

Full lesson + hints (answer hidden behind a reveal):
${lessonUrl(1)}`,
    hint: `${T} round 2, hint drop for lesson 1:

It has more than 100,000 GitHub stars.

And it deliberately ships without sub-agents or a plan mode.`,
  },
  2: {
    teaser: `${T} round 2, lesson 2 🕵️

Importing ONE 6 KB function made Node load 106 files, because it came through a barrel index.ts.

This repo now fails the commit when an entry point's import graph grows past a budget.

"Entry points are cost contracts." Which repo? 👇`,
    reply: `Bonus: the check immediately caught two lines like

import { type Usage } from "./types"

That looks type-only. It still emits a runtime import.

${lessonUrl(2)}`,
    hint: `${T} round 2, lesson 2 hint:

It's a TypeScript monorepo of 14 packages, and one of them is a single API for many LLM providers.`,
  },
  3: {
    teaser: `${T} round 2, lesson 3 🕵️

How do you test an AI agent without paying for tokens?

This repo's tests talk to a model that doesn't exist, in an environment with nothing of yours in it: env -i, a temp HOME, no git config, TZ=UTC.

Which repo? 👇`,
    reply: `Also: 81 regression tests named after the issue they fix, like 5208-late-bash-output.test.ts. The "why" survives.

${lessonUrl(3)}`,
    hint: `${T} round 2, lesson 3 hint:

Its test script starts from an empty environment and adds back only an allowlist.`,
  },
  4: {
    teaser: `${T} round 2, lesson 4 🕵️

This agent never rewrites a session.

Branching, compaction, even hiding a message from the model: each one is a NEW line in a JSONL tree. What the model sees is a projection of the active branch.

Which repo? 👇`,
    reply: `Compaction stores a summary and the ID of the first entry it kept. The older entries stay in the file, so you can always go back.

${lessonUrl(4)}`,
    hint: `${T} round 2, lesson 4 hint:

Its maintainers created a famous Java game framework and a famous Python web framework.

That one should narrow it down 👀`,
  },
  5: {
    teaser: `${T} round 2, lesson 5 🕵️

"Treat npm dep and lockfile changes as reviewed code."

Exact pins. --ignore-scripts everywhere. Exactly 3 deps allowed to run install scripts, each with a written reason. And a pre-commit hook that blocks lockfile commits.

Which repo? 👇`,
    reply: `Supply-chain attacks don't come through code you read. They come through the lockfile nobody opens.

${lessonUrl(5)}`,
    hint: `${T} round 2, lesson 5 hint:

You can run it straight from GitHub with nix run.`,
  },
  6: {
    teaser: `${T} round 2, lesson 6 🕵️

Models send edits with curly quotes, snippets that appear twice and overlapping changes.

This edit tool matches exactly first, fuzzily second, rewrites only touched lines, and rejects ambiguity with a fixable error.

Which repo? 👇`,
    reply: `Plus one queue per file (keyed by real path), so parallel edits can't drop each other, and a script that groups failed edits from real transcripts.

${lessonUrl(6)}`,
    hint: `${T} round 2, lesson 6 hint:

Its prompt templates live in a hidden folder named after the project.`,
  },
  7: {
    teaser: `${T} round 2, lesson 7 🕵️

A terminal UI with two renderers behind one interface: one owns the scrollback, one leaves it to your terminal.

And a test that fails if showing an edit causes a full-screen redraw.

Which repo? 👇`,
    reply: `Count your most expensive UI operation and assert on the count. It catches what screenshots never will.

${lessonUrl(7)}`,
    hint: `${T} round 2, lesson 7 hint:

It runs on Android phones, and its renderer has a special case for the on-screen keyboard.`,
  },
  8: {
    teaser: `${T} round 2, lesson 8 🕵️

Everyone writes docs for agents now.

This repo MEASURES them: every task runs twice, in fresh containers, with and without the docs. Then it reports the lift.

Which repo? 👇`,
    reply: `Keep the docs that move the number. Delete the ones that don't.

${lessonUrl(8)}`,
    hint: `Last ${T} round 2 hints:

Its website is a two-letter name on .dev.

Its name is a mathematical constant. 🥧

Reveal + 20 power-user tips drops soon.`,
  },
}

const launch = [
  `${T} round 2 🕵️

New repo. I read it cover to cover: the core, the TUI, the tests, CI, the contributor gate, even its supply-chain scripts.

8 lessons. You guess the repo. 🧵`,
  `How to play:
1. One engineering lesson from the repo each day
2. Each comes with hints, and they pile up
3. Reply with your guess, no googling the quotes 😄
4. Day 9: the reveal + 20 power-user tips

Round 1's answer is still a secret too.`,
  `Hint zero: it's open source, it's small on purpose, and it expects you to bend it to your own workflow.

Series hub (answers stay hidden):
${hub}`,
]

const revealThread = [
  `${T} round 2: the reveal 🥁

All 8 lessons came from…

Pi (github.com/earendil-works/pi)

A minimal, extensible agent harness by Mario Zechner (libGDX) and Armin Ronacher (Flask).

Who got it? 👇🧵`,
  `The 8 lessons, unmasked:
1. A small, replaceable core
2. Entry points are cost contracts
3. A fake model + an empty env
4. Never mutate history
5. The lockfile is code
6. A tool a model can't misuse
7. Who owns the scrollback
8. Measure your docs`,
  `Reading the repo taught me how it's built. Using it taught me the tricks.

The finale has 20 power-user tips. A few favorites 👇`,
  `🧭 Steer while it works:

Enter: guide the next response
Alt+Enter: queue a follow-up for after the task
Alt+↑: pull queued messages back
Esc: stop`,
  `🌳 Sessions are trees.

/tree, pick an earlier message of yours, edit it, resubmit: a new branch, and the old one stays.

/fork makes it a separate session. /clone copies where you are now.`,
  `🔧 Pipe into it:

git diff | pi --print "Review this change"

Or get every agent event as JSON lines:

pi --mode json "Inspect this repo" > events.jsonl`,
  `All 20 tips: rebinding every key, prompt templates as /commands, skills, compacting with intent, tool allowlists, trying packages for one run and more:

${reveal}

Round 3 is another repo. Follow to play.`,
]

const tipsThread = [
  `20 Pi power-user tips 🧵`,
  `1/ Ctrl+G writes your prompt in $VISUAL or $EDITOR.

@ searches for a file to attach. Tab completes paths.`,
  `2/ Ctrl+O collapses tool output. Ctrl+T hides thinking blocks.

Shift+Tab cycles the thinking level. Ctrl+P cycles the models you picked in /scoped-models.`,
  `3/ !git status runs it and sends the output to the model.

!!git status runs it without sending anything.`,
  `4/ Every shortcut is a named action. Rebind or disable any of them in ~/.pi/agent/keybindings.json:

{ "app.session.new": "ctrl+shift+n" }

Then /reload.`,
  `5/ /compact keep the API decisions and open questions

Tell the summary what to preserve. The original messages stay in the session file.`,
  `6/ Turn any prompt into a command: save ~/.pi/agent/prompts/review.md and type /review.

Arguments: $1, $ARGUMENTS, \${1:-default}`,
  `7/ pi -e npm:@example/pi-tools loads a package for one run. pi install keeps it.

Want sub-agents or plan mode? There are example extensions for both, or ask Pi to write one.

All 20:
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
  project: 'pi',
  title: `${T} round 2: Pi`,
  hub,
  playbook: [
    'Post the teaser without a link and put the link in the first reply. X shows link-free posts to more people, and the reply carries the click.',
    'Every post page has its own OG image (round, lesson number and title), so links unfurl nicely.',
    'Quote-tweet the funniest or closest guesses each evening.',
    'Don\'t confirm or deny guesses before reveal day. "👀" is the best reply.',
    'Lesson 4\'s hint (libGDX + Flask) is a near-giveaway. Expect correct guesses from day 4.',
    'On reveal day, in app/content/rounds/pi.ts set `finale.indexed: true` and give it a `listing` so it joins the feed, sitemap and home page. Then update the "keeps every reveal out of the feed" test in app/site.test.ts.',
  ],
  schedule: [
    { when: 'Day 0', what: 'Launch thread', notes: 'Pin it to your profile.' },
    ...lessons.map((lesson) => ({
      when: `Day ${lesson.lesson}`,
      what: `Lesson ${lesson.lesson}: ${lesson.title}`,
      notes: 'Morning: teaser, then reply with the link right away. Evening: hint drop, and quote-tweet the best guesses.',
    })),
    { when: 'Day 9', what: 'The reveal thread', notes: 'Publish the finale in the feed and on the home page the same day.' },
    { when: 'Day 11', what: '20 power-user tips thread', notes: 'Evergreen. Re-share it later on.' },
  ],
  sections: [
    { title: 'Day 0: launch thread', note: 'Pin this.', thread: true, tweets: thread(launch) },
    ...lessonSections,
    { title: 'Day 9: the reveal', thread: true, tweets: thread(revealThread) },
    { title: 'Day 11: 20 power-user tips (evergreen)', thread: true, tweets: thread(tipsThread) },
  ],
}
