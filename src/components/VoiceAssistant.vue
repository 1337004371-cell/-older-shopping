<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { matchScene } from '@/data/searchCases'

const router = useRouter()
const isPressed = ref(false)
const showSheet = ref(false)
const recognizedText = ref('')
const imgLoaded = ref(true)

const mockResults = ['腿脚不好', '走路膝盖疼', '补钙怎么补', '手机怎么用', '冬天穿什么暖和']

function onTouchStart() {
  isPressed.value = true
  recognizedText.value = ''
  showSheet.value = true
}

function onTouchEnd() {
  isPressed.value = false
  setTimeout(() => {
    const result = mockResults[Math.floor(Math.random() * mockResults.length)]
    recognizedText.value = result
    speak(result)
    setTimeout(() => {
      showSheet.value = false
      const matched = matchScene(result)
      if (matched) {
        router.push({ name: 'search', query: { q: result } })
      }
    }, 1500)
  }, 800)
}

function speak(text: string) {
  const matched = matchScene(text)
  const label = matched?.label ?? text
  const utterance = `正在为您寻找解决${label}的方案`
  const synth = window.speechSynthesis
  if (!synth) return
  synth.cancel()
  const msg = new SpeechSynthesisUtterance(utterance)
  msg.lang = 'zh-CN'
  msg.rate = 0.9
  synth.speak(msg)
}
</script>

<template>
  <!-- 半屏弹窗 -->
  <Transition name="slide-up">
    <div
      v-if="showSheet"
      class="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl px-6 py-6 z-[1000]"
    >
      <div class="flex items-center gap-3 mb-4">
        <div class="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
        <span class="text-[18px] font-bold text-gray-800">正在听您说话...</span>
      </div>
      <div v-if="isPressed" class="flex items-center justify-center gap-1 h-12 mb-3">
        <span
          v-for="i in 12"
          :key="i"
          class="w-1.5 rounded-full bg-indigo-400"
          :style="{ height: `${12 + Math.random() * 28}px` }"
        />
      </div>
      <p v-if="recognizedText" class="text-[22px] font-bold text-indigo-500 text-center">
        "{{ recognizedText }}"
      </p>
      <p v-else class="text-[16px] text-gray-400 text-center">请说出您的需求...</p>
    </div>
  </Transition>

  <!-- 悬浮组件：头像 + 胶囊标签 -->
  <div
    class="fixed bottom-[80px] right-4 z-[999] flex flex-col items-center"
    @touchstart.prevent="onTouchStart"
    @touchend.prevent="onTouchEnd"
    @mousedown.prevent="onTouchStart"
    @mouseup.prevent="onTouchEnd"
    @mouseleave="isPressed && onTouchEnd()"
  >
    <!-- 头像 -->
    <div class="relative">
      <!-- 紫色波纹扩散 -->
      <span
        v-if="isPressed"
        class="absolute inset-[-8px] rounded-full bg-indigo-400/40 animate-ripple"
      />
      <span
        v-if="isPressed"
        class="absolute inset-[-8px] rounded-full bg-indigo-400/25 animate-ripple-delay"
      />
      <div
        class="relative w-20 h-20 rounded-full overflow-hidden border-[2.5px] border-white shadow-xl transition-transform"
        :class="isPressed ? 'scale-90' : 'scale-100'"
      >
        <img
          v-if="imgLoaded"
          src="https://pic.imgdb.cn/item/65fd1f459f345e8d0309990b.jpg"
          alt="客服助手"
          class="w-full h-full object-cover"
          @error="imgLoaded = false"
        />
        <span v-else class="w-full h-full flex items-center justify-center bg-indigo-400 text-[36px]">
          👩‍💼
        </span>
      </div>
    </div>

    <!-- 胶囊标签 — 部分重叠头像底部 -->
    <div
      class="relative -mt-4 w-[170px] py-2.5 rounded-full bg-indigo-400 shadow-lg text-center transition-transform"
      :class="isPressed ? 'scale-90' : 'scale-100'"
    >
      <p class="text-white text-[14px] font-bold leading-snug px-2">
        {{ isPressed ? '松开结束' : '按住说话，我来帮您找' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
@keyframes ripple {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.6); opacity: 0; }
}
.animate-ripple {
  animation: ripple 1s ease-out infinite;
}
.animate-ripple-delay {
  animation: ripple 1s ease-out 0.4s infinite;
}
</style>
