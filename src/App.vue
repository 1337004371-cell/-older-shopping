<script setup lang="ts">
import GlobalAssistant from '@/components/GlobalAssistant.vue'
</script>

<template>
  <!-- app root -->
  <div id="app-container" class="pb-[80px]">
    <router-view />
  </div>
  <GlobalAssistant />
</template>
