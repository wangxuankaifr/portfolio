import { useEffect, useRef, useState } from 'react'
import mobileMedia from './mobileDemoMedia.json'
import { publicAsset } from './publicAsset'
import { Icon } from './Icons'

function retryAsset(path, attempt) {
  const url = publicAsset(path)
  return attempt ? `${url}${url.includes('?') ? '&' : '?'}retry=${attempt}` : url
}

export function MobileImage({ src, alt = '', width, height, priority = false, className = '', style, onClick, original = false }) {
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
      <span>图片暂未载入</span>
      <button type="button" onClick={event => {
        event.preventDefault()
        event.stopPropagation()
        setFailed(false)
        setAttempt(value => value + 1)
      }}>重新加载</button>
    </span> : onClick ? <button type="button" className="m-image-zoom" onClick={onClick}
      aria-label={`放大查看${alt ? `：${alt}` : '作品图片'}`}>{image}</button> : image}
  </span>
}

export function MobileVideo({ item, priority = false, onActivate }) {
  const videoRef = useRef(null)
  const playRequest = useRef(0)
  const mounted = useRef(true)
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
  const playbackHint = optimized?.audio === null ? '可全屏观看' : '可在播放控件中开启声音与全屏观看'

  useEffect(() => {
    if (status !== 'loading') {
      setSlow(false)
      return
    }
    const timer = window.setTimeout(() => setSlow(true), 5000)
    return () => window.clearTimeout(timer)
  }, [status])

  useEffect(() => {
    const video = videoRef.current
    mounted.current = true
    const pauseWhenHidden = () => {
      if (document.hidden) video.pause()
    }
    document.addEventListener('visibilitychange', pauseWhenHidden)
    return () => {
      mounted.current = false
      playRequest.current += 1
      document.removeEventListener('visibilitychange', pauseWhenHidden)
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }, [])

  const play = () => {
    const video = videoRef.current
    const request = ++playRequest.current
    onActivate?.(video)
    setActivated(true)
    setStatus('loading')
    setSlow(false)
    if (!video.getAttribute('src') || video.error) {
      video.src = source
      video.load()
    }
    // Keep play() in the trusted tap handler for iPhone's inline player.
    video.play().catch(error => {
      if (!mounted.current || request !== playRequest.current || error.name === 'AbortError') return
      setStatus(error.name === 'NotAllowedError' ? 'paused' : 'error')
    })
  }

  const retry = () => {
    const video = videoRef.current
    playRequest.current += 1
    video.pause()
    video.removeAttribute('src')
    video.load()
    setHasPlayed(false)
    play()
  }

  return <div className="m-video">
    <div className="m-video-stage" style={{ aspectRatio: `${width} / ${height}` }}>
      <video ref={videoRef} width={width} height={height} poster={poster}
        preload="none" playsInline muted controls={activated}
        aria-label={label}
        onPlaying={() => { setStatus('playing'); setHasPlayed(true) }}
        onPause={() => setStatus(value => value === 'error' || value === 'idle' ? value : 'paused')}
        onEnded={() => setStatus('ended')}
        onWaiting={() => { if (activated) setStatus('loading') }}
        onStalled={() => { if (activated) setStatus('loading') }}
        onError={() => { if (activated) setStatus('error') }}/>
      {showingPoster && <MobileImage src={item.image} alt={label} width={item.width} height={item.height}
        priority={priority} className="m-video-poster"/>}
      {(status === 'idle' || status === 'error' || (status === 'paused' && !hasPlayed)) &&
        <button type="button" className="m-video-play" onClick={status === 'error' ? retry : play}
          aria-label={status === 'error' ? `重新加载视频：${label}` : `播放视频：${label}`}>
          <Icon name="play"/>
          <span>{status === 'error' ? '重新播放' : '播放影片'}</span>
        </button>}
      {status === 'loading' && <span className="m-video-loading" role="status">
        <span className="m-video-spinner" aria-hidden="true"/>
        {slow ? '正在加载，可继续等待' : '正在加载影片'}
      </span>}
      {status === 'ended' && <button type="button" className="m-video-play" onClick={play}>
        <Icon name="play"/><span>再次播放</span>
      </button>}
    </div>
    <div className="m-video-caption" aria-live="polite">
      <span>{status === 'error' ? '影片暂未载入，请重新加载。' : activated ? playbackHint : '点击播放，可全屏观看'}</span>
      {(status === 'error' || slow) && <button type="button" onClick={retry}>重新加载</button>}
    </div>
  </div>
}
