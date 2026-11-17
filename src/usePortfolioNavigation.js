import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { artworkByProject } from './artwork.js'
import { portfolioCategories, projects } from './portfolio.js'
import { parseRoute, projectHref, routeMotion } from './navigation.js'
import { createRouteTransition, readCover } from './routeTransition.js'

const sceneKey = route => `${route.base}|${route.projectId || ''}`
const routeKey = route => `${sceneKey(route)}|${route.imageIndex ?? ''}`

function visibleCover(host, page, subject, trigger) {
  const matching = readCover(trigger)
  if (matching) return matching
  if (!subject.projectId) return readCover(host.querySelector(`.index-row-${subject.category}`))
  if (page.section === 'home') {
    const cards = host.querySelectorAll(`.flow-project[data-project-id="${subject.projectId}"]:not([hidden])`)
    for (const card of cards) {
      const cover = readCover(card)
      if (cover) return cover
    }
    return null
  }
  return readCover(host.querySelector(`.visual-project-link[href="${projectHref(page, subject.projectId)}"]`))
}

function defaultCover(subject) {
  const category = portfolioCategories.find(item => item.id === subject.category)
  const project = projects.find(item => subject.projectId ? item.id === subject.projectId : item.category === subject.category)
  if (!subject.projectId && category?.overviewCover) return category.overviewCover.image
  return artworkByProject[project?.id]?.cover?.image || project?.cover?.image
}

export default function usePortfolioNavigation(app, finishTextReveal) {
  const [route, setRoute] = useState(() => parseRoute(location.hash))
  const [transitioning, setTransitioning] = useState(false)
  const current = useRef(route)
  const transition = useRef(null)
  const pending = useRef(null)
  const backPending = useRef(false)
  const origins = useRef(new Map())

  useLayoutEffect(() => {
    const animator = createRouteTransition(app.current, setTransitioning)
    transition.current = animator
    return () => {
      animator.dispose()
      transition.current = null
      pending.current = null
    }
  }, [app])

  const navigate = useCallback((href, { historyMode = 'push', state = null, trigger } = {}) => {
    const before = current.current
    const next = parseRoute(href)
    const key = routeKey(next)
    if (pending.current === key) return
    if (key === routeKey(before)) {
      if (pending.current) {
        pending.current = null
        transition.current?.cancel()
      }
      return
    }

    const effect = routeMotion(before, next)
    const update = () => {
      if (historyMode === 'push') history.pushState(state, '', href)
      if (historyMode === 'replace') history.replaceState(state, '', href)
      pending.current = null
      const result = {
        ...next,
        screenMotion: before.base === next.base ? before.screenMotion : Boolean(effect),
        opensWithPageTransition: before.projectId === next.projectId
          ? before.opensWithPageTransition : Boolean(effect && next.projectId),
      }
      current.current = result
      if (effect) flushSync(() => setRoute(result))
      else setRoute(result)
    }

    const animator = transition.current
    if (!effect || !animator) {
      animator?.cancel()
      update()
      return
    }
    pending.current = key
    finishTextReveal.current?.()
    if (effect.kind !== 'project') {
      animator.play(effect, update)
      return
    }

    const host = app.current
    const subject = effect.returning ? before : next
    const entry = origins.current.get(sceneKey(subject))
    const source = effect.returning ? entry : visibleCover(host, before, subject, trigger)
    if (source && !effect.returning) origins.current.set(sceneKey(subject), source)
    animator.play({ ...effect, source, cover: defaultCover(subject),
      getDestination: () => visibleCover(host, next, subject, entry?.element),
    }, update)
  }, [app, finishTextReveal])

  useEffect(() => {
    const sync = () => {
      backPending.current = false
      navigate(location.hash, { historyMode: 'native' })
    }
    window.addEventListener('hashchange', sync)
    window.addEventListener('popstate', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [navigate])

  const returnTo = (href, wasOpenedHere, state = null) => {
    if (backPending.current || pending.current) return
    if (wasOpenedHere) {
      backPending.current = true
      history.back()
    } else navigate(href, { historyMode: 'replace', state })
  }

  function followLink(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = event.target.closest?.('a[href^="#"]')
    if (!link || (link.target && link.target !== '_self') || !/^#\/?(?:home|work|about|contact)(?:\/|$)/.test(link.hash)) return
    event.preventDefault()
    navigate(link.hash, { trigger: link })
  }

  return { route, navigate, returnTo, followLink, transitioning }
}
