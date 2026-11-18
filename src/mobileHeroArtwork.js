import { heroArtwork } from './heroArtwork'
import optimized from './mobileHeroArtwork.json'

// The same PC artwork, rasterized to phone-sized textures; source order stays intact.
export const mobileHeroArtwork = heroArtwork.flatMap(art => {
  const image = optimized[art.id]
  return image ? [{ ...art, image: image.src, width: image.width, height: image.height }] : []
})
