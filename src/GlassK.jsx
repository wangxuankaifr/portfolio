import { useEffect, useRef, useState } from 'react'
import { createGlassKRenderer } from './glassKRenderer'

export default function GlassK() {
  const canvas = useRef(null)
  const [fallback, setFallback] = useState(false)
  useEffect(() => {
    const el = canvas.current
    const renderer = createGlassKRenderer(el)
    if (!renderer) { setFallback(true); return }
    setFallback(false)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0, elapsed = 0, previous = 0, lastDraw = 0, lost = false
    const render = now => {
      if (!previous) previous = now
      elapsed += Math.min((now - previous) / 1000, .05)
      previous = now
      if (now - lastDraw > 1000 / 30) { renderer.render(elapsed); lastDraw = now }
      frame = requestAnimationFrame(render)
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      previous = 0
      if (lost) return
      renderer.render(elapsed)
      if (!document.hidden && !reduced.matches) frame = requestAnimationFrame(render)
    }
    const contextLost = event => { event.preventDefault(); lost = true; cancelAnimationFrame(frame); setFallback(true) }
    document.addEventListener('visibilitychange', sync)
    reduced.addEventListener('change', sync)
    el.addEventListener('webglcontextlost', contextLost)
    sync()
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', sync)
      reduced.removeEventListener('change', sync)
      el.removeEventListener('webglcontextlost', contextLost)
      renderer.dispose()
    }
  }, [])
  return <span className="glass-k" data-fallback={fallback} aria-hidden="true"><canvas ref={canvas}/><svg className="glass-k-fallback" viewBox="0 0 80 90" fill="none"><path d="M12 8h15v32L53 8h19L40 45l34 37H53L27 52v30H12V8Z" fill="#e5eef7" stroke="#778fa9" strokeWidth="2"/><path d="m27 40 26-32M40 45l34 37M12 8v74" stroke="#fff" strokeWidth="2"/></svg></span>
}
