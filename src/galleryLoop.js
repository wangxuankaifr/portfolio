export const positiveModulo=(value,length)=>length>0?((value%length)+length)%length:0

export function loopPosition(top,start,height) {
  return start+positiveModulo(top-start,height)
}

// Image-relative position survives a changed column width, caption height or gap.
export function resizeLoopPosition(top,previous,next) {
  if(!previous?.height)return next.start
  const local=positiveModulo(top-previous.start,previous.height)
  const index=Math.max(0,previous.segments.findLastIndex(item=>item.offset<=local))
  const oldSegment=previous.segments[index]
  const segment=next.segments[Math.min(index,next.segments.length-1)]
  if(!oldSegment||!segment)return next.start
  const fraction=(local-oldSegment.offset)/Math.max(1,oldSegment.span)
  return next.start+segment.offset+fraction*segment.span
}
