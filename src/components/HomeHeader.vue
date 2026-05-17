<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const keyword = ref('')

function onSubmit() {
  const q = keyword.value.trim()
  if (!q) return
  router.push({ name: 'search', query: { q } })
}
</script>

<template>
  <div class="w-full px-3 py-3 bg-white sticky top-0 z-50">
    <form class="flex items-center gap-2" @submit.prevent="onSubmit">
      <div class="flex-1 flex items-center h-[40px] border border-gray-300 rounded-lg px-3 bg-gray-50">
        <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="keyword"
          type="search"
          placeholder="鞋底软不用系鞋带的鞋"
          class="flex-1 ml-2 text-[16px] text-gray-800 placeholder-gray-400 outline-none bg-transparent"
        />
      </div>
      <button type="submit" class="h-[40px] px-4 bg-[#FF7A68] text-[16px] font-extrabold rounded-lg shrink-0 active:opacity-80 shadow-sm" style="color: #FFFFFF">
        搜索
      </button>
    </form>
  </div>
</template>
