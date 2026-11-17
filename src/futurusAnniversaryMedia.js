const directory = '/media/futurus-anniversary'

export const futurusAnniversaryMedia = [
  {
    image: `${directory}/key-visual-poster.jpg`,
    video: `${directory}/key-visual.mp4`,
    width: 1920,
    height: 1080,
    alt: 'FUTURUS 十周年动态主视觉',
  },
  {
    image: `${directory}/logo-system.jpg`,
    width: 2160,
    height: 3840,
    fullWidth: true,
    alt: '十周年标识的烫银样机、构成与应用规范',
  },
  ...[
    ['002', '十周年主视觉海报与现场展示'],
    ['003', '庆典入口与主题海报'],
    ['004', '周年纪念章与金属周边'],
    ['005', '周年服装与刺绣设计'],
  ].map(([number, alt]) => ({
    image: `${directory}/anniversary-${number}.jpg`,
    width: 1920,
    height: 1080,
    alt,
  })),
]
