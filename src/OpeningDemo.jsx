import { useLayoutEffect, useRef } from 'react'
import BrandMark from './BrandMark'
import { createOpeningRipple } from './openingRipple'
import './opening-demo.css'

const timing = {
  clear: 2240,
  numberFade: 2440,
  lift: 2620,
  land: 3230,
  stretch: 3330,
  barOpen: 3880,
  artwork: 4390,
  end: 4920,
}

const range = (time, start, end) => Math.max(0, Math.min(1, (time - start) / (end - start)))
const easeOut = value => 1 - (1 - value) ** 3
const easeInOut = value => value * value * (3 - 2 * value)
const mix = (from, to, amount) => from + (to - from) * amount
const middle = rect => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })

export default function OpeningDemo({ onPhase }) {
  const wash = useRef(null)
  const anchor = useRef(null)
  const lockup = useRef(null)
  const counter = useRef(null)
  const canvas = useRef(null)
  const offset = useRef(null)
  const displacement = useRef(null)

  useLayoutEffect(() => {
    const site = anchor.current.closest('.site-shell')
    const navbar = site.querySelector('.header-inner')
    const navMark = navbar.querySelector('.brand-mark')
    const artwork = lockup.current
    const logo = artwork.querySelector('img')
    const glass = canvas.current
    const white = wash.current
    const number = counter.current
    const toolbar = site.querySelector('.site-header')
    const links = Array.from(toolbar.querySelectorAll('nav > a'))
    const menu = toolbar.querySelector('.menu-toggle')
    const wave = displacement.current
    const waveOffset = offset.current
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    let geometry, frame, previousTime, ripple
    let elapsed = 0
    let active = true
    let revealed = false

    const measure = () => {
      const start = anchor.current.getBoundingClientRect()
      const destination = navMark.getBoundingClientRect()
      const bar = navbar.getBoundingClientRect()
      const target = middle(destination)
      const circleLeft = target.x - bar.left - bar.height / 2
      geometry = {
        origin: middle(start), target, ratio: destination.width / start.width,
        circleLeft, circleRight: bar.width - circleLeft - bar.height,
      }
    }
    const resetClock = () => { previousTime = undefined }
    const finish = () => onPhase(null)
    const onKey = event => { if (event.key === 'Escape') finish() }
    const onMotionChange = event => { if (event.matches) finish() }

    measure()
    window.addEventListener('resize', measure)
    document.addEventListener('visibilitychange', resetClock)
    window.addEventListener('keydown', onKey)
    media.addEventListener('change', onMotionChange)

    logo.decode().then(() => {
      if (active && elapsed < timing.clear) ripple = createOpeningRipple(glass, logo)
    }).catch(() => {})

    const draw = timestamp => {
      if (previousTime !== undefined) elapsed += timestamp - previousTime
      previousTime = timestamp

      const loading = range(elapsed, 0, timing.clear)
      const strength = 1 - easeInOut(range(loading, .15, 1))
      const blur = `${(3.15 * (1 - loading) ** 1.5).toFixed(3)}px`
      const rendered = loading < 1 && ripple?.draw(loading, strength)
      glass.style.visibility = rendered ? 'visible' : 'hidden'
      glass.style.filter = `blur(${blur})`
      logo.style.visibility = rendered ? 'hidden' : 'visible'
      logo.style.filter = loading < 1 && !rendered ? `url(#opening-demo-ripple) blur(${blur})` : 'none'
      wave.setAttribute('scale', String(28 * strength))
      waveOffset.setAttribute('dx', String(-48 * loading))
      waveOffset.setAttribute('dy', String(Math.sin(loading * 8) * 14))
      if (loading === 1 && ripple) {
        ripple.dispose()
        ripple = null
      }

      const count = String(Math.floor(loading * 100))
      if (number.textContent !== count) number.textContent = count
      number.style.opacity = 1 - range(elapsed, timing.numberFade, timing.lift)

      const { origin, target, ratio, circleLeft, circleRight } = geometry
      const flight = easeInOut(range(elapsed, timing.lift, timing.land))
      const x = (target.x - origin.x) * flight
      const y = (target.y - origin.y) * flight - 15 * Math.sin(Math.PI * flight)
      artwork.style.transform = `translate3d(${x}px,${y}px,0) scale(${mix(1, ratio, flight)})`

      // Keep the real glass surface under the docked mark as its right edge extends.
      const extension = easeInOut(range(elapsed, timing.stretch, timing.barOpen))
      const circle = easeOut(range(elapsed, timing.land, timing.stretch + 55))
      navbar.style.setProperty('--opening-bar-left', `${(1 - extension) * circleLeft}px`)
      navbar.style.setProperty('--opening-bar-right', `${(1 - extension) * circleRight}px`)
      navbar.style.setProperty('--opening-bar-opacity', circle)
      navbar.style.setProperty('--opening-bar-scale', mix(.87, 1, circle))
      navbar.style.setProperty('--opening-bar-tint', `${100 * (1 - extension)}%`)
      artwork.style.opacity = flight < 1 ? 1 : 0
      toolbar.style.setProperty('--opening-docked', flight === 1 ? '1' : '0')
      white.style.opacity = 1 - easeInOut(range(elapsed, timing.land + 80, timing.barOpen))

      const sinceBarOpen = elapsed - timing.barOpen
      links.forEach((link, index) => {
        const delay = 40 + index * 82
        link.style.setProperty('--opening-entry', easeOut(range(sinceBarOpen, delay, delay + 260)))
      })
      menu.style.setProperty('--opening-entry', easeOut(range(sinceBarOpen, 70, 330)))
      toolbar.style.setProperty('--opening-arrow', easeOut(range(sinceBarOpen, 255, 480)))
      site.style.setProperty('--opening-type-left', easeOut(range(sinceBarOpen, 466, 872)))
      site.style.setProperty('--opening-type-right', easeOut(range(sinceBarOpen, 550, 958)))
      site.style.setProperty('--opening-details-left', easeOut(range(sinceBarOpen, 584, 952)))
      site.style.setProperty('--opening-details-right', easeOut(range(sinceBarOpen, 673, 1040)))
      if (!revealed && elapsed >= timing.artwork) {
        revealed = true
        onPhase('artwork')
      }

      if (elapsed < timing.end) frame = requestAnimationFrame(draw)
      else finish()
    }

    frame = requestAnimationFrame(draw)
    return () => {
      active = false
      cancelAnimationFrame(frame)
      ripple?.dispose()
      window.removeEventListener('resize', measure)
      document.removeEventListener('visibilitychange', resetClock)
      window.removeEventListener('keydown', onKey)
      media.removeEventListener('change', onMotionChange)
      for (const name of ['--opening-bar-left', '--opening-bar-right', '--opening-bar-opacity', '--opening-bar-scale', '--opening-bar-tint']) navbar.style.removeProperty(name)
      for (const item of [...links, menu]) item.style.removeProperty('--opening-entry')
      for (const name of ['--opening-docked', '--opening-arrow']) toolbar.style.removeProperty(name)
      for (const name of ['--opening-type-left', '--opening-type-right', '--opening-details-left', '--opening-details-right']) site.style.removeProperty(name)
    }
  }, [onPhase])

  return <>
    <div ref={wash} className="opening-demo-wash" aria-hidden="true"/>
    <div ref={anchor} className="opening-demo-anchor" aria-hidden="true">
      <div ref={lockup} className="opening-demo-logo">
        <BrandMark className="opening-demo-mark"/>
        <canvas ref={canvas} className="opening-demo-canvas" width="448" height="448"/>
      </div>
      <span ref={counter} className="opening-demo-count">0</span>
    </div>
    <svg width="0" height="0" className="opening-demo-filter" aria-hidden="true" focusable="false">
      <filter id="opening-demo-ripple" x="-45%" y="-45%" width="190%" height="190%">
        <feTurbulence type="fractalNoise" baseFrequency=".017 .031" numOctaves="2" seed="9" result="water"/>
        <feOffset ref={offset} in="water" result="flow"/>
        <feDisplacementMap ref={displacement} in="SourceGraphic" in2="flow" scale="28" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </svg>
    <button className="opening-demo-skip" type="button" onClick={() => onPhase(null)}>跳过开屏动画</button>
  </>
}
