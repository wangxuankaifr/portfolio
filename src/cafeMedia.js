const directory = '/media/cafe'

export const cafeCover = {
  image: `${directory}/cover.webp`,
  width: 1920,
  height: 1080,
  fit: 'contain',
  alt: '「感 CAFÉ」影片定帧，咖啡杯、数字方块与岩石在浅色空间中悬浮',
}

export const cafeFilm = {
  ...cafeCover,
  video: `${directory}/brand-film.mp4`,
  alt: '「感 CAFÉ」品牌影片',
}
