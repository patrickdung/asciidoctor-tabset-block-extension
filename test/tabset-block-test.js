/* eslint-env mocha */
'use strict'

//Opal is apt to be needed for Antora tests, perhaps not otherwise
// IMPORTANT eagerly load Opal since we'll always be in this context; change String encoding from UTF-16LE to UTF-8
const { Opal } = require('asciidoctor-opal-runtime')
if ('encoding' in String.prototype && String(String.prototype.encoding) !== 'UTF-8') {
  String.prototype.encoding = Opal.const_get_local(Opal.const_get_qualified('::', 'Encoding'), 'UTF_8') // eslint-disable-line
}
const asciidoctor = require('@asciidoctor/core')()
const tabsetBlock = require('./../lib/tabset-block')
const { expect } = require('chai')

describe('tabset-block tests', () => {
  beforeEach(() => {
    asciidoctor.Extensions.unregisterAll()
  })

  ;[{
    type: 'global',
    f: (text) => {
      tabsetBlock.register(asciidoctor.Extensions)
      return asciidoctor.load(text)
    },
  },
  {
    type: 'registry',
    f: (text) => {
      const registry = tabsetBlock.register(asciidoctor.Extensions.create())
      return asciidoctor.load(text, { extension_registry: registry })
    },
  }].forEach(({ type, f }) => {
    it(`Simple tabset block, ${type}`, () => {
      const doc = f(`
[tabset]
====
Tab A::
+
--
Contents A
--
Tab B::
+
--
Contents B
--
====
`)
      const html = doc.convert()
      expect(html).to.equal(`<div id="tabset1" class="openblock tabset is-loading">
<div class="content">
<div class="ulist tabs">
<ul>
<li class="tab">
<p><a id="tabset1_tab-a"></a>Tab A</p>
</li>
<li class="tab">
<p><a id="tabset1_tab-b"></a>Tab B</p>
</li>
</ul>
</div>
<div class="openblock tabset-panes">
<div class="content">
<div id="tabset1_tab-a_pane" class="openblock tab-pane">
<div class="content">
<div class="paragraph">
<p>Contents A</p>
</div>
</div>
</div>
<div id="tabset1_tab-b_pane" class="openblock tab-pane">
<div class="content">
<div class="paragraph">
<p>Contents B</p>
</div>
</div>
</div>
</div>
</div>
</div>
</div>`)
    })
  })
})
