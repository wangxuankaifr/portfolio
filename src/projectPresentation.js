import { liveVividPhotos } from './liveVividPhotos.js'
import { liveVividOriginalPhotos } from './liveVividOriginalPhotos.js'
import { futurusAnniversaryMedia } from './futurusAnniversaryMedia.js'
import { futurusExperienceDayMedia } from './futurusExperienceDayMedia.js'
import { futurusXiaokeMedia } from './futurusXiaokeMedia.js'
import { eyescareLivestreamMedia } from './eyescareLivestreamMedia.js'
import { cafeFilm } from './cafeMedia.js'
import { discoveryCover, discoveryFilm } from './discoveryMedia.js'

// Complete source-page sequences audited against the user-provided 99-page PDF.
// Includes the three additional visual cases explicitly confirmed on 2026-11-03.
// Treatment/reference/storyboard pages remain labelled as such; no employers or dates inferred.
export const projectPresentationById = {
  'futurus-anniversary': { pages: futurusAnniversaryMedia },
  'futurus-experience-day': { pages: futurusExperienceDayMedia },
  'futurus-xiaoke': { pages: futurusXiaokeMedia },
  'futurus-hefei-logo-wall': {
    pages: [
      {
        image: '/media/futurus-hefei-logo-wall/logo-wall-poster.jpg',
        video: '/media/futurus-hefei-logo-wall/logo-wall.mp4',
        width: 1920,
        height: 1080,
        alt: 'FUTURUS 合肥工厂展厅 Logo 墙动态展示',
      },
      {
        image: '/media/futurus-hefei-logo-wall/rendering-1.png',
        width: 1672,
        height: 941,
        alt: 'FUTURUS 合肥工厂展厅 Logo 墙侧视效果图',
      },
      {
        image: '/media/futurus-hefei-logo-wall/rendering-2.png',
        width: 1672,
        height: 941,
        alt: 'FUTURUS 合肥工厂展厅 Logo 墙全景效果图',
      },
    ],
  },
  'futurus-ocean-blue': {
    pages: [
      {
        image: '/media/futurus-ocean-blue/cover.jpg',
        width: 3200,
        height: 2140,
        alt: 'Ocean Blue 电子名片手机样机，人物剪影朝右',
      },
      {
        image: '/media/futurus-ocean-blue/second-card.jpg',
        width: 3200,
        height: 2140,
        alt: 'Ocean Blue 电子名片手机样机，人物剪影朝左',
      },
    ],
  },
  'futurus-on-the-moon': {
    pages: [
      {
        image: '/media/futurus-on-the-moon/cover.png',
        video: '/media/futurus-on-the-moon/motion-poster.mp4',
        width: 1920,
        height: 1080,
        alt: 'FUTURUS 中秋动态海报 On the moon',
      },
    ],
  },
  'eyescare-brand-poster': {
    pages: [
      {
        image: '/media/eyescare-brand-poster/cover.jpg',
        width: 3200,
        height: 1800,
        alt: '爱视可线下门店四联展板的橡木画框展示',
      },
      ...[
        ['spatial-optics', '爱视可空间光学海报，孩子走向桌上的读写台'],
        ['automotive-optics', '爱视可车企背书海报，呈现车载光学的技术背景'],
        ['reading-experience', '爱视可使用体验海报，孩子坐在读写台前'],
        ['expert-perspective', '爱视可专家共识主题海报'],
      ].map(([name, alt]) => ({
        image: `/media/eyescare-brand-poster/${name}.jpg`,
        width: 2262,
        height: 3200,
        alt,
      })),
    ],
  },
  'livestream-optimization': { pages: eyescareLivestreamMedia },
  'brand-website': {
    pages: [
      {
        image: '/media/brand-website/cover.webp',
        video: '/media/brand-website/website-demo.mp4',
        width: 2290,
        height: 1833,
        alt: '爱视可官网首页与产品页的桌面样机演示',
      },
    ],
  },
  "zero": {
    "pages": [
      {
        "image": "/media/project-full/page-06.webp",
        "page": 6,
        "caption": "ZERO · 项目封页",
        "alt": "ZERO · KV：ZERO · 项目封页，原作品集第6页",
        "width": 1600,
        "height": 900
      },
      {
        "image": "/media/project-full/page-07.webp",
        "page": 7,
        "caption": "ZERO · 创意概念与环形空间视觉",
        "alt": "ZERO · KV：ZERO · 创意概念与环形空间视觉，原作品集第7页",
        "width": 1600,
        "height": 900
      },
      {
        "image": "/media/project-full/page-08.webp",
        "page": 8,
        "caption": "ZERO 001 · 海报应用",
        "alt": "ZERO · KV：ZERO 001 · 海报应用，原作品集第8页",
        "width": 1600,
        "height": 900
      },
      {
        "image": "/media/project-full/page-09.webp",
        "page": 9,
        "caption": "ZERO 002 · 海报应用",
        "alt": "ZERO · KV：ZERO 002 · 海报应用，原作品集第9页",
        "width": 1600,
        "height": 900
      }
    ],
    "sourcePageRange": [
      6,
      9
    ]
  },
  "smart": {
    "pages": [
      {
        "image": "/media/project-full/page-10.webp",
        "page": 10,
        "caption": "smart · 纪念书整体展示",
        "alt": "Red Moment：smart · 纪念书整体展示，原作品集第10页",
        "width": 1600,
        "height": 900
      },
      {
        "image": "/media/project-full/page-11.webp",
        "page": 11,
        "caption": "smart · 创意背景与Red Moment主题跨页",
        "alt": "Red Moment：smart · 创意背景与Red Moment主题跨页，原作品集第11页",
        "width": 1600,
        "height": 900
      },
      {
        "image": "/media/project-full/page-12.webp",
        "page": 12,
        "caption": "smart · 红蓝3D互动视觉",
        "alt": "Red Moment：smart · 红蓝3D互动视觉，原作品集第12页",
        "width": 1600,
        "height": 900
      },
      {
        "image": "/media/project-full/page-13.webp",
        "page": 13,
        "caption": "smart · 纪念书内页与实体物料",
        "alt": "Red Moment：smart · 纪念书内页与实体物料，原作品集第13页",
        "width": 1600,
        "height": 900
      },
      {
        "image": "/media/project-full/page-14.webp",
        "page": 14,
        "caption": "smart · 十年车型邮票时间线",
        "alt": "Red Moment：smart · 十年车型邮票时间线，原作品集第14页",
        "width": 1600,
        "height": 900
      }
    ],
    "sourcePageRange": [
      10,
      14
    ]
  },
  "aia": {
    "pages": [
      {
        "image": "/media/details/aia-centered-mockup.png",
        "page": 15,
        "caption": "新年新气场 · 活动插画展示",
        "alt": "新年新气场 · 屏幕 mock-up 居中展示，移除外部项目说明文字",
        "width": 1672,
        "height": 941
      },
      {
        "image": "/media/project-full/page-16.webp",
        "page": 16,
        "caption": "AIA · 健康任务系列插画",
        "alt": "新年新气场：AIA · 健康任务系列插画，原作品集第16页",
        "width": 1600,
        "height": 900
      },
      {
        "image": "/media/project-full/page-17.webp",
        "page": 17,
        "caption": "AIA · 系列场景与应用",
        "alt": "新年新气场：AIA · 系列场景与应用，原作品集第17页",
        "width": 1600,
        "height": 900
      },
      {
        "image": "/media/project-full/page-18.webp",
        "page": 18,
        "caption": "AIA · 互动界面与系列延展",
        "alt": "新年新气场：AIA · 互动界面与系列延展，原作品集第18页",
        "width": 1600,
        "height": 900
      }
    ],
    "sourcePageRange": [
      15,
      18
    ]
  },
  "redmi-photo": {
    "pages": [...liveVividPhotos, ...liveVividOriginalPhotos]
  },
  "mobile": {
    "pages": [
      {
        "image": "/media/project-full/page-40.webp",
        "page": 40,
        "caption": "Xiaomi 15T Series · 发布视觉",
        "alt": "Mobile Visual Design：Xiaomi 15T Series · 发布视觉，原作品集第40页",
        "width": 1600,
        "height": 900,
        "subsection": "Xiaomi 15T Pro"
      },
      {
        "image": "/media/project-full/page-41.webp",
        "page": 41,
        "caption": "Xiaomi 15T Series · 视觉概念与产品卖点",
        "alt": "Mobile Visual Design：Xiaomi 15T Series · 视觉概念与产品卖点，原作品集第41页",
        "width": 1600,
        "height": 900,
        "subsection": "Xiaomi 15T Pro"
      },
      {
        "image": "/media/project-full/page-42.webp",
        "page": 42,
        "caption": "Xiaomi 15T Series · 产品与影像场景",
        "alt": "Mobile Visual Design：Xiaomi 15T Series · 产品与影像场景，原作品集第42页",
        "width": 1600,
        "height": 900,
        "subsection": "Xiaomi 15T Pro"
      },
      {
        "image": "/media/project-full/page-43.webp",
        "page": 43,
        "caption": "Xiaomi 15T Pro · 专业影像卖点",
        "alt": "Mobile Visual Design：Xiaomi 15T Pro · 专业影像卖点，原作品集第43页",
        "width": 1600,
        "height": 900,
        "subsection": "Xiaomi 15T Pro"
      },
      {
        "image": "/media/project-full/page-44.webp",
        "page": 44,
        "caption": "Xiaomi 15T Pro · 性能与使用体验",
        "alt": "Mobile Visual Design：Xiaomi 15T Pro · 性能与使用体验，原作品集第44页",
        "width": 1600,
        "height": 900,
        "subsection": "Xiaomi 15T Pro"
      },
      {
        "image": "/media/project-full/page-45.webp",
        "page": 45,
        "caption": "Xiaomi 15T Pro · 产品卖点整合",
        "alt": "Mobile Visual Design：Xiaomi 15T Pro · 产品卖点整合，原作品集第45页",
        "width": 1600,
        "height": 900,
        "subsection": "Xiaomi 15T Pro"
      },
      {
        "image": "/media/project-full/page-46.webp",
        "page": 46,
        "caption": "Xiaomi 14 Ultra · 发布视觉",
        "alt": "Mobile Visual Design：Xiaomi 14 Ultra · 发布视觉，原作品集第46页",
        "width": 1600,
        "height": 900,
        "subsection": "Xiaomi 14 Ultra"
      },
      {
        "image": "/media/project-full/page-47.webp",
        "page": 47,
        "caption": "Xiaomi 14 Ultra · 专业影像与光学结构",
        "alt": "Mobile Visual Design：Xiaomi 14 Ultra · 专业影像与光学结构，原作品集第47页",
        "width": 1600,
        "height": 900,
        "subsection": "Xiaomi 14 Ultra"
      },
      {
        "image": "/media/project-full/page-48.webp",
        "page": 48,
        "caption": "Xiaomi 14 Ultra · 材质、结构与防护",
        "alt": "Mobile Visual Design：Xiaomi 14 Ultra · 材质、结构与防护，原作品集第48页",
        "width": 1600,
        "height": 900,
        "subsection": "Xiaomi 14 Ultra"
      },
      {
        "image": "/media/project-full/page-49.webp",
        "page": 49,
        "caption": "Xiaomi 14 Ultra · 发布视觉应用（1）",
        "alt": "Mobile Visual Design：Xiaomi 14 Ultra · 发布视觉应用（1），原作品集第49页",
        "width": 1600,
        "height": 900,
        "subsection": "Xiaomi 14 Ultra"
      },
      {
        "image": "/media/project-full/page-50.webp",
        "page": 50,
        "caption": "Xiaomi 14 Ultra · 发布视觉应用（2）",
        "alt": "Mobile Visual Design：Xiaomi 14 Ultra · 发布视觉应用（2），原作品集第50页",
        "width": 1600,
        "height": 900,
        "subsection": "Xiaomi 14 Ultra"
      },
      {
        "image": "/media/project-full/page-51.webp",
        "page": 51,
        "caption": "Xiaomi 14 Ultra · 发布视觉应用（3）",
        "alt": "Mobile Visual Design：Xiaomi 14 Ultra · 发布视觉应用（3），原作品集第51页",
        "width": 1600,
        "height": 900,
        "subsection": "Xiaomi 14 Ultra"
      },
      {
        "image": "/media/project-full/page-52.webp",
        "page": 52,
        "caption": "Xiaomi 14 Ultra · 发布视觉应用（4）",
        "alt": "Mobile Visual Design：Xiaomi 14 Ultra · 发布视觉应用（4），原作品集第52页",
        "width": 1600,
        "height": 900,
        "subsection": "Xiaomi 14 Ultra"
      },
      {
        "image": "/media/project-full/page-53.webp",
        "page": 53,
        "caption": "REDMI Note 12 · Live vivid主视觉",
        "alt": "Mobile Visual Design：REDMI Note 12 · Live vivid主视觉，原作品集第53页",
        "width": 1600,
        "height": 900,
        "subsection": "REDMI Note 12"
      },
      {
        "image": "/media/project-full/page-54.webp",
        "page": 54,
        "caption": "REDMI Note 12 · 视觉概念与传播应用",
        "alt": "Mobile Visual Design：REDMI Note 12 · 视觉概念与传播应用，原作品集第54页",
        "width": 1600,
        "height": 900,
        "subsection": "REDMI Note 12"
      },
      {
        "image": "/media/project-full/page-55.webp",
        "page": 55,
        "caption": "REDMI Note 12 · 外观、材料与续航",
        "alt": "Mobile Visual Design：REDMI Note 12 · 外观、材料与续航，原作品集第55页",
        "width": 1600,
        "height": 900,
        "subsection": "REDMI Note 12"
      },
      {
        "image": "/media/project-full/page-56.webp",
        "page": 56,
        "caption": "REDMI Note 12 · 日间影像与产品性能",
        "alt": "Mobile Visual Design：REDMI Note 12 · 日间影像与产品性能，原作品集第56页",
        "width": 1600,
        "height": 900,
        "subsection": "REDMI Note 12"
      },
      {
        "image": "/media/project-full/page-57.webp",
        "page": 57,
        "caption": "REDMI Note 12 · 夜景影像与屏幕表现",
        "alt": "Mobile Visual Design：REDMI Note 12 · 夜景影像与屏幕表现，原作品集第57页",
        "width": 1600,
        "height": 900,
        "subsection": "REDMI Note 12"
      },
      {
        "image": "/media/project-full/page-58.webp",
        "page": 58,
        "caption": "REDMI Note 12 · 发布页面应用",
        "alt": "Mobile Visual Design：REDMI Note 12 · 发布页面应用，原作品集第58页",
        "width": 1600,
        "height": 900,
        "subsection": "REDMI Note 12"
      }
    ],
    "sourcePageRange": [
      40,
      58
    ]
  },
  "ecosystem": {
    "pages": [
      {
        "image": "/media/project-full/page-59.webp",
        "page": 59,
        "caption": "ECO system · 生态产品发布视觉分类封页",
        "alt": "ECO system：ECO system · 生态产品发布视觉分类封页，原作品集第59页",
        "width": 1600,
        "height": 900,
        "subsection": "ECO system"
      },
      {
        "image": "/media/project-full/page-60.webp",
        "page": 60,
        "caption": "Redmi Watch 3 · 产品与人物主视觉",
        "alt": "ECO system：Redmi Watch 3 · 产品与人物主视觉，原作品集第60页",
        "width": 1600,
        "height": 900,
        "subsection": "Watch / Wearables"
      },
      {
        "image": "/media/project-full/page-61.webp",
        "page": 61,
        "caption": "Redmi Watch 3 · 配色与续航",
        "alt": "ECO system：Redmi Watch 3 · 配色与续航，原作品集第61页",
        "width": 1600,
        "height": 900,
        "subsection": "Watch / Wearables"
      },
      {
        "image": "/media/project-full/page-62.webp",
        "page": 62,
        "caption": "Redmi Watch 3 · 表盘与显示",
        "alt": "ECO system：Redmi Watch 3 · 表盘与显示，原作品集第62页",
        "width": 1600,
        "height": 900,
        "subsection": "Watch / Wearables"
      },
      {
        "image": "/media/project-full/page-63.webp",
        "page": 63,
        "caption": "Redmi Watch 3 · 发布页面应用",
        "alt": "ECO system：Redmi Watch 3 · 发布页面应用，原作品集第63页",
        "width": 1600,
        "height": 900,
        "subsection": "Watch / Wearables"
      },
      {
        "image": "/media/project-full/page-64.webp",
        "page": 64,
        "caption": "Xiaomi · 穿戴产品与材质场景",
        "alt": "ECO system：Xiaomi · 穿戴产品与材质场景，原作品集第64页",
        "width": 1600,
        "height": 900,
        "subsection": "Watch / Wearables"
      },
      {
        "image": "/media/project-full/page-65.webp",
        "page": 65,
        "caption": "Xiaomi Smart Band 8 Pro · 产品与功能视觉",
        "alt": "ECO system：Xiaomi Smart Band 8 Pro · 产品与功能视觉，原作品集第65页",
        "width": 1600,
        "height": 900,
        "subsection": "Watch / Wearables"
      },
      {
        "image": "/media/project-full/page-66.webp",
        "page": 66,
        "caption": "Xiaomi Watch S3 · 结构与功能视觉",
        "alt": "ECO system：Xiaomi Watch S3 · 结构与功能视觉，原作品集第66页",
        "width": 1600,
        "height": 900,
        "subsection": "Watch / Wearables"
      },
      {
        "image": "/media/project-full/page-67.webp",
        "page": 67,
        "caption": "Xiaomi Watch S3 · 发布页面应用",
        "alt": "ECO system：Xiaomi Watch S3 · 发布页面应用，原作品集第67页",
        "width": 1600,
        "height": 900,
        "subsection": "Watch / Wearables"
      },
      {
        "image": "/media/project-full/page-68.webp",
        "page": 68,
        "caption": "Redmi Watch 5 · 产品与续航",
        "alt": "ECO system：Redmi Watch 5 · 产品与续航，原作品集第68页",
        "width": 1600,
        "height": 900,
        "subsection": "Watch / Wearables"
      },
      {
        "image": "/media/project-full/page-69.webp",
        "page": 69,
        "caption": "Redmi Watch 5 · 人物与显示体验",
        "alt": "ECO system：Redmi Watch 5 · 人物与显示体验，原作品集第69页",
        "width": 1600,
        "height": 900,
        "subsection": "Watch / Wearables"
      },
      {
        "image": "/media/project-full/page-70.webp",
        "page": 70,
        "caption": "Redmi Watch 5 · 显示、佩戴与续航整合",
        "alt": "ECO system：Redmi Watch 5 · 显示、佩戴与续航整合，原作品集第70页",
        "width": 1600,
        "height": 900,
        "subsection": "Watch / Wearables"
      },
      {
        "image": "/media/project-full/page-71.webp",
        "page": 71,
        "caption": "Redmi Buds 6 Pro · 产品主视觉",
        "alt": "ECO system：Redmi Buds 6 Pro · 产品主视觉，原作品集第71页",
        "width": 1600,
        "height": 900,
        "subsection": "Earbuds"
      },
      {
        "image": "/media/project-full/page-72.webp",
        "page": 72,
        "caption": "Redmi Buds 6 Pro · 降噪与聆听场景",
        "alt": "ECO system：Redmi Buds 6 Pro · 降噪与聆听场景，原作品集第72页",
        "width": 1600,
        "height": 900,
        "subsection": "Earbuds"
      },
      {
        "image": "/media/project-full/page-73.webp",
        "page": 73,
        "caption": "Redmi Buds 6 Pro · 产品功能整合",
        "alt": "ECO system：Redmi Buds 6 Pro · 产品功能整合，原作品集第73页",
        "width": 1600,
        "height": 900,
        "subsection": "Earbuds"
      },
      {
        "image": "/media/project-full/page-74.webp",
        "page": 74,
        "caption": "Redmi Buds 6 · 产品与色彩视觉",
        "alt": "ECO system：Redmi Buds 6 · 产品与色彩视觉，原作品集第74页",
        "width": 1600,
        "height": 900,
        "subsection": "Earbuds"
      },
      {
        "image": "/media/project-full/page-75.webp",
        "page": 75,
        "caption": "Redmi Buds 6 · 音质、降噪与使用场景",
        "alt": "ECO system：Redmi Buds 6 · 音质、降噪与使用场景，原作品集第75页",
        "width": 1600,
        "height": 900,
        "subsection": "Earbuds"
      },
      {
        "image": "/media/project-full/page-76.webp",
        "page": 76,
        "caption": "Xiaomi Smart Band 7 Pro · 产品与功能视觉",
        "alt": "ECO system：Xiaomi Smart Band 7 Pro · 产品与功能视觉，原作品集第76页",
        "width": 1600,
        "height": 900,
        "subsection": "Watch / Wearables"
      },
      {
        "image": "/media/project-full/page-77.webp",
        "page": 77,
        "caption": "Xiaomi Smart Band 7 Pro · 佩戴与生活场景",
        "alt": "ECO system：Xiaomi Smart Band 7 Pro · 佩戴与生活场景，原作品集第77页",
        "width": 1600,
        "height": 900,
        "subsection": "Watch / Wearables"
      },
      {
        "image": "/media/project-full/page-78.webp",
        "page": 78,
        "caption": "Xiaomi Robot Vacuum X10+ · 清洁与导航功能",
        "alt": "ECO system：Xiaomi Robot Vacuum X10+ · 清洁与导航功能，原作品集第78页",
        "width": 1600,
        "height": 900,
        "subsection": "Robot vacuum"
      },
      {
        "image": "/media/project-full/page-79.webp",
        "page": 79,
        "caption": "Xiaomi Robot Vacuum X10+ · 家居场景与使用体验",
        "alt": "ECO system：Xiaomi Robot Vacuum X10+ · 家居场景与使用体验，原作品集第79页",
        "width": 1600,
        "height": 900,
        "subsection": "Robot vacuum"
      }
    ],
    "sourcePageRange": [
      59,
      79
    ]
  },
  "discovery": {
    "pages": [
      discoveryFilm,
      discoveryCover,
      {
        "image": "/media/project-full/page-82.webp",
        "page": 82,
        "caption": "The Test of Elements · 影片与旁白处理",
        "alt": "The Test of Elements：The Test of Elements · 影片与旁白处理，原作品集第82页",
        "width": 1600,
        "height": 900,
        "subsection": "Film Treatment"
      },
      {
        "image": "/media/project-full/page-83.webp",
        "page": 83,
        "caption": "The Test of Elements · 影像方向参考",
        "alt": "The Test of Elements：The Test of Elements · 影像方向参考，原作品集第83页",
        "width": 1600,
        "height": 900,
        "subsection": "Visual reference"
      },
      {
        "image": "/media/project-full/page-84.webp",
        "page": 84,
        "caption": "The Test of Elements · 故事线与分镜",
        "alt": "The Test of Elements：The Test of Elements · 故事线与分镜，原作品集第84页",
        "width": 2400,
        "height": 1350,
        "subsection": "Story board"
      },
      {
        "image": "/media/project-full/page-85.webp",
        "page": 85,
        "caption": "The Test of Elements · 项目信息",
        "alt": "The Test of Elements：The Test of Elements · 项目信息，原作品集第85页",
        "width": 1600,
        "height": 900,
        "subsection": "项目信息"
      },
      {
        "image": "/media/project-full/page-86.webp",
        "page": 86,
        "caption": "The Test of Elements · 影片画面精选",
        "alt": "The Test of Elements：The Test of Elements · 影片画面精选，原作品集第86页",
        "width": 1600,
        "height": 900,
        "subsection": "影片画面"
      }
    ],
    "sourcePageRange": [
      81,
      86
    ]
  },
  "cafe": {
    "pages": [
      cafeFilm,
      {
        "image": "/media/project-full/page-87.webp",
        "page": 87,
        "caption": "感 CAFÉ · 项目封页",
        "alt": "「感 CAFÉ」· 项目封页，原作品集第87页",
        "width": 1600,
        "height": 900,
        "subsection": "项目封页"
      },
      {
        "image": "/media/project-full/page-88.webp",
        "page": 88,
        "caption": "感 CAFÉ · 影片与旁白处理",
        "alt": "「感 CAFÉ」· 影片与旁白处理，原作品集第88页",
        "width": 1600,
        "height": 900,
        "subsection": "Film Treatment"
      },
      {
        "image": "/media/project-full/page-89.webp",
        "page": 89,
        "caption": "感 CAFÉ · 影像方向参考",
        "alt": "「感 CAFÉ」· 影像方向参考，原作品集第89页",
        "width": 1600,
        "height": 900,
        "subsection": "Visual reference"
      },
      {
        "image": "/media/project-full/page-90.webp",
        "page": 90,
        "caption": "感 CAFÉ · 故事分镜",
        "alt": "「感 CAFÉ」· 故事分镜，原作品集第90页",
        "width": 2400,
        "height": 1350,
        "subsection": "Story board"
      },
      {
        "image": "/media/project-full/page-91.webp",
        "page": 91,
        "caption": "感 CAFÉ · 项目信息",
        "alt": "「感 CAFÉ」· 项目信息，原作品集第91页",
        "width": 1600,
        "height": 900,
        "subsection": "项目信息"
      },
      {
        "image": "/media/project-full/page-92.webp",
        "page": 92,
        "caption": "感 CAFÉ · 影片画面精选",
        "alt": "「感 CAFÉ」· 影片画面精选，原作品集第92页",
        "width": 1600,
        "height": 900,
        "subsection": "影片画面"
      }
    ],
    "sourcePageRange": [
      87,
      92
    ]
  },
  "mercedes": {
    "pages": [
      {
        "image": "/media/project-full/page-93.webp",
        "page": 93,
        "caption": "Mercedes-Benz · 项目封页",
        "alt": "心之所向：Mercedes-Benz · 项目封页，原作品集第93页",
        "width": 1600,
        "height": 900,
        "subsection": "项目封页"
      },
      {
        "image": "/media/project-full/page-94.webp",
        "page": 94,
        "caption": "心之所向 · 影片与创意处理",
        "alt": "心之所向：心之所向 · 影片与创意处理，原作品集第94页",
        "width": 1600,
        "height": 900,
        "subsection": "Film Treatment"
      },
      {
        "image": "/media/project-full/page-95.webp",
        "page": 95,
        "caption": "心之所向 · 影像方向参考",
        "alt": "心之所向：心之所向 · 影像方向参考，原作品集第95页",
        "width": 1600,
        "height": 900,
        "subsection": "Visual reference"
      },
      {
        "image": "/media/project-full/page-96.webp",
        "page": 96,
        "caption": "心之所向 · 故事分镜",
        "alt": "心之所向：心之所向 · 故事分镜，原作品集第96页",
        "width": 2400,
        "height": 1350,
        "subsection": "Story board"
      },
      {
        "image": "/media/project-full/page-97.webp",
        "page": 97,
        "caption": "心之所向 · 项目信息与创意提案角色",
        "alt": "心之所向：心之所向 · 项目信息与创意提案角色，原作品集第97页",
        "width": 1600,
        "height": 900,
        "subsection": "项目信息"
      },
      {
        "image": "/media/project-full/page-98.webp",
        "page": 98,
        "caption": "心之所向 · 影片画面精选",
        "alt": "心之所向：心之所向 · 影片画面精选，原作品集第98页",
        "width": 1600,
        "height": 900,
        "subsection": "影片画面"
      }
    ],
    "sourcePageRange": [
      93,
      98
    ]
  },
  "mercedes-social": {
    "pages": [
      {
        "image": "/media/project-full/page-04.webp",
        "page": 4,
        "caption": "奔驰 · 牛年新春社交海报（一）",
        "alt": "奔驰 · 牛年新春海报：奔驰 · 牛年新春社交海报（一），原作品集第4页",
        "width": 1600,
        "height": 900
      },
      {
        "image": "/media/project-full/page-05.webp",
        "page": 5,
        "caption": "奔驰 · 牛年新春社交海报（二）",
        "alt": "奔驰 · 牛年新春海报：奔驰 · 牛年新春社交海报（二），原作品集第5页",
        "width": 1600,
        "height": 900
      }
    ],
    "sourcePageRange": [
      4,
      5
    ]
  },
  "sf-motors": {
    "pages": [
      {
        "image": "/media/project-full/page-19.webp",
        "page": 19,
        "caption": "SF MOTORS · 开屏海报",
        "alt": "SF MOTORS · 开屏海报：SF MOTORS · 开屏海报，原作品集第19页",
        "width": 1600,
        "height": 900
      }
    ],
    "sourcePageRange": [
      19,
      19
    ]
  },
  "volkswagen": {
    "pages": [
      {
        "image": "/media/project-full/page-20.webp",
        "page": 20,
        "caption": "Volkswagen · 星球归属系列（一）",
        "alt": "Volkswagen · 星球归属：Volkswagen · 星球归属系列（一），原作品集第20页",
        "width": 1600,
        "height": 900
      },
      {
        "image": "/media/project-full/page-21.webp",
        "page": 21,
        "caption": "Volkswagen · 星球归属系列（二）",
        "alt": "Volkswagen · 星球归属：Volkswagen · 星球归属系列（二），原作品集第21页",
        "width": 1600,
        "height": 900
      }
    ],
    "sourcePageRange": [
      20,
      21
    ]
  }
}

// Independently identified case metadata; chronological/company fields intentionally absent.
export const additionalPresentationCases = {
  "mercedes-social": {
    "title": "New Year Poster",
    "category": "visual",
    "description": "奔驰牛年新春社交海报，原PDF页标题为“Social 牛年新春海报”。",
    "pages": [
      {
        "image": "/media/project-full/page-04.webp",
        "page": 4,
        "caption": "奔驰 · 牛年新春社交海报（一）",
        "alt": "奔驰 · 牛年新春海报：奔驰 · 牛年新春社交海报（一），原作品集第4页",
        "width": 1600,
        "height": 900
      },
      {
        "image": "/media/project-full/page-05.webp",
        "page": 5,
        "caption": "奔驰 · 牛年新春社交海报（二）",
        "alt": "奔驰 · 牛年新春海报：奔驰 · 牛年新春社交海报（二），原作品集第5页",
        "width": 1600,
        "height": 900
      }
    ],
    "sourcePageRange": [
      4,
      5
    ]
  },
  "sf-motors": {
    "title": "SF MOTORS",
    "category": "visual",
    "description": "以Creation / Humanity / Technology递进呈现SF MOTORS的未来出行想象。",
    "pages": [
      {
        "image": "/media/project-full/page-19.webp",
        "page": 19,
        "caption": "SF MOTORS · 开屏海报",
        "alt": "SF MOTORS · 开屏海报：SF MOTORS · 开屏海报，原作品集第19页",
        "width": 1600,
        "height": 900
      }
    ],
    "sourcePageRange": [
      19,
      19
    ]
  },
  "volkswagen": {
    "title": "星球归属",
    "category": "visual",
    "description": "将车辆能力对应到行星符号，以宇宙、轨道线和数字网格建立系列视觉。",
    "pages": [
      {
        "image": "/media/project-full/page-20.webp",
        "page": 20,
        "caption": "Volkswagen · 星球归属系列（一）",
        "alt": "Volkswagen · 星球归属：Volkswagen · 星球归属系列（一），原作品集第20页",
        "width": 1600,
        "height": 900
      },
      {
        "image": "/media/project-full/page-21.webp",
        "page": 21,
        "caption": "Volkswagen · 星球归属系列（二）",
        "alt": "Volkswagen · 星球归属：Volkswagen · 星球归属系列（二），原作品集第21页",
        "width": 1600,
        "height": 900
      }
    ],
    "sourcePageRange": [
      20,
      21
    ]
  }
}
