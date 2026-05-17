<script setup lang="ts">
import { useRouter } from 'vue-router'
import { scenes } from '@/data/mockData'
import type { Scene } from '@/data/mockData'

const router = useRouter()

const tagStyles: Record<string, { bg: string; text: string }> = {
  s1: { bg: '#F57C00', text: '#FFFFFF' },
  s2: { bg: '#EC407A', text: '#FFFFFF' },
  s3: { bg: '#5C6BC0', text: '#FFFFFF' },
  s4: { bg: '#42A5F5', text: '#FFFFFF' },
  s5: { bg: '#26A69A', text: '#FFFFFF' },
  s6: { bg: '#FF7043', text: '#FFFFFF' },
  s7: { bg: '#FFA726', text: '#FFFFFF' },
  s8: { bg: '#AB47BC', text: '#FFFFFF' },
}

function onTagClick(scene: Scene) {
  router.push({ name: 'category', params: { id: scene.id } })
}
</script>

<template>
  <div class="w-full px-3 py-2 bg-white">
    <div class="grid grid-cols-4 gap-2">
      <button
        v-for="scene in scenes"
        :key="scene.id"
        class="flex flex-col items-center justify-center rounded-xl py-2 px-1 min-h-[52px] active:scale-95 transition-transform"
        :style="{ backgroundColor: tagStyles[scene.id].bg }"
        @click="onTagClick(scene)"
      >
        <span
          class="text-[16px] font-extrabold leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-full text-center"
          :style="{ color: tagStyles[scene.id].text }"
        >{{ scene.name }}</span>
      </button>
    </div>
  </div>
</template>
