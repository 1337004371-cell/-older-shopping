<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col items-center justify-center px-8">
    <!-- 成功图标 -->
    <div class="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
      <svg class="w-14 h-14 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
      </svg>
    </div>

    <h1 class="text-[26px] font-black text-gray-800 mb-2">下单成功！</h1>
    <p class="text-[16px] text-gray-500 mb-2 text-center">您的订单已提交，我们将尽快为您安排发货</p>
    <p class="text-[14px] text-gray-400 mb-10">预计 3-5 个工作日送达</p>

    <button
      class="w-full max-w-[320px] h-[56px] rounded-xl bg-[#4CAF50] text-white text-[20px] font-extrabold mb-4 active:opacity-90 transition-opacity"
      @click="router.push({ name: 'home' })"
    >
      返回首页
    </button>

    <button
      class="w-full max-w-[320px] h-[56px] rounded-xl border-2 border-gray-300 text-gray-600 text-[18px] font-bold active:opacity-80 transition-opacity"
      @click="router.back()"
    >
      继续逛逛
    </button>
  </div>
</template>
