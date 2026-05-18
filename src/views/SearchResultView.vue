<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Product, Video } from '@/data/mockData'
import { matchScene, FALLBACK_SCENE_IDS } from '@/data/searchCases'
import { sceneTagMap } from '@/data/sceneTags'
import { getProducts, getVideos } from '@/utils/cloudDB'
import SearchSkeleton from '@/components/SearchSkeleton.vue'
import VideoCard from '@/components/VideoCard.vue'
import { useStickyHeader } from '@/composables/useStickyHeader'

const route = useRoute()
const router = useRouter()
const query = computed(() => (route.query.q as string) || '')
const searchQuery = ref(query.value)
const matched = computed(() => matchScene(query.value))
const expanded = ref(false)
const loading = ref(true)
const answerRef = ref<HTMLElement | null>(null)
const needsExpand = ref(false)
const textMaxHeight = ref(200)

function checkOverflow() {
  nextTick(() => {
    if (!answerRef.value) return
    const el = answerRef.value
    // scrollHeight = full content height, clientHeight = visible (clamped) height
    // With line-clamp-5 applied, if content fits in 5 lines they'll be equal
    needsExpand.value = el.scrollHeight > el.clientHeight + 2
    textMaxHeight.value = el.scrollHeight + 8
  })
}

const assistantAnswer = computed(() => {
  if (!matched.value) return `暂时没有找到"${query.value}"的解决方案，您可以试试换个说法，比如"走路脚疼"或"补钙"。`
  return matched.value.expertAdvice
})

const sceneId = computed(() => matched.value?.sceneId ?? '')

const tags = computed(() => sceneTagMap[sceneId.value] ?? [{ key: '全部', label: '全部', icon: '🎯' }])
const activeTag = ref('全部')

watch(sceneId, () => { activeTag.value = '全部' })

watch(query, (q) => {
  searchQuery.value = q
  expanded.value = false
  loading.value = true
  setTimeout(() => {
    loading.value = false
    checkOverflow()
  }, 600)
})

const allProducts = ref<Product[]>([])
const allVideos = ref<Video[]>([])

const topVideo = computed(() => {
  const sId = matched.value?.sceneId
  return sId ? allVideos.value.find((v) => v.sceneId === sId) : null
})

const matchedProducts = computed(() => {
  const sId = matched.value?.sceneId
  const result = sId ? allProducts.value.filter((p) => p.sceneId === sId) : []
  return result
})

// 兜底推荐：无匹配或匹配结果为空时，从热门场景取爆款商品
const isFallback = computed(() => !matched.value || matchedProducts.value.length === 0)

const fallbackProducts = computed(() => {
  if (!isFallback.value) return []
  const products: Product[] = []
  for (const sId of FALLBACK_SCENE_IDS) {
    const sceneProducts = allProducts.value.filter(p => p.sceneId === sId)
    products.push(...sceneProducts.slice(0, 4))
    if (products.length >= 8) break
  }
  return products.slice(0, 8)
})

const filteredProducts = computed(() => {
  let list = matchedProducts.value
  if (activeTag.value !== '全部') {
    list = list.filter((p) => p.subCategory === activeTag.value)
  }
  return list
})

const showProducts = ref(true)

const headerRef = ref<HTMLElement | null>(null)
const { headerHeight } = useStickyHeader(headerRef)

function onTagClick(key: string) {
  if (key === activeTag.value) return
  showProducts.value = false
  setTimeout(() => {
    activeTag.value = key
    showProducts.value = true
  }, 150)
}

function onSearch() {
  const q = searchQuery.value.trim()
  if (!q) return
  router.replace({ name: 'search', query: { q } })
}

onMounted(async () => {
  try {
    const [products, vids] = await Promise.all([getProducts(), getVideos()])
    allProducts.value = products
    allVideos.value = vids
  } catch (e) {
    console.error('Failed to load from cloud DB:', e)
  }
  setTimeout(() => {
    loading.value = false
    checkOverflow()
  }, 600)
})
</script>

<template>
  <SearchSkeleton v-if="loading" :count="6" />

  <div v-else class="min-h-screen bg-[#f5f5f5] pb-8">
    <!-- 顶部搜索栏 -->
    <div ref="headerRef" class="flex items-center gap-2 px-3 py-2 bg-white sticky top-0 z-50">
      <button
        class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
        @click="router.back()"
      >
        <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <form class="flex-1 flex items-center gap-2" @submit.prevent="onSearch">
        <div class="flex-1 flex items-center h-[36px] border border-gray-300 rounded-lg px-3 bg-gray-50">
          <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            class="flex-1 ml-2 text-[18px] text-gray-800 placeholder-gray-400 outline-none bg-transparent"
          />
        </div>
        <button type="submit" class="h-[36px] px-3 bg-[#FF7A68] text-[15px] font-extrabold rounded-lg shrink-0 active:opacity-80 shadow-sm" style="color: #FFFFFF">
          搜索
        </button>
      </form>
    </div>

    <!-- ====== 助手回答卡片 ====== -->
    <div id="assistant-card" class="px-4 pt-0">
      <div class="relative rounded-2xl bg-[#FFF8E1] px-5 py-4 shadow-sm">
        <!-- 头像 -->
        <div class="absolute top-3 right-3 w-10 h-10 min-h-[40px] rounded-full overflow-hidden border-2 border-white shadow-sm bg-amber-100">
          <img
            src="https://pic.imgdb.cn/item/65fd1f459f345e8d0309990b.jpg"
            alt="助手"
            class="w-full h-full object-cover"
          />
        </div>
        <!-- 文字内容 -->
        <div class="overflow-hidden transition-all duration-300 ease-in-out" :style="{ maxHeight: expanded ? textMaxHeight + 'px' : '' }">
          <p
            ref="answerRef"
            class="text-[20px] font-bold text-[#4E342E] leading-relaxed pr-12"
            :class="expanded ? '' : 'line-clamp-5'"
          >
            {{ assistantAnswer }}
          </p>
        </div>
        <!-- 展开/收起按钮 -->
        <button
          v-if="needsExpand"
          class="mt-2 flex items-center gap-1.5 text-[16px] font-bold text-[#E65100] active:opacity-70"
          style="min-height: 44px"
          @click="expanded = !expanded"
        >
          {{ expanded ? '收起内容' : '查看更多' }}
          <svg class="w-5 h-5 transition-transform duration-300" :class="expanded ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- ====== 搜索结果（有匹配且商品非空） ====== -->
    <template v-if="matched && matchedProducts.length > 0">
      <!-- 专家视频 -->
      <div v-if="topVideo" class="px-3 py-3">
        <h2 class="text-[18px] font-extrabold text-gray-800 mb-3">专家讲解</h2>
        <VideoCard :video="topVideo" />
      </div>

      <!-- 多维标签栏（吸顶） -->
      <div class="sticky z-40 bg-white pt-2 pb-2 px-3 shadow-sm" :style="{ top: headerHeight + 'px' }">
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            v-for="tag in tags"
            :key="tag.key"
            class="flex items-center gap-1.5 shrink-0 h-[40px] px-4 rounded-full text-[15px] font-bold border-2 transition-all active:scale-95"
            :class="activeTag === tag.key
              ? 'border-[#4CAF50] bg-[#E8F5E9] text-[#2E7D32]'
              : 'border-transparent bg-white text-gray-600'"
            @click="onTagClick(tag.key)"
          >
            <span class="text-[18px] leading-none">{{ tag.icon }}</span>
            <span>{{ tag.label }}</span>
          </button>
        </div>
      </div>

      <!-- 双列商品列表（淡入淡出） -->
      <Transition name="fade">
        <div v-if="showProducts" class="px-4 py-2">
          <div v-if="filteredProducts.length > 0" class="grid grid-cols-2 gap-3">
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              class="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
              @click="router.push({ name: 'product', params: { id: product.id } })"
            >
              <div class="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <img
                  :src="product.mainImage"
                  :alt="product.name"
                  loading="lazy"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="px-3 py-2.5">
                <p class="text-[15px] text-gray-800 font-extrabold leading-snug line-clamp-2 min-h-[42px]">{{ product.name }}</p>
                <div class="flex items-center gap-1.5 mt-2">
                  <span class="bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">{{ product.tag }}</span>
                  <span class="text-[11px] text-gray-400 line-through">¥{{ (product.price * 1.8).toFixed(0) }}</span>
                </div>
                <div class="mt-1.5">
                  <span class="text-[22px] font-black text-red-500">¥{{ product.price }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="flex flex-col items-center justify-center py-12">
            <span class="text-5xl mb-3">📦</span>
            <p class="text-[17px] font-bold text-gray-400">该分类暂无商品</p>
          </div>
        </div>
      </Transition>
    </template>

    <!-- 未匹配 / 结果为空 → 兜底推荐 -->
    <div v-if="isFallback" class="px-4 pt-4">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-[22px]">🔥</span>
        <h2 class="text-[18px] font-extrabold text-gray-800">为您推荐热门好物</h2>
      </div>
      <p class="text-[15px] text-gray-500 mb-4">暂时没有找到"{{ query }}"的相关内容，您可以试试：腿脚、牙齿、保暖、洗澡、养生</p>
      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="product in fallbackProducts"
          :key="product.id"
          class="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
          @click="router.push({ name: 'product', params: { id: product.id } })"
        >
          <div class="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            <img
              :src="product.mainImage"
              :alt="product.name"
              loading="lazy"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="px-3 py-2.5">
            <p class="text-[15px] text-gray-800 font-extrabold leading-snug line-clamp-2 min-h-[42px]">{{ product.name }}</p>
            <div class="flex items-center gap-1.5 mt-2">
              <span class="bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">{{ product.tag }}</span>
              <span class="text-[11px] text-gray-400 line-through">¥{{ (product.price * 1.8).toFixed(0) }}</span>
            </div>
            <div class="mt-1.5">
              <span class="text-[22px] font-black text-red-500">¥{{ product.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active { transition: opacity 0.25s ease-out; }
.fade-leave-active { transition: opacity 0.15s ease-in; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
