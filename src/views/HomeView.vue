<script setup lang="ts">
import HomeHeader from '@/components/HomeHeader.vue'
import SceneTags from '@/components/SceneTags.vue'
import VideoList from '@/components/VideoList.vue'
import type { Scene } from '@/data/mockData'

function onSceneSelect(scene: Scene) {
  console.log('Selected scene:', scene.name)
}
</script>

<template>
  <div class="min-h-screen bg-[#f5f5f5]">
    <HomeHeader />
    <SceneTags @select="onSceneSelect" />
    <VideoList />
  </div>
</template>
