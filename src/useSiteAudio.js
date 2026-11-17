import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { publicAsset } from './publicAsset'

const preferenceKey = 'portfolio-site-sound'
const ambienceUrl = publicAsset('/media/sound/ambient-loop.wav')
const controls = 'a[href], button, summary, [role="button"]'
const readable = 'img, h1, h2, h3, h4, p, dt, dd, li, figcaption'

function wasMuted() {
  try { return localStorage.getItem(preferenceKey) === 'off' }
  catch { return false }
}

function audioTarget(node) {
  if (!(node instanceof Element) ||
      node.closest('.site-sound-toggle, [inert], [hidden], [disabled], [aria-disabled="true"]')) return null
  const control = node.closest(controls)
  const content = node.closest(readable) || (node.matches('span, time') && node.textContent.trim() ? node : null)
  return control || content
}

function createSiteAudio(Context) {
  const context = new Context()
  const effects = context.createGain()
  const abort = new AbortController()
  effects.gain.value = 0
  effects.connect(context.destination)

  let track, load, music
  let position = 0
  let wantsMusic = false

  function playMusic() {
    if (!wantsMusic || music || !track || context.state !== 'running') return
    const source = context.createBufferSource()
    const gain = context.createGain()
    const start = context.currentTime
    source.buffer = track
    source.loop = true
    gain.gain.setValueAtTime(0, start)
    gain.gain.setTargetAtTime(.94, start, .38)
    source.connect(gain)
    gain.connect(context.destination)
    source.onended = () => { source.disconnect(); gain.disconnect() }
    source.start(start, position)
    music = { source, gain, start }
  }
  context.addEventListener('statechange', playMusic)

  function stopMusic() {
    if (!music) return
    const now = context.currentTime
    const fade = context.state === 'running' ? .14 : 0
    const { source, gain, start } = music
    position = (position + now - start + fade) % track.duration
    gain.gain.setTargetAtTime(0, now, .027)
    source.stop(now + fade)
    music = null
  }

  function setActive(enabled, playBackground) {
    effects.gain.setTargetAtTime(enabled ? 1 : 0, context.currentTime, .018)
    wantsMusic = enabled && playBackground
    if (!wantsMusic) return stopMusic()
    if (track) return playMusic()
    if (load) return
    load = fetch(ambienceUrl, { signal: abort.signal })
      .then(response => {
        if (!response.ok) throw new Error('The background track could not be loaded.')
        return response.arrayBuffer()
      })
      .then(bytes => context.decodeAudioData(bytes))
      .then(buffer => { track = buffer; playMusic() })
      .catch(() => {})
      .finally(() => { load = null })
  }

  function playFeedback(target) {
    if (context.state !== 'running') return
    const picture = target.matches('img, .flow-project, .visual-project-link')
    const pitch = picture ? 587 : target.closest('.site-header') ? 740 : 659
    const time = context.currentTime
    const note = context.createOscillator()
    const overtone = context.createOscillator()
    const volume = context.createGain()
    const shimmer = context.createGain()
    note.frequency.setValueAtTime(pitch * .93, time)
    note.frequency.exponentialRampToValueAtTime(pitch, time + .026)
    overtone.frequency.value = pitch * 2.42
    shimmer.gain.value = .16
    volume.gain.setValueAtTime(.0001, time)
    volume.gain.linearRampToValueAtTime(picture ? .046 : .043, time + .005)
    volume.gain.exponentialRampToValueAtTime(.0001, time + .16)
    note.connect(volume)
    overtone.connect(shimmer).connect(volume)
    volume.connect(effects)
    note.start(time)
    overtone.start(time)
    note.stop(time + .17)
    overtone.stop(time + .17)
    note.onended = () => {
      note.disconnect()
      overtone.disconnect()
      shimmer.disconnect()
      volume.disconnect()
    }
  }

  return {
    context, setActive, playFeedback,
    dispose() {
      abort.abort()
      wantsMusic = false
      context.removeEventListener('statechange', playMusic)
      context.close().catch(() => {})
    },
  }
}

export default function useSiteAudio(playBackground) {
  const [muted, setMuted] = useState(wasMuted)
  const engine = useRef(null)
  const enabled = !muted

  const activate = useCallback(() => {
    const Context = window.AudioContext || window.webkitAudioContext
    if (!Context) return
    try {
      const audio = engine.current ?? (engine.current = createSiteAudio(Context))
      if (audio.context.state !== 'running') audio.context.resume().catch(() => {})
      return audio
    } catch {
      // Sound is optional when a browser does not expose an audio output.
    }
  }, [])

  const toggle = () => {
    if (!enabled) activate()
    setMuted(enabled)
    try { localStorage.setItem(preferenceKey, enabled ? 'off' : 'on') } catch {}
  }

  useLayoutEffect(() => {
    const sync = () => {
      if (enabled && !document.hidden) activate()?.setActive(true, playBackground)
      else engine.current?.setActive(false, false)
    }
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [activate, enabled, playBackground])

  useEffect(() => {
    let lastSound = -Infinity
    const feedback = target => {
      const time = performance.now()
      if (!target || !enabled || document.hidden || engine.current?.context.state !== 'running' || time - lastSound < 70) return
      lastSound = time
      engine.current?.playFeedback(target)
    }
    const onGesture = event => {
      if (!event.isTrusted || !enabled || event.target.closest?.('.site-sound-toggle')) return
      if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return
      if (engine.current?.context.state !== 'running') activate()
      if (event.pointerType === 'touch') feedback(audioTarget(event.target))
    }
    const onHover = event => {
      if (event.pointerType === 'touch') return
      const target = audioTarget(event.target)
      if (target && target !== audioTarget(event.relatedTarget)) feedback(target)
    }
    const onFocus = event => {
      if (event.target.matches?.(':focus-visible')) feedback(audioTarget(event.target))
    }
    document.addEventListener('click', onGesture, true)
    document.addEventListener('keydown', onGesture, true)
    document.addEventListener('pointerover', onHover, { passive: true })
    document.addEventListener('focusin', onFocus)
    return () => {
      document.removeEventListener('click', onGesture, true)
      document.removeEventListener('keydown', onGesture, true)
      document.removeEventListener('pointerover', onHover)
      document.removeEventListener('focusin', onFocus)
    }
  }, [activate, enabled])

  useEffect(() => () => {
    engine.current?.dispose()
    engine.current = null
  }, [])

  return { enabled, toggle }
}
