import { useEffect, useRef } from 'react'
import { Icon } from './Icons'
import { publicAsset } from './publicAsset'

function pauseVideo(video, playback) {
  if (playback.active === video) {
    playback.position = video.currentTime
    playback.active = null
  }
  video.pause()
}

function playVideo(video, playback) {
  if (playback.active !== video) {
    if (playback.active) pauseVideo(playback.active, playback)
    if (Math.abs(video.currentTime - playback.position) > .05) {
      video.currentTime = playback.position
    }
    playback.active = video
  }
  video.play().catch(() => {})
}

export default function ProjectGalleryVideo({ item, poster, suspended, posterOnly, copy, playback, onOpen }) {
  const videoRef = useRef(null)
  const showVideo = !posterOnly && (!copy || item.playInLoopCopies)
  const label = item.alt || item.caption || '作品视频'

  useEffect(() => {
    const video = videoRef.current
    if (!video || suspended) return
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false
    let disposed = false
    const syncPlayback = () => {
      if (disposed) return
      if (visible && !document.hidden && !reducedMotion.matches) {
        playVideo(video, playback)
      } else {
        pauseVideo(video, playback)
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      syncPlayback()
    }, { root: video.closest('.project-sheet-scroll') })
    observer.observe(video)
    document.addEventListener('visibilitychange', syncPlayback)
    reducedMotion.addEventListener('change', syncPlayback)
    return () => {
      disposed = true
      observer.disconnect()
      document.removeEventListener('visibilitychange', syncPlayback)
      reducedMotion.removeEventListener('change', syncPlayback)
      pauseVideo(video, playback)
    }
  }, [suspended, playback, showVideo])

  return <div className="project-gallery-video">
    {showVideo ? <video ref={videoRef} src={publicAsset(item.video)} poster={publicAsset(item.image)} width={item.width} height={item.height}
      muted loop playsInline preload={copy ? 'none' : 'metadata'} aria-hidden="true"/> : poster}
    <button type="button" className="project-gallery-video-trigger" aria-label={`放大播放：${label}`} aria-haspopup="dialog"
      tabIndex={copy ? -1 : undefined} onMouseDown={copy ? event => event.preventDefault() : undefined}
      onClick={event => onOpen(item, copy ? null : event.currentTarget)}>
      <span className="project-gallery-video-play" aria-hidden="true"><Icon name="play"/></span>
    </button>
  </div>
}
