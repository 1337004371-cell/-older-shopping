<script setup lang="ts">
defineProps<{ count?: number }>()
</script>

<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-8">
    <!-- 导航栏骨架 -->
    <div class="flex items-center gap-3 px-4 py-3 bg-white sticky top-0 z-50">
      <div class="w-11 h-11 rounded-full bg-gray-100 animate-pulse" />
      <div class="flex-1 h-[44px] rounded-lg bg-gray-100 animate-pulse" />
    </div>

    <!-- 助手回答卡片骨架（固定 5 行高度 ≈ 170px） -->
    <div class="px-4 pt-4">
      <div class="relative rounded-2xl bg-[#FFF8E1]/60 px-5 py-4 shadow-sm">
        <!-- 头像占位 -->
        <div class="absolute top-3 right-3 w-10 h-10 rounded-full bg-amber-100 animate-pulse" />
        <!-- 5 行文字占位 -->
        <div class="pr-12 flex flex-col gap-[10px]">
          <div class="h-[22px] w-full rounded bg-amber-100/80 animate-pulse" />
          <div class="h-[22px] w-full rounded bg-amber-100/80 animate-pulse" />
          <div class="h-[22px] w-full rounded bg-amber-100/80 animate-pulse" />
          <div class="h-[22px] w-[85%] rounded bg-amber-100/80 animate-pulse" />
          <div class="h-[22px] w-[60%] rounded bg-amber-100/80 animate-pulse" />
        </div>
        <!-- 查看更多按钮占位 -->
        <div class="mt-3 h-[44px] w-[120px] rounded-lg bg-amber-100/60 animate-pulse" />
      </div>
    </div>

    <!-- 分隔区域骨架 -->
    <div class="px-4 pt-5 pb-2 flex items-center gap-2">
      <div class="h-[30px] w-[90px] rounded-full bg-gray-200 animate-pulse" />
      <div class="h-[16px] w-[100px] rounded bg-gray-200 animate-pulse" />
    </div>

    <!-- 视频卡片骨架（aspect-video ≈ 16:9） -->
    <div class="px-4 py-2">
      <div class="h-[20px] w-[80px] rounded bg-gray-200 animate-pulse mb-3" />
      <div class="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div class="aspect-video bg-gray-200 animate-pulse" />
        <div class="px-4 py-3 flex flex-col gap-2">
          <div class="h-[20px] w-[85%] rounded bg-gray-100 animate-pulse" />
          <div class="h-[16px] w-[65%] rounded bg-gray-100 animate-pulse" />
          <div class="flex items-center gap-2 mt-1">
            <div class="w-6 h-6 rounded-full bg-gray-100 animate-pulse" />
            <div class="h-[14px] w-[60px] rounded bg-gray-100 animate-pulse" />
            <div class="ml-auto h-[12px] w-[70px] rounded bg-gray-100 animate-pulse" />
          </div>
        </div>
      </div>
    </div>

    <!-- 标签栏骨架 -->
    <div class="px-3 pt-2 pb-1 flex gap-2">
      <div v-for="i in 4" :key="i" class="h-[40px] w-[80px] rounded-full bg-gray-200 animate-pulse shrink-0" />
    </div>

    <!-- 商品卡片骨架（双列，aspect-square 锁定高度） -->
    <div class="px-4 py-2 grid grid-cols-2 gap-3">
      <div v-for="i in (count ?? 4)" :key="i" class="bg-white rounded-xl overflow-hidden shadow-sm">
        <!-- 商品图占位 -->
        <div class="aspect-square bg-gray-200 animate-pulse" />
        <div class="px-3 py-2.5 flex flex-col gap-2">
          <!-- 标题 2 行 -->
          <div class="min-h-[42px] flex flex-col gap-[6px]">
            <div class="h-[18px] w-full rounded bg-gray-100 animate-pulse" />
            <div class="h-[18px] w-[70%] rounded bg-gray-100 animate-pulse" />
          </div>
          <!-- 标签 + 划线价 -->
          <div class="flex items-center gap-1.5">
            <div class="h-[16px] w-[50px] rounded bg-gray-100 animate-pulse" />
            <div class="h-[12px] w-[40px] rounded bg-gray-100 animate-pulse" />
          </div>
          <!-- 价格 -->
          <div class="h-[22px] w-[70px] rounded bg-gray-100 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
</template>
