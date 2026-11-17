import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icons'
import { publicAsset } from './publicAsset'
import './artwork-viewer.css'

export default function ArtworkViewer({item,onClose,returnFocus,parentDialog,scrollContainer}) {
  const dialog=useRef(null),backButton=useRef(null),timer=useRef(null),closing=useRef(false)
  const [leaving,setLeaving]=useState(false)
  useEffect(()=>{
    const el=dialog.current,previous=returnFocus||document.activeElement
    const gallery=scrollContainer.current
    const position=gallery?.dataset.loopReady==='true'?{top:gallery.scrollTop,width:gallery.clientWidth,height:gallery.clientHeight}:null
    el.showModal()
    backButton.current?.focus({preventScroll:true})
    return()=>{
      clearTimeout(timer.current)
      el.close()
      if(parentDialog.current?.open){
        if(previous?.isConnected)previous.focus({preventScroll:true})
        if(position&&gallery?.isConnected&&gallery.clientWidth===position.width&&gallery.clientHeight===position.height)gallery.scrollTop=position.top
      }
    }
  },[])
  const close=()=>{
    if(closing.current)return
    closing.current=true
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return onClose()
    setLeaving(true)
    timer.current=setTimeout(onClose,260)
  }
  return <dialog ref={dialog} className={`project-sheet artwork-viewer${leaving?' is-leaving':''}`} aria-label="作品大图" onCancel={event=>{event.preventDefault();close()}}>
    <div className="artwork-viewer-scroll" tabIndex={0} role="region" aria-label="作品大图，可滚动查看完整内容">
      <img className="artwork-viewer-image" style={{'--image-ratio':item.width/item.height}} src={publicAsset(item.image)} width={item.width} height={item.height} alt={item.alt||item.caption} decoding="async" draggable="false"/>
    </div>
    <button ref={backButton} className="artwork-viewer-back" aria-label="返回作品" onClick={close} autoFocus><Icon name="back"/></button>
  </dialog>
}
