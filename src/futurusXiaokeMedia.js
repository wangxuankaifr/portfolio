const directory = '/media/futurus-xiaoke'

export const futurusXiaokeCover = {
  image: `${directory}/cover.jpg`,
  width: 1672,
  height: 941,
  fit: 'contain',
  alt: '小可形象升级主视觉，小可驾驶潜水器探索海底',
}

export const futurusXiaokeMedia = [
  {
    image: `${directory}/intro-poster.jpg`,
    video: `${directory}/intro.mp4`,
    width: 1920,
    height: 1080,
    alt: '小可形象升级动态展示',
  },
  ...[
    ['002', '小可宝石薄荷版角色六视图'],
    ['003', '小可的六种夸张表情'],
    ['004', '小可的六种角色与服装拓展'],
    ['005', '小可在太空舱欢迎孩子登舰'],
    ['010', '家长兑现游乐园奖励的概念画面'],
    ['006', '小可在太空舱里举起望远镜'],
    ['007', '小可在水边钓鱼的互动场景'],
    ['008', '小可在太空舱研究水晶的互动场景'],
    ['009', '小可在太空舱听音乐的互动场景'],
  ].map(([number, alt]) => ({
    image: `${directory}/scene-${number}.jpg`,
    width: 1920,
    height: 1080,
    alt,
  })),
]
