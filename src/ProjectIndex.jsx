import { portfolioCategories } from './portfolio'
import { artworkByProject } from './artwork'
import { categorySummary } from './navigation'
import { Arrow, Icon } from './Icons'
import { CategoryVideoHeading } from './CategoryVideoHeading'
import { publicAsset } from './publicAsset'
import './visual-category.css'

const coverOf = project => artworkByProject[project.id]?.cover || project.cover
const categoryVideos = {
  visual: {
    desktop: '/media/visual/futurus-anniversary-desktop.mp4',
    mobile: '/media/visual/futurus-anniversary-mobile.mp4',
    poster: '/media/visual/futurus-anniversary-poster.jpg',
  },
  photo: {
    desktop: '/media/photo/photography-desktop.mp4',
    mobile: '/media/photo/photography-mobile.mp4',
    poster: '/media/photo/photography-poster.jpg',
  },
  ip: {
    desktop: '/media/ip/xiaoke-desktop.mp4',
    mobile: '/media/ip/xiaoke-mobile.mp4',
    poster: '/media/ip/xiaoke-poster.jpg',
  },
  launch: {
    desktop: '/media/launch/launch-desktop.mp4',
    mobile: '/media/launch/launch-mobile.mp4',
    poster: '/media/launch/launch-poster.jpg',
  },
  film: {
    desktop: '/media/film/film-desktop.mp4',
    mobile: '/media/film/film-mobile.mp4',
    poster: '/media/film/film-poster.jpg',
  },
}

function PortfolioFooter({ className, name, onBackToTop }) {
  return <footer className={`portfolio-footer ${className}`}>
    <span>{name}</span>
    <button type="button" className="portfolio-back-to-top" aria-label="回到顶部" onClick={onBackToTop}>
      <Icon name="diagonal"/>
    </button>
  </footer>
}

export function ProjectIndex({ onBackToTop }) {
  return <section className="project-index" aria-labelledby="index-heading">
    <div className="index-heading wrap"><h1 id="index-heading">项目总览</h1><p>2019–2026</p></div>
    <div className="index-rows">{portfolioCategories.map(group => {
      const {entries,period,showPeriod} = categorySummary(group.id)
      const art = group.overviewCover ?? coverOf(entries[0])
      return <a className={`index-row index-row-${group.id}`} key={group.id} href={`#work/${group.id}`} aria-label={`${group.title}，${group.chinese}${showPeriod?`，${period}`:''}`}>
        <figure className="index-preview" aria-hidden="true">
          <img src={publicAsset(art.image)} alt="" width={art.width} height={art.height} decoding="async"/>
        </figure>
        <div className="index-row-inner wrap">
          <span className="index-category-label">{group.chinese}</span>
          <h2>{group.title}</h2>
          <span className="index-row-meta">{showPeriod&&period}</span>
          <span className="index-row-arrow"><Arrow diagonal/></span>
        </div>
      </a>
    })}</div>
    <PortfolioFooter className="index-footer wrap" name="Stomae Wang" onBackToTop={onBackToTop}/>
  </section>
}

export function CategoryProjects({ category, onSelect, onBackToTop }) {
  const group = portfolioCategories.find(item => item.id === category)
  const {entries,period} = categorySummary(category)
  const video = categoryVideos[category]
  return <section className={`visual-category visual-category-${category}`} aria-labelledby="category-heading">
    {video && <CategoryVideoHeading key={category} period={period} media={video}>{group.title}</CategoryVideoHeading>}
    <div className="wrap">
      <div className="visual-archive">
        {!video && <><header className="visual-heading">
          <h1 id="category-heading">{group.title}</h1>
        </header>
        <div className="visual-toolbar">
          <p>{period}</p>
        </div></>}
        <div className="visual-projects">{entries.map((project, index) => {
          const art = coverOf(project)
          const year = project.period || project.year
          const coverRatio = art.fit === 'contain' ? `${art.width} / ${art.height}` : undefined
          return <article className="visual-project" key={project.id}>
            <a className="visual-project-link" href={`#work/${category}/project/${project.id}`} aria-labelledby={`visual-title-${project.id}`} onClick={event => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
              event.preventDefault()
              onSelect(project, event.currentTarget)
            }}>
              <p className="visual-project-client">{project.client}</p>
              <h2 id={`visual-title-${project.id}`}>{project.title}</h2>
              <p className="visual-project-details">{year && <span className="visual-project-year">{year}</span>}<span>{project.format}</span></p>
              <figure className="visual-project-cover" style={{ aspectRatio: coverRatio }}>
                <img src={publicAsset(art.image)} alt={art.alt || art.caption || project.title} width={art.width} height={art.height} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" style={{objectFit:art.fit || 'cover'}}/>
              </figure>
              <span className="visual-project-open" aria-hidden="true"><span>View</span><i/><span>project</span></span>
            </a>
          </article>
        })}</div>
        <PortfolioFooter className="visual-footer" name="Stromae Wang" onBackToTop={onBackToTop}/>
      </div>
    </div>
  </section>
}
