<script setup lang="ts">
const props = defineProps<{ images?: string[] }>()

const fallback = [
  'https://picsum.photos/seed/pdetail1/750/600',
  'https://picsum.photos/seed/pdetail2/750/800',
  'https://picsum.photos/seed/pdetail3/750/1000',
  'https://picsum.photos/seed/pdetail4/750/700',
]

const list = props.images?.length ? props.images : fallback
</script>

<template>
  <section class="mt-2 bg-white">
    <h2 class="text-[22px] font-extrabold text-gray-800 text-center py-5">宝贝详情</h2>
    <div class="flex flex-col">
      <div
        v-for="(src, i) in list"
        :key="i"
        class="relative w-full min-h-[300px] bg-gradient-to-br from-gray-100 to-gray-200"
      >
        <img
          :src="src"
          alt="商品详情图"
          loading="lazy"
          class="w-full object-cover"
        />
      </div>
    </div>
  </section>
</template>
