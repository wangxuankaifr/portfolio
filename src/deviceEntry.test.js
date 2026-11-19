import test from 'node:test'
import assert from 'node:assert/strict'
import { mobileEntryURL, shouldOpenMobile } from './deviceEntry.js'

test('iPhone WeChat and Android phones open mobile, including landscape', () => {
  assert.equal(shouldOpenMobile({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) MicroMessenger/8.0', width: 844 }), true)
  assert.equal(shouldOpenMobile({ userAgent: 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36', width: 915 }), true)
})

test('desktop content stays on desktop, even in a narrow mouse window', () => {
  for (const width of [1440, 1024, 390]) {
    assert.equal(shouldOpenMobile({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', width, coarsePointer: false }), false)
  }
})

test('narrow touch devices have a fallback while wider tablets retain desktop', () => {
  assert.equal(shouldOpenMobile({ width: 390, coarsePointer: true }), true)
  assert.equal(shouldOpenMobile({ userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)', width: 1024, coarsePointer: true }), false)
})

test('mobile entry preserves project deep links, query values and configured base', () => {
  assert.equal(mobileEntryURL('https://example.com/?source=share#work/visual/project/brand-website'), 'https://example.com/mobile.html?source=share#work/visual/project/brand-website')
  assert.equal(mobileEntryURL('https://example.com/portfolio/index.html?source=share#contact', '/portfolio/'), 'https://example.com/portfolio/mobile.html?source=share#contact')
})
