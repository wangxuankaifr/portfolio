import { useEffect, useRef, useState } from 'react'
import { createTrophyRenderer } from './trophyRenderer'
import { publicAsset } from './publicAsset'

export default function TrophyMark() {
  const mark=useRef(null),canvas=useRef(null)
  const [fallback,setFallback]=useState(false)
  useEffect(()=>{
    const el=canvas.current,media=matchMedia('(prefers-reduced-motion: reduce)')
    let engine=createTrophyRenderer(el),frame=0,elapsed=0,previous=0,lastDraw=0,inView=true,lost=false
    setFallback(!engine)
    const draw=now=>{
      if(previous)elapsed+=Math.min((now-previous)/1000,.1)
      previous=now
      if(now-lastDraw>=1000/30){engine?.render(elapsed);lastDraw=now}
      frame=requestAnimationFrame(draw)
    }
    const sync=()=>{
      cancelAnimationFrame(frame);previous=0
      if(!engine||lost)return
      engine.render(elapsed)
      if(inView&&!document.hidden&&!media.matches)frame=requestAnimationFrame(draw)
    }
    const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;sync()})
    const onLost=event=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);setFallback(true)}
    const onRestored=()=>{engine?.dispose();engine=createTrophyRenderer(el);lost=false;setFallback(!engine);sync()}
    observer.observe(mark.current);document.addEventListener('visibilitychange',sync);media.addEventListener('change',sync)
    el.addEventListener('webglcontextlost',onLost);el.addEventListener('webglcontextrestored',onRestored);sync()
    return ()=>{
      cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',sync);media.removeEventListener('change',sync)
      el.removeEventListener('webglcontextlost',onLost);el.removeEventListener('webglcontextrestored',onRestored);engine?.dispose()
    }
  },[])
  return <span ref={mark} className="trophy-mark" data-renderer={fallback?'fallback':'webgl'} aria-hidden="true"><canvas ref={canvas}/>{fallback&&<img className="trophy-fallback" src={publicAsset('/media/branding/trophy-reference.png')} width="512" height="512" alt="" decoding="async" draggable="false"/>}</span>
}
