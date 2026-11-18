import { useId, useLayoutEffect, useRef } from 'react'
import BrandMark from './BrandMark'
import { createOpeningRipple } from './openingRipple'
import './mobile-motion.css'

const clamp = value => Math.max(0, Math.min(1, value))
const range = (value, start, end) => clamp((value - start) / (end - start))
const smooth = value => value * value * (3 - 2 * value)
const out = value => 1 - (1 - value) ** 3
const center = rect => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
const decode = image => image?.decode ? image.decode().catch(() => {}) : Promise.resolve()

export function MobileOpening({ onComplete }) {
  const done = useRef(onComplete)
  done.current = onComplete
  const layer = useRef(null)
  const anchor = useRef(null)
  const mark = useRef(null)
  const canvas = useRef(null)
  const count = useRef(null)
  const displacement = useRef(null)
  const flow = useRef(null)
  const filterId = `mobile-opening-${useId().replace(/:/g, '')}`

  useLayoutEffect(() => {
    const host = layer.current.closest('.m-app')
    const target = host.querySelector('.m-home-return img')
    const homeReturn = host.querySelector('.m-home-return')
    const nav = host.querySelector('.m-nav-bar')
    const navLinks = Array.from(nav?.querySelectorAll('.m-nav-contact, .m-menu-toggle') || [])
    const logo = mark.current.querySelector('img')
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    let active = true
    let frame = 0
    let ripple = null
    let ready = false
    let start = null
    let finishingAt = null
    let finishingFrom = 0
    let loadedAt = null
    let geometry = null

    const measure = () => {
      const origin = anchor.current.getBoundingClientRect()
      const destination = target?.getBoundingClientRect()
      geometry = {
        origin: center(origin),
        target: destination ? center(destination) : { x: 48, y: 48 },
        ratio: destination?.width ? destination.width / origin.width : .23,
      }
    }
    const complete = () => { if (active) done.current?.() }
    const motionChange = event => { if (event.matches) complete() }
    const escape = event => { if (event.key === 'Escape') complete() }
    if (preference.matches) {
      queueMicrotask(complete)
      return () => { active = false }
    }

    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('keydown', escape)
    preference.addEventListener('change', motionChange)
    const images = Array.from(host.querySelectorAll('.m-home-stage img'))
    Promise.allSettled([document.fonts?.ready || Promise.resolve(), ...images.map(decode), decode(logo)])
      .then(() => { ready = true })
    decode(logo).then(() => {
      if (active && loadedAt === null) ripple = createOpeningRipple(canvas.current, logo)
    }).catch(() => {})

    const draw = timestamp => {
      if (!active) return
      start ??= timestamp
      const elapsed = timestamp - start
      if (finishingAt === null && elapsed >= 1400 && (ready || elapsed >= 3000)) {
        finishingAt = elapsed
        finishingFrom = Math.min(.92, elapsed / 1600 * .92)
      }
      const loading = finishingAt === null ? Math.min(.92, elapsed / 1600 * .92)
        : finishingFrom + (1 - finishingFrom) * smooth(range(elapsed, finishingAt, finishingAt + 220))
      if (loading >= 1 && loadedAt === null) loadedAt = elapsed
      const strength = 1 - smooth(range(loading, .15, 1))
      const blur = `${(2.8 * (1 - loading) ** 1.5).toFixed(3)}px`
      const rendered = loading < 1 && ripple?.draw(loading, strength)
      canvas.current.style.visibility = rendered ? 'visible' : 'hidden'
      canvas.current.style.filter = `blur(${blur})`
      logo.style.visibility = rendered ? 'hidden' : 'visible'
      logo.style.filter = loading < 1 && !rendered ? `url(#${filterId}) blur(${blur})` : 'none'
      displacement.current.setAttribute('scale', String(25 * strength))
      flow.current.setAttribute('dx', String(-42 * loading))
      flow.current.setAttribute('dy', String(Math.sin(loading * 8) * 12))
      count.current.textContent = String(Math.floor(loading * 100))
      if (loadedAt !== null && ripple) { ripple.dispose(); ripple = null }

      const revealTime = loadedAt === null ? -1 : elapsed - loadedAt
      const flight = smooth(range(revealTime, 180, 740))
      const { origin, target: destination, ratio } = geometry
      const x = (destination.x - origin.x) * flight
      const y = (destination.y - origin.y) * flight - 10 * Math.sin(Math.PI * flight)
      const scale = 1 + (ratio - 1) * flight
      mark.current.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`
      mark.current.style.opacity = String(1 - range(revealTime, 900, 950))
      count.current.style.opacity = String(1 - range(revealTime, 100, 230))
      host.style.setProperty('--m-intro-docked', flight === 1 ? '1' : '0')
      layer.current.style.opacity = String(1 - smooth(range(revealTime, 700, 930)))
      const bar = smooth(range(revealTime, 760, 1110))
      if (nav) {
        nav.style.setProperty('--m-intro-bar-opacity', String(out(range(revealTime, 760, 870))))
        nav.style.setProperty('--m-intro-bar-right', `${Math.max(0, nav.clientWidth - nav.clientHeight) * (1 - bar)}px`)
      }
      navLinks.forEach((link, index) => {
        link.style.setProperty('--m-intro-link', String(out(range(revealTime, 1070 + index * 55, 1290 + index * 55))))
      })
      host.style.setProperty('--m-intro-title', String(out(range(revealTime, 1030, 1370))))
      host.style.setProperty('--m-intro-art', String(out(range(revealTime, 1170, 1520))))
      if (revealTime < 1540) frame = requestAnimationFrame(draw)
      else complete()
    }
    frame = requestAnimationFrame(draw)
    return () => {
      active = false
      cancelAnimationFrame(frame)
      ripple?.dispose()
      window.removeEventListener('resize', measure)
      window.removeEventListener('keydown', escape)
      preference.removeEventListener('change', motionChange)
      for (const name of ['--m-intro-docked', '--m-intro-title', '--m-intro-art']) host.style.removeProperty(name)
      for (const name of ['--m-intro-bar-opacity', '--m-intro-bar-right']) nav?.style.removeProperty(name)
      navLinks.forEach(link => link.style.removeProperty('--m-intro-link'))
      homeReturn?.style.removeProperty('opacity')
    }
  }, [filterId])

  return <>
    <div ref={layer} className="m-opening-wash" aria-hidden="true" />
    <div ref={anchor} className="m-opening-anchor" aria-hidden="true">
      <div ref={mark} className="m-opening-mark"><BrandMark/>
        <canvas ref={canvas} className="m-opening-canvas" width="448" height="448" />
      </div>
      <span ref={count} className="m-opening-count">0</span>
    </div>
    <svg className="m-motion-filter" width="0" height="0" aria-hidden="true" focusable="false">
      <filter id={filterId} x="-45%" y="-45%" width="190%" height="190%">
        <feTurbulence type="fractalNoise" baseFrequency=".017 .031" numOctaves="2" seed="9" result="water"/>
        <feOffset ref={flow} in="water" result="flow"/>
        <feDisplacementMap ref={displacement} in="SourceGraphic" in2="flow" scale="25" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </svg>
    <button className="m-opening-skip" type="button" onClick={() => done.current?.()}>跳过开场动画</button>
  </>
}

export function MobileRouteTransition({ id, onCovered, onComplete }) {
  const callbacks = useRef({ onCovered, onComplete })
  callbacks.current = { onCovered, onComplete }
  const layer = useRef(null)
  const canvas = useRef(null)
  const wash = useRef(null)
  const source = useRef(null)

  useLayoutEffect(() => {
    if (id === null || id === undefined) return
    let active = true
    let frame = 0
    let committed = false
    let start = null
    const overlay = layer.current
    const context = canvas.current.getContext('2d')
    const logo = source.current.querySelector('img')
    let texture = null
    const commit = () => {
      if (!active || committed) return
      committed = true
      callbacks.current.onCovered?.()
    }
    const finish = () => {
      if (!active) return
      commit()
      callbacks.current.onComplete?.()
    }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)')
    const reduceNow = event => { if (event.matches) finish() }
    reduce.addEventListener('change', reduceNow)
    if (reduce.matches) {
      queueMicrotask(finish)
      return () => { active = false; reduce.removeEventListener('change', reduceNow) }
    }

    // Match the desktop transition's top-layer placement above an open image dialog.
    let usesPopover = typeof overlay.showPopover === 'function'
    if (usesPopover) {
      overlay.setAttribute('popover', 'manual')
      try { overlay.showPopover() }
      catch { usesPopover = false; overlay.removeAttribute('popover') }
    }

    const paint = (openness, angle, fallbackOpacity) => {
      const width = layer.current.clientWidth || innerWidth
      const height = layer.current.clientHeight || innerHeight
      if (!context || !logo.naturalWidth) {
        canvas.current.style.opacity = '0'
        layer.current.style.background = `rgb(0 0 0 / ${fallbackOpacity})`
        source.current.style.opacity = String(fallbackOpacity)
        wash.current.style.opacity = '0'
        return
      }
      source.current.style.opacity = '0'
      canvas.current.style.opacity = '1'
      layer.current.style.background = 'transparent'
      if (!texture) {
        texture = document.createElement('canvas')
        texture.width = texture.height = 768
        texture.getContext('2d').drawImage(logo, 0, 0, 768, 768)
      }
      const density = Math.min(devicePixelRatio || 1, 1.5)
      const pixelsWide = Math.round(width * density)
      const pixelsHigh = Math.round(height * density)
      if (canvas.current.width !== pixelsWide) canvas.current.width = pixelsWide
      if (canvas.current.height !== pixelsHigh) canvas.current.height = pixelsHigh
      context.setTransform(pixelsWide / width, 0, 0, pixelsHigh / height, 0, 0)
      context.globalCompositeOperation = 'source-over'
      context.fillStyle = '#000'
      context.fillRect(0, 0, width, height)
      const markSize = Math.max(82, Math.min(154, Math.min(width, height) * .22))
      const full = Math.max(width, height) * 15
      const size = markSize * (full / markSize) ** openness
      context.save()
      context.translate(width / 2, height / 2)
      context.rotate(angle * openness)
      context.globalCompositeOperation = 'destination-out'
      context.drawImage(texture, -size * .5, -size * .53, size, size)
      context.restore()
      wash.current.style.opacity = String(1 - openness ** .62)
    }
    // The same mark is already in the navigation; decode is warm in normal navigation.
    decode(logo)
    const draw = timestamp => {
      if (!active) return
      start ??= timestamp
      const elapsed = timestamp - start
      const closing = elapsed < 430
      const openness = closing ? 1 - smooth(range(elapsed, 0, 430)) : smooth(range(elapsed, 550, 1060))
      const fallback = closing ? out(range(elapsed, 0, 240)) : 1 - smooth(range(elapsed, 650, 1060))
      try { paint(openness, closing ? -.24 : .18, fallback) }
      catch { canvas.current.style.opacity = '0'; layer.current.style.background = `rgb(0 0 0 / ${fallback})`; source.current.style.opacity = String(fallback); wash.current.style.opacity = '0' }
      if (!committed && elapsed >= 490) commit()
      if (elapsed < 1060) frame = requestAnimationFrame(draw)
      else finish()
    }
    frame = requestAnimationFrame(draw)
    return () => {
      active = false
      cancelAnimationFrame(frame)
      reduce.removeEventListener('change', reduceNow)
      if (usesPopover) {
        try { overlay.hidePopover() } catch {}
        overlay.removeAttribute('popover')
      }
    }
  }, [id])

  if (id === null || id === undefined) return null
  return <div ref={layer} className="m-route-transition" aria-hidden="true">
    <div ref={wash} className="m-route-wash"/>
    <canvas ref={canvas} className="m-route-aperture"/>
    <div ref={source} className="m-route-logo"><BrandMark/></div>
  </div>
}
