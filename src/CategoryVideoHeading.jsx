import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icons'
import { publicAsset } from './publicAsset'

export function CategoryVideoHeading({ children, period, media }) {
  const videoRef = useRef(null)
  const [playIntent, setPlayIntent] = useState(null)
  const [playback, setPlayback] = useState('loading')
  const playing = playback === 'playing'

  useEffect(() => {
    const video = videoRef.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let inView = true
    let disposed = false
    video.muted = true
    video.defaultMuted = true

    const syncPlayback = () => {
      const shouldPlay = (playIntent ?? !reducedMotion.matches) && inView && !document.hidden
      if (shouldPlay) {
        video.play().catch(() => {
          if (!disposed && video.paused) setPlayback('paused')
        })
      } else {
        video.pause()
        setPlayback('paused')
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      syncPlayback()
    }, { threshold: 0 })
    observer.observe(video)
    document.addEventListener('visibilitychange', syncPlayback)
    reducedMotion.addEventListener('change', syncPlayback)
    syncPlayback()

    return () => {
      disposed = true
      observer.disconnect()
      document.removeEventListener('visibilitychange', syncPlayback)
      reducedMotion.removeEventListener('change', syncPlayback)
      video.pause()
    }
  }, [playIntent])

  const togglePlayback = () => {
    const video = videoRef.current
    if (video.paused) {
      setPlayIntent(true)
      video.play().catch(() => {
        if (video.paused) setPlayback('paused')
      })
    } else {
      setPlayIntent(false)
      video.pause()
    }
  }

  return <header className="visual-video-hero">
    <video ref={videoRef} className="visual-heading-background" autoPlay muted loop playsInline preload="metadata"
      poster={publicAsset(media.poster)} aria-hidden="true"
      onPlaying={() => setPlayback('playing')} onPause={() => setPlayback('paused')}>
      <source media="(max-width: 760px)" src={publicAsset(media.mobile)} type="video/mp4"/>
      <source src={publicAsset(media.desktop)} type="video/mp4"/>
    </video>
    <div className="visual-video-caption wrap">
      <h1 id="category-heading">{children}</h1>
    </div>
    <p className="visual-video-period">{period}</p>
    <button type="button" className="visual-video-interaction" aria-label={playing ? '暂停背景视频' : '播放背景视频'}
      onClick={togglePlayback}>
      {playback === 'paused' && <span className="visual-video-play" aria-hidden="true"><Icon name="play"/></span>}
    </button>
  </header>
}
