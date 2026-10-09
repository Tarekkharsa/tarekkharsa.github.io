// X campaign for Guess the codebase, round 3 (answer: OpenCode v2). Render with `npm run kit -- opencode`.
import { postUrl, series, seriesIndex } from '../../app/content/posts.ts'
import { opencodeRound } from '../../app/content/rounds/opencode.ts'
import { thread, type KitSection, type TweetKit } from '../kit.ts'

const { lessons, finale } = opencodeRound
const T = series.hashtag
const hub = postUrl(seriesIndex)
const reveal = postUrl(finale)
const lessonUrl = (n: number) => postUrl(lessons[n - 1]!)

/** Per lesson: a teaser without a link (X shows those to more people), the link reply, and a hint drop. */
const perLesson: Record<number, { teaser: string; reply: string; hint: string }> = {
  1: {
    teaser: `${T} round 3 🕵️

This time I read a rewrite that hasn't shipped yet.

Lesson 1: pressing Enter doesn't start the model. Your prompt lands in a durable inbox first. The model only sees it when a runner promotes it at a safe boundary.

Which repo? 👇`,
    reply: `Same prompt ID twice? Same receipt, no duplicate. Different prompt, same ID? It fails loudly.

Steer and queue become explicit delivery modes instead of a race.

${lessonUrl(1)}`,
    hint: `${T} round 3, lesson 1 hints:

It runs on Bun, and its default branch isn't called main.`,
  },
  2: {
    teaser: `${T} round 3, lesson 2 🕵️

This agent never rewrites its system prompt mid-conversation.

The baseline is frozen for the provider cache. When the branch or rules change, it APPENDS an update at the next turn boundary.

Which repo? 👇`,
    reply: `Changes are sampled lazily, combined into one message, rendered in a stable order, and the exact text is stored for replay.

Your prompt cache will thank you:
${lessonUrl(2)}`,
    hint: `${T} round 3, lesson 2 hint:

Its headless server listens on port 4096, and its terminal UI can attach to one running elsewhere.`,
  },
  3: {
    teaser: `${T} round 3, lesson 3 🕵️

No hand-written HTTP mocks. This repo records real provider traffic once and replays cassettes forever.

In CI, a missing cassette is a failure, never a live call. And there's no overwrite flag: delete the file to refresh it.

Which repo? 👇`,
    reply: `Secrets are redacted before anything hits disk, and WebSocket replay keeps frame order.

${lessonUrl(3)}`,
    hint: `${T} round 3, lesson 3 hint:

The team behind it also makes an infrastructure-as-code framework.`,
  },
  4: {
    teaser: `${T} round 3, lesson 4 🕵️

This repo speeds up its tests like a scientist: one metric, one row per hypothesis, before / after / keep or discard.

And a "Dead Ends" table, so nobody tries the same idea twice.

Which repo? 👇`,
    reply: `Best part: the suite went 225s → 187s, then a safety review gave back 15s to restore coverage. Seconds lost, right call.

${lessonUrl(4)}`,
    hint: `${T} round 3, lesson 4 hint:

Its second-busiest committer is its own GitHub app.`,
  },
  5: {
    teaser: `${T} round 3, lesson 5 🕵️

Its embedded SDK has no "local implementation".

It builds the real server routes and hands the generated client a fetch() that calls them in memory. Same router, same handlers, no network.

Which repo? 👇`,
    reply: `Two modes, one API, nothing to drift. Plus a rule: client code never imports core or server.

${lessonUrl(5)}`,
    hint: `${T} round 3, lesson 5 hint:

You can summon it in a GitHub comment with a slash command.`,
  },
  6: {
    teaser: `${T} round 3, lesson 6 🕵️

Its "2.0" branch is 4,760 commits behind.

Because v2 is being built on the default branch, next to v1, with a dated changelog of every schema change and a field-by-field review of the old config.

Which repo? 👇`,
    reply: `Config review: 12 keep, 14 remove, 13 redesign. Every legacy setting has to earn its way in.

${lessonUrl(6)}`,
    hint: `${T} round 3, lesson 6 hint:

Its GitHub org was renamed, and the old URL still redirects.`,
  },
  7: {
    teaser: `${T} round 3, lesson 7 🕵️

"A provider can be correctly configured and have valid credentials while policy still denies its use."

Config says how. Policy says whether. And the whole evaluator is one findLast: the last matching rule wins.

Which repo? 👇`,
    reply: `No "more specific beats wildcard" magic. Read the rules top to bottom and you know the answer.

${lessonUrl(7)}`,
    hint: `${T} round 3, lesson 7 hint:

It has two built-in primary agents, you switch between them with Tab, and one asks before every edit.`,
  },
  8: {
    teaser: `${T} round 3, lesson 8 🕵️

This repo's glossary tells you which words NOT to use.

System Context. Avoid: system prompt.
Page. Avoid: response envelope.

24 terms, 9 banned synonyms, for humans and agents alike.

Which repo? 👇`,
    reply: `Vocabulary rots before code does. Agents spread whichever word they saw last.

${lessonUrl(8)}`,
    hint: `Last ${T} round 3 hint:

Its name is "code" with the opposite of "closed" in front. 🙃

Reveal + 20 power-user tips soon.`,
  },
}

const launch = [
  `${T} round 3 🕵️

This time it's a rewrite in progress: the next major version of a popular open-source tool, read on its default branch before it ships.

8 lessons. You guess the repo. 🧵`,
  `How to play:
1. One engineering lesson from the repo each day
2. Each comes with hints, and they pile up
3. Reply with your guess, no googling the quotes 😄
4. Day 9: the reveal + 20 power-user tips`,
  `Hint zero: it's open source, it's very popular, and it's in the middle of rebuilding its own core.

Series hub (answers stay hidden):
${hub}`,
]

const revealThread = [
  `${T} round 3: the reveal 🥁

All 8 lessons came from…

OpenCode v2 (github.com/anomalyco/opencode)

The open-source coding agent, rebuilding its core on its default branch before release.

Who got it? 👇🧵`,
  `The 8 lessons, unmasked:
1. Admit the prompt, run it later
2. Never rewrite the system prompt
3. Record HTTP once, replay forever
4. A lab notebook for speed
5. One API, even in-process
6. Rebuild on the main branch
7. Configured is not allowed
8. Ban the synonyms`,
  `The lessons are v2. The finale's 20 tips are for OpenCode today. A few favorites 👇`,
  `🧭 Tab switches between Build and Plan. Plan asks before every edit and shell command, so it's a safe place to think.`,
  `↩️ /undo (ctrl+x u) removes the last message AND reverts its file changes. /redo brings them back. Needs a git repo.`,
  `⚡ Skip the cold start:

opencode serve
opencode run --attach http://localhost:4096 "…"

MCP servers stay up between runs.`,
  `All 20 tips: custom commands with live shell output, per-tool permissions, auto mode with deny rules, opencode pr, /opencode in GitHub comments and more:

${reveal}`,
]

const tipsThread = [
  `20 OpenCode power-user tips 🧵`,
  `1/ @ fuzzy-searches files into the conversation. ! runs a shell command inline. The leader key is ctrl+x: n new, l sessions, m models, c compact.`,
  `2/ Custom commands are Markdown: .opencode/commands/test.md becomes /test.

Use $ARGUMENTS or $1, and !\`git log --oneline -10\` inserts live output into the prompt.`,
  `3/ Permissions per tool in opencode.json:

"permission": { "*": "ask", "bash": "allow", "edit": "deny" }

opencode --auto approves everything else, and deny rules still apply.`,
  `4/ opencode pr 123 checks out a PR and starts on it.

opencode stats --days 7 --models shows what it cost.

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
  project: 'opencode',
  title: `${T} round 3: OpenCode v2`,
  hub,
  playbook: [
    'Post the teaser without a link and put the link in the first reply. X shows link-free posts to more people, and the reply carries the click.',
    'Say it\'s an unreleased rewrite: that\'s the hook of this round, and it explains why the lessons may not match the current release.',
    'Quote-tweet the funniest or closest guesses each evening.',
    'Don\'t confirm or deny guesses before reveal day. "👀" is the best reply.',
    'If v2 ships during the round, check the pinned "where to look" links still make sense and mention the release in the reveal.',
    'On reveal day, in app/content/rounds/opencode.ts set `finale.indexed: true` and give it a `listing`. Then update the "keeps every reveal out of the feed" test in app/site.test.ts.',
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
