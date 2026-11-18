import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { projects } from './portfolio'
import { artworkByProject } from './artwork'
import { parseRoute } from './navigation'
import BrandMark from './BrandMark'
import { Icon } from './Icons'
import { MobileImage } from './MobileMedia'
import MobileProject from './MobileProject'
import MobileWork from './MobileWork'
import { MobileAbout, MobileContact } from './MobileProfile'
import { MobileOpening, MobileRouteTransition } from './MobileMotion'
import './typography.css'
import './mobile-demo.css'

const featuredIds = ['brand-website', 'livestream-optimization', 'cafe']
const featured = featuredIds.map(id => projects.find(project => project.id === id))
const navigation = [['work', '作品'], ['about', '关于'], ['contact', '联系我']]
const pageNames = { home: '首页', work: '作品', about: '关于', contact: '联系我' }
const coverOf = project => artworkByProject[project.id]?.cover || project.cover
const routeKey = route => route.projectId ? `${route.base}/project/${route.projectId}` : route.base

function Home() {
  const [motion, setMotion] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  return <section className="m-home" aria-labelledby="mobile-home-title">
    <h1 className="m-home-title" id="mobile-home-title">
      <span>STOMAE WANG</span>
      <span>PORTFOLIO<br/>2019–2026</span>
    </h1>
    <div className="m-home-stage" aria-label="精选作品" data-motion={motion ? 'running' : 'paused'}>
      {featured.map((project, index) => {
        const cover = coverOf(project)
        return <article className={`m-floating-art m-floating-art-${index}`} key={project.id}>
          <MobileImage src={cover.image} width={cover.width} height={cover.height} alt={project.title} priority/>
          <a href={`#home/project/${project.id}`} aria-label={`查看项目：${project.title}`}/>
        </article>
      })}
      <button className="m-stage-control" type="button" aria-label={motion ? '暂停画面动效' : '开启画面动效'}
        aria-pressed={motion} onClick={() => setMotion(value => !value)}><Icon name={motion ? 'pause' : 'play'}/></button>
    </div>
  </section>
}

export default function MobileDemo() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  const current = useRef(route)
  const positions = useRef(new Map())
  const pending = useRef(null)
  const sequence = useRef(0)
  const [transitionId, setTransitionId] = useState(null)
  const [intro, setIntro] = useState(() => route.section === 'home' && !route.projectId)
  const project = projects.find(item => item.id === route.projectId)
  const home = route.section === 'home' && !project
  const transitioning = transitionId !== null
  const title = project?.title || pageNames[route.section]

  const requestRoute = useCallback(next => {
    const before = current.current
    if (pending.current) {
      if (pending.current.covered) pending.current.queued = next
      else pending.current.next = next
      return
    }
    if (routeKey(before) === routeKey(next)) return
    positions.current.set(routeKey(before), window.scrollY)
    setIntro(false)
    const id = ++sequence.current
    pending.current = { id, next, covered: false, queued: null }
    setTransitionId(id)
  }, [])

  useEffect(() => {
    const update = () => requestRoute(parseRoute(window.location.hash))
    window.addEventListener('hashchange', update)
    window.addEventListener('popstate', update)
    return () => {
      window.removeEventListener('hashchange', update)
      window.removeEventListener('popstate', update)
    }
  }, [requestRoute])

  const covered = useCallback(() => {
    const scene = pending.current
    if (!scene) return
    scene.covered = true
    const before = current.current
    if (scene.next.projectId && !before.projectId && before.base === scene.next.base) {
      history.replaceState({ ...history.state, mobileDemoFrom: before.base }, '')
    }
    current.current = scene.next
    flushSync(() => setRoute(scene.next))
  }, [])

  const completeTransition = useCallback(() => {
    const queued = pending.current?.queued
    pending.current = null
    setTransitionId(null)
    if (queued && routeKey(queued) !== routeKey(current.current)) requestRoute(queued)
  }, [requestRoute])

  const completeIntro = useCallback(() => setIntro(false), [])

  useLayoutEffect(() => {
    document.title = `${title} — Stomae Wang 王宣凯`
    if (home) document.documentElement.dataset.mobileHome = ''
    else delete document.documentElement.dataset.mobileHome
    window.scrollTo({ top: home ? 0 : positions.current.get(routeKey(route)) || 0, behavior: 'instant' })
    return () => { delete document.documentElement.dataset.mobileHome }
  }, [route, title, home])

  const back = () => {
    if (project) {
      if (history.state?.mobileDemoFrom === route.base) history.back()
      else window.location.hash = route.base
    } else window.location.hash = route.category ? '#work' : '#home'
  }
  const backLabel = project ? route.section === 'home' ? '返回首页' : '返回作品列表'
    : route.category ? '返回项目总览' : '返回首页'

  return <div className={`m-app${home ? ' m-app-home' : ''}`} data-intro={intro ? 'true' : undefined}
    data-route-transition={transitioning ? '' : undefined}>
    <header className="m-header" inert={intro || transitioning}>
      <button type="button" className="m-home-return" onClick={back} aria-label={backLabel}><BrandMark/></button>
    </header>
    <main className={`m-main${home ? ' m-main-home' : ''}`} id="mobile-main" key={routeKey(route)} inert={intro || transitioning}>
      {project ? <MobileProject project={project} onBack={back} playbackEnabled={!transitioning}
        backLabel={route.section === 'home' ? '返回首页' : '返回作品'}/>
        : home ? <Home/>
          : route.section === 'work' ? <MobileWork category={route.category} playbackEnabled={!transitioning}/>
            : route.section === 'about' ? <MobileAbout/> : <MobileContact/>}
    </main>
    <nav className="m-bottom-nav" aria-label="主导航" inert={intro || transitioning}>
      {navigation.map(([section, label]) => <a key={section} href={`#${section}`}
        className={section === 'contact' ? 'm-nav-contact' : undefined}
        aria-current={route.section === section ? 'page' : undefined}>
        <span>{label}</span>{section === 'contact' && <Icon name="diagonal"/>}
      </a>)}
    </nav>
    {intro && <MobileOpening onComplete={completeIntro}/>}
    <MobileRouteTransition id={transitionId} onCovered={covered} onComplete={completeTransition}/>
  </div>
}
