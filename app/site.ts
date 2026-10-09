export const site = {
  name: 'Tarek Kharsa',
  origin: 'https://tarekkharsa.github.io',
  description:
    'Full-stack software engineer working on AI infrastructure: coding agents, multi-agent orchestration, and the tooling that makes them reliable.',
  jobTitle: 'Software Engineer',
  twitterHandle: 'tarekkh1997',
  sourceUrl: 'https://github.com/Tarekkharsa/tarekkharsa.github.io',
  social: {
    github: 'https://github.com/Tarekkharsa',
    twitter: 'https://twitter.com/tarekkh1997',
  },
  copyrightYear: 2026,
  /**
   * GoatCounter (cookie-free, no consent banner). Dashboard: https://tarekkharsa.goatcounter.com.
   * count.js skips localhost, so `npm run dev` and `npm run preview` are never counted.
   */
  analytics: {
    endpoint: 'https://tarekkharsa.goatcounter.com/count',
    script: 'https://gc.zgo.at/count.js',
  },
  /** 400×400 portrait, shown on the home page only. */
  photo: { path: '/assets/tarek.jpg', alt: 'Tarek Kharsa' },
} as const

/** Turns a site-relative path into the absolute URL used by canonical, OG and feed tags. */
export function absoluteUrl(path: string): string {
  return new URL(path, site.origin).href
}

/** Builds an X/Twitter "post" intent URL. */
export function tweetIntent(text: string, url: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
}
