/**
 * Build-time syntax highlighting for code blocks in hand-written post bodies.
 *
 * A block opts in with a language class, and can name its file for the header bar:
 *
 *   <pre data-title="graphql.config.ts"><code class="language-ts">...</code></pre>
 *
 * Tokens become <span class="tok-*"> elements, so pages still ship no highlighting script.
 */

type Kind = 'kw' | 'str' | 'com' | 'num' | 'type' | 'fn' | 'var' | 'punc'
type Rule = [Kind | null, RegExp]

const TS_KEYWORDS =
  'import|from|export|default|const|let|var|function|return|class|extends|new|type|interface|yield|async|await|if|else|switch|case|for|of|in|typeof|keyof|as|satisfies|true|false|null|undefined|this|static|readonly'

const LANGUAGES: Record<string, Rule[]> = {
  ts: [
    ['com', /^(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/],
    ['str', /^("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)/],
    ['kw', new RegExp(`^(?:${TS_KEYWORDS})\\b`)],
    ['num', /^\d[\d_]*(?:\.\d+)?\b/],
    ['fn', /^[a-z_$][\w$]*(?=\s*(?:<[^<>()]*>)?\()/],
    ['type', /^[A-Z][\w$]*/],
    [null, /^[a-z_$][\w$]*/],
    ['punc', /^(?:=>|[{}()[\];,.:<>=*|&!?+-])/],
  ],
  graphql: [
    ['com', /^#[^\n]*/],
    ['str', /^"(?:[^"\\\n]|\\.)*"/],
    ['kw', /^(?:query|mutation|subscription|fragment|on)\b/],
    ['var', /^\$\w+/],
    ['num', /^\d+\b/],
    ['type', /^[A-Z]\w*/],
    [null, /^[a-z_]\w*/],
    ['punc', /^(?:\.\.\.|[{}()[\]:!=@])/],
  ],
}

const LABELS: Record<string, string> = { ts: 'TypeScript', graphql: 'GraphQL' }

const ENTITIES: Record<string, string> = { '&lt;': '<', '&gt;': '>', '&amp;': '&', '&quot;': '"', '&#39;': "'" }

const decode = (html: string) => html.replace(/&(?:lt|gt|amp|quot|#39);/g, (entity) => ENTITIES[entity] ?? entity)

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Highlights plain source text and returns escaped HTML. */
export function highlight(source: string, language: string): string {
  let rules = LANGUAGES[language]
  if (rules == null) return escape(source)
  let out = ''
  let rest = source
  while (rest.length > 0) {
    let matched = false
    for (let [kind, pattern] of rules) {
      let match = pattern.exec(rest)
      if (match == null) continue
      let token = match[0]
      out += kind == null ? escape(token) : `<span class="tok-${kind}">${escape(token)}</span>`
      rest = rest.slice(token.length)
      matched = true
      break
    }
    if (!matched) {
      out += escape(rest[0])
      rest = rest.slice(1)
    }
  }
  return out
}

const BLOCK = /<pre([^>]*)><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g

/** Highlights every opted-in code block in a post body; other markup is left untouched. */
export function highlightCodeBlocks(html: string): string {
  return html.replace(BLOCK, (_block, attributes: string, language: string, code: string) => {
    let title = /\sdata-title="([^"]*)"/.exec(attributes)?.[1]
    let rest = attributes.replace(/\sdata-title="[^"]*"/, '')
    let pre = `<pre${rest}><code class="language-${language}">${highlight(decode(code), language)}</code></pre>`
    let caption = title ?? LABELS[language]
    if (caption == null) return pre
    return `<figure class="code-block"><figcaption><span class="dots" aria-hidden="true"></span>${caption}</figcaption>${pre}</figure>`
  })
}
