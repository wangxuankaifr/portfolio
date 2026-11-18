import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { portfolioCategories, projects } from './portfolio'
import { artworkByProject } from './artwork'
import { parseRoute } from './navigation'
import BrandMark from './BrandMark'
import { Icon } from './Icons'
import { MobileImage } from './MobileMedia'
import MobileProject from './MobileProject'
import { MobileAbout, MobileContact } from './MobileProfile'
import './typography.css'
import './mobile-demo.css'

const featuredIds = ['brand-website', 'livestream-optimization', 'cafe']
const featured = featuredIds.map(id => projects.find(project => project.id === id))
const navigation = [['work', '作品'], ['about', '关于'], ['contact', '联系我']]
const pageNames = { home: '首页', work: '作品', about: '关于', contact: '联系我' }
const coverOf = project => artworkByProject[project.id]?.cover || project.cover
const hrefOf = (project, base = '#work') => `${base}/project/${project.id}`
const routeKey = route => route.projectId ? `${route.base}/project/${route.projectId}` : route.base

function ProjectCard({ project, priority = false, className = '', base = '#work' }) {
  const cover = coverOf(project)
  return <article className={`m-project-card ${className}`}>
    <MobileImage src={cover.image} width={cover.width} height={cover.height}
      alt={cover.alt || project.title} priority={priority} className="m-project-cover"/>
    <a href={hrefOf(project, base)} className="m-card-link">
      <div>
        <h3>{project.title}</h3>
        <p>{project.company || project.client}<span>{project.period || project.year}</span></p>
      </div>
      <Icon name="diagonal"/>
    </a>
  </article>
}

function Home() {
  const [motion, setMotion] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  return <>
    <section className="m-home" aria-labelledby="mobile-home-title">
      <div className="m-home-titles">
        <h1 id="mobile-home-title">Stomae<br/>Wang</h1>
        <p className="m-home-edition">PORTFOLIO<span>2019–2026</span></p>
      </div>
      <div className="m-home-positioning">
        <p>Brand Design Lead<br/>Art Direction<br/>Brand Identity &amp; Visual Design</p>
        <p>Beijing,<br/>China</p>
      </div>
      <div className="m-home-stage" aria-label="精选作品" data-motion={motion ? 'running' : 'paused'}>
        {featured.map((project, index) => {
          const cover = coverOf(project)
          return <article className={`m-floating-art m-floating-art-${index}`} key={project.id}>
            <MobileImage src={cover.image} width={cover.width} height={cover.height}
              alt={project.title} priority/>
            <a href={hrefOf(project, '#home')} aria-label={`查看项目：${project.title}`}/>
          </article>
        })}
        <button className="m-stage-control" type="button" aria-label={motion ? '暂停画面动效' : '开启画面动效'}
          aria-pressed={motion} onClick={() => setMotion(value => !value)}><Icon name={motion ? 'pause' : 'play'}/></button>
      </div>
      <div className="m-home-bottom">
        <p>Great products are<br/>triumphs of taste.</p>
        <a className="m-round-link" href="#work" aria-label="查看全部作品"><Icon name="diagonal"/></a>
      </div>
    </section>
    <section className="m-featured" aria-labelledby="featured-heading">
      <header className="m-section-heading"><h2 id="featured-heading">精选作品</h2><a href="#work">全部作品<Icon name="right"/></a></header>
      {featured.map(project => <ProjectCard key={project.id} project={project} base="#home"/>)}
    </section>
    <a className="m-home-contact" href="#contact"><span>Let’s create<br/>something meaningful.</span><Icon name="diagonal"/></a>
  </>
}

function Work({ category }) {
  const group = portfolioCategories.find(item => item.id === category)
  const entries = category ? projects.filter(project => project.category === category) : projects
  return <section className="m-work" aria-labelledby="mobile-work-title">
    <header className="m-work-heading"><h1 id="mobile-work-title">{group?.title || 'Selected\nworks.'}</h1><p>{group?.period || '2019–2026'}</p></header>
    <nav className="m-filters" aria-label="作品分类">
      <a href="#work" aria-current={!category ? 'page' : undefined}>全部</a>
      {portfolioCategories.map(item => <a href={`#work/${item.id}`} key={item.id}
        aria-current={category === item.id ? 'page' : undefined}>{item.title}</a>)}
    </nav>
    <div className="m-work-list">
      {entries.map((project, index) => <ProjectCard key={project.id} project={project} priority={index === 0}
        base={category ? `#work/${category}` : '#work'}/>)}
    </div>
    <footer className="m-work-footer"><span>Stomae Wang</span><button type="button" aria-label="回到顶部"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Icon name="diagonal"/></button></footer>
  </section>
}

export default function MobileDemo() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  const positions = useRef(new Map())
  const project = projects.find(item => item.id === route.projectId)
  const title = project?.title || pageNames[route.section]

  useEffect(() => {
    const update = () => {
      positions.current.set(routeKey(route), window.scrollY)
      const next = parseRoute(window.location.hash)
      if (next.projectId && !route.projectId && route.base === next.base) {
        history.replaceState({ ...history.state, mobileDemoFrom: route.base }, '')
      }
      setRoute(next)
    }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [route])

  useLayoutEffect(() => {
    document.title = `${title} — Stomae Wang 王宣凯`
    window.scrollTo({ top: positions.current.get(routeKey(route)) || 0, behavior: 'instant' })
  }, [route, title])

  const back = () => {
    if (history.state?.mobileDemoFrom === route.base) history.back()
    else window.location.hash = route.base
  }

  return <div className="m-app">
    <header className={`m-header${project ? ' m-header-project' : ''}`}>
      {project ? <button className="m-header-back" onClick={back} aria-label="返回作品列表"><Icon name="back"/></button>
        : <a className="m-brand" href="#home" aria-label="Stomae Wang 返回首页"><BrandMark/></a>}
      <span className="m-header-title">{project ? project.title : route.section === 'home' ? '王宣凯' : pageNames[route.section]}</span>
      {project ? <a className="m-header-home" href="#work" aria-label="查看所有作品"><Icon name="close"/></a>
        : <span className="m-header-location">Beijing, China</span>}
    </header>
    <main className="m-main" id="mobile-main" key={routeKey(route)}>
      {project ? <MobileProject project={project} onBack={back}/>
        : route.section === 'home' ? <Home/>
          : route.section === 'work' ? <Work category={route.category}/>
            : route.section === 'about' ? <MobileAbout/>
              : <MobileContact/>}
    </main>
    <nav className="m-bottom-nav" aria-label="主导航">
      {navigation.map(([section, label]) => <a key={section} href={`#${section}`}
        aria-current={route.section === section ? 'page' : undefined}>
        <span>{label}</span>{section === 'contact' && <Icon name="diagonal"/>}
      </a>)}
    </nav>
  </div>
}
