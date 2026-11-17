import { useLayoutEffect, useRef, useState } from 'react'
import { loopPosition, positiveModulo, resizeLoopPosition } from './galleryLoop'

export default function useLoopingGallery(scroller,canonical,onProgress,paused=false) {
  const [guards,setGuards]=useState(1)
  const geometry=useRef(null),idle=useRef(null),notify=useRef(onProgress)
  notify.current=onProgress

  useLayoutEffect(()=>{
    if(paused){
      clearTimeout(idle.current)
      if(geometry.current&&scroller.current)geometry.current.top=scroller.current.scrollTop
      return
    }
    const el=scroller.current,cycle=canonical.current
    if(!el||!cycle)return
    const report=()=>{
      const g=geometry.current
      if(!g)return
      g.top=el.scrollTop
      const local=positiveModulo(el.scrollTop-g.start,g.height)
      el.dataset.loopPosition=local.toFixed(2)
      notify.current?.(local/g.height)
    }
    const recenter=()=>{
      const g=geometry.current
      if(!g)return
      if(el.clientWidth!==g.width||el.clientHeight!==g.viewport)return
      const active=document.activeElement
      if(active instanceof HTMLAnchorElement&&cycle.contains(active)){
        const image=active.getBoundingClientRect(),viewport=el.getBoundingClientRect()
        // A browser may position the first focused link a few pixels before
        // the canonical start. Keep that visible focus ring on its real link.
        if(image.bottom>viewport.top&&image.top<viewport.bottom){report();return}
      }
      const top=loopPosition(el.scrollTop,g.start,g.height)
      if(Math.abs(top-el.scrollTop)>.5){
        el.scrollTop=top
        el.dataset.loopRebases=String(Number(el.dataset.loopRebases||0)+1)
      }
      report()
    }
    const measure=()=>{
      const height=Number.parseFloat(getComputedStyle(cycle).height),viewport=el.clientHeight,start=cycle.offsetTop
      if(height<1||viewport<1)return
      const needed=Math.max(1,Math.ceil(viewport/height)+1)
      const figures=[...cycle.children]
      const offsets=figures.map(item=>item.offsetTop)
      const next={height,viewport,start,width:el.clientWidth,segments:offsets.map((offset,index)=>({offset,span:(offsets[index+1]??height)-offset}))}
      const previous=geometry.current
      const unchanged=previous&&Math.abs(previous.height-height)<.1&&previous.start===start&&previous.viewport===viewport&&previous.width===next.width
      if(!unchanged){
        clearTimeout(idle.current)
        const top=resizeLoopPosition(previous?.top??el.scrollTop,previous,next)
        geometry.current=next
        el.scrollTop=top
        el.dataset.loopStart=String(start)
        el.dataset.loopHeight=String(height)
        el.dataset.loopReady='true'
        report()
      }
      if(needed!==guards)setGuards(needed)
    }
    const onScroll=()=>{
      const g=geometry.current
      if(!g)return
      if(el.clientWidth!==g.width||el.clientHeight!==g.viewport){clearTimeout(idle.current);return}
      // Leave native touch/wheel inertia alone across ordinary image seams.
      // Idle recentring is invisible because every cycle has identical geometry.
      const buffer=Math.max(48,Math.min(g.viewport*.6,g.height*.5))
      if(el.scrollTop<buffer||el.scrollTop+g.viewport>el.scrollHeight-buffer)recenter()
      report()
      clearTimeout(idle.current)
      idle.current=setTimeout(recenter,180)
    }
    const onScrollEnd=()=>{clearTimeout(idle.current);recenter()}
    const onFocus=event=>{
      // Keyboard navigation only enters the canonical anchors. Browser focus
      // scrolling can reveal them naturally; update the cyclic progress marker.
      if(event.target instanceof HTMLAnchorElement)report()
    }
    const observer=new ResizeObserver(measure)
    observer.observe(el);observer.observe(cycle)
    el.addEventListener('scroll',onScroll,{passive:true})
    el.addEventListener('scrollend',onScrollEnd)
    el.addEventListener('focusin',onFocus)
    measure()
    return()=>{observer.disconnect();clearTimeout(idle.current);el.removeEventListener('scroll',onScroll);el.removeEventListener('scrollend',onScrollEnd);el.removeEventListener('focusin',onFocus)}
  },[guards,scroller,canonical,paused])

  const onKeyDown=event=>{
    if(paused)return
    if(event.altKey||event.ctrlKey||event.metaKey||event.defaultPrevented)return
    if(event.target.closest('input,textarea,select,summary,.project-sheet-intro'))return
    if(event.target instanceof HTMLButtonElement && event.key===' ')return
    const el=scroller.current,g=geometry.current
    if(!el||!g)return
    const delta={ArrowDown:48,ArrowUp:-48,PageDown:g.viewport*.86,PageUp:-g.viewport*.86,' ':g.viewport*.86*(event.shiftKey?-1:1)}[event.key]
    if(event.key==='Home'){event.preventDefault();el.scrollTop=g.start}
    else if(event.key==='End'){event.preventDefault();el.scrollTop=g.start+Math.max(0,g.height-g.viewport)}
    else if(delta!==undefined){event.preventDefault();el.scrollBy({top:delta,behavior:'auto'})}
  }
  return {guards,onKeyDown}
}
