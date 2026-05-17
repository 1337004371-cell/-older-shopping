/**
 * Process scraped ez66 data → final seed data
 *
 * Reads:     scripts/scraped-products.json
 * Output:    scripts/seed-data.json
 */

const fs = require('fs')
const path = require('path')
const OpenCC = require('opencc-js')

const t2s = OpenCC.Converter({ from: 'tw', to: 'cn' })
const scraped = JSON.parse(fs.readFileSync(path.join(__dirname, 'scraped-products.json'), 'utf-8'))

// ============================================================
// Category → sceneId mapping
// ============================================================
const CATEGORY_SCENE = {
  '養生餐食': 's1',
  '健康美體': 's2',
  '居家照护': 's4',
  '洗浴安全': 's6',
  '如厕辅助': 's6',
  '輕鬆閱聽': 's5',
  '行走助行': 's7',
  '熟年衣鞋': 's7',
}

// Hearing/communication products → s8
function getSceneId(product) {
  const cat = product.categoryGuess
  const name = product.name
  const desc = product.description || ''

  if (cat === '輕鬆閱聽') {
    if (/助聽|集音|聽力|收音機|擴音/.test(name)) return 's8'
    return 's5' // vision products
  }

  if (cat === '居家照护') {
    if (/床|枕|墊|褥/.test(name)) return 's4'
    if (/呼叫|看護|鈴/.test(name)) return 's3'
    return 's6'
  }

  return CATEGORY_SCENE[cat] || 's7'
}

// ============================================================
// SceneId + subCategory assignment
// ============================================================
function getSubCategory(sceneId, name) {
  const s = t2s(name)
  const map = {
    s1: () => {
      if (/增稠|饮品|绿茶|茶/.test(s)) return '增稠饮品'
      if (/点心|冻|布丁|慕斯/.test(s)) return '介护食品'
      return '营养补充'
    },
    s2: () => {
      if (/发|染|洗发/.test(s)) return '染发护发'
      if (/按摩|膝力|护膝|护腰|护腕/.test(s)) return '按摩理疗'
      if (/漱口|牙刷/.test(s)) return '口腔护理'
      return '运动健身'
    },
    s3: () => {
      if (/呼叫|看护/.test(s)) return '看护呼叫'
      return '提醒'
    },
    s4: () => {
      if (/养护床|电动.*床/.test(s)) return '养护床'
      if (/防褥疮|气垫床/.test(s)) return '防褥疮垫'
      return '床边扶手'
    },
    s5: () => {
      if (/放大镜/.test(s)) return '放大镜'
      return '滤蓝光眼镜'
    },
    s6: () => {
      if (/洗澡椅|沐浴|洗发/.test(s)) return '洗澡椅'
      if (/扶手|扶乐|起身|拉环/.test(s)) return '扶手'
      if (/马桶|便盆|尿袋/.test(s)) return '如厕辅助'
      if (/无障碍|斜坡|地垫|水彩/.test(s)) return '无障碍'
      return '防滑'
    },
    s7: () => {
      if (/散步车|健行车|助步车|助行/.test(s)) return '散步车'
      if (/拐杖|手杖|伞/.test(s)) return '拐杖'
      if (/轮椅/.test(s)) return '轮椅'
      if (/室内鞋|拖鞋|袜/.test(s)) return '室内鞋'
      return '止滑鞋'
    },
    s8: () => {
      if (/助听|集音|听力/.test(s)) return '助听器'
      if (/收音机/.test(s)) return '收音机'
      return '通讯设备'
    },
  }
  return (map[sceneId] || (() => '其他'))()
}

// ============================================================
// Tag (营销标签)
// ============================================================
const TAG_POOL = ['台湾制造', '日本进口', '长照补助', '限时特惠', '百亿补贴', '新品上市', '热销推荐']
function getTag(name, priceTWD) {
  if (/日本|IKEDA|ASAHI|Ever-Smile|FORICA|kewpie|Daiwa|CLEARDENT|KAWAMOTO|NISHIKI/.test(name)) return '日本进口'
  if (/台湾製|L'elan|Moonstar/.test(name)) return '台湾制造'
  if (priceTWD >= 10000) return '长照补助'
  if (priceTWD <= 200) return '限时特惠'
  return TAG_POOL[Math.floor(Math.random() * TAG_POOL.length)]
}

// ============================================================
// Scene descriptions
// ============================================================
const SCENE_TEXTS = {
  s1: '吃得好，营养跟得上',
  s2: '气色好，显年轻十岁',
  s3: '有需要，一按就呼叫',
  s4: '睡得香，精神自然好',
  s5: '看得清，生活更方便',
  s6: '浴室安全，家人放心',
  s7: '走路稳当不累脚',
  s8: '听得清，聊天不费劲',
}

// ============================================================
// Category (衣/食/住/行) mapping
// ============================================================
function getCategory(sceneId) {
  const map = { s1: '食', s2: '衣', s3: '住', s4: '住', s5: '住', s6: '住', s7: '行', s8: '住' }
  return map[sceneId] || '住'
}

// ============================================================
// AI Content Generation
// ============================================================
function generateExpertTips(sceneId, subCategory, name) {
  const tips = {
    s1: {
      '介护食品': [
        '选择适合长辈咀嚼硬度的食品等级',
        '注意保存期限与开封后的冷藏条件',
        '搭配日常饮食轮换，避免口味单一',
        '优先选择含蛋白质和钙质的产品',
        '可先少量购买试吃，确认接受度',
      ],
      '营养补充': [
        '注意每份蛋白质含量，建议每餐20g以上',
        '选择低钠、低糖的配方更健康',
        '软质餐食口感接近真实食物更有食欲',
        '微波加热后更香，但注意温度勿过烫',
        '可搭配蔬菜泥一起食用更均衡',
      ],
      '增稠饮品': [
        '注意增稠剂的合适浓度，太稠不好入口',
        '选择无糖或低糖配方更适合银发族',
        '饮用前摇匀确保口感一致',
        '搭配正餐饮用，增加水分摄入',
        '选择独立包装更方便携带',
      ],
    },
    s2: {
      '染发护发': [
        '选择植物性染发剂更温和不刺激',
        '使用前先做皮肤过敏测试',
        '染后48小时内避免洗发以固色',
        '选择含护发成分的二合一产品更方便',
        '白发补色产品可针对性遮盖新生白发',
      ],
      '按摩理疗': [
        '每次使用建议15-20分钟，避免过长时间',
        '选择有温热功能的款式效果更好',
        '关节处使用时从低档位开始适应',
        '饭后一小时再使用腹部按摩功能',
        '定期清洁按摩头保持卫生',
      ],
      '口腔护理': [
        '选择超软毛牙刷减少牙龈刺激',
        '含氟漱口水能有效预防蛀牙',
        '刷牙时力度要轻，避免损伤牙龈',
        '每三个月更换一次牙刷',
        '饭后使用漱口水保持口腔清新',
      ],
      '运动健身': [
        '选择合适阻力的训练器材循序渐进',
        '每天坚持10-15分钟轻度锻炼',
        '运动前做好热身，避免肌肉拉伤',
        '手部握力训练有助于日常活动',
        '配合深呼吸效果更好',
      ],
    },
    s3: {
      '看护呼叫': [
        '选择信号覆盖范围适合居家面积的款式',
        '夜灯功能方便起夜时快速找到按钮',
        '防水款式适合浴室使用',
        '定期检查电池电量确保正常运作',
        '选择铃声大、有震动的款式更可靠',
      ],
      '提醒': [
        '选择字大、声大的产品更适合长辈',
        '设置多个时间点提醒更不容易忘记',
        '选择操作简单的产品减少学习成本',
        '电池续航长的产品更省心',
        '可考虑带语音播报功能的款式',
      ],
    },
    s4: {
      '养护床': [
        '选择有三马达独立调节功能的更灵活',
        '注意床面尺寸是否匹配家中空间',
        '护栏高度要足够防止翻落',
        '电动调节时动作要缓慢，给长者适应时间',
        '定期检查电动马达运转是否正常',
      ],
      '防褥疮垫': [
        '选择交替充气式防褥疮效果更好',
        '注意气囊数量和管径规格',
        '定期检查气泵运转和管路密封性',
        '铺上薄床单使用更舒适',
        '每3-6个月检查一次气压是否正常',
      ],
      '床边扶手': [
        '选择可调节高度的款式适配不同床型',
        '安装时确保底座稳固不晃动',
        '扶手握把要包覆防滑材质',
        '承重至少100kg以上更安全',
        '有收纳袋的款式更实用',
      ],
    },
    s5: {
      '放大镜': [
        '2-3倍放大倍率适合日常阅读',
        '选择带LED灯的款式在暗处也能使用',
        '眼镜式放大镜解放双手更方便',
        '轻量化设计长时间使用不累',
        '选择有保修的品牌更有保障',
      ],
      '滤蓝光眼镜': [
        '选择全罩式镜片过滤效果更好',
        '镜片重量轻的款式佩戴更舒适',
        '日常看电视、手机时都建议佩戴',
        '注意镜片是否有防刮涂层',
        '镜框弹性好的更耐用',
      ],
    },
    s6: {
      '洗澡椅': [
        '选择高度可调节的款式适配不同身高',
        '注意承重限制，至少100kg以上',
        '防滑脚垫是必备安全设计',
        '有扶手的款式起身更方便',
        '铝合金材质防锈且轻便',
      ],
      '扶手': [
        '吸附式扶手免打孔安装更方便',
        '选择L型扶手浴室转弯处更实用',
        '安装前确认墙面平整光滑',
        '定期检查吸盘吸附力是否减弱',
        '选择承重100kg以上的款式更安全',
      ],
      '如厕辅助': [
        '选择免施工的产品改造负担更小',
        '马桶扶手高度要配合使用者身高',
        '便盆椅选择有轮子的移动更方便',
        '注意防水等级，浴室使用更安全',
        '折叠式设计收纳不占空间',
      ],
      '无障碍': [
        '防滑地垫是浴室安全的第一步',
        '选择免施工方案减少改造麻烦',
        '浴室门口放置吸水地垫防止滑倒',
        '圆角护角保护避免碰撞受伤',
        '整体套组比单品更划算',
      ],
      '防滑': [
        '选择硅胶材质的止滑垫更耐用',
        '座椅止滑垫注意尺寸匹配',
        '单向止滑设计上下车更安全',
        '定期清洁保持止滑效果',
        '防水材质浴室也能使用',
      ],
    },
    s7: {
      '散步车': [
        '选择有双刹车系统的更安全',
        '座位承重至少100kg才能放心坐',
        '收纳袋要够大方便购物',
        '折叠后体积小便于放入后备箱',
        '高度可调适配不同身高',
      ],
      '拐杖': [
        '碳纤维材质轻量又坚固',
        '选择有防滑胶头的款式更安全',
        '折叠式拐杖出行携带更方便',
        '高度可调适配不同身高',
        '四脚拐杖支撑面积大更稳当',
      ],
      '轮椅': [
        '选择快拆大轮的款式推动更省力',
        '折叠后体积小方便收纳和出行',
        '座椅宽度要留有适当余量',
        '扶手可掀起方便侧向移位',
        '注意总重量是否方便搬运',
      ],
      '止滑鞋': [
        '宽头设计不挤脚更舒适',
        '魔术贴开合方便穿脱',
        '鞋底防滑纹路深更安全',
        '透气材质夏天不闷脚',
        '室内外两用性价比更高',
      ],
      '室内鞋': [
        '全开式设计弯腰不方便也能轻松穿脱',
        '止滑大底在光滑地面更安全',
        '选择有足弓支撑的款式更舒适',
        '包覆性好的款式走路更稳',
        '可机洗的款式清洁更方便',
      ],
    },
    s8: {
      '助听器': [
        '选择有降噪功能的在嘈杂环境更清晰',
        '充电式比电池式更方便日常使用',
        '从低音量开始慢慢适应',
        '定期清洁耳塞保持卫生',
        '建议到听力中心做专业测试后再选购',
      ],
      '收音机': [
        '选择操作简单的旋钮式调频',
        '耳机插孔方便不打扰家人时使用',
        '口袋型大小随身携带更方便',
        '选择省电的款式电池用得更久',
        '声音大且清晰是关键选购标准',
      ],
      '通讯设备': [
        '选择字大、声大的产品更适合',
        '一键拨号功能操作更简便',
        '语音播报来电者姓名更方便',
        '续航长的产品减少充电频率',
        'SOS紧急呼叫功能很有必要',
      ],
    },
  }

  const sceneTips = tips[sceneId] || {}
  return sceneTips[subCategory] || sceneTips[Object.keys(sceneTips)[0]] || [
    '选择口碑好的品牌品质更有保障',
    '注意产品尺寸是否适合使用场景',
    '使用前仔细阅读说明书',
    '定期检查产品状态确保安全',
    '有疑问时咨询客服更安心',
  ]
}

function generateSceneWiki(sceneId, subCategory) {
  const wikis = {
    s1: '银发族随着年龄增长，咀嚼能力和消化功能逐渐减弱。介护食品是专为咀嚼困难的长者设计的营养膳食，通过特殊的加工工艺让食物保持原味的同时变得柔软易食。选择时应注意食品的硬度等级（分为容易咀嚼、舌头压碎、无需咀嚼三个等级），并根据长辈的实际能力选购。每日搭配不同口味的餐食轮换，既能保证营养均衡，也能增加食欲。',
    s2: '银发族的皮肤和头发护理需要更温和的产品。随着年龄增长，皮脂分泌减少，皮肤容易干燥；头发变白变细，需要特别的染护产品。选择银发族专用产品时，建议关注成分的温和性，避免刺激性化学物质。按摩理疗产品则能有效缓解关节酸痛，促进血液循环，但需注意使用时间和力度。',
    s3: '居家照护呼叫系统是独居长者安全保障的重要一环。好的呼叫器应具备信号稳定、铃声够大、操作简单三个核心特点。建议在卧室、浴室、客厅等关键位置各放一个呼叫按钮，确保任何位置都能及时呼救。夜灯功能也是实用加分项，方便起夜时快速找到按钮位置。',
    s4: '好的睡眠是健康的基石。银发族由于身体机能变化，对床具的要求更高。电动养护床可以独立调节头部和脚部高度，帮助长者找到最舒适的姿势；防褥疮气垫床通过交替充气减少局部压力，是长期卧床长者的必备品；床边扶手则为夜间起夜提供安全支撑，防止跌落。',
    s5: '视力下降是银发族最常见的困扰之一。老花镜只能解决近距离阅读问题，放大镜则可以在购物、看药品说明书、看手机等场景中提供更大的帮助。选择放大镜时，倍率不是越大越好——2到3倍适合大多数日常场景，倍率太高反而视野太小。带LED灯的款式在光线不足的环境下特别实用。',
    s6: '浴室是家中最容易发生意外的地方，尤其是对行动不便的长者。洗澡椅让长者可以坐着沐浴，减少滑倒风险；扶手提供稳定的支撑点，帮助长者在湿滑环境中保持平衡。选择免施工产品可以不破坏原有装修，适合租屋族或不想大改造的家庭。建议从扶手和防滑垫开始，逐步提升浴室安全。',
    s7: '保持行走能力是银发族独立生活的关键。散步车（助行车）不仅提供行走支撑，还自带座椅可以随时休息，是户外活动的最佳伙伴。拐杖则适合尚有行走能力但需要额外稳定性的长者。选择鞋类时，防滑、宽头、易穿脱是三大核心要素——好的银发鞋可以让每一步都走得更稳当。',
    s8: '听力下降常常被忽视，却严重影响银发族的社交生活。助听器技术近年来有了巨大进步，从传统的模拟放大到数字智能降噪，使用体验越来越好。选购时建议先做专业听力测试，了解自己的听力损失类型和程度，再选择合适的产品。好的助听器应该能区分人声和环境噪声，在嘈杂的聚会场合也能听清对话。',
  }
  return wikis[sceneId] || wikis['s7']
}

function generatePeerReviews(sceneId, subCategory, name) {
  // Realistic peer reviews per category
  const reviewTemplates = {
    s1: [
      { name: '王阿姨', avatar: '👩‍🦳', comment: '买给妈妈的，她特别喜欢这个口味，说比之前吃的好吃多了，现在每天都期待吃饭了' },
      { name: '老陈', avatar: '👴', comment: '牙口不好之后选择真的很少，这个吃起来不费力又有营养，已经回购好几次了' },
      { name: '张大妈', avatar: '👩', comment: '给老伴买的，他说味道不错，口感像真正的食物，比流食好太多了' },
    ],
    s2: [
      { name: '刘姐', avatar: '👩‍🦱', comment: '用了一个月，感觉头发比之前柔顺多了，白发也不那么明显了，邻居都说气色变好了' },
      { name: '赵叔', avatar: '🧓', comment: '膝盖疼了好几年，用这个按摩器每天按15分钟，走路舒服多了，值得推荐' },
      { name: '孙奶奶', avatar: '👵', comment: '以前刷牙总出血，换了超软毛的就不出了，漱口水也很温和不辣嘴' },
    ],
    s3: [
      { name: '李大叔', avatar: '👴', comment: '独居老人的安全感来源，按一下就能联系到家人，晚上睡觉也踏实多了' },
      { name: '周阿姨', avatar: '👩', comment: '装了三个按钮，卧室浴室客厅各一个，老人说很方便，比手机好操作' },
      { name: '钱奶奶', avatar: '👵', comment: '夜灯功能很贴心，起夜不用摸黑找开关了，铃声也够大声' },
    ],
    s4: [
      { name: '吴叔', avatar: '🧓', comment: '买了电动床后老伴不用我扶也能坐起来了，翻身调角度都很方便' },
      { name: '郑阿姨', avatar: '👩‍🦳', comment: '防褥疮垫是必须的，之前没用的时候老母亲骶尾部都红了，用了之后好多了' },
      { name: '冯大爷', avatar: '👴', comment: '床边扶手很稳当，起夜扶着站起来不费劲，安装也不麻烦' },
    ],
    s5: [
      { name: '陈奶奶', avatar: '👵', comment: '看药品说明书终于不用找人帮忙了，放大镜带着灯特别好用，推荐给老姐妹们' },
      { name: '马叔', avatar: '👴', comment: '眼镜式的比手持的方便太多了，看报纸、看手机都清晰，解放双手' },
      { name: '何阿姨', avatar: '👩', comment: '项链式的出门也能戴，在超市看商品标签特别方便，造型也不土' },
    ],
    s6: [
      { name: '黄大叔', avatar: '🧓', comment: '装了洗澡椅和扶手后，老伴洗澡我放心多了，不用时刻守在门外' },
      { name: '林阿姨', avatar: '👩‍🦳', comment: '吸附式扶手不用打孔，租的房子也能装，吸力很牢，用了半年没掉过' },
      { name: '杨奶奶', avatar: '👵', comment: '浴室无障碍套组一下子把安全问题都解决了，防滑垫效果特别好' },
    ],
    s7: [
      { name: '老王', avatar: '👴', comment: '有了散步车出门底气足多了，走累了随时能坐下来歇歇，双收纳袋买菜刚好' },
      { name: '钟阿姨', avatar: '👩', comment: '碳纤维拐杖很轻，折叠起来放包里，上下楼梯时拿出来用特别方便' },
      { name: '曹叔', avatar: '🧓', comment: '止滑鞋穿了半年了，鞋底纹路还很好，雨天出门也不怕滑了' },
    ],
    s8: [
      { name: '田大叔', avatar: '👴', comment: '戴了助听器后看电视不用开到最大声了，老伴也不用跟着受罪，家里安静多了' },
      { name: '许阿姨', avatar: '👩‍🦳', comment: '收音机小巧精致，散步时带着听广播，声音清楚，操作也简单' },
      { name: '罗奶奶', avatar: '👵', comment: '集音器在聚会时特别有用，终于能听清大家说什么了，不再觉得自己被冷落了' },
    ],
  }

  return reviewTemplates[sceneId] || reviewTemplates['s7']
}

// ============================================================
// Main processing
// ============================================================
function process() {
  const products = scraped.products.map((p, idx) => {
    const sceneId = getSceneId(p)
    const subCategory = getSubCategory(sceneId, p.name)
    const nameCN = t2s(p.name)
    const descCN = t2s(p.description || '').slice(0, 300)

    return {
      id: `p-${p.slug}`,
      sceneId,
      name: nameCN,
      scene: SCENE_TEXTS[sceneId],
      price: p.priceRMB,
      tag: t2s(getTag(p.name, p.priceTWD)),
      category: getCategory(sceneId),
      subCategory: t2s(subCategory),
      buyUrl: p.buyUrl,
      mainImage: p.mainImage,
      detailImageList: p.detailImageList,
      expertTips: generateExpertTips(sceneId, subCategory, nameCN).map(t2s),
      sceneWiki: t2s(generateSceneWiki(sceneId, subCategory)),
      peerReviews: generatePeerReviews(sceneId, subCategory, nameCN),
    }
  })

  // Stats
  const sceneCounts = {}
  const subCatCounts = {}
  products.forEach((p) => {
    sceneCounts[p.sceneId] = (sceneCounts[p.sceneId] || 0) + 1
    subCatCounts[p.subCategory] = (subCatCounts[p.subCategory] || 0) + 1
  })

  console.log('=== Processing Complete ===')
  console.log(`Total products: ${products.length}\n`)

  console.log('Scene distribution:')
  Object.entries(sceneCounts).sort().forEach(([k, v]) => console.log(`  ${k}: ${v}`))

  console.log('\nSubCategory distribution:')
  Object.entries(subCatCounts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`))

  // Save
  const outputPath = path.join(__dirname, 'seed-data.json')
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2))
  console.log(`\nSaved to: ${outputPath}`)

  // Preview first 3
  console.log('\n--- Preview (first 3) ---')
  products.slice(0, 3).forEach((p) => {
    console.log(`\n[${p.sceneId}] ${p.name}`)
    console.log(`  ¥${p.price} | ${p.tag} | ${p.category}/${p.subCategory}`)
    console.log(`  expertTips: ${p.expertTips.length} lines`)
    console.log(`  peerReviews: ${p.peerReviews.length} reviews`)
    console.log(`  images: 1 main + ${p.detailImageList.length} detail`)
  })
}

process()
