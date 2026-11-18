import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { getProjectGallery } from './projectGallery'
import { Icon } from './Icons'
import { publicAsset } from './publicAsset'
import { MobileImage, MobileVideo } from './MobileMedia'
import './mobile-project.css'

function MobileLightbox({ item, onClose }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (dialog.showModal) dialog.showModal()
    else dialog.setAttribute('open', '')
    closeRef.current?.focus({ preventScroll: true })
    return () => {
      dialog.close?.()
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [])

  return <dialog ref={dialogRef} className="m-lightbox" aria-label="作品原图"
    onCancel={event => { event.preventDefault(); onClose() }}>
    <div className="m-lightbox-bar">
      <a href={publicAsset(item.image)} target="_blank" rel="noreferrer">打开原图<Icon name="diagonal"/></a>
      <button ref={closeRef} type="button" className="m-glass-close" aria-label="关闭作品原图" onClick={onClose}><Icon name="close"/></button>
    </div>
    <div className="m-lightbox-content">
      <MobileImage original src={item.image} alt={item.alt || item.caption || '作品原图'}
        width={item.width} height={item.height} priority/>
    </div>
  </dialog>
}

export default function MobileProject({ project, onBack }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const activeVideo = useRef(null)
  const gallery = getProjectGallery(project)
  const description = project.description || project.summary
  const contribution = project.contribution || project.role
  const deliverables = project.deliverables || project.tags || []
  const hasDetails = contribution || project.approach || deliverables.length > 0

  useEffect(() => () => activeVideo.current?.pause(), [])

  const activateVideo = video => {
    if (activeVideo.current && activeVideo.current !== video) activeVideo.current.pause()
    activeVideo.current = video
  }

  return <article className="m-project">
    <header className="m-project-intro">
      <div className="m-project-meta">
        {project.company && <span>{project.company}</span>}
        {(project.period || project.year) && <span>{project.period || project.year}</span>}
      </div>
      <h1>{project.title}</h1>
      {project.format && <p className="m-project-format">{project.format}</p>}
      {description && <p id="mobile-project-description"
        className={`m-project-description${descriptionExpanded ? ' is-expanded' : ''}`}>{description}</p>}
      {description?.length > 80 && <button type="button" className="m-project-description-toggle"
        aria-expanded={descriptionExpanded} aria-controls="mobile-project-description"
        onClick={() => setDescriptionExpanded(value => !value)}>
        {descriptionExpanded ? '收起项目说明' : '展开项目说明'}<Icon name="plus"/>
      </button>}
      {hasDetails && <details className="m-project-details">
        <summary>关于这个项目<Icon name="plus"/></summary>
        <div className="m-project-details-content">
          {contribution && <div><h2>我的参与</h2><p>{contribution}</p></div>}
          {project.approach && <div><h2>设计思路</h2><p>{project.approach}</p></div>}
          {deliverables.length > 0 && <div><h2>呈现内容</h2><ul>{deliverables.map(item => <li key={item}>{item}</li>)}</ul></div>}
        </div>
      </details>}
    </header>

    <section className="m-project-gallery" aria-label={`${project.title}作品内容`}>
      {gallery.map((item, index) => <figure className="m-project-figure" key={`${item.image}-${index}`}>
        {item.subsection && item.subsection !== gallery[index - 1]?.subsection && <h2 className="m-project-group">{item.subsection}</h2>}
        {item.video
          ? <MobileVideo item={item} priority={index === 0} onActivate={activateVideo}/>
          : <MobileImage src={item.image} alt={item.alt || item.caption || `${project.title}作品图`}
            width={item.width} height={item.height} priority={index === 0}
            onClick={() => { activeVideo.current?.pause(); setSelectedImage(item) }}/>}
      </figure>)}
    </section>

    <footer className="m-project-end">
      <button type="button" onClick={onBack}><Icon name="back"/>返回作品</button>
      <a href="#contact">联系我<Icon name="diagonal"/></a>
    </footer>
    {selectedImage && <MobileLightbox item={selectedImage} onClose={() => setSelectedImage(null)}/>}
  </article>
}
