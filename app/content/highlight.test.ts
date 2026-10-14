import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { highlight, highlightCodeBlocks } from './highlight.ts'

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

describe('highlight', () => {
  it('keeps the source text exactly and escapes markup', () => {
    let source = 'const a = "<b>" && x < y // done\ntype T = Array<string>'
    let html = highlight(source, 'ts')
    assert.equal(text(html), source)
    assert.ok(!html.includes('<b>'))
  })

  it('marks keywords, strings, comments, types and calls', () => {
    let html = highlight('const book = Library.use("x") // hi', 'ts')
    assert.match(html, /<span class="tok-kw">const<\/span>/)
    assert.match(html, /<span class="tok-type">Library<\/span>/)
    assert.match(html, /<span class="tok-fn">use<\/span>/)
    assert.match(html, /<span class="tok-str">"x"<\/span>/)
    assert.match(html, /<span class="tok-com">\/\/ hi<\/span>/)
  })

  it('highlights GraphQL variables and types', () => {
    let html = highlight('query Book($isbn: Isbn!) { book }', 'graphql')
    assert.match(html, /<span class="tok-kw">query<\/span>/)
    assert.match(html, /<span class="tok-var">\$isbn<\/span>/)
    assert.match(html, /<span class="tok-type">Isbn<\/span>/)
  })
})

describe('highlightCodeBlocks', () => {
  it('wraps a titled block in a captioned figure and decodes entities once', () => {
    let html = highlightCodeBlocks('<pre data-title="a.ts"><code class="language-ts">x &lt; y</code></pre>')
    assert.match(html, /^<figure class="code-block"><figcaption>.*a\.ts<\/figcaption><pre><code class="language-ts">/)
    assert.equal(text(html.replace(/<figcaption>.*<\/figcaption>/, '')), 'x < y')
  })

  it('leaves blocks without a language alone', () => {
    let html = '<pre><code>curl -fsSL https://t3.codes/install.sh | sh</code></pre>'
    assert.equal(highlightCodeBlocks(html), html)
  })
})
