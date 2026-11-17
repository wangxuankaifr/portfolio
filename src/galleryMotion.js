import { loopPosition } from './galleryLoop.js'

const FRAME=1000/60
export const motionStep=(current,target,dt)=>current+(target-current)*(1-Math.pow(.9,Math.max(0,dt)/FRAME))
export const normalizeWheel=(event,height)=>event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?height:1)
export function scrollCurve(lag,small=false) {
  const amount=Math.tanh(lag/(small?500:900))
  return amount*Math.abs(amount)*.286
}
export function advanceLoopMotion(current,target,dt,loop) {
  let next=motionStep(current,target,dt)
  if(Math.abs(target-next)<.05)next=target
  const wrapped=loop?.height>0?loopPosition(next,loop.start,loop.height):next
  return {current:wrapped,target:target+wrapped-next,lag:target-next}
}

// This controller only owns deliberate wheel/mouse-drag input. Native touch,
// pinch, focus and keyboard scrolling retain their browser behavior.
export function createGalleryMotion(el,{onFrame=()=>{}}={}) {
  const doc=el.ownerDocument,win=doc.defaultView
  let state={current:el.scrollTop,target:el.scrollTop},written=el.scrollTop
  let raf=0,lastTime=0,impulse=0,nativeLag=0,drag=null,suppressClick=false,disposed=false
  let lastWheel=-Infinity,lastTrackpad=-Infinity,suppressNativeUntil=0
  let measuredHeight=Number(el.dataset.loopHeight)||0
  const now=()=>win.performance.now()
  const loop=()=>el.dataset.loopReady==='true'?{start:Number(el.dataset.loopStart),height:Number(el.dataset.loopHeight)}:null
  const paint=lag=>{
    el.dataset.motionLag=lag.toFixed(3)
    el.dataset.motionActive=String(Math.abs(lag)>.05)
    onFrame(lag)
  }
  const sync=()=>{
    const actual=el.scrollTop,delta=actual-written
    const geometry=loop(),length=geometry?.height
    if(length&&length!==measuredHeight){
      measuredHeight=length;state={current:actual,target:actual};written=actual;impulse=0;nativeLag=0
      return
    }
    if(Math.abs(delta)<.05)return
    if(length&&Math.abs(delta/length-Math.round(delta/length))<.001&&Math.abs(delta)>length*.5){
      state.current+=delta;state.target+=delta
    }else{
      state={current:actual,target:actual};impulse=0
      const movement=length?delta-Math.round(delta/length)*length:delta
      nativeLag=now()<suppressNativeUntil?0:movement*9
    }
    written=actual
  }
  const tick=time=>{
    raf=0
    if(disposed||doc.hidden)return
    sync()
    const dt=lastTime?Math.min(64,Math.max(1,time-lastTime)):FRAME
    lastTime=time
    if(Math.abs(impulse)>.05){
      const part=impulse*(1-Math.pow(.78,dt/FRAME))
      state.target+=part;impulse-=part
    }else if(impulse){state.target+=impulse;impulse=0}
    let lag=0
    if(Math.abs(state.target-state.current)>.05){
      state=advanceLoopMotion(state.current,state.target,dt,loop())
      el.scrollTop=state.current;written=el.scrollTop
      // Keep subpixel interpolation even on browsers that round scrollTop.
      lag=state.lag;nativeLag=0
    }else{
      nativeLag=motionStep(nativeLag,0,dt)
      if(Math.abs(nativeLag)<.05)nativeLag=0
      lag=nativeLag
    }
    paint(lag)
    if(Math.abs(state.target-state.current)>.05||Math.abs(impulse)>.05||nativeLag)raf=win.requestAnimationFrame(tick)
    else {lastTime=0;paint(0)}
  }
  const wake=()=>{if(!raf&&!disposed&&!doc.hidden)raf=win.requestAnimationFrame(tick)}
  const stop=()=>{
    win.cancelAnimationFrame(raf);raf=0;lastTime=0;impulse=0;nativeLag=0
    state={current:el.scrollTop,target:el.scrollTop};written=el.scrollTop;paint(0)
  }
  const onWheel=event=>{
    if(event.defaultPrevented||!event.cancelable||event.ctrlKey||event.metaKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return
    const delta=normalizeWheel(event,el.clientHeight)
    if(!delta||!loop()?.height)return
    event.preventDefault();sync()
    const stamp=event.timeStamp,interval=stamp-lastWheel
    if(interval<30)lastTrackpad=stamp
    const notched=Math.abs(delta)>=40&&interval>=30&&stamp-lastTrackpad>=500
    lastWheel=stamp
    if(notched)impulse+=delta*1.25*2
    else state.target+=delta*1.25
    wake()
  }
  const onScroll=()=>{sync();if(nativeLag||Math.abs(state.target-state.current)>.05)wake()}
  const onDown=event=>{
    if(event.pointerType!=='mouse'||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return
    if(event.target.closest('button,input,textarea,select,summary'))return
    stop();suppressClick=false
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,last:event.clientY,delta:0,time:0,moved:false}
  }
  const onMove=event=>{
    if(!drag||event.pointerId!==drag.id)return
    if(!drag.moved){
      if(Math.abs(event.clientY-drag.y)<=10||Math.abs(event.clientY-drag.y)<Math.abs(event.clientX-drag.x))return
      drag.moved=true;suppressClick=true;el.dataset.dragging='true'
      el.setPointerCapture?.(event.pointerId)
    }
    event.preventDefault()
    drag.delta=(drag.last-event.clientY)*1.5;drag.last=event.clientY;drag.time=event.timeStamp
    state.target+=drag.delta;wake()
  }
  const release=(event,project=true)=>{
    if(!drag||event.pointerId!==drag.id)return
    if(project&&drag.moved&&event.timeStamp-drag.time<100){state.target+=drag.delta*12;wake()}
    if(el.hasPointerCapture?.(drag.id))el.releasePointerCapture(drag.id)
    drag=null;delete el.dataset.dragging
  }
  const onUp=event=>release(event)
  const onCancel=event=>{release(event,false);stop()}
  const onClick=event=>{if(suppressClick){suppressClick=false;event.preventDefault();event.stopPropagation()}}
  const onDragStart=event=>event.preventDefault()
  const onKeyDown=event=>{
    if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)){
      stop()
      if(event.key==='Home'||event.key==='End')suppressNativeUntil=now()+150
    }
  }
  const onVisibility=()=>{if(doc.hidden){
    if(drag&&el.hasPointerCapture?.(drag.id))el.releasePointerCapture(drag.id)
    drag=null;delete el.dataset.dragging;stop()
  }}
  el.dataset.motionEnabled='true'
  el.addEventListener('wheel',onWheel,{passive:false})
  el.addEventListener('scroll',onScroll,{passive:true})
  el.addEventListener('pointerdown',onDown)
  el.addEventListener('click',onClick,true)
  el.addEventListener('dragstart',onDragStart)
  el.addEventListener('keydown',onKeyDown)
  win.addEventListener('pointermove',onMove,{passive:false})
  win.addEventListener('pointerup',onUp)
  win.addEventListener('pointercancel',onCancel)
  doc.addEventListener('visibilitychange',onVisibility)
  return {stop,dispose(){
    stop();disposed=true
    if(drag&&el.hasPointerCapture?.(drag.id))el.releasePointerCapture(drag.id)
    drag=null
    el.removeEventListener('wheel',onWheel);el.removeEventListener('scroll',onScroll)
    el.removeEventListener('pointerdown',onDown);el.removeEventListener('click',onClick,true)
    el.removeEventListener('dragstart',onDragStart);el.removeEventListener('keydown',onKeyDown)
    win.removeEventListener('pointermove',onMove);win.removeEventListener('pointerup',onUp);win.removeEventListener('pointercancel',onCancel)
    doc.removeEventListener('visibilitychange',onVisibility)
    delete el.dataset.motionEnabled;delete el.dataset.motionActive;delete el.dataset.motionLag;delete el.dataset.dragging
  }}
}
