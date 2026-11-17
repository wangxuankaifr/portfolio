import './route-transition.css'
import { publicAsset } from './publicAsset'

const travelEase = 'cubic-bezier(.42,.04,.22,1)'
const settleEase = 'cubic-bezier(.21,.73,.25,1)'
const brandClose = 460
const brandHold = 130
const brandOpen = 520
const smooth = progress => progress * progress * (3 - 2 * progress)

function rectStyle(rect, extra = {}) {
  return {
    left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`,
    borderRadius: rect.borderRadius || '0px', ...extra,
  }
}

function between(from, to, progress, tilt) {
  const rect = {}
  for (const key of ['left', 'top', 'width', 'height']) rect[key] = from[key] + (to[key] - from[key]) * progress
  return rectStyle(rect, { borderRadius: '7px', transform: `rotate(${tilt}deg)`, offset: .59, opacity: 1 })
}

export function readCover(trigger) {
  const img = trigger?.querySelector('.index-preview img, .visual-project-cover img, .flow-fallback')
  if (!img) return null
  const box = trigger.matches('.index-row') ? trigger : img
  const rect = box.getBoundingClientRect()
  if (!rect.width || !rect.height || rect.right <= 0 || rect.bottom <= 0 || rect.top >= innerHeight || rect.left >= innerWidth) return null
  const style = getComputedStyle(img)
  return {
    element: trigger, src: img.currentSrc || img.src, position: style.objectPosition,
    left: rect.left, top: rect.top, width: rect.width, height: rect.height,
    borderRadius: getComputedStyle(box).borderRadius,
  }
}

export function createRouteTransition(host, setTransitioning) {
  const layer = document.createElement('div')
  layer.className = 'route-transition'
  layer.hidden = true
  layer.setAttribute('aria-hidden', 'true')
  const make = (tag, className) => {
    const element = document.createElement(tag)
    element.className = className
    layer.append(element)
    return element
  }
  const matte = make('div', 'route-transition-matte')
  const image = make('img', 'route-transition-cover')
  const wash = make('div', 'route-transition-wash')
  const aperture = make('canvas', 'route-transition-aperture')
  const apertureContext = aperture.getContext('2d')
  let brandTexture
  image.alt = ''
  image.draggable = false

  const preference = matchMedia('(prefers-reduced-motion: reduce)')
  const usesPopover = typeof layer.showPopover === 'function'
  if (usesPopover) layer.setAttribute('popover', 'manual')
  host.append(layer)
  let active = null

  function placeOnTop() {
    if (usesPopover) {
      if (layer.matches(':popover-open')) layer.hidePopover()
      layer.showPopover()
    } else {
      const parent = host.querySelector('dialog.project-sheet[open]') || host
      parent.append(layer)
    }
  }

  function hide() {
    if (usesPopover && layer.matches(':popover-open')) layer.hidePopover()
    layer.hidden = true
    if (layer.parentElement !== host) host.append(layer)
    delete host.dataset.routeTransition
    delete layer.dataset.kind
    image.removeAttribute('src')
    wash.style.removeProperty('opacity')
    setTransitioning(false)
  }

  function cancel(finishRoute = false) {
    const scene = active
    if (!scene) return
    active = null
    if (finishRoute) scene.commit()
    scene.stopDrawing?.()
    scene.animations.forEach(animation => animation.cancel())
    hide()
  }

  function play({ kind, returning, source, getDestination, cover }, update) {
    cancel()
    if (preference.matches || !layer.animate) {
      update()
      return
    }

    const useCover = kind === 'project' && Boolean(source?.src || cover)
    const scene = { animations: [], committed: false, commit: () => {
      if (scene.committed) return
      scene.committed = true
      update()
    } }
    active = scene

    const animate = (element, frames, duration, easing = settleEase, delay = 0) => {
      const animation = element.animate(frames, { duration, easing, delay, fill: 'both' })
      scene.animations.push(animation)
      return animation.finished
    }

    async function swap() {
      if (active !== scene) return false
      scene.commit()
      // A project sheet enters the top layer during the route update.
      placeOnTop()
      await new Promise(requestAnimationFrame)
      return active === scene
    }

    async function exchangeCover() {
      const width = document.documentElement.clientWidth
      const height = innerHeight
      const viewport = { left: 0, top: 0, width, height }
      const fallback = { left: width * .17, top: height * .25, width: width * .66, height: height * .5, borderRadius: '12px' }
      const start = source || fallback
      const direction = start.left + start.width / 2 < width / 2 ? -1 : 1
      const tilt = width < 761 ? .9 : 1.65
      image.style.objectPosition = source?.position || 'center'
      image.src = source?.src || publicAsset(cover)

      if (returning) {
        await Promise.all([
          animate(matte, [{ opacity: 0 }, { opacity: 1 }], 165),
          animate(image, [rectStyle(viewport, { opacity: 0 }), rectStyle(viewport, { opacity: 1 })], 165),
        ])
        if (!await swap()) return
        const destination = getDestination?.() || fallback
        image.style.objectPosition = destination.position || image.style.objectPosition
        await Promise.all([
          animate(matte, [{ opacity: 1 }, { opacity: .48, offset: .33 }, { opacity: 0 }], 535),
          animate(image, [
            rectStyle(viewport, { opacity: 1, transform: 'rotate(0deg)' }),
            between(viewport, destination, .69, -direction * tilt),
            rectStyle(destination, { opacity: 1, transform: 'rotate(0deg)', offset: .88 }),
            rectStyle(destination, { opacity: 0, transform: 'rotate(0deg)' }),
          ], 535, travelEase),
        ])
      } else {
        await Promise.all([
          animate(matte, [{ opacity: 0 }, { opacity: .72, offset: .62 }, { opacity: 1 }], 495),
          animate(image, [
            rectStyle(start, { opacity: source ? 1 : 0, transform: 'rotate(0deg)' }),
            between(start, viewport, .71, direction * tilt),
            rectStyle(viewport, { opacity: 1, transform: 'rotate(0deg)' }),
          ], 495, travelEase),
        ])
        if (!await swap()) return
        await Promise.all([
          animate(matte, [{ opacity: 1 }, { opacity: 0 }], 250),
          animate(image, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.025)' }], 250),
        ])
      }
    }

    async function exchangeBrand() {
      if (!brandTexture && apertureContext) {
        const logo = host.querySelector('.brand-mark')
        if (!logo?.naturalWidth) await logo?.decode().catch(() => {})
        if (logo?.naturalWidth) {
          const texture = document.createElement('canvas')
          texture.width = texture.height = 960
          texture.getContext('2d').drawImage(logo, 0, 0, texture.width, texture.height)
          brandTexture = texture
        }
      }
      if (active !== scene) return
      if (!brandTexture) return swap()

      function paint(openness, angle) {
        const width = layer.clientWidth || innerWidth
        const height = layer.clientHeight || innerHeight
        const density = Math.min(devicePixelRatio || 1, 1.5)
        const pixelsWide = Math.round(width * density)
        const pixelsHigh = Math.round(height * density)
        if (aperture.width !== pixelsWide) aperture.width = pixelsWide
        if (aperture.height !== pixelsHigh) aperture.height = pixelsHigh
        const context = apertureContext
        context.setTransform(pixelsWide / width, 0, 0, pixelsHigh / height, 0, 0)
        context.fillStyle = '#000'
        context.fillRect(0, 0, width, height)

        const mark = Math.max(82, Math.min(154, Math.min(width, height) * .18))
        const full = Math.max(width, height) * 15
        const size = mark * (full / mark) ** openness
        context.save()
        context.translate(width / 2, height / 2)
        context.rotate(angle * openness)
        // Pivot through the central stroke so the cut-out can open past every edge.
        context.globalCompositeOperation = 'destination-out'
        context.drawImage(brandTexture, -size * .5, -size * .53, size, size)
        context.restore()
        wash.style.opacity = 1 - openness ** .62
      }

      await new Promise((resolve, reject) => {
        let frame
        let start
        scene.stopDrawing = () => {
          cancelAnimationFrame(frame)
          resolve()
        }
        const draw = time => {
          start ??= time
          const elapsed = time - start
          const openingAt = brandClose + brandHold
          const leaving = elapsed < brandClose
          const openness = leaving ? 1 - smooth(elapsed / brandClose)
            : smooth(Math.min(1, Math.max(0, elapsed - openingAt) / brandOpen))
          try {
            paint(openness, leaving ? -.24 : .18)
            if (!scene.committed && elapsed >= brandClose + brandHold / 2) {
              scene.commit()
              placeOnTop()
            }
          } catch (error) {
            reject(error)
            return
          }
          if (elapsed < openingAt + brandOpen) frame = requestAnimationFrame(draw)
          else resolve()
        }
        frame = requestAnimationFrame(draw)
      })
    }

    layer.hidden = false
    layer.dataset.kind = useCover ? 'cover' : 'brand'
    host.dataset.routeTransition = kind
    setTransitioning(true)
    try {
      placeOnTop()
      const completion = useCover ? exchangeCover() : exchangeBrand()
      completion.catch(() => { if (active === scene) scene.commit() }).finally(() => {
        if (active === scene) cancel()
      })
    } catch {
      cancel(true)
    }
  }

  const reduce = event => { if (event.matches) cancel(true) }
  preference.addEventListener('change', reduce)
  return { play, cancel, dispose() {
    cancel()
    preference.removeEventListener('change', reduce)
    layer.remove()
  } }
}
