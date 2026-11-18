import { useCallback, useEffect, useRef, useState } from 'react'
import mobileMedia from './mobileDemoMedia.json'
import { publicAsset } from './publicAsset'
import { Icon } from './Icons'

const coordinatedPauses = new WeakSet()

export function pauseMobileVideo(video) {
  if (!video || video.paused) return
  coordinatedPauses.add(video)
  video.pause()
}

function retryAsset(path, attempt) {
  const url = publicAsset(path)
  return attempt ? `${url}${url.includes('?') ? '&' : '?'}retry=${attempt}` : url
}

export function MobileImage({ src, alt = '', width, height, priority = false, className = '', style, onClick, original = false, retryable = true }) {
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const optimized = original ? null : mobileMedia.images[src]
  const imageWidth = width || optimized?.width || 1600
  const imageHeight = height || optimized?.height || 900
  const source = optimized?.src || src
  const sourceSet = optimized?.variants?.map(variant => `${retryAsset(variant.src, attempt)} ${variant.width}w`).join(', ')

  useEffect(() => {
    setFailed(false)
    setAttempt(0)
  }, [src, original])

  const image = <img key={attempt} src={retryAsset(source, attempt)} srcSet={sourceSet}
    sizes="(max-width: 720px) calc(100vw - 40px), 680px" alt={alt}
    width={imageWidth} height={imageHeight} loading={priority ? 'eager' : 'lazy'}
    fetchPriority={priority ? 'high' : 'auto'} decoding="async" onError={() => setFailed(true)}/>

  return <span className={`m-image ${className}${failed ? ' has-error' : ''}`}
    style={{ aspectRatio: `${imageWidth} / ${imageHeight}`, ...style }}>
    {failed ? <span className="m-image-error" role="status">
      <span>{retryable ? '图片暂未载入' : '封面暂未载入'}</span>
      {retryable && <button type="button" onClick={event => {
        event.preventDefault()
        event.stopPropagation()
        setFailed(false)
        setAttempt(value => value + 1)
      }}>重新加载</button>}
    </span> : onClick ? <button type="button" className="m-image-zoom" onClick={onClick}
      aria-label={`放大查看${alt ? `：${alt}` : '作品图片'}`}>{image}</button> : image}
  </span>
}

export function MobileVideo({ item, priority = false, onActivate, autoPlay = false }) {
  const videoRef = useRef(null)
  const stageRef = useRef(null)
  const playRequest = useRef(0)
  const mounted = useRef(true)
  const visible = useRef(false)
  const userPaused = useRef(false)
  const automaticPlayback = useRef(false)
  const autoPlayIntent = useRef(autoPlay)
  const ended = useRef(false)
  const hasPlayedRef = useRef(false)
  const statusRef = useRef('idle')
  const activateRef = useRef(onActivate)
  const requestPlayRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [activated, setActivated] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [slow, setSlow] = useState(false)
  const optimized = mobileMedia.videos[item.video]
  const source = publicAsset(optimized?.src || item.video)
  const poster = publicAsset(mobileMedia.images[item.image]?.src || item.image)
  const label = item.alt || item.caption || '项目视频'
  const width = optimized?.width || item.width || 1600
  const height = optimized?.height || item.height || 900
  const showingPoster = !hasPlayed || status === 'error'
  activateRef.current = onActivate
  autoPlayIntent.current = autoPlay

  const updateStatus = useCallback(value => {
    if (!mounted.current) return
    statusRef.current = value
    setStatus(value)
  }, [])

  useEffect(() => {
    if (status !== 'loading') {
      setSlow(false)
      return
    }
    const timer = window.setTimeout(() => setSlow(true), 5000)
    return () => window.clearTimeout(timer)
  }, [status])

  const play = useCallback((automatic = false) => {
    const video = videoRef.current
    if (!video || !mounted.current || document.hidden) return
    if (automatic && (!autoPlayIntent.current || !visible.current || userPaused.current || ended.current || !video.paused)) return
    const request = ++playRequest.current
    if (!automatic) userPaused.current = false
    automaticPlayback.current = automatic
    if (automatic) video.muted = true
    activateRef.current?.(video)
    setActivated(true)
    updateStatus('loading')
    setSlow(false)
    if (video.getAttribute('src') !== source || video.error) {
      video.src = source
      video.load()
    }
    // The same function remains synchronous when called by a trusted tap.
    const reportFailure = error => {
      if (!mounted.current || request !== playRequest.current) return
      if (error.name === 'NotAllowedError' || error.name === 'AbortError') updateStatus('paused')
      else updateStatus('error')
    }
    try {
      const result = video.play()
      result?.catch(reportFailure)
    } catch (error) {
      reportFailure(error)
    }
  }, [source, updateStatus])
  requestPlayRef.current = play

  const pausePlayback = useCallback(() => {
    playRequest.current += 1
    pauseMobileVideo(videoRef.current)
    if (['loading', 'playing'].includes(statusRef.current)) updateStatus('paused')
  }, [updateStatus])

  // A route transition pauses the frame without discarding its decoded image.
  useEffect(() => {
    if (!autoPlay) pausePlayback()
    else if (visible.current && !document.hidden) requestPlayRef.current?.(true)
  }, [autoPlay, pausePlayback])

  useEffect(() => {
    const video = videoRef.current
    const stage = stageRef.current
    mounted.current = true
    visible.current = false
    ended.current = false
    userPaused.current = false
    hasPlayedRef.current = false
    automaticPlayback.current = false
    updateStatus('idle')
    setHasPlayed(false)
    setActivated(false)
    let observer
    let measureFrame
    let measureVisibility

    const updateVisibility = isVisible => {
      const entering = isVisible && !visible.current
      visible.current = isVisible
      if (!isVisible) pausePlayback()
      else if (entering && autoPlayIntent.current && !document.hidden) requestPlayRef.current?.(true)
    }
    const restoreVisiblePlayback = () => {
      if (document.hidden) pausePlayback()
      else if (autoPlayIntent.current && visible.current) requestPlayRef.current?.(true)
    }
    const bridgeReady = () => {
      if (autoPlayIntent.current && visible.current && !document.hidden) requestPlayRef.current?.(true)
    }

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        const entry = entries[0]
        updateVisibility(entry.isIntersecting && entry.intersectionRatio >= .2)
      }, { threshold: [0, .2], rootMargin: '-76px 0px -20px 0px' })
      observer.observe(stage)
    } else {
      measureVisibility = () => {
        cancelAnimationFrame(measureFrame)
        measureFrame = requestAnimationFrame(() => {
          const rect = stage.getBoundingClientRect()
          const available = Math.max(0, Math.min(rect.bottom, innerHeight - 20) - Math.max(rect.top, 76))
          updateVisibility(rect.width > 0 && rect.height > 0 && available / rect.height >= .2)
        })
      }
      window.addEventListener('scroll', measureVisibility, { passive: true })
      window.addEventListener('resize', measureVisibility)
      measureVisibility()
    }
    document.addEventListener('visibilitychange', restoreVisiblePlayback)
    document.addEventListener('WeixinJSBridgeReady', bridgeReady)
    return () => {
      mounted.current = false
      visible.current = false
      playRequest.current += 1
      observer?.disconnect()
      cancelAnimationFrame(measureFrame)
      if (measureVisibility) {
        window.removeEventListener('scroll', measureVisibility)
        window.removeEventListener('resize', measureVisibility)
      }
      document.removeEventListener('visibilitychange', restoreVisiblePlayback)
      document.removeEventListener('WeixinJSBridgeReady', bridgeReady)
      coordinatedPauses.delete(video)
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }, [source, pausePlayback, updateStatus])

  const retry = () => {
    const video = videoRef.current
    playRequest.current += 1
    pauseMobileVideo(video)
    video.removeAttribute('src')
    video.load()
    ended.current = false
    hasPlayedRef.current = false
    setHasPlayed(false)
    play(false)
  }

  return <div className="m-video">
    <div ref={stageRef} className="m-video-stage" style={{ aspectRatio: `${width} / ${height}` }}>
      <video ref={videoRef} width={width} height={height} poster={poster}
        preload="none" playsInline muted controls={activated}
        aria-label={label}
        onPlaying={() => {
          if (!mounted.current) return
          if (document.hidden || !visible.current || (automaticPlayback.current && !autoPlayIntent.current)) {
            pausePlayback()
            return
          }
          hasPlayedRef.current = true
          ended.current = false
          updateStatus('playing')
          setHasPlayed(true)
        }}
        onPause={() => {
          const coordinated = coordinatedPauses.delete(videoRef.current)
          if (!mounted.current || ['error', 'idle', 'ended'].includes(statusRef.current)) return
          if (!coordinated && visible.current && !document.hidden && hasPlayedRef.current) userPaused.current = true
          updateStatus('paused')
        }}
        onEnded={() => { ended.current = true; updateStatus('ended') }}
        onWaiting={() => { if (activated && visible.current && !document.hidden && !videoRef.current.paused) updateStatus('loading') }}
        onStalled={() => { if (activated && visible.current && !document.hidden && !videoRef.current.paused) updateStatus('loading') }}
        onError={() => { if (activated) updateStatus('error') }}/>
      {showingPoster && <MobileImage src={item.image} alt={label} width={item.width} height={item.height}
        priority={priority} className="m-video-poster" retryable={false}/>}
      {(status === 'idle' || status === 'error' || (status === 'paused' && !hasPlayed)) &&
        <button type="button" className="m-video-play" onClick={status === 'error' ? retry : () => play(false)}
          aria-label={status === 'error' ? `重新加载视频：${label}` : `播放视频：${label}`}>
          <Icon name="play"/>
          <span>{status === 'error' ? '重新播放' : '播放影片'}</span>
        </button>}
      {status === 'loading' && <span className="m-video-loading" role="status">
        <span className="m-video-spinner" aria-hidden="true"/>
        {slow ? '正在加载，可继续等待' : '正在加载影片'}
      </span>}
      {status === 'ended' && <button type="button" className="m-video-play" onClick={() => play(false)}>
        <Icon name="play"/><span>再次播放</span>
      </button>}
    </div>
    {(status === 'error' || slow) && <div className="m-video-caption" aria-live="polite">
      {status === 'error' && <span>影片暂未载入，请重新加载。</span>}
      <button type="button" onClick={retry}>重新加载</button>
    </div>}
  </div>
}
