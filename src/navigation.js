import { portfolioCategories, projects } from './portfolio.js'
import { getProjectGallery } from './projectGallery.js'

const sections = new Set(['home', 'work', 'about', 'contact'])
const categoryIds = new Set(portfolioCategories.map(item => item.id))
const projectIds = new Set(projects.map(item => item.id))

function isGalleryImage(project, index) {
  if (!project || !Number.isSafeInteger(index) || index < 0) return false
  const item = getProjectGallery(project)[index]
  return Boolean(item && !item.video)
}

export function parseRoute(hash = '') {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const section = sections.has(parts[0]) ? parts[0] : 'home'
  const category = section === 'work' && categoryIds.has(parts[1]) ? parts[1] : null
  const base = `#${section}${category ? `/${category}` : ''}`
  const projectIndex = category ? 2 : 1
  const candidate = parts[projectIndex] === 'project' ? parts[projectIndex + 1] : null
  const projectId = projectIds.has(candidate) ? candidate : null
  const imagePart=parts[projectIndex+2]==='image'?parts[projectIndex+3]:null
  const imageNumber=imagePart!==null&&/^\d+$/.test(imagePart)?Number(imagePart):null
  const project=projects.find(item=>item.id===projectId)
  const imageIndex=isGalleryImage(project,imageNumber)?imageNumber:null
  return { section, category, base, projectId, imageIndex }
}

export function projectHref(route, projectId) {
  return projectIds.has(projectId) ? `${route.base}/project/${projectId}` : route.base
}

export function imageHref(route,projectId,index) {
  const project=projects.find(item=>item.id===projectId)
  const base=projectHref(route,projectId)
  return isGalleryImage(project,index)?`${base}/image/${index}`:base
}

export function routeMotion(from, to) {
  if (from.projectId !== to.projectId && (from.projectId || to.projectId)) {
    return { kind: 'project', returning: Boolean(from.projectId && !to.projectId) }
  }
  if (from.section !== to.section) return { kind: 'brand' }
  if (from.section === 'work' && to.section === 'work' && from.category !== to.category) {
    return { kind: 'project', returning: Boolean(from.category && !to.category) }
  }
  return null
}

export function categorySummary(id) {
  const category = portfolioCategories.find(item => item.id === id)
  const entries = projects.filter(project => project.category === id)
  const years = entries.flatMap(project => (project.period || project.year || '').match(/\d{4}/g) || []).map(Number)
  const first = Math.min(...years), last = Math.max(...years)
  return { entries, count: entries.length, hasUndated: entries.some(project => !(project.period || project.year)), period: category?.period || (years.length ? first === last ? `${first}` : `${first}–${last}` : ''), showPeriod: Boolean(category?.period || (years.length && entries.every(project => project.period || project.year))) }
}
