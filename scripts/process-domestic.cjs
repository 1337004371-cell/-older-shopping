/**
 * 处理国内电商抓取数据 → Product 格式
 * Reads:  scripts/scraped-domestic.json
 * Output: scripts/seed-data-domestic.json
 */

const fs = require('fs')
const path = require('path')

const scraped = JSON.parse(fs.readFileSync(path.join(__dirname, 'scraped-domestic.json'), 'utf-8'))

// Clean JD title: remove 【行情 报价 价格 评测】 etc
function cleanName(name) {
  return name
    .replace(/【行情[^】]*】/g, '')
    .replace(/【图片[^】]*】/g, '')
    .replace(/【.*?报价.*?】/g, '')
    .replace(/【价保\d+】/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Price estimation by product type
function estimatePrice(name) {
  if (/钙片|维生素|鱼油|蛋白粉/.test(name)) return 150
  if (/轮椅|助力车|电动车/.test(name)) return 3000
  if (/养护床|电动床/.test(name)) return 5000
  if (/破壁机|流食机/.test(name)) return 500
  if (/散步车|助行车/.test(name)) return 2000
  if (/洗澡椅|沐浴/.test(name)) return 300
  if (/扶手|护栏/.test(name)) return 200
  if (/移动马桶|座便/.test(name)) return 300
  if (/牵引器|理疗仪/.test(name)) return 400
  if (/护腰|护膝/.test(name)) return 200
  if (/药盒/.test(name)) return 50
  if (/握力球|康复训练/.test(name)) return 80
  if (/报警器|呼叫器|雷达/.test(name)) return 300
  if (/定位|手表/.test(name)) return 500
  if (/手机/.test(name)) return 300
  if (/围兜|围嘴/.test(name)) return 40
  if (/辅助筷|助食/.test(name)) return 50
  if (/助食碗|防洒/.test(name)) return 60
  if (/流食杯|护理杯/.test(name)) return 80
  if (/接便器|便盆|接尿/.test(name)) return 100
  if (/马桶扶手|坐便扶手/.test(name)) return 250
  if (/夜灯/.test(name)) return 50
  if (/洗头盆|洗头帽/.test(name)) return 100
  if (/灶台|橱柜/.test(name)) return 8000
  if (/桌椅|餐桌/.test(name)) return 1500
  if (/病号服|护理服/.test(name)) return 120
  if (/内衣|文胸/.test(name)) return 80
  if (/防漏尿|尿失禁/.test(name)) return 60
  if (/浴罩/.test(name)) return 80
  if (/玩具/.test(name)) return 50
  if (/台盆|浴室柜/.test(name)) return 2000
  if (/灶|煤气/.test(name)) return 2000
  return 200
}

// Infer sceneId from product name
function inferSceneId(name) {
  if (/米稀|养胃|营养|蛋白粉|钙片|维生素|鱼油|辅助筷|助食|防洒碗|流食杯|围兜|破壁机|流食/.test(name)) return 's1'
  if (/护腰|护膝|膝盖|按摩|理疗|颈椎|牵引|握力|康复训练|病号服|内衣|文胸|防漏尿|染发|洗发|染护/.test(name)) return 's2'
  if (/呼叫器|报警器|防走失|药盒|提醒|感应器|雷达|跌倒/.test(name)) return 's3'
  if (/床边扶手|床护栏|起身器|夜灯|桌椅|灶台|橱柜|适老/.test(name)) return 's4'
  if (/放大镜|老花|眼镜|滤蓝光/.test(name)) return 's5'
  if (/洗澡椅|沐浴|扶手|马桶|便盆|接尿|如厕|浴罩|洗头|卫生间|卫浴|浴室|台盆/.test(name)) return 's6'
  if (/轮椅|助力车|散步车|助行|拐杖|散步鞋|止滑|室内鞋/.test(name)) return 's7'
  if (/助听|收音机|手机|定位|通讯|电话/.test(name)) return 's8'
  return 's7'
}

const SCENE_TEXTS = {
  s1: '吃得好，营养跟得上', s2: '气色好，显年轻十岁',
  s3: '有需要，一按就呼叫', s4: '睡得香，精神自然好',
  s5: '看得清，生活更方便', s6: '浴室安全，家人放心',
  s7: '走路稳当不累脚', s8: '听得清，聊天不费劲'
}

function getCategory(sceneId) {
  const map = { s1:'食', s2:'衣', s3:'住', s4:'住', s5:'住', s6:'住', s7:'行', s8:'住' }
  return map[sceneId] || '住'
}

function getSubCategory(sceneId, name) {
  const map = {
    s1: () => /增稠|饮品/.test(name) ? '增稠饮品' : /辅助筷|助食|防洒|流食杯|围兜|破壁机/.test(name) ? '介护食品' : '营养补充',
    s2: () => /护腰|护膝|膝盖|按摩|理疗|颈椎|牵引/.test(name) ? '按摩理疗' : /康复训练|握力/.test(name) ? '运动健身' : '染发护发',
    s3: () => /药盒/.test(name) ? '提醒' : '看护呼叫',
    s4: () => /床边扶手|起身器|护栏/.test(name) ? '床边扶手' : '养护床',
    s5: () => '放大镜',
    s6: () => /洗澡椅|沐浴|洗头/.test(name) ? '洗澡椅' : /扶手|护栏/.test(name) ? '扶手' : /马桶|便盆|接尿|座便/.test(name) ? '如厕辅助' : '防滑',
    s7: () => /轮椅|助力车/.test(name) ? '轮椅' : '散步车',
    s8: () => /手机|定位/.test(name) ? '通讯设备' : '助听器'
  }
  return (map[sceneId] || (() => '其他'))()
}

function getTag(name, price) {
  if (price >= 3000) return '长照补助'
  if (price <= 60) return '限时特惠'
  if (/进口|日本|Swisse|善存/.test(name)) return '进口优选'
  if (/鱼跃|可孚/.test(name)) return '医疗器械'
  return '热销推荐'
}

function generateExpertTips(sceneId, subCategory) {
  const tips = require('./content-1-28.cjs')
  // Reuse from first matching product in the same sceneId/subCategory
  for (const val of Object.values(tips)) {
    // We just generate generic tips per scene
  }
  const generic = {
    s1: ['选择适合长辈咀嚼硬度的食品', '注意保质期和储存条件', '少量多样轮换避免口味单一', '优先选择含蛋白质和钙的产品', '微波加热后注意温度勿过烫'],
    s2: ['使用前仔细阅读说明书', '循序渐进不要过度使用', '选择正规品牌的理疗产品', '有皮肤过敏史先做小范围测试', '定期检查产品状态确保安全'],
    s3: ['选择操作简单的一键式产品', '信号覆盖要满足居家面积', '定期检查电池电量', '防水款式适合浴室使用', '夜灯功能方便起夜时找到按钮'],
    s4: ['安装时确保稳固不晃动', '选择可调节高度的款式更灵活', '注意承重限制确保安全', '定期检查螺丝是否松动', '选择圆角设计避免磕碰'],
    s5: ['选择合适倍率的放大镜', '带LED灯的款式更实用', '轻量化设计长时间使用不累', '注意镜片是否有防刮涂层', '眼镜式的解放双手更方便'],
    s6: ['免打孔安装不破坏装修', '选择承重100kg以上的产品', '防滑是浴室安全的第一步', '定期检查安装是否牢固', '选择防水材质更耐用'],
    s7: ['选择轻量化的产品更方便', '注意承重和安全认证', '折叠功能方便收纳和出行', '试推试坐确认舒适度', '定期检查刹车和轮胎'],
    s8: ['选择字大、声大的产品', '一键操作更简便', '续航长的产品更省心', 'SOS紧急功能很有必要', '定期充电确保正常使用']
  }
  return generic[sceneId] || generic['s6']
}

function generateSceneWiki(sceneId, subCategory) {
  const wikis = {
    s1: '银发族随着年龄增长，咀嚼能力和消化功能逐渐减弱。合适的介护食品和营养补充品可以帮助长辈维持均衡营养，同时辅助餐具让进食更加安全和便捷。从流食机到专用碗筷，这些产品让银发族在进食困难时也能保持营养摄入和用餐尊严。',
    s2: '银发族的身体需要更细致的护理和保养。从护腰带保护腰椎，到膝盖理疗缓解关节疼痛，再到康复训练器材维持肢体功能，这些产品帮助长者在日常生活中保持身体活力和舒适感。选择正规医疗器械品牌的产品更有保障。',
    s3: '居家安全离不开及时的呼叫和预警系统。无论是紧急呼叫器还是跌倒检测雷达，这些设备都能在关键时刻发出警报，让照护者第一时间得知情况。智能化的监测设备正在成为居家养老的标配，为独居长者提供全天候的安全保障。',
    s4: '适老化改造是居家养老的重要基础。从床边扶手到适老家具，从夜灯照明到厨房改造，这些产品让居家环境更加安全便利。好的适老化设计应该是无感的——融入日常环境，不突兀不尴尬，让长者在熟悉的环境中安全舒适地生活。',
    s5: '视力下降是银发族最常见的困扰。合适的视觉辅助工具可以让阅读、购物、查看手机等日常活动变得更加轻松。选择时要根据实际需求挑选倍率和形式，不是越贵越好，而是越适合越好。',
    s6: '浴室和卫生间是家中最容易发生意外的地方。从洗澡椅到扶手，从马桶辅助到防滑设施，这些安全产品为长者提供全方位的防护。建议从最需要的设备开始，逐步完善居家卫浴安全体系。',
    s7: '保持行动能力是银发族独立生活的关键。合适的助行工具和代步设备让长者能够安全出行，维持社交活动和户外锻炼。选择时要考虑使用场景、便携性和安全性，让每一步都走得更稳当。',
    s8: '通讯和定位设备是银发族与外界联系的重要纽带。大字大音的手机让通话不再困难，定位设备让家人随时知道长辈位置，紧急呼叫功能在需要时一键求助。这些智能设备正在用科技力量守护银发族的安全与联系。'
  }
  return wikis[sceneId] || wikis['s6']
}

function generatePeerReviews(sceneId) {
  const reviews = {
    s1: [
      { name: '张阿姨', avatar: '👩‍🦳', comment: '牙口不好之后吃饭成了一大难题，这些辅助餐具和营养品真的帮了大忙，现在每顿饭都能好好吃了。' },
      { name: '老陈', avatar: '👴', comment: '术后只能吃流食，营养品加上流食机，每天能吃到不同口味，营养也跟上了，恢复得比预期好。' },
      { name: '赵大姐', avatar: '👩', comment: '给老爸配齐了辅助筷子和防洒碗，他说终于能自己吃饭不用人喂了，心情好了很多。' },
    ],
    s2: [
      { name: '刘姐', avatar: '👩‍🦱', comment: '膝盖疼了好几年，用理疗仪每天热敷按摩，走路舒服多了，比吃药省心。' },
      { name: '赵叔', avatar: '🧓', comment: '腰突后一直戴护腰，支撑力很好，做家务和散步都不那么疼了，质量不错。' },
      { name: '孙奶奶', avatar: '👵', comment: '每天用康复器材锻炼手臂，坚持两个月力气大了很多，拧瓶盖没问题了。' },
    ],
    s3: [
      { name: '李大叔', avatar: '👴', comment: '给独居的老母亲装了呼叫器和跌倒检测，我在手机上就能收到报警，安心多了。' },
      { name: '周阿姨', avatar: '👩', comment: '药盒带提醒功能，老爸再也不忘记吃药了，分格设计很清楚一目了然。' },
      { name: '钱奶奶', avatar: '👵', comment: '报警器声音很大，在厨房都能听到，按一下就响，操作简单老人一学就会。' },
    ],
    s4: [
      { name: '吴叔', avatar: '🧓', comment: '床边装了扶手，起夜扶着站起来不费劲，适老化改造真的很有必要。' },
      { name: '郑阿姨', avatar: '👩‍🦳', comment: '换了适老椅子，靠背高扶手稳，坐半天腰不酸，比普通餐椅舒服太多了。' },
      { name: '冯大爷', avatar: '👴', comment: '小夜灯插在走廊，起夜不用摸黑了，感应式的走过就亮很方便。' },
    ],
    s5: [
      { name: '陈奶奶', avatar: '👵', comment: '看药品说明书终于不用找人帮忙了，放大镜带着灯特别好用，推荐给老姐妹们。' },
      { name: '马叔', avatar: '👴', comment: '眼镜式的比手持的方便太多，看报纸看手机都清晰，解放双手。' },
      { name: '何阿姨', avatar: '👩', comment: '在超市看商品标签特别方便，造型也不土，戴着出门不尴尬。' },
    ],
    s6: [
      { name: '黄大叔', avatar: '🧓', comment: '浴室装了扶手和洗澡椅，老伴洗澡我放心多了，不用时刻守在门外。' },
      { name: '林阿姨', avatar: '👩‍🦳', comment: '移动马桶放在卧室，半夜上厕所不用走到卫生间了，老人方便很多。' },
      { name: '杨奶奶', avatar: '👵', comment: '洗头盆解决了卧床洗头的大难题，一个人就能搞定，不用折腾去理发店了。' },
    ],
    s7: [
      { name: '老王', avatar: '👴', comment: '电动轮椅太方便了，推着去公园晒太阳不再是奢望，电池续航也够用。' },
      { name: '钟阿姨', avatar: '👩', comment: '助力车比想象中轻便，折叠放后备箱带出去玩，老人出门意愿强多了。' },
      { name: '曹叔', avatar: '🧓', comment: '有了代步工具后出门底气足多了，不用整天待在家里，生活质量提高了不少。' },
    ],
    s8: [
      { name: '田大叔', avatar: '👴', comment: '大字手机按键清楚声音大，老爸终于能自己打电话了，不用每次找我帮忙。' },
      { name: '许阿姨', avatar: '👩‍🦳', comment: '定位手环太安心了，婆婆有次走丢了，通过手机定位很快就找到了。' },
      { name: '罗奶奶', avatar: '👵', comment: 'SOS按键按一下就联系到家人，比翻手机找号码快多了，安全感满满的。' },
    ]
  }
  return reviews[sceneId] || reviews['s6']
}

const products = scraped.products.map((p, idx) => {
  const name = cleanName(p.name)
  const price = p.price || estimatePrice(name)
  const sceneId = inferSceneId(name)
  const subCategory = getSubCategory(sceneId, name)

  return {
    id: `p-cn-${p.platform}-${p.itemId}`,
    sceneId,
    name,
    scene: SCENE_TEXTS[sceneId],
    price,
    tag: getTag(name, price),
    category: getCategory(sceneId),
    subCategory,
    buyUrl: p.buyUrl,
    mainImage: p.mainImage || '',
    detailImageList: p.detailImageList || [],
    expertTips: generateExpertTips(sceneId, subCategory),
    sceneWiki: generateSceneWiki(sceneId, subCategory),
    peerReviews: generatePeerReviews(sceneId),
  }
})

// Stats
const sceneCounts = {}
const subCatCounts = {}
products.forEach(p => {
  sceneCounts[p.sceneId] = (sceneCounts[p.sceneId] || 0) + 1
  subCatCounts[p.subCategory] = (subCatCounts[p.subCategory] || 0) + 1
})

console.log('=== Processing Complete ===')
console.log(`Total products: ${products.length}\n`)

console.log('Scene distribution:')
Object.entries(sceneCounts).sort().forEach(([k, v]) => console.log(`  ${k}: ${v}`))

console.log('\nSubCategory distribution:')
Object.entries(subCatCounts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`))

const outputPath = path.join(__dirname, 'seed-data-domestic.json')
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2))
console.log(`\nSaved to: ${outputPath}`)

// Merge with existing data
const existing = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data-fixed.json'), 'utf-8'))
const merged = existing.concat(products)
const mergedPath = path.join(__dirname, 'seed-data-fixed.json')
fs.writeFileSync(mergedPath, JSON.stringify(merged, null, 2))
console.log(`\nMerged: ${existing.length} + ${products.length} = ${merged.length} total products`)
