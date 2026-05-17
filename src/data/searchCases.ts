export interface SearchCase {
  keywords: string[]
  sceneId: string
  label: string
  expertAdvice: string
}

// 关键词 → 场景映射
export const searchCases: SearchCase[] = [
  {
    keywords: ['腿脚', '走路', '脚疼', '鞋', '膝盖', '腿', '关节'],
    sceneId: 's7',
    label: '出门不累脚',
    expertAdvice: '专家建议：老人选鞋要"一折、二捏、三拧"。折一下看前掌是否柔软，捏一下看后跟是否稳固，拧一下看抗扭转力，这样走路才不累脚。',
  },
  {
    keywords: ['牙齿', '牙', '吃饭', '嚼', '消化', '蛋白质', '营养'],
    sceneId: 's1',
    label: '吃饭牙不愁',
    expertAdvice: '口腔科医生提醒：假牙不清洗比马桶还脏！每天用清洁片泡一泡，吃东西才放心。软食不是只能喝粥，山药南瓜泥营养又好嚼。',
  },
  {
    keywords: ['保暖', '冬天', '冷', '居家', '暖气', '暖和'],
    sceneId: 's4',
    label: '睡个好觉',
    expertAdvice: '中医养生讲究：头寒脚暖百病消。冬天出门戴帽、在家穿棉拖鞋，腰腹保暖最关键，一条好的电热毯顶三床被子。',
  },
  {
    keywords: ['忘', '记忆', '忘事', '记性', '吃药', '药盒', '提醒'],
    sceneId: 's3',
    label: '记忆好帮手',
    expertAdvice: '医生提醒：老人忘事不一定是老糊涂，可能是没睡好或营养不够。把药分装到智能药盒里，定时提醒，再也不会忘记吃药。子女在外也更放心。',
  },
  {
    keywords: ['衣服', '穿衣', '穿搭', '外套', '体面', '聚会'],
    sceneId: 's8',
    label: '聚会有面子',
    expertAdvice: '形象顾问建议：中老年穿搭记住三个字——净、挺、合。颜色选素净不花哨，面料要挺括不软塌，尺寸要合身不紧绷，穿出门邻居都夸年轻。',
  },
  {
    keywords: ['养生', '补钙', '血压', '健康', '按摩', '颈椎'],
    sceneId: 's2',
    label: '气色显年轻',
    expertAdvice: '营养师叮嘱：补钙不是越多越好，随餐服用吸收更好，同时别忘了多晒太阳补充维D。血压记得每天定时量，早晚各一次最准。',
  },
  {
    keywords: ['出行', '旅行', '火车', '飞机', '拉杆箱'],
    sceneId: 's6',
    label: '干活不弯腰',
    expertAdvice: '旅行达人经验：老年人出门记住"三带三不带"——必带药盒、保温杯、防滑鞋垫；不带重物、不穿新鞋、不赶夜路。轻装上阵才开心。',
  },
  {
    keywords: ['带娃', '孙子', '孙女', '宝宝', '婴儿'],
    sceneId: 's6',
    label: '干活不弯腰',
    expertAdvice: '儿科医生提示：带孙子安全第一，家里插座要有保护盖，桌角贴防撞条，药物一定要锁好。辅食机省时又省力，做一顿够吃一整天。',
  },
  {
    keywords: ['手机', '微信', '防骗', '骗局', '上网'],
    sceneId: 's5',
    label: '东西看得清',
    expertAdvice: '反诈民警提醒：记住"三不原则"——不点陌生链接、不信天上掉馅饼、不转账给陌生人。收到"中奖"短信直接删，有疑问找子女帮忙看。',
  },
]

export function matchScene(query: string): SearchCase | null {
  const q = query.toLowerCase()
  for (const c of searchCases) {
    if (c.keywords.some((k) => q.includes(k))) return c
  }
  return null
}
