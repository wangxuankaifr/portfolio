import { useEffect, useRef, useState } from 'react'
import { portfolioCategories } from './portfolio'
import { artworkByProject } from './artwork'
import { categorySummary } from './navigation'
import { MobileImage } from './MobileMedia'
import { publicAsset } from './publicAsset'
import mobileMedia from './mobileDemoMedia.json'
import { Icon } from './Icons'
import './mobile-work.css'

const coverOf = project => artworkByProject[project.id]?.cover || project.cover
const categoryVideos = {
  visual: '/media/visual/futurus-anniversary-mobile.mp4',
  photo: '/media/photo/photography-mobile.mp4',
  launch: '/media/launch/launch-mobile.mp4',
  ip: '/media/ip/xiaoke-mobile.mp4',
  film: '/media/film/film-mobile.mp4',
}

function WorkFooter({ onBackToTop }) {
  return <footer className="mw-footer">
    <span>Stomae Wang</span>
    <button type="button" aria-label="回到顶部" onClick={onBackToTop || (() => window.scrollTo({
      top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    }))}><Icon name="diagonal"/></button>
  </footer>
}

function WorkOverview({ onBackToTop }) {
  return <section className="mw-overview" aria-labelledby="mobile-work-heading">
    <header className="mw-index-heading"><h1 id="mobile-work-heading">项目总览</h1><p>2019–2026</p></header>
    <div className="mw-index-rows">{portfolioCategories.map((group, index) => {
      const { entries, period, showPeriod } = categorySummary(group.id)
      const cover = group.overviewCover || coverOf(entries[0])
      return <a className={`mw-index-row mw-index-row-${group.id}`} href={`#work/${group.id}`} key={group.id}
        aria-label={`${group.title}，${group.chinese}${showPeriod ? `，${period}` : ''}`}>
        <MobileImage src={cover.image} alt="" width={cover.width} height={cover.height}
          priority={index < 2} className="mw-index-image" retryable={false}/>
        <div className="mw-index-content">
          <h2>{group.title}</h2>
          <span className="mw-index-label">{group.chinese}</span>
          {showPeriod && <span className="mw-index-period">{period}</span>}
        </div>
      </a>
    })}</div>
    <WorkFooter onBackToTop={onBackToTop}/>
  </section>
}

function CategoryHeading({ group, cover, period, playbackEnabled }) {
  const video = useRef(null)
  const visibility = useRef(false)
  const playbackAllowed = useRef(playbackEnabled)
  const intent = useRef(null)
  const sync = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [hasFrame, setHasFrame] = useState(false)
  const poster = publicAsset(mobileMedia.images[cover.image]?.src || cover.image)
  playbackAllowed.current = playbackEnabled

  useEffect(() => {
    const element = video.current
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    let disposed = false
    let playRequest = 0
    let measureFrame
    let measureVisibility
    visibility.current = false
    setHasFrame(false)
    const play = () => {
      if (!element.paused) return
      const request = ++playRequest
      if (!element.getAttribute('src') || element.error) {
        element.src = publicAsset(categoryVideos[group.id])
        element.load()
      }
      element.muted = true
      element.play()?.catch(() => { if (!disposed && request === playRequest) setPlaying(false) })
    }
    sync.current = () => {
      if (playbackAllowed.current && (intent.current ?? !reduced.matches) && visibility.current && !document.hidden) play()
      else {
        playRequest += 1
        element.pause()
      }
    }
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
      visibility.current = entry.isIntersecting && entry.intersectionRatio >= .1
      sync.current?.()
    }, { threshold: [0, .1], rootMargin: '-76px 0px -88px 0px' }) : null
    observer?.observe(element)
    if (!observer) {
      measureVisibility = () => {
        cancelAnimationFrame(measureFrame)
        measureFrame = requestAnimationFrame(() => {
          const rect = element.getBoundingClientRect()
          const available = Math.max(0, Math.min(rect.bottom, innerHeight - 88) - Math.max(rect.top, 76))
          visibility.current = rect.width > 0 && rect.height > 0 && available / rect.height >= .1
          sync.current?.()
        })
      }
      window.addEventListener('scroll', measureVisibility, { passive: true })
      window.addEventListener('resize', measureVisibility)
      measureVisibility()
    }
    document.addEventListener('visibilitychange', sync.current)
    reduced.addEventListener('change', sync.current)
    sync.current()
    const handler = sync.current
    return () => {
      disposed = true
      playRequest += 1
      sync.current = null
      observer?.disconnect()
      cancelAnimationFrame(measureFrame)
      if (measureVisibility) {
        window.removeEventListener('scroll', measureVisibility)
        window.removeEventListener('resize', measureVisibility)
      }
      document.removeEventListener('visibilitychange', handler)
      reduced.removeEventListener('change', handler)
      element.pause()
      element.removeAttribute('src')
      element.load()
    }
  }, [group.id])

  useEffect(() => { sync.current?.() }, [playbackEnabled])

  return <header className={`mw-category-hero mw-category-hero-${group.id}`}>
    <MobileImage src={cover.image} alt="" width={cover.width} height={cover.height} priority
      className={`mw-category-still${hasFrame ? ' is-playing' : ''}`} retryable={false}/>
    <video ref={video} className="mw-category-video" muted playsInline loop preload="none" poster={poster}
      aria-hidden="true" onPlaying={() => {
        if (!playbackAllowed.current || !visibility.current || document.hidden) video.current?.pause()
        else { setHasFrame(true); setPlaying(true) }
      }} onPause={() => setPlaying(false)} onError={() => { setHasFrame(false); setPlaying(false) }}/>
    <div className="mw-category-shade"/>
    <h1 id="mobile-category-heading">{group.title}</h1>
    <span className="mw-category-chinese">{group.chinese}</span>
    {period && <span className="mw-category-period">{period}</span>}
    <button type="button" className="mw-category-motion" aria-label={playing ? '暂停分类背景视频' : '播放分类背景视频'}
      onClick={() => { intent.current = !playing; sync.current?.() }}><Icon name={playing ? 'pause' : 'play'}/></button>
  </header>
}

function CategoryArchive({ category, onBackToTop, playbackEnabled }) {
  const group = portfolioCategories.find(item => item.id === category)
  const { entries, period } = categorySummary(category)
  if (!group || !entries.length) return <WorkOverview onBackToTop={onBackToTop}/>
  const cover = group.overviewCover || coverOf(entries[0])

  return <section className="mw-category" aria-labelledby="mobile-category-heading">
    <CategoryHeading group={group} cover={cover} period={period} playbackEnabled={playbackEnabled}/>
    <div className="mw-archive-heading"><span>{group.chinese}</span><span>{String(entries.length).padStart(2, '0')} projects</span></div>
    <div className="mw-projects">{entries.map((project, index) => {
      const art = coverOf(project)
      const year = project.period || project.year
      return <article className="mw-project" key={project.id}>
        <header className="mw-project-heading">
          <p>{project.client}</p>
          <h2><a href={`#work/${category}/project/${project.id}`}>{project.title}</a></h2>
        </header>
        <MobileImage src={art.image} alt={art.alt || art.caption || project.title} width={art.width} height={art.height}
          priority={index === 0} className="mw-project-cover" style={art.fit === 'contain' ? undefined : { aspectRatio: '5 / 3' }}/>
        <div className="mw-project-bottom">
          <p>{year && <span className="mw-project-year">{year}</span>}<span>{project.format}</span></p>
          <span className="mw-project-open" aria-hidden="true">View<i/>project</span>
        </div>
      </article>
    })}</div>
    <WorkFooter onBackToTop={onBackToTop}/>
  </section>
}

export default function MobileWork({ category, onBackToTop, playbackEnabled = true }) {
  return category ? <CategoryArchive key={category} category={category} onBackToTop={onBackToTop} playbackEnabled={playbackEnabled}/>
    : <WorkOverview onBackToTop={onBackToTop}/>
}
