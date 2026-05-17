<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getVideos } from '@/utils/cloudDB'
import VideoCard from '@/components/VideoCard.vue'
import type { Video } from '@/data/mockData'

const PAGE_SIZE = 4
const allVideos = ref<Video[]>([])
const visibleVideos = ref<Video[]>([])
const loadedCount = ref(0)
const isLoading = ref(false)
const allLoaded = ref(false)
const loadError = ref('')

async function fetchVideos() {
  try {
    isLoading.value = true
    loadError.value = ''
    allVideos.value = await getVideos()
    loadedCount.value = Math.min(PAGE_SIZE, allVideos.value.length)
    visibleVideos.value = allVideos.value.slice(0, loadedCount.value)
    if (loadedCount.value >= allVideos.value.length) allLoaded.value = true
  } catch (e: any) {
    console.error('[VideoList] 加载失败:', e)
    loadError.value = '视频加载失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

function loadMore() {
  if (allLoaded.value || isLoading.value) return
  isLoading.value = true
  setTimeout(() => {
    const next = loadedCount.value + PAGE_SIZE
    loadedCount.value = Math.min(next, allVideos.value.length)
    visibleVideos.value = allVideos.value.slice(0, loadedCount.value)
    if (loadedCount.value >= allVideos.value.length) allLoaded.value = true
    isLoading.value = false
  }, 300)
}

function retry() {
  fetchVideos()
}

onMounted(() => {
  fetchVideos()
  const sentinel = document.getElementById('scroll-sentinel')
  if (!sentinel) return
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) loadMore()
  }, { rootMargin: '200px' })
  observer.observe(sentinel)
})
</script>

<template>
  <div class="w-full px-3 py-2">
    <!-- 加载失败提示 -->
    <div v-if="loadError" class="flex flex-col items-center justify-center py-10 gap-3">
      <span class="text-gray-400 text-[15px]">{{ loadError }}</span>
      <button
        class="px-6 py-2 bg-[#4CAF50] text-white rounded-full text-[15px] font-bold active:scale-95 transition-transform"
        @click="retry"
      >
        重新加载
      </button>
    </div>

    <!-- 视频卡片列表 -->
    <div v-else class="flex flex-col gap-4">
      <VideoCard v-for="video in visibleVideos" :key="video.id" :video="video" :linkTo="'/video/' + video.id" />
    </div>

    <!-- 加载更多触发器 -->
    <div id="scroll-sentinel" class="h-4" />

    <!-- 首次加载中 -->
    <div v-if="isLoading && visibleVideos.length === 0" class="flex items-center justify-center py-10 gap-2">
      <div class="w-5 h-5 border-2 border-[#4CAF50] border-t-transparent rounded-full animate-spin" />
      <span class="text-gray-400 text-[15px]">加载视频中...</span>
    </div>

    <!-- 加载更多 -->
    <div v-else-if="isLoading" class="flex items-center justify-center py-6 gap-2">
      <div class="w-5 h-5 border-2 border-[#4CAF50] border-t-transparent rounded-full animate-spin" />
      <span class="text-gray-400 text-[15px]">加载更多...</span>
    </div>

    <!-- 全部加载完 -->
    <div v-if="allLoaded && visibleVideos.length > 0" class="text-center py-6 text-gray-400 text-[14px]">
      — 已经到底啦 —
    </div>

    <!-- 空状态 -->
    <div v-if="!isLoading && !loadError && visibleVideos.length === 0" class="text-center py-10 text-gray-400 text-[15px]">
      暂无视频内容
    </div>
  </div>
</template>
