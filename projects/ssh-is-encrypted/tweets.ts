// X campaign for the "But SSH is encrypted" essay, a reply to Theo's tweet of Oct 9, 2026.
// Render with `npm run kit -- ssh-is-encrypted`.
import { postUrl, sshEncryptedEssay } from '../../app/content/posts.ts'
import { thread, type TweetKit } from '../kit.ts'

const url = postUrl(sshEncryptedEssay)

export const kit: TweetKit = {
  project: 'ssh-is-encrypted',
  title: '"But SSH is encrypted" essay',
  hub: url,
  playbook: [
    "Quote-tweet Theo's post while it's still getting views; that's where the audience for this already is.",
    'Keep it about the idea, not the person who made the argument. No dunking: concede the plain-HTTP LAN point up front.',
    'Link goes in the first reply, not in the quote-tweet itself.',
    'Post the standalone thread a day later for people who missed the quote-tweet.',
  ],
  schedule: [
    { when: 'Today', what: "Quote-tweet of Theo's post + link reply", notes: 'While his tweet is still circulating.' },
    { when: 'Tomorrow', what: 'Standalone thread', notes: 'Pin it if it does well.' },
  ],
  sections: [
    {
      title: "Quote-tweet of Theo's post",
      note: "Quote https://x.com/theo's \"ssh is encrypted\" tweet with the first post, then reply to yourself with the link.",
      thread: true,
      tweets: thread([
        `Good news: SSH is encrypted.

Also encrypted: everything T3 Code uses. Tailscale is WireGuard, T3 Connect is HTTPS, and it can literally connect over SSH.

Bad news: when someone grabs your unlocked phone, their rm -rf ~ is also fully encrypted. 🔐`,
        `"It's encrypted" is the "it compiles" of security: necessary, nice to hear, wildly insufficient.

The 4 questions that actually matter, plus the one place the critique is right:

${url}`,
      ]),
    },
    {
      title: 'Standalone thread',
      thread: true,
      tweets: thread([
        `"But SSH is encrypted" is the wrong security question. 🧵

It's like picking a car because the seatbelts work. Every car has seatbelts.

Encryption answers 1 of 4 questions:

1. Can anyone read my traffic?
2. Who can connect?
3. What can they do once in?
4. How do I take it back?`,
        `Row 1 is a tie between a phone SSH terminal and T3 Code.

- Tailscale: WireGuard end to end
- T3 Connect: HTTPS through a tunnel, and the relay never sees your session token
- SSH: T3 Code's desktop app can literally connect over SSH`,
        `The fair part of the critique: T3 Code's plain LAN pairing (t3 serve --host <ip>) is HTTP. Its own docs say so.

Fine at home. On café Wi-Fi, use Tailscale.

Steelman the argument before you answer it.`,
        `Now the threat that actually happens: someone has your phone.

A raw SSH key on it is usually a full shell as you. Every file, every credential, git push, rm -rf.

Silver lining: the thief's rm -rf ~ arrives end-to-end encrypted. 🔐`,
        `A T3 Code device gets its own session:

- scoped: pairing can narrow permissions, never widen them; read-only is an option
- revocable per device in Settings → Connections
- over T3 Connect, bound to a key on the device (DPoP)
- agents ask for approval in Supervised mode`,
        `To be fair: a full-permission T3 Code device is powerful too. It can start an agent in Full access.

The difference is you can choose less, per device, and revoke it cleanly. With SSH you could too, but it's manual, so nobody does.

That's least privilege.`,
        `Usability is a separate argument. Claude Code in tmux over SSH works, and some people love it.

T3 Code's case is approvals, readable diffs, notifications, many machines. Product reasons, not security reasons. Don't blur them.`,
        `Encryption is a property of the pipe. Security is a property of the system.

A sealed envelope is great. Less great if you mailed it to the burglar.

Ask who can connect, what they can do, and how you take it back.

Full post:
${url}`,
      ]),
    },
  ],
}
