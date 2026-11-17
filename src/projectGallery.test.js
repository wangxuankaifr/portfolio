import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { projects } from './portfolio.js'
import { projectPresentationById } from './projectPresentation.js'
import { getProjectGallery } from './projectGallery.js'

test('all retained PDF pages are assigned once, excluding the replaced photography layouts',()=>{
  const excluded=new Set([1,2,3,22,38,39,80,99,...Array.from({length:15},(_,i)=>23+i)])
  const expected=Array.from({length:99},(_,i)=>i+1).filter(page=>!excluded.has(page))
  const pages=Object.values(projectPresentationById).flatMap(group=>group.pages.map(item=>item.page)).filter(Number.isInteger).sort((a,b)=>a-b)
  assert.deepEqual(pages,expected)
  assert.equal(projects.length,21)
})
test('every project opens its entire ordered sequence and all assets exist',()=>{
  for(const project of projects){
    const full=projectPresentationById[project.id].pages
    const gallery=getProjectGallery(project)
    if(full[0]?.video)assert.equal(gallery[0],full[0],project.title)
    assert.equal(new Set(gallery.map(item=>item.image)).size,gallery.length)
    assert.deepEqual(gallery.filter(item=>full.some(page=>page.image===item.image)).map(item=>item.image),full.map(item=>item.image))
    for(const item of gallery){
      assert.ok(existsSync(`public${item.image}`),item.image)
      assert.ok(item.width>0&&item.height>0,item.image)
      if(item.video)assert.ok(existsSync(`public${item.video}`),item.video)
    }
  }
})
