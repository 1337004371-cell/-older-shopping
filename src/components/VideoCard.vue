<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'
import type { Video } from '@/data/mockData'

const props = defineProps<{ video: Video; linkTo?: string }>()
const router = useRouter()

const cardRef = ref<HTMLElement | null>(null)
const { isVisible } = useIntersectionObserver(cardRef, 0.4)
const isMuted = ref(true)
const isPlaying = ref(false)
const isPlayerOpen = ref(false)

watch(isVisible, (visible) => {
  if (visible && !isPlayerOpen.value) {
    isPlaying.value = true
    console.log(`[播放] ${props.video.title}`)
  } else {
    isPlaying.value = false
    console.log(`[暂停] ${props.video.title}`)
  }
})

function toggleMute() {
  isMuted.value = !isMuted.value
}

function openPlayer() {
  if (props.linkTo) {
    const q = new URLSearchParams({
      url: props.video.videoUrl,
      cover: props.video.coverUrl || props.video.coverImage || '',
      title: props.video.title,
    })
    router.push(props.linkTo + '?' + q.toString())
    return
  }
  if (props.video.videoUrl && props.video.videoUrl !== '#') {
    isPlayerOpen.value = true
    isPlaying.value = true
  }
}

function closePlayer() {
  isPlayerOpen.value = false
}
</script>

<template>
  <div ref="cardRef" class="bg-white rounded-2xl overflow-hidden shadow-sm">
    <!-- 标题（纯黑 + 荧光笔高亮） -->
    <div class="px-4 pt-4 pb-2">
      <p class="video-highlight-title text-[20px] font-bold leading-snug">
        {{ video.title }}
      </p>
    </div>

    <!-- 摘要 -->
    <div class="px-4 pb-3">
      <p class="text-[15px] text-gray-600 leading-relaxed">
        {{ video.summary }}
      </p>
    </div>

    <!-- 视频区域 -->
    <div class="relative aspect-video bg-gradient-to-br from-gray-200 to-gray-300 mx-4 rounded-xl overflow-hidden">
      <!-- Bilibili iframe 播放器 -->
      <iframe
        v-if="isPlayerOpen"
        :src="video.videoUrl"
        class="absolute inset-0 w-full h-full"
        frameborder="0"
        allowfullscreen
        allow="autoplay; encrypted-media"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />

      <!-- 封面区域（未播放时显示） -->
      <template v-else>
        <!-- 封面图 -->
        <img
          v-if="video.coverUrl || video.coverImage"
          :src="video.coverUrl || video.coverImage"
          :alt="video.title"
          referrerpolicy="no-referrer"
          class="absolute inset-0 w-full h-full object-cover"
        />

        <!-- 播放中指示器 -->
        <div
          v-if="isPlaying"
          class="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/50 rounded-full px-2.5 py-1"
        >
          <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span class="text-white text-[12px] font-bold">播放中</span>
        </div>

        <!-- 播放按钮 -->
        <button
          class="absolute inset-0 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          @click="openPlayer"
        >
          <div class="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center">
            <svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>

        <!-- 静音/取消静音按钮 -->
        <button
          class="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center active:scale-90 transition-transform"
          @click.stop="toggleMute"
        >
          <svg v-if="isMuted" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
          <svg v-else class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>
      </template>

      <!-- 关闭播放器按钮 -->
      <button
        v-if="isPlayerOpen"
        class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center active:scale-90 transition-transform z-10"
        @click.stop="closePlayer"
      >
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- 作者信息 -->
    <div class="px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <img
          :src="video.avatarUrl"
          :alt="video.author"
          class="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm"
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
</template>

<style scoped>
.video-highlight-title {
  color: #000;
  background: linear-gradient(to bottom, transparent 45%, #FFD700 45%);
  display: inline;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
</style>
