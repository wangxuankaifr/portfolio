const directory = '/media/livestream-optimization'

export const eyescareLivestreamCover = {
  image: `${directory}/product-mockup.jpg`,
  width: 3200,
  height: 1800,
  fit: 'contain',
  alt: '爱视可新品展示直播画面的手机样机',
}

export const eyescareLivestreamMedia = [
  eyescareLivestreamCover,
  ...[
    ['01', '现状视觉问题诊断'],
    ['02', '品牌视觉方向'],
    ['04', '最终用户看到的直播画面'],
    ['03', '直播间整体空间效果'],
    ['05', '产品展示台'],
    ['06', '直播信息层级与 UI 系统'],
    ['07', '材质、色彩与灯光'],
    ['08', '品牌背景系统'],
    ['09', '三态直播视觉系统'],
    ['10', '直播画面改版前后对比'],
    ['11', '视觉方向边界'],
    ['12', '品牌视觉整改总结'],
  ].map(([number, alt]) => ({
    image: `${directory}/slide-${number}.png`,
    width: 1672,
    height: 941,
    alt,
  })),
]
