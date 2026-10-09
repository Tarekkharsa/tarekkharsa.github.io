// X campaign for the "But SSH is encrypted" post, a reply to Theo's tweet of Oct 9, 2026.
// Render with `npm run kit -- ssh-is-encrypted`.
import { postUrl, sshEncryptedEssay } from '../../app/content/posts.ts'
import { thread, type TweetKit } from '../kit.ts'

const url = postUrl(sshEncryptedEssay)

export const kit: TweetKit = {
  project: 'ssh-is-encrypted',
  title: '"But SSH is encrypted"',
  hub: url,
  playbook: [
    "Quote-tweet Theo's post while it's still getting views.",
    'Joke about the argument, not the person. Theo never named them; keep it that way.',
    'Link goes in the first reply, not in the quote-tweet.',
    'Post the short thread a day later for people who missed it.',
  ],
  schedule: [
    { when: 'Today', what: "Quote-tweet Theo + link reply", notes: 'While his tweet is still circulating.' },
    { when: 'Tomorrow', what: 'Short thread', notes: 'Pin it if it does well.' },
  ],
  sections: [
    {
      title: "Quote-tweet of Theo's post",
      note: "Quote Theo's \"ssh is encrypted\" tweet with the first post, then reply to yourself with the link.",
      thread: true,
      tweets: thread([
        `SSH is encrypted. So is WhatsApp. I still wouldn't give WhatsApp a shell on my laptop.

The pipe was never the question. What someone can do with your stolen phone is.`,
        `Made a tiny interactive thing about it. Pick a setup, see what the thief gets:

${url}`,
      ]),
    },
    {
      title: 'Short thread',
      thread: true,
      tweets: thread([
        `"But SSH is encrypted" 🧵

Sure. Every pipe is. T3 Code over Tailscale is WireGuard, over T3 Connect it's HTTPS, and it can even connect over SSH.

So that's a tie. Here's what isn't:`,
        `Your phone gets stolen.

SSH key on it: the thief has a shell as you. Files, ~/.aws, git push, rm -rf ~. End-to-end encrypted, at least 🔐

T3 Code on it: they get whatever you gave that phone. Make it read-only and they can only watch.`,
        `Fixing it:

SSH: find every server that key reaches and delete it from authorized_keys. Hope you remember them all.

T3 Code: Settings → Connections → revoke the phone. Done.`,
        `One fair hit: T3 Code's plain LAN pairing is HTTP. Don't use it on airport Wi-Fi.

"It's encrypted" is the "it compiles" of security. Good to hear, nowhere near done.

${url}`,
      ]),
    },
  ],
}
