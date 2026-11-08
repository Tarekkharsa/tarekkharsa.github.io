/**
 * Open-source work shown on the home page. Every entry links to the merged (or open) pull
 * request, so each claim can be checked. Update `status` when a PR lands; drop closed ones.
 */

export interface PullRequest {
  repo: string
  number: number
}

export interface Contribution {
  /** The upstream project, as people know it. */
  project: string
  url: string
  /** One plain sentence: what changed for people who use the project. */
  summary: string
  status: 'merged' | 'in review'
  pulls: PullRequest[]
  /** Extra links, such as the plugin repos or reproductions behind a PR. */
  links?: { label: string; href: string }[]
}

export interface Project {
  name: string
  url: string
  language: string
  summary: string
}

export const contributions: Contribution[] = [
  {
    project: 'Effect',
    url: 'https://github.com/Effect-TS/effect',
    summary:
      'HttpClient retries now wait for the time a server asks for in Retry-After, HTTP dates included, and the checks behind retryTransient are exported for custom retry policies.',
    status: 'merged',
    pulls: [
      { repo: 'Effect-TS/effect', number: 9052 },
      { repo: 'Effect-TS/effect', number: 9053 },
      { repo: 'Effect-TS/effect', number: 9059 },
    ],
    links: [
      {
        label: 'effect/graphql feedback',
        href: 'https://github.com/Tarekkharsa/effect-graphql-feedback',
      },
    ],
  },
  {
    project: 'Hermes Agent',
    url: 'https://github.com/NousResearch/hermes-agent',
    summary:
      'Two of my plugins are in its plugin catalog: Lahja, local speech-to-text that keeps your Arabic dialect, and canary-trap, which catches prompt injection by the decoy key it tries to send.',
    status: 'merged',
    pulls: [
      { repo: 'NousResearch/hermes-agent', number: 149968 },
      { repo: 'NousResearch/hermes-agent', number: 149988 },
    ],
    links: [
      { label: 'lahja', href: 'https://github.com/Tarekkharsa/hermes-lahja' },
      { label: 'canary-trap', href: 'https://github.com/Tarekkharsa/hermes-canary-trap' },
    ],
  },
  {
    project: 'TanStack Router',
    url: 'https://github.com/TanStack/router',
    summary:
      'A fix for a crash when a link is clicked before the page finishes hydrating, and hydration that no longer waits for every code-split chunk.',
    status: 'in review',
    pulls: [
      { repo: 'TanStack/router', number: 8576 },
      { repo: 'TanStack/router', number: 8577 },
    ],
  },
  {
    project: 'TanStack Form',
    url: 'https://github.com/TanStack/form',
    summary: 'A field with a synchronous validator renders once per keystroke again, not twice.',
    status: 'in review',
    pulls: [{ repo: 'TanStack/form', number: 2447 }],
  },
]

export const projects: Project[] = [
  {
    name: 'agentstack',
    url: 'https://github.com/Tarekkharsa/agentstack',
    language: 'Rust',
    summary:
      'One agent setup for every coding CLI: MCP servers, skills and instructions in one repo, served to Claude Code, Codex, Cursor, OpenCode and more.',
  },
  {
    name: 'coolant',
    url: 'https://github.com/Tarekkharsa/coolant',
    language: 'Rust',
    summary:
      'A Mac menu bar app and CLI that shows why your Mac runs hot while coding agents work (Spotlight, security scans, builds, leftover dev servers) and fixes what it safely can.',
  },
]

export function pullUrl(pull: PullRequest): string {
  return `https://github.com/${pull.repo}/pull/${pull.number}`
}
