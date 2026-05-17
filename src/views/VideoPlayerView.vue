<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Video, Product } from '@/data/mockData'
import { getVideoById, getProducts } from '@/utils/cloudDB'
import { sceneTagMap } from '@/data/sceneTags'

const route = useRoute()
const router = useRouter()

// 从路由 query 立即拿到播放地址，不等 DB
const instantUrl = (route.query.url as string) || ''
const instantCover = (route.query.cover as string) || ''
const instantTitle = (route.query.title as string) || '视频'

const video = ref<Video | null>(null)
const allSceneProducts = ref<Product[]>([])
const productsLoading = ref(true)

// tag 逻辑（同金刚区）
const sceneId = computed(() => video.value?.sceneId ?? '')
const tags = computed(() => sceneTagMap[sceneId.value] ?? [{ key: '全部', label: '全部', icon: '🎯' }])
const activeTag = ref('全部')

const filteredProducts = computed(() => {
  let list = allSceneProducts.value
  if (activeTag.value !== '全部') {
    list = list.filter(p => p.subCategory === activeTag.value)
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

onMounted(async () => {
  const id = route.params.id as string

  try {
    const v = await getVideoById(id)
    video.value = v

    if (v) {
      const all = await getProducts()
      allSceneProducts.value = all.filter(p => p.sceneId === v.sceneId)
    }
  } catch (e) {
    console.error('[VideoPlayerView] 加载失败:', e)
  }
  productsLoading.value = false
})
</script>

<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-8">
    <!-- 顶部导航 -->
    <div class="flex items-center gap-2 px-3 py-2 bg-white sticky top-0 z-50">
      <button
        class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
        @click="router.back()"
      >
        <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="flex-1 text-[16px] font-bold text-gray-800 truncate">{{ video?.title ?? instantTitle }}</h1>
    </div>

    <!-- 视频播放区 -->
    <div class="relative aspect-video bg-black">
      <iframe
        v-if="instantUrl"
        :src="instantUrl + '&autoplay=1&muted=1'"
        class="absolute inset-0 w-full h-full"
        frameborder="0"
        allowfullscreen
        allow="autoplay; encrypted-media"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>

    <!-- 视频信息 -->
    <div v-if="video" class="bg-white px-4 py-4">
      <p class="text-[20px] font-extrabold text-gray-800 leading-snug">{{ video.title }}</p>
      <p class="text-[15px] text-gray-500 mt-2 leading-relaxed">{{ video.summary }}</p>
      <div class="flex items-center justify-between mt-3">
        <div class="flex items-center gap-2.5">
          <img
            :src="video.avatarUrl"
            :alt="video.author"
            class="w-9 h-9 rounded-full object-cover border border-gray-200"
          />
          <span class="text-[15px] font-bold text-gray-800">{{ video.author }}</span>
          <svg class="w-4 h-4 text-[#4CAF50]" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex items-center gap-3 text-[13px] text-gray-400">
          <span>{{ video.views }}</span>
          <span>{{ video.likes }}</span>
        </div>
      </div>
    </div>

    <!-- 商品区：标题 + tag + 双列网格 -->
    <div class="mt-2 bg-white">
      <div class="px-4 pt-4 pb-2">
        <h2 class="text-[18px] font-extrabold text-gray-800">看视频买同款</h2>
      </div>

      <!-- 多维标签栏（同金刚区交互） -->
      <div v-if="tags.length > 1" class="px-3 pb-2">
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

      <!-- 商品加载中 -->
      <div v-if="productsLoading" class="px-4 py-6 text-center">
        <div class="w-5 h-5 border-2 border-[#4CAF50] border-t-transparent rounded-full animate-spin mx-auto" />
        <p class="text-[14px] text-gray-400 mt-2">正在加载推荐商品...</p>
      </div>

      <!-- 双列商品列表（淡入淡出，同金刚区） -->
      <Transition v-else name="fade">
        <div v-if="showProducts" class="px-4 py-2">
          <div v-if="filteredProducts.length > 0" class="grid grid-cols-2 gap-3">
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              class="bg-[#f9f9f9] rounded-xl overflow-hidden shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
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
