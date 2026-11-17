import { useLayoutEffect, useRef, useState } from 'react'
import { Icon } from './Icons'
import { publicAsset } from './publicAsset'
import './project-video-viewer.css'

export default function ProjectVideoViewer({ item, position, returnFocus, onClose }) {
  const dialogRef = useRef(null)
  const videoRef = useRef(null)
  const closeRef = useRef(null)
  const [frameVisible, setFrameVisible] = useState(false)
  const label = item.alt || item.caption || '作品视频'

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    const video = videoRef.current
    dialog.showModal()
    closeRef.current.focus({ preventScroll: true })

    const listeners = new AbortController()
    const { signal } = listeners
    let frameRequest = null
    let paintRequest = null

    const reveal = () => {
      if (!signal.aborted) setFrameVisible(true)
    }

    const revealAfterFrame = () => {
      if (signal.aborted) return
      if (video.seeking) {
        video.addEventListener('seeked', revealAfterFrame, { signal, once: true })
      } else if (typeof video.requestVideoFrameCallback === 'function') {
        frameRequest = video.requestVideoFrameCallback(reveal)
      } else {
        paintRequest = requestAnimationFrame(reveal)
      }
    }

    const restorePosition = () => {
      if (position > 0 && position < video.duration) video.currentTime = position
    }

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) restorePosition()
    else video.addEventListener('loadedmetadata', restorePosition, { signal, once: true })
    // The separate poster covers browsers that hide the native poster as soon as play() is called.
    video.play().then(revealAfterFrame).catch(reveal)

    return () => {
      listeners.abort()
      if (frameRequest !== null) video.cancelVideoFrameCallback(frameRequest)
      if (paintRequest !== null) cancelAnimationFrame(paintRequest)
      video.pause()
      dialog.close()
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true })
    }
  }, [position, returnFocus])

  const close = () => {
    const video = videoRef.current
    onClose(video.readyState === HTMLMediaElement.HAVE_NOTHING ? position : video.currentTime)
  }

  return <dialog ref={dialogRef} className="project-video-viewer" aria-label={`放大播放：${label}`}
    style={{ '--video-ratio': item.width / item.height }} onCancel={event => { event.preventDefault(); close() }}>
    <div className="project-video-viewer-dismiss" aria-hidden="true" onClick={close}/>
    <button ref={closeRef} type="button" className="project-video-viewer-close"
      aria-label="关闭视频视窗" onClick={close}>
      <Icon name="close"/>
    </button>
    <div className="project-video-viewer-frame">
      <video ref={videoRef} className="project-video-viewer-media" src={publicAsset(item.video)} poster={publicAsset(item.image)} aria-label={label}
        width={item.width} height={item.height} preload="auto" controls muted loop playsInline/>
      {!frameVisible && <img className="project-video-viewer-poster" src={publicAsset(item.image)} alt="" draggable={false}/>}
    </div>
  </dialog>
}
