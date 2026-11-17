import { useLayoutEffect } from 'react'
import { createGalleryMotion } from './galleryMotion.js'
import { createGalleryWarp } from './galleryWarp.js'

export default function useProjectMotion(scroller,canonical,canvas,guards,paused) {
  useLayoutEffect(()=>{
    const el=scroller.current,cycle=canonical.current,surface=canvas.current
    if(paused||!el||!cycle||!surface)return
    const preference=matchMedia('(prefers-reduced-motion: reduce)')
    let motion=null,warp=null,observer=null,refreshFrame=0,lag=0
    const refresh=()=>{
      cancelAnimationFrame(refreshFrame)
      refreshFrame=requestAnimationFrame(()=>{refreshFrame=0;warp?.refresh();warp?.render(lag)})
    }
    const onLost=event=>{event.preventDefault();warp?.dispose();warp=null}
    const onRestored=()=>{if(!preference.matches){warp=createGalleryWarp(surface,el);refresh()}}
    const disconnect=()=>{
      cancelAnimationFrame(refreshFrame);refreshFrame=0
      observer?.disconnect();observer=null
      motion?.dispose();motion=null;warp?.dispose();warp=null;lag=0
      el.removeEventListener('load',refresh,true)
      surface.parentElement.removeEventListener('animationend',refresh)
      surface.removeEventListener('webglcontextlost',onLost)
      surface.removeEventListener('webglcontextrestored',onRestored)
    }
    const connect=()=>{
      disconnect()
      if(preference.matches)return
      warp=createGalleryWarp(surface,el)
      motion=createGalleryMotion(el,{onFrame:value=>{lag=value;warp?.render(value)}})
      observer=new ResizeObserver(refresh)
      observer.observe(el);observer.observe(cycle);observer.observe(surface.parentElement)
      el.addEventListener('load',refresh,true)
      surface.parentElement.addEventListener('animationend',refresh)
      surface.addEventListener('webglcontextlost',onLost)
      surface.addEventListener('webglcontextrestored',onRestored)
    }
    connect();preference.addEventListener('change',connect)
    return()=>{preference.removeEventListener('change',connect);disconnect()}
  },[scroller,canonical,canvas,guards,paused])
}
