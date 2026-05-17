<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { scenes } from '@/data/mockData'
import type { Product, Video } from '@/data/mockData'
import { getProducts, getVideos } from '@/utils/cloudDB'
import { sceneTagMap } from '@/data/sceneTags'
import VideoCard from '@/components/VideoCard.vue'
import { useStickyHeader } from '@/composables/useStickyHeader'

const route = useRoute()
const router = useRouter()

const allProducts = ref<Product[]>([])
const allVideos = ref<Video[]>([])

const sceneId = computed(() => route.params.id as string)
const scene = computed(() => scenes.find((s) => s.id === sceneId.value))

const topVideo = computed(() => {
  const list = allVideos.value.filter((v) => v.sceneId === sceneId.value)
  return list.length > 0 ? list[0] : null
})

const tags = computed(() => sceneTagMap[sceneId.value] ?? [{ key: '全部', label: '全部', icon: '🎯' }])
const activeTag = ref('全部')

watch(sceneId, () => { activeTag.value = '全部' })

const filteredProducts = computed(() => {
  let list = allProducts.value.filter((p) => p.sceneId === sceneId.value)
  if (activeTag.value !== '全部') {
    list = list.filter((p) => p.subCategory === activeTag.value)
  }
  return list
})

const showProducts = ref(true)

function onTagClick(key: string) {
  if (key === activeTag.value) return
  showProducts.value = false
  setTimeout(() => {
    activeTag.value = key
    showProducts.value = true
  }, 150)
}

const hasData = computed(() => topVideo.value !== null || filteredProducts.value.length > 0)

const headerRef = ref<HTMLElement | null>(null)
const { headerHeight } = useStickyHeader(headerRef)

onMounted(async () => {
  try {
    const [products, vids] = await Promise.all([
      getProducts(),
      getVideos(),
    ])
    allProducts.value = products
    allVideos.value = vids
  } catch (e) {
    console.error('CategoryView: failed to load from cloud:', e)
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-8">
    <!-- 顶部导航 -->
    <div ref="headerRef" class="relative flex items-center px-3 py-2 bg-white sticky top-0 z-50">
      <button
        class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
        @click="router.push({ name: 'home' })"
      >
        <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="absolute left-1/2 -translate-x-1/2 text-[16px] font-bold text-gray-800">
        {{ scene?.name ?? '推荐' }}
      </h1>
    </div>

    <template v-if="hasData">
      <!-- 视频卡片 -->
      <div v-if="topVideo" class="px-3 py-3">
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

      <!-- 商品列表（淡入淡出） -->
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

    <!-- 无数据占位 -->
    <div v-else class="flex flex-col items-center justify-center py-20">
      <span class="text-6xl mb-4">🔍</span>
      <p class="text-[20px] font-bold text-gray-500 text-center px-6">正在为您挑选最合适的方案</p>
      <p class="text-[16px] text-gray-400 mt-1">请稍后...</p>
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
