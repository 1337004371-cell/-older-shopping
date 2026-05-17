<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { scenes } from '@/data/mockData'
import type { Product } from '@/data/mockData'
import { getProductById } from '@/utils/cloudDB'
import { showSuccessToast } from 'vant'
import ProductImageDetails from '@/components/ProductImageDetails.vue'

const route = useRoute()
const router = useRouter()
const product = ref<Product | null>(null)
const productLoading = ref(true)
const scene = computed(() => {
  const p = product.value
  return p ? scenes.find((s) => s.id === p.sceneId) : null
})

const showSku = ref(false)
const selectedColor = ref('')
const selectedSize = ref('')
const isSpeaking = ref(false)
const shouldShake = ref(false)

// 2秒后抖动引导
// 专家锦囊折叠
const tipsExpanded = ref(false)
const tipsRef = ref<HTMLElement | null>(null)
const tipsNeedExpand = ref(false)
const tipsMaxHeight = ref(200)

function checkTipsOverflow() {
  nextTick(() => {
    if (!tipsRef.value) return
    const el = tipsRef.value
    tipsNeedExpand.value = el.scrollHeight > el.clientHeight + 2
    tipsMaxHeight.value = el.scrollHeight + 8
  })
}

async function fetchProduct() {
  productLoading.value = true
  try {
    product.value = await getProductById(route.params.id as string)
  } catch (e) {
    console.error('Failed to load product from cloud DB:', e)
  }
  productLoading.value = false
  checkTipsOverflow()
}

onMounted(() => {
  fetchProduct()
  setTimeout(() => { shouldShake.value = true }, 2000)
  setTimeout(() => { shouldShake.value = false }, 3500)
})

watch(() => route.params.id, () => {
  if (route.params.id) fetchProduct()
})

const colors = ['黑色', '深灰', '藏青']
const sizes = ['M', 'L', 'XL', 'XXL', 'XXXL']

function selectColor(c: string) { selectedColor.value = c }
function selectSize(s: string) { selectedSize.value = s }
const canBuy = computed(() => selectedColor.value && selectedSize.value)

// 场景百科
interface SceneTip {
  title: string
  tips: { icon: string; text: string }[]
  compare: { left: { icon: string; text: string }[]; right: { icon: string; text: string }[] }
  heartfelt: string
}

const sceneTips: Record<string, SceneTip> = {
  s1: {
    title: '吃饭香，身体才棒',
    tips: [
      { icon: '🥣', text: '不用嚼半天，嘴巴里含一含就化了' },
      { icon: '💊', text: '营养搭配好的，不用自己费心思' },
      { icon: '📦', text: '一包拆开就能吃，不用开火也能对付一顿' },
    ],
    compare: {
      left: [
        { icon: '😣', text: '硬邦邦咬不动' },
        { icon: '😩', text: '做一顿饭累得慌' },
        { icon: '🤷', text: '营养不均衡' },
      ],
      right: [
        { icon: '😋', text: '软糯好消化' },
        { icon: '✨', text: '拆开就能吃' },
        { icon: '🧑‍⚕️', text: '科学搭配好的' },
      ],
    },
    heartfelt: '儿女不在身边，给爸妈备点好吃的，他们也舍不得委屈自己。',
  },
  s2: {
    title: '脚舒服了，出门才有劲',
    tips: [
      { icon: '☁️', text: '鞋底像棉花一样软，踩上去不硌脚' },
      { icon: '🌧️', text: '下雨天去菜市场也不怕滑倒' },
      { icon: '👟', text: '不用弯腰系鞋带，脚一蹬就穿好了' },
    ],
    compare: {
      left: [
        { icon: '😣', text: '鞋底硬，走路脚疼' },
        { icon: '😩', text: '弯腰系鞋带费劲' },
        { icon: '😱', text: '一沾水就打滑' },
      ],
      right: [
        { icon: '😊', text: '走两站路脚不累' },
        { icon: '✨', text: '脚一蹬就穿好' },
        { icon: '🛡️', text: '雨天也不怕滑' },
      ],
    },
    heartfelt: '给父母备一双好鞋，就是给他们多一份安全。',
  },
  s3: {
    title: '家里暖和，比啥都强',
    tips: [
      { icon: '🛏️', text: '被窝提前暖好，晚上不冷不冻' },
      { icon: '🛁', text: '浴室铺了防滑垫，洗澡心里踏实' },
      { icon: '🧣', text: '毯子厚实又轻巧，盖着不压人' },
    ],
    compare: {
      left: [
        { icon: '🥶', text: '晚上钻被窝打哆嗦' },
        { icon: '😰', text: '浴室地滑怕摔跤' },
        { icon: '😣', text: '旧被子又重又薄' },
      ],
      right: [
        { icon: '😌', text: '被窝热乎乎的' },
        { icon: '🛡️', text: '洗澡稳稳当当' },
        { icon: '😊', text: '又暖和又轻巧' },
      ],
    },
    heartfelt: '儿女不在身边的日子，让家更暖一点，爸妈更安心。',
  },
  s4: {
    title: '穿得体面，出门有面子',
    tips: [
      { icon: '🧥', text: '拉链一拉就穿好，不用跟纽扣较劲' },
      { icon: '😌', text: '宽松不勒人，坐着躺着都舒服' },
      { icon: '🧺', text: '面料软和，洗几水也不起球' },
    ],
    compare: {
      left: [
        { icon: '😣', text: '扣子小半天扣不上' },
        { icon: '😩', text: '紧绷绷不舒服' },
        { icon: '😤', text: '洗两次就起球' },
      ],
      right: [
        { icon: '✨', text: '一拉就穿好' },
        { icon: '😊', text: '宽松又得体' },
        { icon: '👍', text: '怎么洗都像新的' },
      ],
    },
    heartfelt: '爸妈也爱美，穿得舒服体面，出门遛弯都精神。',
  },
  s5: {
    title: '养生别瞎补，听大夫的',
    tips: [
      { icon: '💡', text: '不是越贵越好，适合自己才管用' },
      { icon: '🩺', text: '血压计家里备一个，随时量量心里有数' },
      { icon: '💆', text: '脖子酸了按一按，不用老往医院跑' },
    ],
    compare: {
      left: [
        { icon: '🤷', text: '跟风买一堆保健品' },
        { icon: '😰', text: '血压高了才知道' },
        { icon: '😣', text: '脖子酸硬扛着' },
      ],
      right: [
        { icon: '🧑‍⚕️', text: '听大夫说该补啥' },
        { icon: '📊', text: '每天自己量一量' },
        { icon: '😌', text: '在家就能缓解' },
      ],
    },
    heartfelt: '爸妈身体好，儿女在外头才放心。',
  },
  s6: {
    title: '出门一趟，轻松不折腾',
    tips: [
      { icon: '🧳', text: '箱子轮子顺滑，拎着不费劲' },
      { icon: '🥾', text: '登山杖一撑，上台阶也有劲了' },
      { icon: '💊', text: '药盒分好格，出门不忘吃药' },
    ],
    compare: {
      left: [
        { icon: '😣', text: '箱子提着胳膊酸' },
        { icon: '😩', text: '爬台阶腿打哆嗦' },
        { icon: '😰', text: '出门忘带药' },
      ],
      right: [
        { icon: '✨', text: '推着就走不费力' },
        { icon: '🛡️', text: '撑着杖走得稳' },
        { icon: '💊', text: '药盒一格一天' },
      ],
    },
    heartfelt: '世界那么大，腿脚利索了才能去看看。',
  },
  s7: {
    title: '带孙子，省心又安全',
    tips: [
      { icon: '🍼', text: '辅食机一按就打好，不用自己剁半天' },
      { icon: '🚗', text: '安全座椅装上，带娃出门不担心' },
      { icon: '📷', text: '摄像头装一个，在厨房也能看着娃' },
    ],
    compare: {
      left: [
        { icon: '😣', text: '剁辅食剁到手酸' },
        { icon: '😰', text: '抱着孩子坐车不安全' },
        { icon: '😱', text: '一转身娃就跑没影' },
      ],
      right: [
        { icon: '✨', text: '按一下就弄好' },
        { icon: '🛡️', text: '坐稳当踏实出门' },
        { icon: '📱', text: '手机上随时看' },
      ],
    },
    heartfelt: '帮儿女带好娃，就是对年轻人最大的帮忙。',
  },
  s8: {
    title: '手机不难，教您几招',
    tips: [
      { icon: '📱', text: '字大图标大，不用眯着眼找' },
      { icon: '🛡️', text: '遇到不认识的链接，千万别点' },
      { icon: '🏥', text: '微信挂号、缴费，不用跑医院排队' },
    ],
    compare: {
      left: [
        { icon: '😣', text: '字太小看不清' },
        { icon: '😱', text: '乱点链接被骗' },
        { icon: '😩', text: '干啥都得跑一趟' },
      ],
      right: [
        { icon: '👀', text: '大字大图看得清' },
        { icon: '🔒', text: '不点不认识的东西' },
        { icon: '✨', text: '手机上就办了' },
      ],
    },
    heartfelt: '学会用手机，爸妈自己就能办好些事，不用老等孩子回来帮忙。',
  },
}

// 同龄人评价
const reviews = [
  { avatar: '👴', name: '张大爷', age: 68, text: '隔壁老王也买了，说走路确实不累脚，我也来一双试试。' },
  { avatar: '👵', name: '李阿姨', age: 65, text: '给老伴买的，穿着正合适，质量比超市的好多了。' },
  { avatar: '🧓', name: '王叔叔', age: 72, text: '这个价格真的划算，比实体店便宜不少，还包邮到家。' },
]

function speakIntro() {
  if (!product.value) return
  isSpeaking.value = true
  const text = `为您推荐${product.value.name}，只要${product.value.price}元，${product.value.tag}限时优惠，品质有保障，适合长辈使用。`
  const synth = window.speechSynthesis
  if (!synth) { isSpeaking.value = false; return }
  synth.cancel()
  const msg = new SpeechSynthesisUtterance(text)
  msg.lang = 'zh-CN'
  msg.rate = 0.85
  msg.onend = () => { isSpeaking.value = false }
  msg.onerror = () => { isSpeaking.value = false }
  synth.speak(msg)
}

function confirmBuy() {
  showSku.value = false
  showSuccessToast('提交成功')
  setTimeout(() => {
    router.push({ name: 'order-success' })
  }, 800)
}

function openAssistant() {
  window.dispatchEvent(new CustomEvent('open-assistant'))
}
</script>

<template>
  <div class="min-h-screen bg-[#f5f5f5]">
    <!-- 加载状态 -->
    <div v-if="productLoading" class="flex items-center justify-center py-20">
      <p class="text-gray-400 text-[16px]">加载中...</p>
    </div>

    <template v-else-if="product">
      <!-- 可滚动内容区（底部留出按钮栏空间） -->
      <div class="pb-28">
      <!-- 顶部导航 -->
      <div class="relative flex items-center px-3 py-2 bg-white sticky top-0 z-50">
        <button
          class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          @click="router.back()"
        >
          <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="absolute left-1/2 -translate-x-1/2 text-[16px] font-bold text-gray-800">
          商品详情
        </h1>
      </div>

      <!-- 商品主图 -->
      <div class="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          v-if="product.mainImage"
          :src="product.mainImage"
          :alt="product.name"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <svg class="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      </div>

      <!-- 价格 + 商品名 -->
      <div class="bg-white px-4 py-4">
        <div class="flex items-baseline gap-2">
          <span class="text-[36px] font-black text-red-500">¥{{ product.price }}</span>
          <span class="text-[16px] text-gray-400 line-through">¥{{ (product.price * 1.8).toFixed(0) }}</span>
          <span class="bg-red-500 text-white text-[14px] font-bold px-2.5 py-0.5 rounded ml-2">{{ product.tag }}</span>
        </div>
        <h1 class="text-[22px] font-extrabold text-gray-800 mt-3 leading-snug">{{ product.name }}</h1>
        <div class="flex items-center gap-2 mt-2.5">
          <span class="bg-green-50 text-green-700 text-[13px] font-bold px-2.5 py-1 rounded">品质保障</span>
          <span class="bg-blue-50 text-blue-700 text-[13px] font-bold px-2.5 py-1 rounded">7天无理由</span>
          <span class="bg-orange-50 text-orange-700 text-[13px] font-bold px-2.5 py-1 rounded">包邮</span>
        </div>
      </div>

      <!-- 专家锦囊（来自云数据库） -->
      <div v-if="product.expertTips" class="bg-white mt-2 px-4 py-4">
        <h3 class="text-[18px] font-extrabold text-gray-800 mb-3">专家锦囊</h3>
        <div class="rounded-2xl bg-[#FFF8E1] px-5 py-4 shadow-sm">
          <div v-if="product.scene" class="text-[20px] font-bold text-[#4E342E] mb-3">
            {{ product.scene }}
          </div>
          <div class="overflow-hidden transition-all duration-300 ease-in-out" :style="{ maxHeight: tipsExpanded ? tipsMaxHeight + 'px' : '' }">
            <p
              ref="tipsRef"
              class="text-[17px] font-bold text-[#4E342E] leading-relaxed whitespace-pre-line"
              :class="tipsExpanded ? '' : 'line-clamp-5'"
            >{{ product.expertTips.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n') }}</p>
          </div>
          <button
            v-if="tipsNeedExpand"
            class="mt-2 flex items-center gap-1.5 text-[16px] font-bold text-[#E65100] active:opacity-70"
            style="min-height: 44px"
            @click="tipsExpanded = !tipsExpanded"
          >
            {{ tipsExpanded ? '收起内容' : '查看更多' }}
            <svg class="w-5 h-5 transition-transform duration-300" :class="tipsExpanded ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 语音导购 -->
      <div class="bg-white mt-2 px-4 py-4">
        <button
          class="w-full flex items-center justify-center gap-3 h-[56px] rounded-xl bg-[#E8F5E9] active:scale-[0.98] transition-transform relative overflow-hidden"
          @click="speakIntro"
        >
          <!-- 动态波纹 -->
          <span v-if="isSpeaking" class="absolute left-0 bottom-0 w-full h-1 bg-[#4CAF50] animate-pulse" />
          <div v-if="isSpeaking" class="flex items-center gap-1 mr-1">
            <span v-for="i in 5" :key="i" class="w-1 rounded-full bg-[#4CAF50]" :style="{ height: `${8 + Math.random() * 16}px` }" />
          </div>
          <svg class="w-6 h-6 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          <span class="text-[18px] font-extrabold text-[#2E7D32]">
            {{ isSpeaking ? '正在为您讲解...' : '真人语音介绍' }}
          </span>
        </button>
      </div>

      <!-- 场景百科（知识卡片） -->
      <div v-if="scene && sceneTips[scene.id]" class="mt-2 px-3 py-4 scene-card">
        <!-- 标题 -->
        <div class="flex items-center gap-2.5 mb-4">
          <span class="text-3xl">{{ scene.icon }}</span>
          <h3 class="text-[22px] font-extrabold text-[#5D4037]">{{ sceneTips[scene.id].title }}</h3>
        </div>

        <!-- 大白话 tips（知识卡片） -->
        <div class="bg-[#FFF8E1] rounded-2xl px-4 py-4 mb-4">
          <div class="flex flex-col gap-4">
            <div
              v-for="(tip, i) in sceneTips[scene.id].tips"
              :key="i"
              class="flex items-center gap-3.5"
            >
              <span class="text-[36px] shrink-0 leading-none">{{ tip.icon }}</span>
              <p class="text-[17px] font-bold text-[#4E342E] leading-relaxed">{{ tip.text }}</p>
            </div>
          </div>
        </div>

        <!-- 省心对比 -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <!-- 普通 -->
          <div class="bg-gray-100 rounded-2xl px-4 py-4">
            <p class="text-[15px] font-extrabold text-gray-400 mb-2.5 text-center">普通款</p>
            <div class="flex flex-col gap-2.5">
              <div
                v-for="(item, i) in sceneTips[scene.id].compare.left"
                :key="i"
                class="flex items-start gap-2"
              >
                <span class="text-[20px] shrink-0 leading-none">{{ item.icon }}</span>
                <p class="text-[15px] text-gray-400 leading-relaxed">{{ item.text }}</p>
              </div>
            </div>
          </div>
          <!-- 本款 -->
          <div class="bg-[#E8F5E9] rounded-2xl px-4 py-4">
            <p class="text-[15px] font-extrabold text-green-700 mb-2.5 text-center">本款</p>
            <div class="flex flex-col gap-2.5">
              <div
                v-for="(item, i) in sceneTips[scene.id].compare.right"
                :key="i"
                class="flex items-start gap-2"
              >
                <span class="text-[20px] shrink-0 leading-none">{{ item.icon }}</span>
                <p class="text-[15px] font-bold text-green-800 leading-relaxed">{{ item.text }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 儿女孝心 -->
        <div class="bg-[#FFF3E0] rounded-2xl px-5 py-3.5">
          <p class="text-[16px] text-[#BF360C] leading-relaxed text-center font-bold">
            💛 {{ sceneTips[scene.id].heartfelt }}
          </p>
        </div>
      </div>

      <!-- 同龄人评价 -->
      <div class="bg-white mt-2 px-4 py-4">
        <h3 class="text-[18px] font-extrabold text-gray-800 mb-3">同龄人说</h3>
        <div class="flex flex-col gap-4">
          <div v-for="(r, i) in reviews" :key="i" class="flex gap-3">
            <span class="text-[36px] leading-none shrink-0">{{ r.avatar }}</span>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[16px] font-bold text-gray-800">{{ r.name }}</span>
                <span class="text-[13px] text-gray-400">{{ r.age }}岁</span>
              </div>
              <p class="text-[16px] text-gray-600 leading-relaxed">{{ r.text }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 宝贝详情（长图） -->
      <ProductImageDetails :images="product.detailImageList" />
      </div><!-- end pb-28 scrollable content -->

      <!-- SKU 选择器（半屏弹窗） -->
      <van-action-sheet v-model:show="showSku" title="选择规格" :close-on-click-overlay="true">
        <div class="px-5 py-5">
          <!-- 商品摘要 -->
          <div v-if="product" class="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
            <div class="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                v-if="product.mainImage"
                :src="product.mainImage"
                :alt="product.name"
                class="w-full h-full object-cover"
              />
              <svg v-else class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p class="text-[28px] font-black text-red-500">¥{{ product.price }}</p>
              <p class="text-[14px] text-gray-400 line-through">¥{{ (product.price * 1.8).toFixed(0) }}</p>
              <p class="text-[15px] text-gray-600 mt-1 font-bold">{{ product.name }}</p>
            </div>
          </div>

          <!-- 颜色选择 -->
          <h4 class="text-[19px] font-extrabold text-gray-800 mb-3">颜色</h4>
          <div class="flex flex-wrap gap-3 mb-5">
            <button
              v-for="c in colors"
              :key="c"
              class="h-[48px] px-6 rounded-xl text-[18px] font-bold border-2 transition-colors"
              :class="selectedColor === c ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-200 bg-white text-gray-700'"
              @click="selectColor(c)"
            >{{ c }}</button>
          </div>

          <!-- 尺码选择 -->
          <h4 class="text-[19px] font-extrabold text-gray-800 mb-3">尺码</h4>
          <div class="flex flex-wrap gap-3 mb-7">
            <button
              v-for="s in sizes"
              :key="s"
              class="h-[48px] px-6 rounded-xl text-[18px] font-bold border-2 transition-colors"
              :class="selectedSize === s ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-200 bg-white text-gray-700'"
              @click="selectSize(s)"
            >{{ s }}</button>
          </div>

          <!-- 确认按钮 -->
          <button
            class="w-full h-[56px] rounded-xl text-[22px] font-extrabold transition-colors"
            :class="canBuy ? 'bg-red-500 text-white active:opacity-90' : 'bg-gray-200 text-gray-400'"
            :disabled="!canBuy"
            @click="confirmBuy"
          >
            选好了，去下单
          </button>
        </div>
      </van-action-sheet>

      <!-- 底部固定栏：助手 + 购物按钮 -->
      <div
        v-if="product"
        style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; background: white; padding: 10px 16px 8px; box-shadow: 0 -4px 16px rgba(0,0,0,0.1); display: flex; align-items: flex-start; gap: 8px;"
      >
        <!-- AI 助手按钮 -->
        <div style="display: flex; flex-direction: column; align-items: center; flex-shrink: 0;">
          <button
            style="width: 48px; height: 48px; border-radius: 50%; overflow: hidden; border: 2px solid #c7d2fe; padding: 0; background: #eef2ff; cursor: pointer;"
            @click="openAssistant"
          >
            <img
              src="https://pic.imgdb.cn/item/65fd1f459f345e8d0309990b.jpg"
              alt="AI助手"
              style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;"
            />
          </button>
          <span style="font-size: 10px; color: #818cf8; font-weight: bold; margin-top: 2px; white-space: nowrap;">点我帮您找</span>
        </div>
        <div style="flex: 1; display: flex; align-items: stretch; gap: 8px; padding-top: 0;">
          <button
            style="flex: 1; border-radius: 12px; font-size: 20px; font-weight: 900; background-color: #FFB800; color: #FFFFFF; border: none; height: 48px;"
            @click="showSku = true"
          >
            加入购物车
          </button>
          <button
            style="flex: 1; border-radius: 12px; font-size: 20px; font-weight: 900; background-color: #FF6B00; color: #FFFFFF; border: none; height: 48px;"
            @click="showSku = true"
          >
            立即购买
          </button>
        </div>
      </div>
    </template>

    <div v-else class="flex items-center justify-center py-20">
      <p class="text-gray-400 text-[16px]">商品未找到</p>
    </div>
  </div>
</template>

<style scoped>
.scene-card {
  animation: floatUp 0.6s ease-out both;
}
@keyframes floatUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
  20%, 40%, 60%, 80% { transform: translateX(3px); }
}
.animate-shake {
  animation: shake 0.6s ease-in-out 3;
}
</style>
