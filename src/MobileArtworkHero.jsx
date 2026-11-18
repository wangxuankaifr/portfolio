import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { projects } from './portfolio'
import { createArtworkFlow } from './ArtworkFlow'
import { artworkTrajectory } from './artworkTrajectory'
import { createArtworkPointer } from './artworkPointer'
import { mobileHeroArtwork } from './mobileHeroArtwork'
import { publicAsset } from './publicAsset'
import { Icon } from './Icons'
import './mobile-artwork-hero.css'

// Predecode the small bitmaps before WebGL uploads them. A failed request never
// keeps the loading screen or the renderer's all-texture ready signal waiting.
function preloadArtwork(art, pending) {
  return new Promise(resolve => {
    const image = new Image()
    let finished = false
    let timer
    const finish = success => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      image.onload = null
      image.onerror = null
      resolve(success ? art : null)
    }
    pending.push(() => { finish(false); image.removeAttribute('src') })
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      if (image.decode) image.decode().then(() => finish(true), () => finish(false))
      else finish(true)
    }
    image.onerror = () => finish(false)
    timer = setTimeout(() => finish(false), 2200)
    image.src = publicAsset(art.image)
  })
}

export default function MobileArtworkHero({ paused = false, onSelect }) {
  const stage = useRef(null)
  const canvas = useRef(null)
  const renderer = useRef(null)
  const buttons = useRef([])
  const elapsed = useRef(6.8)
  const pointer = useRef(null)
  pointer.current ??= createArtworkPointer()
  const [assets, setAssets] = useState(mobileHeroArtwork)
  const [size, setSize] = useState(() => ({ width: innerWidth, height: innerHeight }))
  const [ready, setReady] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [inView, setInView] = useState(true)
  const [visible, setVisible] = useState(() => !document.hidden)
  const [focused, setFocused] = useState(false)
  const aspects = useMemo(() => assets.map(art => art.width / art.height), [assets])
  const moving = !paused && !userPaused && !reduced && inView && visible && !focused

  useEffect(() => {
    let active = true
    const pending = []
    Promise.all(mobileHeroArtwork.map(art => preloadArtwork(art, pending))).then(results => {
      if (!active) return
      const decoded = results.filter(Boolean)
      // If every small file is simply slow, keep a renderer waiting in the
      // background so a recovered network can still reveal the real wave.
      const available = decoded.length ? decoded : mobileHeroArtwork
      setAssets(available)
      try {
        renderer.current = createArtworkFlow(canvas.current, available, {
          onReady: () => { if (active) setReady(true) },
          onError: () => { if (active) setReady(false) },
        })
      } catch {
        setReady(false)
      }
    })
    return () => {
      active = false
      pending.forEach(cancel => cancel())
      renderer.current?.dispose()
      renderer.current = null
    }
  }, [])

  useEffect(() => {
    const element = stage.current
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const motionChange = () => setReduced(media.matches)
    const visibilityChange = () => setVisible(!document.hidden)
    const measure = () => setSize({ width: element.clientWidth, height: element.clientHeight })
    const intersection = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => setInView(entry.isIntersecting)) : null
    const resize = 'ResizeObserver' in window ? new ResizeObserver(measure) : null
    intersection?.observe(element)
    resize?.observe(element)
    if (!resize) window.addEventListener('resize', measure)
    media.addEventListener('change', motionChange)
    document.addEventListener('visibilitychange', visibilityChange)
    measure()
    return () => {
      intersection?.disconnect()
      resize?.disconnect()
      window.removeEventListener('resize', measure)
      media.removeEventListener('change', motionChange)
      document.removeEventListener('visibilitychange', visibilityChange)
    }
  }, [])

  useLayoutEffect(() => {
    const element = stage.current
    const { width, height } = size
    renderer.current?.resize(width, height)
    const interaction = pointer.current
    const move = event => {
      if (event.target.closest?.('.ma-motion-control')) return
      const rect = element.getBoundingClientRect()
      interaction.move(event.clientX - rect.left, event.clientY - rect.top)
    }
    const leave = () => interaction.leave()
    const release = event => { if (event.pointerType === 'touch') leave() }
    if (moving) {
      element.addEventListener('pointerdown', move, { passive: true })
      element.addEventListener('pointermove', move, { passive: true })
      element.addEventListener('pointerup', release, { passive: true })
      element.addEventListener('pointercancel', leave, { passive: true })
      element.addEventListener('pointerleave', leave, { passive: true })
      window.addEventListener('blur', leave)
    } else leave()

    let frame
    let previous = 0
    const draw = timestamp => {
      const dt = moving && previous ? Math.min(Math.max(0, timestamp - previous) / 1000, .1) : 0
      elapsed.current += Math.min(dt, .05) * .7
      previous = timestamp
      const time = elapsed.current
      const frames = artworkTrajectory(time, width, height, assets.length, true, aspects)
        .map(item => ({ ...item, height: item.width / aspects[item.index] }))
      const cursor = reduced ? null : interaction.apply(frames, width, height, dt)
      frames.sort((a, b) => a.width - b.width)
      renderer.current?.render(frames, time, moving ? cursor : null, dt)
      const front = new Map()
      for (const item of frames) {
        const x = item.x - item.width / 2
        const y = item.y - item.height / 2
        const within = x + item.width > 0 && x < width && y + item.height > 0 && y < height
        if (within && (!ready || item.wrapped < .05) && item.width > 30 && item.opacity > .25) front.set(item.index, item)
      }
      buttons.current.forEach((button, index) => {
        if (!button) return
        const item = front.get(index)
        button.hidden = !item
        if (!item) return
        const x = item.x - item.width / 2
        const y = item.y - item.height / 2
        button.tabIndex = x > 12 && x + item.width < width - 12 && y > 100 && y + item.height < height - 20 ? 0 : -1
        button.style.width = `${item.width}px`
        button.style.height = `${item.height}px`
        const lean = item.pitch || item.tilt ? ` perspective(1100px) rotateX(${item.pitch || 0}rad) rotateY(${item.tilt || 0}rad)` : ''
        button.style.transform = `translate3d(${x}px,${y}px,0) rotate(${item.rotation}rad)${lean}`
        button.style.zIndex = String(Math.round(item.width))
        button.style.setProperty('--ma-image-opacity', item.opacity)
      })
      const count = String(front.size)
      if (element.dataset.liveCards !== count) element.dataset.liveCards = count
      if (moving) frame = requestAnimationFrame(draw)
    }
    draw(performance.now())
    return () => {
      cancelAnimationFrame(frame)
      leave()
      element.removeEventListener('pointerdown', move)
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerup', release)
      element.removeEventListener('pointercancel', leave)
      element.removeEventListener('pointerleave', leave)
      window.removeEventListener('blur', leave)
    }
  }, [moving, size, ready, reduced, assets, aspects])

  return <div ref={stage} className="m-home-stage m-artwork-hero" data-renderer={ready ? 'webgl' : 'fallback'}
    data-motion={moving ? 'running' : 'paused'}>
    <canvas ref={canvas} className="ma-flow-canvas" aria-hidden="true"/>
    <div className="ma-project-links" aria-label="精选作品预览">
      {assets.map((card, index) => {
        const project = projects.find(project => project.id === card.project)
        return <button key={card.id} ref={element => { buttons.current[index] = element }}
          type="button" className="ma-project" aria-label={`查看项目：${project.title}`} data-project-id={project.id}
          onClick={() => onSelect?.(project)} onFocus={event => setFocused(event.currentTarget.matches(':focus-visible'))}
          onBlur={() => setFocused(false)}>
          <img src={publicAsset(card.image)} width={card.width} height={card.height} alt="" crossOrigin="anonymous"
            decoding="async" fetchPriority={index < 3 ? 'high' : 'auto'} draggable="false"/>
        </button>
      })}
    </div>
    <button type="button" className="ma-motion-control" aria-label={userPaused || reduced ? '播放作品动效' : '暂停作品动效'}
      aria-pressed={userPaused || reduced} disabled={reduced} onClick={() => setUserPaused(value => !value)}>
      <Icon name={userPaused || reduced ? 'play' : 'pause'}/>
    </button>
  </div>
}
