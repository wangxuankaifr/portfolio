const directory = '/media/futurus-experience-day'

export const futurusExperienceDayCover = {
  image: `${directory}/cover-kv.jpg`,
  width: 1920,
  height: 1080,
  fit: 'contain',
  alt: 'FUTURUS 黑科技体验日主视觉「透明之间 · 未来可见」',
}

export const futurusExperienceDayMedia = [
  {
    image: `${directory}/key-visual-poster.jpg`,
    video: `${directory}/key-visual.mp4`,
    playInLoopCopies: true,
    width: 1920,
    height: 1080,
    alt: '黑科技体验日动态主视觉',
  },
  futurusExperienceDayCover,
  {
    image: `${directory}/invitation.jpg`,
    width: 2400,
    height: 1800,
    alt: '黑科技体验日邀请函的手机样机',
  },
  {
    image: `${directory}/countdown-poster.jpg`,
    video: `${directory}/countdown.mp4`,
    width: 1448,
    height: 1086,
    alt: 'FUTURUS 黑科技体验日倒计时动效',
  },
  {
    image: `${directory}/studio-display-poster.jpg`,
    video: `${directory}/studio-display.mp4`,
    width: 1500,
    height: 1000,
    alt: 'FUTURUS 黑科技体验日现场演讲视觉展示',
  },
]
