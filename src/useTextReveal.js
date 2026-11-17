import { useLayoutEffect, useRef } from 'react'
import './text-reveal.css'

const pageScope = '.page-screen-work, .page-screen-about, .page-screen-contact'
const hoverText = '.visual-project-open span'
const hiddenText = '[hidden], [inert], script, style, svg, .gallery-screenreader-help, .project-gallery-cycle.is-copy, .text-bloom-layer'
const graphemes = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('zh-CN', { granularity: 'grapheme' }) : null
const words = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('zh-CN', { granularity: 'word' }) : null

function textOwners(scope) {
  const owners = new Set()
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement
    if (node.data.trim() && !parent.closest(hiddenText) && !parent.matches(hoverText)) owners.add(parent)
  }
  return [...owners].filter(element => {
    for (let parent = element.parentElement; parent && parent !== scope; parent = parent.parentElement) {
      if (owners.has(parent)) return false
    }
    return true
  })
}

function segments(text, segmenter) {
  if (segmenter) return segmenter.segment(text)
  let offset = 0
  return Array.from(text, segment => {
    const index = offset
    offset += segment.length
    return { segment, index }
  })
}

function measureText(element) {
  const fragments = []
  const range = document.createRange()
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  const wideCopy = element.textContent.trim().length > 68
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.data.trim() || node.parentElement.closest(hiddenText)) continue
    const style = getComputedStyle(node.parentElement)
    if (style.visibility !== 'visible') continue
    const appearance = {
      color: node.parentElement === element ? 'inherit' : style.color,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      fontKerning: style.fontKerning,
      fontFeatureSettings: style.fontFeatureSettings,
      fontVariationSettings: style.fontVariationSettings,
      fontVariantNumeric: style.fontVariantNumeric,
      letterSpacing: style.letterSpacing,
    }
    const fontSize = Number.parseFloat(style.fontSize)

    function place(segment, index, splitAcrossLines) {
      if (!segment.trim()) return
      range.setStart(node, index)
      range.setEnd(node, index + segment.length)
      const rects = [...range.getClientRects()].filter(rect => rect.width > 0 && rect.height > 0)
      if (rects.length === 1) fragments.push({ segment, rect: rects[0], appearance, fontSize })
      else if (rects.length > 1 && splitAcrossLines) {
        for (const part of segments(segment, graphemes)) place(part.segment, index + part.index, false)
      }
    }

    for (const part of segments(node.data, wideCopy ? words : graphemes)) {
      place(part.segment, part.index, wideCopy)
    }
  }
  return fragments
}

function animateBloom(element, pieces, complete) {
  const layer = document.createElement('bloom-layer')
  layer.className = 'text-bloom-layer'
  layer.setAttribute('aria-hidden', 'true')
  if (getComputedStyle(element).position === 'static') element.dataset.textBloomAnchor = ''
  element.append(layer)

  const origin = layer.getBoundingClientRect()
  const scaleX = origin.width || 1
  const scaleY = origin.height || 1
  const letters = pieces.map(({ segment, appearance, rect }) => {
    const letter = document.createElement('span')
    letter.className = 'text-bloom-letter'
    letter.textContent = segment
    Object.assign(letter.style, appearance, {
      left: `${(rect.left - origin.left) / scaleX}px`,
      top: `${(rect.top - origin.top) / scaleY}px`,
      lineHeight: `${rect.height / scaleY}px`,
    })
    return letter
  })
  layer.append(...letters)

  // Match the original glyph metrics before the effect starts. The source text
  // stays in its own flow throughout, including when the page wraps on phones.
  const range = document.createRange()
  const corrections = letters.map((letter, index) => {
    range.selectNodeContents(letter)
    const painted = range.getBoundingClientRect()
    return {
      x: (pieces[index].rect.left - painted.left) / scaleX,
      y: (pieces[index].rect.top - painted.top) / scaleY,
    }
  })
  element.dataset.textBloomPlaying = ''
  const delay = Math.min(32, 280 / Math.max(1, letters.length - 1))
  const animations = letters.map((letter, index) => {
    const { x, y } = corrections[index]
    letter.style.left = `${Number.parseFloat(letter.style.left) + x}px`
    letter.style.top = `${Number.parseFloat(letter.style.top) + y}px`
    const { fontSize } = pieces[index]
    const distance = Math.min(24, Math.max(4, fontSize * .35))
    const blur = Math.min(16, Math.max(2, fontSize * .21))
    return letter.animate([
      { opacity: 0, transform: `translateY(${distance}px) scale(.94)`, filter: `blur(${blur}px)` },
      { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0px)' },
    ], { duration: 560, delay: index * delay, easing: 'cubic-bezier(.22,.65,.28,1)', fill: 'both' })
  })
  Promise.allSettled(animations.map(animation => animation.finished)).then(complete)

  return () => {
    delete element.dataset.textBloomPlaying
    delete element.dataset.textBloomAnchor
    layer.remove()
    animations.forEach(animation => animation.cancel())
  }
}

export default function useTextReveal(app) {
  const finish = useRef(null)

  useLayoutEffect(() => {
    const root = app.current
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!Element.prototype.animate || !window.IntersectionObserver) return

    const seen = new WeakSet()
    const observed = new Set()
    const active = new Map()
    let refreshFrame = 0
    let scope = null

    function complete(element) {
      const cleanup = active.get(element)
      active.delete(element)
      cleanup?.()
    }

    function reveal(element) {
      if (seen.has(element) || preference.matches || !scope?.contains(element) ||
          element.closest(hiddenText) || !element.getClientRects().length) return
      const pieces = measureText(element)
      if (!pieces.length) return
      seen.add(element)
      observer.unobserve(element)
      observed.delete(element)
      active.set(element, animateBloom(element, pieces, () => complete(element)))
    }

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) reveal(entry.target)
    }, { threshold: .06 })

    function refresh() {
      refreshFrame = 0
      const dialog = [...root.querySelectorAll('dialog[open]')].at(-1)
      const nextScope = dialog
        ? (dialog.matches('.project-sheet:not(.artwork-viewer)') ? dialog : null)
        : root.querySelector(pageScope)
      if (scope !== nextScope) finishReveals()
      scope = nextScope

      const next = new Set(scope && !preference.matches ? textOwners(scope).filter(element => !seen.has(element)) : [])
      for (const element of observed) {
        if (!next.has(element)) {
          observer.unobserve(element)
          observed.delete(element)
        }
      }
      for (const element of next) {
        if (!observed.has(element)) {
          observer.observe(element)
          observed.add(element)
        }
      }
    }

    function finishReveals() {
      for (const element of active.keys()) complete(element)
    }

    function requestRefresh() {
      if (!refreshFrame) refreshFrame = requestAnimationFrame(refresh)
    }

    function reset() {
      finishReveals()
      requestRefresh()
    }

    function revealHoverText(event) {
      const card = event.target.closest?.('.visual-project-link')
      if (card && !(event.relatedTarget instanceof Node && card.contains(event.relatedTarget))) {
        card.querySelectorAll(hoverText).forEach(reveal)
      }
    }

    const mutation = new MutationObserver(requestRefresh)
    mutation.observe(root, {
      subtree: true, childList: true, characterData: true,
      attributes: true, attributeFilter: ['open', 'inert'],
    })
    finish.current = finishReveals
    root.addEventListener('pointerover', revealHoverText)
    root.addEventListener('focusin', revealHoverText)
    preference.addEventListener('change', reset)
    window.addEventListener('resize', reset)
    document.fonts?.addEventListener('loadingdone', reset)
    refresh()

    return () => {
      mutation.disconnect()
      observer.disconnect()
      root.removeEventListener('pointerover', revealHoverText)
      root.removeEventListener('focusin', revealHoverText)
      preference.removeEventListener('change', reset)
      window.removeEventListener('resize', reset)
      document.fonts?.removeEventListener('loadingdone', reset)
      finishReveals()
      finish.current = null
      cancelAnimationFrame(refreshFrame)
    }
  }, [app])

  return finish
}
