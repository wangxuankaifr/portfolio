import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { projects } from './portfolio'
import { parseRoute } from './navigation'
import MobileProject from './MobileProject'
import MobileNav from './MobileNav'
import MobileArtworkHero from './MobileArtworkHero'
import MobileWork from './MobileWork'
import { MobileAbout, MobileContact } from './MobileProfile'
import { MobileOpening, MobileRouteTransition } from './MobileMotion'
import './typography.css'
import './mobile-demo.css'

const pageNames = { home: '首页', work: '作品', about: '关于', contact: '联系我' }
const routeKey = route => route.projectId ? `${route.base}/project/${route.projectId}` : route.base

function Home({ paused }) {
  return <section className="m-home" aria-labelledby="mobile-home-title">
    <MobileArtworkHero paused={paused} onSelect={project => { window.location.hash = `#home/project/${project.id}` }}/>
    <h1 className="m-home-title" id="mobile-home-title">
      <span>Stomae<br/>Wang</span>
      <span>PORTFOLIO<br/>2019–2026</span>
    </h1>
    <p className="m-home-quote">Great products<br/>are triumphs of taste.</p>
  </section>
}

export default function MobileDemo() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  const current = useRef(route)
  const positions = useRef(new Map())
  const main = useRef(null)
  const focusFrame = useRef(0)
  useEffect(() => () => cancelAnimationFrame(focusFrame.current), [])
  const pending = useRef(null)
  const sequence = useRef(0)
  const [transitionId, setTransitionId] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
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
    setMenuOpen(false)
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
    cancelAnimationFrame(focusFrame.current)
    if (queued && routeKey(queued) !== routeKey(current.current)) requestRoute(queued)
    else focusFrame.current = requestAnimationFrame(() => main.current?.focus({ preventScroll: true }))
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
    <MobileNav section={route.section} open={menuOpen} onOpenChange={setMenuOpen} onBack={back}
      backLabel={backLabel} disabled={intro || transitioning}/>
    <main className={`m-main${home ? ' m-main-home' : ''}`} id="mobile-main" ref={main} tabIndex={-1} aria-label={title} key={routeKey(route)} inert={intro || transitioning || menuOpen}>
      {project ? <MobileProject project={project} onBack={back} playbackEnabled={!transitioning && !menuOpen}
        backLabel={route.section === 'home' ? '返回首页' : '返回作品'}/>
        : home ? <Home paused={intro || menuOpen || transitioning}/>
          : route.section === 'work' ? <MobileWork category={route.category} playbackEnabled={!transitioning && !menuOpen}/>
            : route.section === 'about' ? <MobileAbout/> : <MobileContact/>}
    </main>
    {intro && <MobileOpening onComplete={completeIntro}/>}
    <MobileRouteTransition id={transitionId} onCovered={covered} onComplete={completeTransition}/>
  </div>
}
