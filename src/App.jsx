import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { projects } from './portfolio'
import { projectHref, imageHref } from './navigation'
import PortfolioHero from './PortfolioHero'
import BrandMark from './BrandMark'
import OpeningDemo from './OpeningDemo'
import ProjectSheet from './ProjectSheet'
import { ProjectIndex, CategoryProjects } from './ProjectIndex'
import AboutPage from './AboutPage'
import { Contact } from './ProfilePages'
import { Arrow, Icon } from './Icons'
import usePortfolioNavigation from './usePortfolioNavigation'
import useSiteAudio from './useSiteAudio'
import useTextReveal from './useTextReveal'
import './pages.css'
import './site-sound.css'

function NavLabel({ label }) {
  return <span className="nav-roll" aria-hidden="true">
    {Array.from(label, (character, index) => <span className="nav-roll-character" key={index}
      data-character={character} style={{ '--nav-letter': index }}><span>{character}</span></span>)}
  </span>
}

function Header({ section, category, introPlaying }) {
  const [open, setOpen] = useState(false)
  const button = useRef(null)
  useEffect(() => {
    const escape = event => { if (event.key === 'Escape') { setOpen(false); button.current?.focus() } }
    const resize = () => { if (innerWidth > 760) setOpen(false) }
    if (open) window.addEventListener('keydown', escape)
    window.addEventListener('resize', resize)
    return () => { window.removeEventListener('keydown', escape); window.removeEventListener('resize', resize) }
  }, [open])
  return <><header className={`site-header header-light ${open ? 'menu-open' : ''}`} inert={introPlaying}><div className="wrap header-inner">
    <a href="#home" className="brand" aria-label="Stomae Wang 返回首页" onClick={() => setOpen(false)}><BrandMark className="brand-mark"/></a>
    <button ref={button} className="menu-toggle" aria-expanded={open} aria-controls="navigation" aria-label={open ? '关闭导航' : '打开导航'} onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'}/></button>
    <nav id="navigation" className={open ? 'is-open' : ''} aria-label="主导航">
      {[['work', '作品'], ['about', '关于']].map(([id, label]) => <a key={id} href={`#${id}`} aria-label={label}
        aria-current={section === id ? 'page' : undefined} onClick={() => setOpen(false)}><NavLabel label={label}/></a>)}
      <a href="#contact" className="nav-contact" aria-current={section === 'contact' ? 'page' : undefined} onClick={() => setOpen(false)}>
        <span className="nav-contact-content">
          <Arrow diagonal className="nav-contact-arrow-start"/>
          <span className="nav-contact-label">联系我</span>
          <Arrow diagonal className="nav-contact-arrow-end"/>
        </span>
      </a>
    </nav>
  </div></header>
  {category && <a href="#work" className="icon-back-link visual-back" aria-label="返回项目总览" onClick={() => setOpen(false)}><Icon name="back"/></a>}
  </>
}

const pageNames = {home:'首页',work:'项目总览',about:'关于',contact:'联系我'}

export default function App() {
  const app = useRef(null)
  const finishTextReveal = useTextReveal(app)
  const { route, navigate, returnTo, followLink, transitioning } = usePortfolioNavigation(app, finishTextReveal)
  const [introPhase, setIntroPhase] = useState(() => {
    const requested = new URLSearchParams(location.search).get('intro') === 'demo'
    return requested && route.section === 'home' && !route.projectId &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'loading' : null
  })
  const main = useRef(null), screen = useRef(null), scrollPositions = useRef(new Map()), initial = useRef(true)
  const project = projects.find(item => item.id === route.projectId)
  const sound = useSiteAudio(!project)
  const home = route.section === 'home'
  const introPlaying = introPhase !== null && home && !project
  useEffect(() => {
    if (!home || project) setIntroPhase(null)
  }, [home, project])
  useLayoutEffect(() => {
    const el=screen.current
    const savedPosition=scrollPositions.current.get(route.base) || 0
    if (el) el.scrollTop=savedPosition
    // Restore after the browser finishes any native hash-anchor positioning.
    const frame=requestAnimationFrame(() => { if(el) el.scrollTop=savedPosition })
    if (!initial.current && !project) main.current?.focus({preventScroll:true})
    initial.current=false
    document.title=`${pageNames[route.section]} — Stomae Wang 王宣凯`
    return () => cancelAnimationFrame(frame)
  }, [route.base])
  const backToTop = () => {
    main.current?.focus({preventScroll:true})
    screen.current?.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }
  const onSelect = (selected, trigger) => {
    if (selected) navigate(projectHref(route, selected.id), { state: { portfolioDialog: true }, trigger })
  }
  const closeProject = () => returnTo(route.base, history.state?.portfolioDialog)
  const openImage = index => navigate(imageHref(route, project.id, index), { state: { ...history.state, portfolioImage: true } })
  const closeImage = () => returnTo(projectHref(route, project.id), history.state?.portfolioImage, history.state)
  return <div ref={app} className="site-shell" data-opening-demo={introPlaying ? '' : undefined} onClick={followLink}>
    <a className="skip-link" href="#main" inert={introPlaying} onClick={event => {event.preventDefault();main.current?.focus()}}>跳至主要内容</a><Header section={route.section} category={route.category} introPlaying={introPlaying}/>
    <main id="main" className="site-main" ref={main} tabIndex={-1} aria-label={pageNames[route.section]} inert={introPlaying}>
      <div className={`home-view${home ? '' : ' is-away'}`} aria-hidden={!home} inert={!home}><PortfolioHero onSelect={onSelect} dialogOpen={!home || Boolean(project) || transitioning || (introPlaying && introPhase === 'loading')}/></div>
      {!home && <div className={`page-screen page-screen-${route.section}${route.screenMotion ? ' enters-with-transition' : ''}`} key={route.base} ref={screen} onScroll={event => scrollPositions.current.set(route.base,event.currentTarget.scrollTop)}>
        {route.section === 'work' && (route.category
          ? <CategoryProjects category={route.category} onSelect={onSelect} onBackToTop={backToTop}/>
          : <ProjectIndex onBackToTop={backToTop}/>)}
        {route.section === 'about' && <AboutPage/>}
        {route.section === 'contact' && <Contact/>}
      </div>}
    </main>
    {!project && <button type="button" className="site-sound-toggle" aria-label="网站声音" aria-pressed={sound.enabled}
      data-above-footer={home || route.section === 'work' ? '' : undefined} inert={introPlaying}
      title={sound.enabled ? '关闭网站声音' : '开启网站声音'} onClick={sound.toggle}>
      <span className="site-sound-ring" aria-hidden="true"/>
    </button>}
    {project && <ProjectSheet key={project.id} project={project} opensWithPageTransition={route.opensWithPageTransition} transitioning={transitioning}
      onClose={closeProject} imageIndex={route.imageIndex} onImageOpen={openImage} onImageClose={closeImage}/>}
    {introPlaying && <OpeningDemo onPhase={setIntroPhase}/>}
  </div>
}
