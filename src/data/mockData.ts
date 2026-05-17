// ============================================================
// 场景定义 — 8 个银发族核心生活场景
// ============================================================

export interface Scene {
  id: string
  name: string
  icon: string
}

export const scenes: Scene[] = [
  { id: 's1', name: '吃饭牙不愁', icon: '🍚' },
  { id: 's2', name: '气色显年轻', icon: '✨' },
  { id: 's3', name: '记忆好帮手', icon: '🧠' },
  { id: 's4', name: '睡个好觉', icon: '😴' },
  { id: 's5', name: '东西看得清', icon: '👓' },
  { id: 's6', name: '干活不弯腰', icon: '🛠️' },
  { id: 's7', name: '出门不累脚', icon: '👟' },
  { id: 's8', name: '聚会有面子', icon: '🎉' },
]

// ============================================================
// 视频数据 — 每场景 2 条，共 16 条
// ============================================================

export interface Video {
  id: string
  sceneId: string
  title: string
  summary: string
  videoUrl: string
  coverUrl: string
  coverImage?: string
  author: string
  avatar: string
  avatarUrl: string
  views: string
  likes: string
}

export const videos: Video[] = [
  // — s1 吃饭牙不愁 —
  { id: 'v1', sceneId: 's1', title: '人过50岁后，肌肉每年流失3%，一定要摄入足量的蛋白质', summary: '老年营养讲堂张教授：科学补充蛋白质，这几种食物别错过', videoUrl: '#', coverUrl: '#', author: '老年营养讲堂', avatar: '👨‍⚕️', avatarUrl: 'https://picsum.photos/seed/doc1/80/80', views: '5.7万次播放', likes: '486次点赞' },
  { id: 'v2', sceneId: 's1', title: '补钙存在三个误区，钙片含量不是越高越好', summary: '骨科专家详细解读：中老年人补钙的正确打开方式', videoUrl: '#', coverUrl: '#', author: '老陈的逆龄实验', avatar: '🧓', avatarUrl: 'https://picsum.photos/seed/uncle1/80/80', views: '3.2万次播放', likes: '328次点赞' },

  // — s2 出门不累脚 —
  { id: 'v3', sceneId: 's2', title: '挑鞋 3 招，走路不累脚', summary: '骨科医生教你选对鞋，走路逛街不脚疼', videoUrl: '#', coverUrl: '#', author: '健康步行指南', avatar: '👟', avatarUrl: 'https://picsum.photos/seed/walk1/80/80', views: '4.1万次播放', likes: '412次点赞' },
  { id: 'v4', sceneId: 's2', title: '健步鞋 vs 运动鞋怎么选', summary: '不同场景穿不同鞋，一图看懂区别', videoUrl: '#', coverUrl: '#', author: '鞋子测评老王', avatar: '🧑', avatarUrl: 'https://picsum.photos/seed/wang1/80/80', views: '2.8万次播放', likes: '215次点赞' },

  // — s3 居家暖洋洋 —
  { id: 'v5', sceneId: 's3', title: '冬天居家保暖小妙招', summary: '不花大钱也能让家里暖和起来', videoUrl: '#', coverUrl: '#', author: '居家生活家', avatar: '🏠', avatarUrl: 'https://picsum.photos/seed/home1/80/80', views: '6.3万次播放', likes: '571次点赞' },
  { id: 'v6', sceneId: 's3', title: '老年人防滑防摔家居改造', summary: '浴室、厨房、走廊 3 个重点区域安全升级', videoUrl: '#', coverUrl: '#', author: '安全家居达人', avatar: '🛡️', avatarUrl: 'https://picsum.photos/seed/safe1/80/80', views: '3.9万次播放', likes: '302次点赞' },

  // — s4 穿得体面不贵 —
  { id: 'v7', sceneId: 's4', title: '中老年穿搭 3 原则', summary: '舒适、得体、不花哨，出门有面子', videoUrl: '#', coverUrl: '#', author: '时尚奶奶团', avatar: '👩', avatarUrl: 'https://picsum.photos/seed/fashion1/80/80', views: '8.2万次播放', likes: '723次点赞' },
  { id: 'v8', sceneId: 's4', title: '换季整理衣柜指南', summary: '留下该留的，淘汰该汰的，衣柜清爽不凌乱', videoUrl: '#', coverUrl: '#', author: '生活整理师小林', avatar: '🧹', avatarUrl: 'https://picsum.photos/seed/lin1/80/80', views: '2.1万次播放', likes: '189次点赞' },

  // — s5 养生有讲究 —
  { id: 'v9', sceneId: 's5', title: '常见养生误区大盘点', summary: '这些"好习惯"其实在伤身，快看你中了几条', videoUrl: '#', coverUrl: '#', author: '养生堂', avatar: '🍵', avatarUrl: 'https://picsum.photos/seed/tea1/80/80', views: '9.5万次播放', likes: '890次点赞' },
  { id: 'v10', sceneId: 's5', title: '每天 10 分钟养生操', summary: '跟着视频做，舒筋活血全身轻松', videoUrl: '#', coverUrl: '#', author: '太极张老师', avatar: '🧘', avatarUrl: 'https://picsum.photos/seed/taichi1/80/80', views: '7.4万次播放', likes: '656次点赞' },

  // — s6 出行不费力 —
  { id: 'v11', sceneId: 's6', title: '老年人旅行行李清单', summary: '带对东西少受罪，出门更安心', videoUrl: '#', coverUrl: '#', author: '快乐旅行团', avatar: '✈️', avatarUrl: 'https://picsum.photos/seed/travel1/80/80', views: '4.6万次播放', likes: '380次点赞' },
  { id: 'v12', sceneId: 's6', title: '坐火车飞机注意事项', summary: '提前了解这些细节，旅途顺利不折腾', videoUrl: '#', coverUrl: '#', author: '出行小助手', avatar: '🚄', avatarUrl: 'https://picsum.photos/seed/train1/80/80', views: '3.3万次播放', likes: '267次点赞' },

  // — s7 带娃省心好物 —
  { id: 'v13', sceneId: 's7', title: '带孙子必备好物清单', summary: '过来人推荐的实用好物，带娃轻松一半', videoUrl: '#', coverUrl: '#', author: '幸福奶奶', avatar: '👶', avatarUrl: 'https://picsum.photos/seed/baby1/80/80', views: '5.1万次播放', likes: '445次点赞' },
  { id: 'v14', sceneId: 's7', title: '安全带娃注意事项', summary: '家中安全隐患排查，让小宝贝远离危险', videoUrl: '#', coverUrl: '#', author: '儿科刘医生', avatar: '👨‍⚕️', avatarUrl: 'https://picsum.photos/seed/doc2/80/80', views: '6.8万次播放', likes: '598次点赞' },

  // — s8 聪明玩手机 —
  { id: 'v15', sceneId: 's8', title: '手机防骗必看指南', summary: '识别常见骗局套路，守住钱袋子', videoUrl: '#', coverUrl: '#', author: '反诈宣传员', avatar: '🛡️', avatarUrl: 'https://picsum.photos/seed/police1/80/80', views: '12.3万次播放', likes: '1102次点赞' },
  { id: 'v16', sceneId: 's8', title: '微信隐藏实用技巧', summary: '语音转文字、医院挂号、生活缴费一站搞定', videoUrl: '#', coverUrl: '#', author: '数码小课堂', avatar: '📱', avatarUrl: 'https://picsum.photos/seed/digital1/80/80', views: '7.9万次播放', likes: '715次点赞' },
]

// ============================================================
// 商品类型定义（数据从云数据库读取）
// ============================================================

export interface PeerReview {
  name: string
  avatar: string
  comment: string
}

export interface Product {
  id: string
  sceneId: string
  name: string
  price: number
  tag: string
  category: string
  buyUrl: string
  subCategory: string
  mainImage: string
  detailImageList?: string[]
  scene?: string
  expertTips?: string[]
  sceneWiki?: string
  peerReviews?: PeerReview[]
}
