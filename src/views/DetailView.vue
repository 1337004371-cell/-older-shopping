<script setup lang="ts">
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { videos } from '@/data/mockData'
import type { Product } from '@/data/mockData'
import { getProducts } from '@/utils/cloudDB'
import { sceneTagMap } from '@/data/sceneTags'
import { useStickyHeader } from '@/composables/useStickyHeader'

const props = defineProps<{ id: string }>()
const router = useRouter()

const allProducts = ref<Product[]>([])

const video = computed(() => videos.find((v) => v.id === props.id))
const sceneId = computed(() => video.value?.sceneId ?? '')

const sceneTitles: Record<string, string> = {
  s1: '护齿好物',
  s2: '护足精选',
  s3: '居家保暖',
  s4: '体面穿搭',
  s5: '养生精选',
  s6: '出行必备',
  s7: '带娃好物',
  s8: '玩转手机',
}
const headerTitle = computed(() => sceneTitles[sceneId.value] ?? '推荐')

const relatedVideos = computed(() => {
  const others = videos.filter((v) => v.sceneId === sceneId.value && v.id !== props.id)
  if (others.length >= 2) return others.slice(0, 2)
  const rest = videos.filter((v) => v.id !== props.id && !others.includes(v))
  return [...others, ...rest].slice(0, 2)
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

const headerRef = ref<HTMLElement | null>(null)
const { headerHeight } = useStickyHeader(headerRef)

// 视频播放器状态
const videoRef = ref<HTMLVideoElement | null>(null)
const playerRef = ref<HTMLElement | null>(null)
const isPlaying = ref(false)
const isMuted = ref(true)
const showControls = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)
let hideTimer: ReturnType<typeof setTimeout> | null = null

onUnmounted(() => { if (hideTimer) clearTimeout(hideTimer) })

onMounted(async () => {
  try {
    allProducts.value = await getProducts()
  } catch (e) {
    console.error('DetailView: failed to load products from cloud:', e)
  }
})

function togglePlay() {
  if (!videoRef.value) return
  if (isPlaying.value) { videoRef.value.pause(); isPlaying.value = false }
  else { videoRef.value.play(); isPlaying.value = true }
  resetHideTimer()
}

function toggleMute() {
  isMuted.value = !isMuted.value
  if (videoRef.value) videoRef.value.muted = isMuted.value
  resetHideTimer()
}

const isFullscreen = ref(false)

async function toggleFullscreen() {
  if (!playerRef.value) return
  if (isFullscreen.value) {
    const exit = document.exitFullscreen || (document as any).webkitExitFullscreen
    if (exit) await exit.call(document)
    try { (screen.orientation as any).unlock() } catch {}
  } else {
    const el = playerRef.value as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }
    const request = el.requestFullscreen || el.webkitRequestFullscreen
    if (request) {
      await request.call(el)
      try { await (screen.orientation as any).lock('landscape') } catch {}
    }
  }
  resetHideTimer()
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

function onTimeUpdate() {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime
  progress.value = duration.value ? (currentTime.value / duration.value) * 100 : 0
}

function onLoadedMetadata() {
  if (!videoRef.value) return
  duration.value = videoRef.value.duration
}

const isDragging = ref(false)
let dragBarEl: HTMLElement | null = null

function seekRatio(clientX: number) {
  if (!videoRef.value || !duration.value || !dragBarEl) return
  const rect = dragBarEl.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  videoRef.value.currentTime = ratio * duration.value
  progress.value = ratio * 100
  currentTime.value = ratio * duration.value
  resetHideTimer()
}

function onDragStart(e: MouseEvent | TouchEvent) {
  isDragging.value = true
  dragBarEl = e.currentTarget as HTMLElement
  const x = 'touches' in e ? e.touches[0].clientX : e.clientX
  seekRatio(x)
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
  document.addEventListener('touchmove', onDragMove, { passive: false })
  document.addEventListener('touchend', onDragEnd)
}

function onDragMove(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  e.preventDefault()
  const x = 'touches' in e ? e.touches[0].clientX : e.clientX
  seekRatio(x)
}

function onDragEnd() {
  isDragging.value = false
  dragBarEl = null
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.removeEventListener('touchmove', onDragMove)
  document.removeEventListener('touchend', onDragEnd)
}

function onVideoTap(e: Event) {
  const target = e.target as HTMLElement
  if (target.closest('button') || target.closest('.progress-bar')) return
  showControls.value = true
  resetHideTimer()
}

function resetHideTimer() {
  showControls.value = true
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => { showControls.value = false }, 3000)
}

function fmt(s: number): string {
  if (!s || !isFinite(s)) return '00:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function onTagClick(key: string) {
  if (key === activeTag.value) return
  showProducts.value = false
  setTimeout(() => {
    activeTag.value = key
    showProducts.value = true
  }, 150)
}
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
        {{ headerTitle }}
      </h1>
    </div>

    <template v-if="video">
      <!-- 视频播放器（完整控件） -->
      <div class="relative aspect-video bg-black overflow-hidden" ref="playerRef" @click="onVideoTap" @fullscreenchange="onFullscreenChange">
        <video
          ref="videoRef"
          class="w-full h-full object-cover"
          :muted="isMuted"
          playsinline
          loop
          @timeupdate="onTimeUpdate"
          @loadedmetadata="onLoadedMetadata"
        >
          <source :src="video.videoUrl" type="video/mp4" />
        </video>

        <!-- 底部控制栏 -->
        <Transition name="fade">
          <div
            v-if="showControls"
            class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 pt-6 pb-2"
          >
            <!-- 进度条 -->
            <div
              class="progress-bar relative h-5 flex items-center mb-1 cursor-pointer"
              @mousedown.stop.prevent="onDragStart"
              @touchstart.stop.prevent="onDragStart"
            >
              <div class="w-full h-1 bg-white/30 rounded-full overflow-visible relative">
                <div class="h-full bg-red-500 rounded-full" :style="{ width: progress + '%' }" />
                <div class="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-red-500 rounded-full shadow" :style="{ left: progress + '%' }" />
              </div>
            </div>
            <!-- 按钮行 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1">
                <button class="w-11 h-11 flex items-center justify-center active:scale-90 transition-transform" @click.stop="togglePlay">
                  <svg v-if="isPlaying" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                  <svg v-else class="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </button>
                <button class="w-11 h-11 flex items-center justify-center active:scale-90 transition-transform" @click.stop="toggleMute">
                  <svg v-if="isMuted" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                  <svg v-else class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
                <span class="text-white text-[12px] font-bold ml-1">{{ fmt(currentTime) }} / {{ fmt(duration) }}</span>
              </div>
            </div>
          </div>
        </Transition>

        <!-- 全屏按钮 -->
        <button
          class="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 rounded-full px-3 py-1.5 active:scale-95 transition-transform z-10"
          @click.stop="toggleFullscreen"
        >
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <span class="text-white text-[12px] font-bold">{{ isFullscreen ? '退出全屏' : '全屏' }}</span>
        </button>
      </div>

      <!-- 视频信息 -->
      <div class="bg-white px-4 py-4">
        <h1 class="detail-highlight-title text-[20px] font-bold leading-snug mb-2">{{ video.title }}</h1>
        <p class="text-[15px] text-gray-600 leading-relaxed mb-3">{{ video.summary }}</p>
        <div class="flex items-center gap-2.5 pt-3 border-t border-gray-100">
          <img
            :src="video.avatarUrl"
            :alt="video.author"
            class="w-11 h-11 rounded-full object-cover border border-gray-200 shadow-sm"
          />
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-[16px] font-bold text-gray-800">{{ video.author }}</span>
              <svg class="w-4 h-4 text-[#4CAF50]" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <p class="text-[13px] text-gray-400 mt-0.5">{{ video.views }} · {{ video.likes }}</p>
          </div>
        </div>
      </div>

      <!-- 相关视频推荐 -->
      <div v-if="relatedVideos.length > 0" class="px-3 py-3">
        <h2 class="text-[19px] font-extrabold text-gray-800 mb-3">相关视频</h2>
        <div class="flex gap-3 overflow-x-auto pb-2">
          <div
            v-for="rv in relatedVideos"
            :key="rv.id"
            class="shrink-0 w-[200px] bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
            @click="router.push({ name: 'detail', params: { id: rv.id } })"
          >
            <div class="aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div class="px-2.5 py-2">
              <p class="text-[14px] font-bold text-gray-700 leading-snug line-clamp-2">{{ rv.title }}</p>
              <p class="text-[12px] text-gray-400 mt-1">{{ rv.author }}</p>
            </div>
          </div>
        </div>
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

    <div v-else class="flex items-center justify-center py-20">
      <p class="text-gray-400 text-[16px]">视频未找到</p>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active { transition: opacity 0.25s ease-out; }
.fade-leave-active { transition: opacity 0.15s ease-in; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.detail-highlight-title {
  color: #000;
  background: linear-gradient(to bottom, transparent 45%, #FFD700 45%);
  display: inline;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
</style>
