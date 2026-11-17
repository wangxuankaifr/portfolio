import test from 'node:test'
import assert from 'node:assert/strict'
import { loopPosition, positiveModulo, resizeLoopPosition } from './galleryLoop.js'

test('wrapping preserves a visible fractional position in either direction',()=>{
  assert.equal(loopPosition(2999.25,2000,1000),2999.25)
  assert.equal(loopPosition(3000.25,2000,1000),2000.25)
  assert.equal(loopPosition(1999.25,2000,1000),2999.25)
  assert.equal(loopPosition(29_125.5,2000,1000),2125.5)
  assert.equal(positiveModulo(-.5,1000),999.5)
})
test('resizing preserves the same image and its internal reading position',()=>{
  const previous={start:2000,height:1000,segments:[{offset:0,span:400},{offset:400,span:600}]}
  const next={start:1200,height:600,segments:[{offset:0,span:250},{offset:250,span:350}]}
  // Halfway through image2 remains halfway through image2 at the new width.
  assert.equal(resizeLoopPosition(2700,previous,next),1625)
  assert.equal(resizeLoopPosition(1700,previous,next),1625)
  assert.equal(resizeLoopPosition(0,null,next),1200)
})
