import { artworkByProject } from './artwork.js'
import { projectPresentationById } from './projectPresentation.js'

export function getProjectGallery(project) {
  const artwork=artworkByProject[project.id]
  const complete=projectPresentationById[project.id]?.pages
  // Respect an opening film or continuous sequence ahead of the category cover.
  if(complete&&(complete[0]?.video||project.galleryLayout==='continuous'||!artwork))return complete
  const cover=artwork?.cover || project.cover
  // A retouched opening page already serves as the cover; keep its page metadata once.
  if(complete?.[0]?.image===cover?.image)return complete
  return [cover,...(complete || artwork?.images || project.gallery || [])]
    .filter((item,index,all)=>item && all.findIndex(other=>other?.image===item.image)===index)
}
