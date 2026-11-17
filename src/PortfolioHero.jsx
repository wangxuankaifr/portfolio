import { useEffect, useRef, useState } from 'react'
import { projects } from './portfolio'
import { heroArtwork } from './heroArtwork'
import { artworkTrajectory } from './artworkTrajectory'
import { createArtworkFlow } from './ArtworkFlow'
import { createArtworkPointer } from './artworkPointer'
import { publicAsset } from './publicAsset'

const artworkAspects = heroArtwork.map(art => art.width / art.height)

export default function PortfolioHero({ onSelect, dialogOpen }) {
  const stage = useRef(null)
  const canvas = useRef(null)
  const renderer = useRef(null)
  const buttons = useRef([])
  const elapsed = useRef(0)
  const interaction = useRef(null)
  interaction.current ??= createArtworkPointer()
  const [size, setSize] = useState({ width: 1440, height: 900 })
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [inView, setInView] = useState(true)
  const [visible, setVisible] = useState(!document.hidden)
  const [focused, setFocused] = useState(false)
  const moving = !paused && !reduced && inView && visible && !dialogOpen && !focused

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => setReduced(media.matches)
    const syncVisibility = () => setVisible(!document.hidden)
    const intersection = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    const resize = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }))
    intersection.observe(stage.current)
    resize.observe(stage.current)
    media.addEventListener('change', syncMotion)
    document.addEventListener('visibilitychange', syncVisibility)
    const engine = createArtworkFlow(canvas.current, heroArtwork, { onReady: () => setReady(true), onError: () => setReady(false) })
    renderer.current = engine
    return () => {
      intersection.disconnect(); resize.disconnect()
      media.removeEventListener('change', syncMotion)
      document.removeEventListener('visibilitychange', syncVisibility)
      engine?.dispose()
      renderer.current = null
    }
  }, [])

  useEffect(() => {
    const { width, height } = size
    renderer.current?.resize(width, height)
    const pointer = interaction.current
    const move = event => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') pointer.move(event.clientX, event.clientY)
    }
    if (moving) {
      window.addEventListener('pointermove', move, { passive: true })
      window.addEventListener('blur', pointer.leave)
      document.documentElement.addEventListener('pointerleave', pointer.leave)
    }
    let frame, previous = 0
    const draw = timestamp => {
      const dt = moving && previous ? Math.min(Math.max(0, timestamp - previous) / 1000, .1) : 0
      elapsed.current += Math.min(dt, .05) * .7
      previous = timestamp
      const time = reduced ? 6 : elapsed.current
      const frames = artworkTrajectory(time, width, height, heroArtwork.length, width <= 760, artworkAspects)
        .map(item => ({ ...item, height: item.width / artworkAspects[item.index] }))
      const cursor = reduced ? null : pointer.apply(frames, width, height, dt)
      // Painter order gives nearer, larger cards priority. The actual links are
      // stable DOM buttons, with a fallback image if GPU rendering is unavailable.
      frames.sort((a, b) => a.width - b.width)
      renderer.current?.render(frames, time, moving ? cursor : null, dt)
      const front = new Map()
      for (const item of frames) {
        const { x, y } = item
        const within = x + item.width / 2 > 0 && x - item.width / 2 < width && y + item.height / 2 > 80 && y - item.height / 2 < height
        if (within && item.wrapped < .05 && item.width > 35 && item.opacity > .3) front.set(item.index, item)
      }
      buttons.current.forEach((button, index) => {
        if (!button) return
        const item = front.get(index)
        button.hidden = !item
        if (!item) return
        const x = item.x - item.width / 2
        const y = item.y - item.height / 2
        const fullyVisible = x > 12 && x + item.width < width - 12 && y > 95 && y + item.height < height - 12
        button.tabIndex = fullyVisible ? 0 : -1
        button.style.width = `${item.width}px`
        button.style.height = `${item.height}px`
        const lean = item.pitch || item.tilt ? ` perspective(1100px) rotateX(${item.pitch || 0}rad) rotateY(${item.tilt}rad)` : ''
        button.style.transform = `translate3d(${x}px,${y}px,0) rotate(${item.rotation}rad)${lean}`
        button.style.zIndex = Math.round(item.width)
        button.style.setProperty('--image-opacity', item.opacity)
      })
      if (moving) frame = requestAnimationFrame(draw)
    }
    draw(performance.now())
    return () => {
      cancelAnimationFrame(frame)
      if (moving) {
        pointer.leave()
        window.removeEventListener('pointermove', move)
        window.removeEventListener('blur', pointer.leave)
        document.documentElement.removeEventListener('pointerleave', pointer.leave)
      }
    }
  }, [moving, size, ready, reduced])

  return <section ref={stage} className="portfolio-hero" id="home" aria-labelledby="hero-heading" data-motion={moving ? 'running' : 'paused'} data-renderer={ready ? 'webgl' : 'fallback'}>
    <canvas ref={canvas} className="artwork-flow-canvas" aria-hidden="true" />
    <div className="flow-project-links" aria-label="精选作品预览">
      {heroArtwork.map((card, index) => { const project = projects.find(project => project.id === card.project); return <button key={card.id} ref={el => { buttons.current[index] = el }} className={`flow-project${card.height > card.width ? ' is-portrait' : ''}`} aria-label={`查看项目：${project.title}`}
        data-project-id={project.id} onClick={event => onSelect(project, event.currentTarget)}
        onFocus={e => setFocused(e.currentTarget.matches(':focus-visible'))} onBlur={() => setFocused(false)}>
        <img className="flow-fallback" src={publicAsset(card.image)} width={card.width} height={card.height} alt="" decoding="async" draggable="false" />
        <span className="artwork-caption" aria-hidden="true">{project.shortTitle || project.title}</span>
      </button> })}
    </div>
    <div className="hero-world">
      <div className="wrap hero-titles">
        <h1 id="hero-heading"><span>Stomae</span><span>Wang</span></h1>
        <p className="hero-edition" aria-label="Portfolio 2019 至 2026"><span>PORTFOLIO</span><span className="hero-year"><span className="hero-year-size" aria-hidden="true">2019–2026</span><span className="hero-year-track" aria-hidden="true"><span className="hero-year-item">2019–2026</span><span className="hero-year-item">2019–2026</span></span></span></p>
      </div>
      <p className="hero-positioning"><span>Brand Design Lead</span><i aria-hidden="true">|</i><span>Art Direction</span><i aria-hidden="true">|</i><span>Brand Identity &amp; Visual Design</span></p>
      <p className="hero-quote">Great products are triumphs of taste.</p>
      <button className="flow-accessibility-control" onClick={() => setPaused(value => !value)} disabled={reduced} aria-pressed={paused || reduced} aria-label={paused || reduced ? '播放图片流' : '暂停图片流'}>{paused || reduced ? '播放图片流' : '暂停图片流'}</button>
    </div>
  </section>
}
