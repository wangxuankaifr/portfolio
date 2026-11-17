import test from 'node:test'
import assert from 'node:assert/strict'
import { parseRoute, projectHref, imageHref, categorySummary, routeMotion } from './navigation.js'
import { portfolioCategories } from './portfolio.js'

test('category and project direct links preserve their originating view', () => {
  const route = parseRoute('#work/launch/project/ecosystem')
  assert.deepEqual(route, { section:'work', category:'launch', base:'#work/launch', projectId:'ecosystem', imageIndex:null })
  assert.equal(projectHref(parseRoute('#about'), 'smart'), '#about/project/smart')
  assert.equal(parseRoute('#home/project/zero').projectId, 'zero')
})
test('invalid and legacy hashes resolve to a safe existing view', () => {
  assert.equal(parseRoute('#main').base, '#home')
  assert.equal(parseRoute('#expertise').base, '#home')
  assert.equal(parseRoute('#work/unknown/project/zero').base, '#work')
  assert.equal(parseRoute('#work/unknown/project/zero').projectId, null)
  assert.equal(parseRoute('#about/project/absent').projectId, null)
  assert.equal(parseRoute('#%E0%A4%A').base, '#home')
})

test('main destinations use one brand motion while project covers retain their reversible motion', () => {
  const overview = parseRoute('#work')
  const category = parseRoute('#work/visual')
  const detail = parseRoute('#work/visual/project/livestream-optimization')
  assert.deepEqual(routeMotion(overview, category), { kind: 'project', returning: false })
  assert.deepEqual(routeMotion(category, detail), { kind: 'project', returning: false })
  assert.deepEqual(routeMotion(detail, category), { kind: 'project', returning: true })
  assert.deepEqual(routeMotion(category, overview), { kind: 'project', returning: true })
  assert.equal(routeMotion(detail, parseRoute('#work/visual/project/livestream-optimization/image/0')), null)
  const destinations = ['#home', '#work', '#about', '#contact']
  for (const source of destinations) {
    for (const target of destinations) {
      const expected = source === target ? null : { kind: 'brand' }
      assert.deepEqual(routeMotion(parseRoute(source), parseRoute(target)), expected)
    }
  }
  assert.deepEqual(routeMotion(category, parseRoute('#about')), { kind: 'brand' })
})
test('category ranges use the latest confirmed overview dates', () => {
  assert.deepEqual(portfolioCategories.map(({ id }) => {
    const { count, period } = categorySummary(id)
    return [id, count, period]
  }), [['visual',14,'2019–2026'],['photo',1,'2021–2025'],['launch',2,'2021–2025'],['ip',1,'2026'],['film',3,'2019–2021']])
})

test('new cases remain addressable with the confirmed November 12 metadata', () => {
  for(const id of ['mercedes-social','sf-motors','volkswagen']) assert.equal(parseRoute(`#work/visual/project/${id}`).projectId,id)
  assert.equal(categorySummary('visual').hasUndated,false)
  assert.equal(categorySummary('visual').showPeriod,true)
})

test('image links stay inside their project and reject invalid gallery indices',()=>{
  const route=parseRoute('#work/launch/project/ecosystem/image/18')
  assert.equal(route.projectId,'ecosystem')
  assert.equal(route.imageIndex,18)
  assert.equal(route.base,'#work/launch')
  assert.equal(imageHref(route,'ecosystem',0),'#work/launch/project/ecosystem/image/0')
  for(const index of ['-1','100','wat','1.2']) assert.equal(parseRoute(`#work/launch/project/ecosystem/image/${index}`).imageIndex,null)
  assert.equal(imageHref(route,'ecosystem',999),'#work/launch/project/ecosystem')
  const anniversary = '#work/visual/project/futurus-anniversary'
  assert.equal(parseRoute(`${anniversary}/image/0`).imageIndex, null)
  assert.equal(parseRoute(`${anniversary}/image/1`).imageIndex, 1)
  assert.equal(imageHref(parseRoute(anniversary), 'futurus-anniversary', 0), anniversary)
})
