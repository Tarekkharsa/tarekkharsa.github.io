export const site = {
  name: 'Tarek Kharsa',
  origin: 'https://tarekkharsa.github.io',
  description:
    'Full-stack software engineer working on AI infrastructure: coding agents, multi-agent orchestration, and the tooling that makes them reliable.',
  jobTitle: 'Software Engineer',
  twitterHandle: 'tarekkh1997',
  email: 'tarekkh1997@gmail.com',
  sourceUrl: 'https://github.com/Tarekkharsa/tarekkharsa.github.io',
  social: {
    github: 'https://github.com/Tarekkharsa',
    linkedin: 'https://www.linkedin.com/in/tarek-kharsa-0509a0177/',
    twitter: 'https://twitter.com/tarekkh1997',
  },
  copyrightYear: 2026,
} as const

/** Turns a site-relative path into the absolute URL used by canonical, OG and feed tags. */
export function absoluteUrl(path: string): string {
  return new URL(path, site.origin).href
}

/** Builds an X/Twitter "post" intent URL. */
export function tweetIntent(text: string, url: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
}
