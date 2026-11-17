import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { getProjectGallery } from './projectGallery'
import TrophyMark from './TrophyMark'
import useLoopingGallery from './useLoopingGallery'
import useProjectMotion from './useProjectMotion'
import ArtworkViewer from './ArtworkViewer'
import ProjectGalleryVideo from './ProjectGalleryVideo'
import ProjectVideoViewer from './ProjectVideoViewer'
import { Icon } from './Icons'
import { publicAsset } from './publicAsset'
import './project-sheet.css'

const galleryText = {
  loop: { label: '循环作品图集', help: '向上或向下滚动可循环浏览。Home 查看第一幅，End 查看最后一幅，Escape 关闭。' },
  single: { label: '单页作品展示', help: '作品完整单页，可滚动查看。Escape 关闭。' },
  fixed: { label: '作品视频展示', help: '选择视频可放大播放。Escape 关闭。' },
}

function GalleryCycle({ images, continuous = false, copy = false, cycleRef, suspended, posterOnly, videoPlayback, onVideoOpen }) {
  const grouped = continuous && new Set(images.map(item => item.subsection).filter(Boolean)).size > 1
  return <div className={`project-gallery-cycle${continuous ? ' is-continuous' : ''}${copy ? ' is-copy' : ''}`} ref={cycleRef} aria-hidden={copy || undefined}>
    {images.map((item, index) => {
      const isPortrait = !item.fullWidth && item.height > item.width * 1.25
      const startsGroup = item.subsection !== images[index - 1]?.subsection
      const alt = item.alt || item.caption || ''
      const picture = <img src={publicAsset(item.image)} alt={copy ? '' : alt} width={item.width || 1600} height={item.height || 900}
        loading={copy || index >= 2 ? 'lazy' : 'eager'} decoding="async"/>

      let media
      if (item.video) {
        media = <ProjectGalleryVideo item={item} poster={picture} suspended={suspended} posterOnly={posterOnly} copy={copy}
          playback={videoPlayback.get(item)} onOpen={onVideoOpen}/>
      } else if (copy) {
        media = <span className="project-image-copy" data-image={item.image}>{picture}</span>
      } else {
        media = <a href={publicAsset(item.image)} data-image={item.image} aria-label={`查看大图：${alt}`}>{picture}</a>
      }

      return <figure key={item.image} className={`project-sheet-figure${isPortrait ? ' is-portrait' : ''}${continuous && index > 0 && startsGroup ? ' is-group-start' : ''}`} data-image-index={index}>
        {grouped && item.subsection && startsGroup && <h3 className="project-gallery-group-title">{item.subsection}</h3>}
        {media}
      </figure>
    })}
  </div>
}

export default function ProjectSheet({ project, opensWithPageTransition, transitioning, onClose, imageIndex=null, onImageOpen, onImageClose }) {
  const dialog=useRef(null),closeButton=useRef(null),scroller=useRef(null),canonical=useRef(null),progress=useRef(null),motionCanvas=useRef(null)
  const [pageEntry] = useState(opensWithPageTransition)
  const [expandedVideo, setExpandedVideo] = useState(null)
  const viewerTrigger=useRef(null)
  const images = useMemo(() => getProjectGallery(project), [project])
  const videoPlayback = useMemo(() => new Map(
    images.filter(item => item.video)
      .map(item => [item, { active: null, position: 0 }])
  ), [images])
  const fixed = project.galleryLayout === 'fixed'
  const looping = !fixed && project.galleryLoop !== false
  const galleryMode = fixed ? 'fixed' : looping ? 'loop' : 'single'
  const mediaRatio = fixed ? images[0].width / images[0].height : undefined
  const { label, help } = galleryText[galleryMode]
  const selectedItem=Number.isInteger(imageIndex)?images[imageIndex]:null
  const selectedImage=selectedItem?.video?null:selectedItem
  const viewingMedia = Boolean(selectedImage || expandedVideo)
  const {guards,onKeyDown}=useLoopingGallery(scroller,canonical,amount=>progress.current?.style.setProperty('--reading-progress',amount),viewingMedia||!looping)
  const copies=looping?guards:0
  useProjectMotion(scroller,canonical,motionCanvas,guards,viewingMedia||!looping)

  useLayoutEffect(()=>{
    const el=dialog.current,previousFocus=document.activeElement
    const overflow=document.body.style.overflow,padding=document.body.style.paddingRight
    const scrollbar=window.innerWidth-document.documentElement.clientWidth
    el.showModal();closeButton.current?.focus({preventScroll:true})
    document.body.style.overflow='hidden'
    if(scrollbar)document.body.style.paddingRight=`${scrollbar}px`
    return()=>{
      el.close();document.body.style.overflow=overflow;document.body.style.paddingRight=padding
      if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true})
    }
  },[])
  const openImage=event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return
    const trigger=event.target.closest('[data-image]')
    const index=images.findIndex(item=>item.image===trigger?.dataset.image)
    if(index<0)return
    event.preventDefault()
    if (dialog.current.closest('[data-route-transition]')) return
    viewerTrigger.current=trigger instanceof HTMLAnchorElement?trigger:scroller.current
    onImageOpen(index)
  }
  const openVideo = (item, trigger) => {
    if (dialog.current.closest('[data-route-transition]')) return
    const playback = videoPlayback.get(item)
    setExpandedVideo({ item, trigger: trigger || scroller.current,
      position: playback.active?.currentTime ?? playback.position })
  }
  const closeVideo = position => {
    videoPlayback.get(expandedVideo.item).position = position
    setExpandedVideo(null)
  }
  return <><dialog ref={dialog} className={`project-sheet${pageEntry ? ' opens-with-page-transition' : ''}`} data-video-open={expandedVideo ? '' : undefined}
    aria-labelledby="project-sheet-title" aria-describedby="project-sheet-description" onKeyDown={onKeyDown} onCancel={event=>{event.preventDefault();onClose()}} onClick={event=>{if(event.target===event.currentTarget)onClose()}}>
    <div className={`project-sheet-layout${fixed ? ' is-fixed' : ''}`}>
      <aside className="project-sheet-intro">
        <h2 id="project-sheet-title">{project.title}</h2>
        <p id="project-sheet-description" className="project-sheet-description">{project.description||project.summary}</p>
        <div className="project-sheet-meta"><div className="project-sheet-pills">
          {project.company&&<span className="project-sheet-pill" aria-label={`任职公司：${project.company}`}>{project.company}</span>}
          {(project.period||project.year)&&<span className="project-sheet-pill" aria-label={`制作年份：${project.period||project.year}`}>{project.period||project.year}</span>}
        </div><TrophyMark/></div>
        {!project.briefOnly&&<div className="project-sheet-supplement">
          <details className="project-sheet-notes"><summary>关于这个项目<span aria-hidden="true"><Icon name="plus"/></span></summary><div className="project-sheet-notes-content">
            <div><h3>我的参与</h3><p>{project.contribution||project.role}</p></div>
            {project.approach&&<div><h3>设计思路</h3><p>{project.approach}</p></div>}
            <div><h3>呈现内容</h3><ul>{(project.deliverables||project.tags).map(item=><li key={item}>{item}</li>)}</ul></div>
          </div></details>
        </div>}
      </aside>
      <section className={`project-sheet-gallery-panel${looping?'':' is-single'}`} aria-label={`${project.title}作品图集`}>
        <p className="gallery-screenreader-help" id="project-gallery-help">{help}</p>
        <div className="project-sheet-scroll" ref={scroller} data-gallery-mode={galleryMode} tabIndex={fixed ? undefined : 0} role="region"
          aria-label={label} aria-describedby="project-gallery-help" style={fixed ? {'--gallery-media-ratio': mediaRatio} : undefined}
          onClick={openImage}>
          <div className="project-gallery-track">
            {Array.from({length:copies*2+1},(_,index)=><GalleryCycle key={index-copies} images={images}
              continuous={project.galleryLayout==='continuous'} copy={index!==copies} cycleRef={index===copies?canonical:undefined}
              suspended={viewingMedia || transitioning} posterOnly={Boolean(expandedVideo)} videoPlayback={videoPlayback} onVideoOpen={openVideo}/>)}
          </div>
        </div>
        <button ref={closeButton} type="button" className="project-sheet-close" aria-label="关闭项目详情"
          hidden={Boolean(expandedVideo)} onClick={onClose} autoFocus><Icon name="close"/></button>
      </section>
    </div>
    {looping&&<canvas ref={motionCanvas} className="project-gallery-motion" aria-hidden="true"/>}
    {looping&&<div className="project-sheet-progress" ref={progress} aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="13"/><circle className="project-sheet-progress-value" cx="16" cy="16" r="13" pathLength="1"/></svg></div>}
  </dialog>
  {selectedImage&&<ArtworkViewer key={selectedImage.image} item={selectedImage} onClose={onImageClose} returnFocus={viewerTrigger.current} parentDialog={dialog} scrollContainer={scroller}/>}
  {expandedVideo&&<ProjectVideoViewer key={expandedVideo.item.video} item={expandedVideo.item}
    position={expandedVideo.position} returnFocus={expandedVideo.trigger} onClose={closeVideo}/>}
  </>
}
