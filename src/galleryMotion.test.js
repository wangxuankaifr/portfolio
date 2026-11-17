import test from 'node:test'
import assert from 'node:assert/strict'
import { motionStep, scrollCurve, normalizeWheel, advanceLoopMotion, createGalleryMotion } from './galleryMotion.js'

test('equal elapsed time gives the same smooth position at 60 and 120 Hz',()=>{
  const simulate=rate=>{
    let position=0
    for(let frame=0;frame<rate/2;frame++)position=motionStep(position,600,1000/rate)
    return position
  }
  assert.ok(Math.abs(simulate(60)-simulate(120))<0.001)
  assert.ok(simulate(60)>570&&simulate(60)<600)
})

test('motion can reverse from the displayed position and settles without overshoot',()=>{
  let position=motionStep(0,500,16.667)
  const before=position
  position=motionStep(position,-200,16.667)
  assert.ok(position<before&&position>-200)
  for(let frame=0;frame<200;frame++)position=motionStep(position,-200,16.667)
  assert.ok(Math.abs(position+200)<0.001)
  assert.equal(motionStep(position,-200,0),position)
})

test('curvature is zero at rest, reverses direction, and remains bounded',()=>{
  assert.equal(scrollCurve(0),0)
  for(const lag of [1,100,900,1e8]){
    assert.ok(scrollCurve(lag)>0&&scrollCurve(lag)<=0.286)
    assert.equal(scrollCurve(-lag),-scrollCurve(lag))
  }
  assert.ok(scrollCurve(200,true)>scrollCurve(200,false))
})

test('wheel lines and pages are normalized without breaking precise pixel input',()=>{
  assert.equal(normalizeWheel({deltaY:3,deltaMode:0},700),3)
  assert.equal(normalizeWheel({deltaY:-3,deltaMode:1},700),-48)
  assert.equal(normalizeWheel({deltaY:1,deltaMode:2},700),700)
})

test('loop seams preserve remaining motion in both directions and over many cycles',()=>{
  for(const [current,target] of [[2998,3040],[2002,1960],[2500,28000]]){
    const next=advanceLoopMotion(current,target,16.667,{start:2000,height:1000})
    const unwrapped=motionStep(current,target,16.667)
    assert.ok(next.current>=2000&&next.current<3000)
    assert.ok(Math.abs((next.target-next.current)-(target-unwrapped))<0.001)
    assert.ok(Math.abs(next.lag-(target-unwrapped))<0.001)
  }
})

function galleryHarness() {
  const target=()=>({listeners:new Map(),
    addEventListener(type,fn){if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type).add(fn)},
    removeEventListener(type,fn){this.listeners.get(type)?.delete(fn)},
    emit(type,options={}){
      const event={target:{closest:()=>null},cancelable:true,defaultPrevented:false,timeStamp:time,
        preventDefault(){this.defaultPrevented=true},stopPropagation(){this.stopped=true},...options}
      for(const fn of this.listeners.get(type)||[])fn(event)
      return event
    }})
  let time=0,next=0
  const frames=new Map(),win=target(),doc=target(),el=target()
  Object.assign(win,{performance:{now:()=>time},requestAnimationFrame:fn=>{frames.set(++next,fn);return next},cancelAnimationFrame:id=>frames.delete(id)})
  Object.assign(doc,{defaultView:win,hidden:false})
  Object.assign(el,{ownerDocument:doc,scrollTop:2400,clientHeight:600,dataset:{loopReady:'true',loopStart:'2000',loopHeight:'1000'}})
  const lags=[],motion=createGalleryMotion(el,{onFrame:lag=>lags.push(lag)})
  const tick=(count=1)=>{
    for(let i=0;i<count&&frames.size;i++){
      time+=1000/60
      const batch=[...frames.values()];frames.clear()
      for(const fn of batch)fn(time)
      el.emit('scroll')
    }
  }
  const wheel=(delta,options={})=>el.emit('wheel',{deltaY:delta,deltaX:0,deltaMode:0,...options})
  return {el,win,doc,frames,lags,motion,tick,wheel}
}

test('wheel input settles across a loop boundary without hitting an end',()=>{
  const h=galleryHarness()
  assert.equal(h.wheel(800).defaultPrevented,true)
  h.tick(300)
  assert.ok(h.el.scrollTop>=2000&&h.el.scrollTop<3000)
  assert.ok(Math.abs(h.el.scrollTop-2400)<.2) // 800 × 1.25 × 2 = two whole cycles.
  assert.equal(h.frames.size,0)
  assert.equal(h.lags.at(-1),0)
  h.motion.dispose()
})

test('native touch/focus scrolling stays direct and pinch-wheel is not intercepted',()=>{
  const h=galleryHarness()
  assert.equal(h.wheel(60,{ctrlKey:true}).defaultPrevented,false)
  h.el.scrollTop=2500;h.el.emit('scroll');h.tick(200)
  assert.equal(h.el.scrollTop,2500)
  assert.equal(h.lags.at(-1),0)
  h.motion.dispose()
})

test('drag release projects motion, suppresses its click, and leaves the next click usable',()=>{
  const h=galleryHarness()
  const pointer={pointerType:'mouse',pointerId:1,button:0,clientX:100,clientY:200}
  h.el.emit('pointerdown',pointer)
  h.win.emit('pointermove',{...pointer,clientY:160})
  h.tick(1)
  h.win.emit('pointerup',{...pointer,clientY:160})
  assert.equal(h.el.emit('click').defaultPrevented,true)
  h.tick(300)
  assert.ok(Math.abs(h.el.scrollTop-2180)<.2) // 40 × 1.5 × (1 + 12), wrapped.
  h.el.emit('pointerdown',pointer);h.win.emit('pointerup',pointer)
  assert.equal(h.el.emit('click').defaultPrevented,false)
  h.motion.dispose()
})

test('hiding or disposing stops frames and restores neutral visual state',()=>{
  const h=galleryHarness()
  h.wheel(100);h.tick(3)
  h.doc.hidden=true;h.doc.emit('visibilitychange')
  assert.equal(h.frames.size,0);assert.equal(h.lags.at(-1),0)
  h.motion.dispose()
  for(const target of [h.el,h.win,h.doc])for(const listeners of target.listeners.values())assert.equal(listeners.size,0)
  assert.equal(h.el.dataset.motionEnabled,undefined)
})

test('responsive remeasurement does not turn a restored reading position into a velocity spike',()=>{
  const h=galleryHarness()
  h.wheel(100);h.tick(3)
  h.el.dataset.loopHeight='800';h.el.dataset.loopStart='1600';h.el.scrollTop=1900
  h.el.emit('scroll');h.tick(2)
  assert.equal(h.el.scrollTop,1900)
  assert.equal(h.lags.at(-1),0)
  assert.equal(h.frames.size,0)
  h.motion.dispose()
})
