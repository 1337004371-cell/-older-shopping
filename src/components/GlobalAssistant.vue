<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { matchScene } from '@/data/searchCases'
import { getProductById } from '@/utils/cloudDB'

const router = useRouter()
const route = useRoute()

const isPressed = ref(false)
const showSheet = ref(false)
const recognizedText = ref('')
const imgLoaded = ref(true)

const isHome = computed(() => route.name === 'home')
const isProduct = computed(() => route.name === 'product')

// 商品详情页：由底栏按钮触发（非长按）
function openFromBar() {
  isPressed.value = true
  recognizedText.value = ''
  showSheet.value = true
  setTimeout(() => onTouchEnd(), 500)
}

onMounted(() => {
  window.addEventListener('open-assistant', openFromBar)
})

onUnmounted(() => {
  window.removeEventListener('open-assistant', openFromBar)
})

const guideText = computed(() => {
  const name = route.name as string
  if (name === 'product') return '您可以问我："这东西怎么用？"或"还有优惠吗？"'
  if (name === 'order-success') return '想知道物流到哪了？长按问我："我的东西在哪？"'
  return '试着跟我说："我想买假牙清洗剂"或"走路脚疼怎么办？"'
})

const mockResultsByRoute = computed(() => {
  const name = route.name as string
  if (name === 'product') return ['这东西怎么用？', '还有优惠吗？', '质量靠谱吗？']
  if (name === 'order-success') return ['我的东西到哪了？', '怎么退货？']
  return ['腿脚不好', '走路膝盖疼', '补钙怎么补', '手机怎么用', '冬天穿什么暖和']
})

function onTouchStart() {
  isPressed.value = true
  recognizedText.value = ''
  showSheet.value = true
}

function onTouchEnd() {
  isPressed.value = false
  setTimeout(() => {
    const pool = mockResultsByRoute.value
    const result = pool[Math.floor(Math.random() * pool.length)]
    recognizedText.value = result
    speak(result)
    setTimeout(() => {
      showSheet.value = false
      setTimeout(() => {
        const name = route.name as string
        if (name !== 'product' && name !== 'order-success') {
          const matched = matchScene(result)
          if (matched) {
            router.push({ name: 'search', query: { q: result } })
          }
        }
      }, 350)
    }, 1500)
  }, 800)
}

async function speak(text: string) {
  const name = route.name as string
  let utterance: string

  if (name === 'product') {
    const productId = route.params.id as string
    let productName = '这款商品'
    let tag = '专属'
    try {
      const p = await getProductById(productId)
      if (p) { productName = p.name; tag = p.tag }
    } catch {}
    utterance = `${productName}，采用优质材料，品质有保障。目前有${tag}优惠，非常划算。`
  } else if (name === 'order-success') {
    utterance = '您的宝贝已从上海发货，正在路上，请放心。'
  } else {
    const matched = matchScene(text)
    const label = matched?.label ?? text
    utterance = `正在为您寻找解决${label}的方案`
  }

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
  <!-- 单根元素：避免 Vue 3 fragment 兼容性问题 -->
  <div style="position: fixed; inset: 0; pointer-events: none; z-index: 9999;">

    <!-- 识别结果弹窗 -->
    <Transition name="slide-up">
      <div
        v-if="showSheet"
        style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 10001; pointer-events: auto; background: white; border-radius: 16px 16px 0 0; box-shadow: 0 -8px 32px rgba(0,0,0,0.2); padding: 24px;"
      >
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #6366f1; animation: pulse 1.5s infinite;" />
          <span style="font-size: 18px; font-weight: bold; color: #1f2937;">正在听您说话...</span>
        </div>
        <div v-if="isPressed" style="display: flex; align-items: center; justify-content: center; gap: 4px; height: 48px; margin-bottom: 12px;">
          <span
            v-for="i in 12"
            :key="i"
            style="width: 6px; border-radius: 9999px; background: #818cf8;"
            :style="{ height: `${12 + Math.random() * 28}px` }"
          />
        </div>
        <p v-if="recognizedText" style="font-size: 22px; font-weight: bold; color: #6366f1; text-align: center;">
          "{{ recognizedText }}"
        </p>
        <p v-else style="font-size: 16px; color: #9ca3af; text-align: center;">请说出您的需求...</p>
      </div>
    </Transition>

    <!-- ====== 首页：底栏对话条 ====== -->
    <div
      v-if="isHome"
      style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999; pointer-events: auto; padding: 0 12px 12px;"
      @touchstart.prevent="onTouchStart"
      @touchend.prevent="onTouchEnd"
      @mousedown.prevent="onTouchStart"
      @mouseup.prevent="onTouchEnd"
      @mouseleave="isPressed && onTouchEnd()"
    >
      <div
        style="display: flex; align-items: center; gap: 8px; border-radius: 16px; border: 2px solid #ADD8E6; background: #F9F9F9; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
        :style="isPressed
          ? { background: '#eef2ff', boxShadow: '0 4px 12px rgba(99,102,241,0.3)', borderColor: '#818cf8' }
          : {}"
      >
        <div style="flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; padding: 12px 16px;">
          <!-- 麦克风图标 -->
          <svg
            style="width: 24px; height: 24px; flex-shrink: 0;"
            :style="{ color: isPressed ? '#6366f1' : '#4CAF50' }"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <p style="font-size: 15px; font-weight: bold; line-height: 1.4; margin: 0;" :style="{ color: isPressed ? '#4f46e5' : '#374151' }">
            <span v-if="isPressed" style="display: inline-flex; align-items: center; gap: 4px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #6366f1; animation: bounce 1s infinite;" />
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #6366f1; animation: bounce 1s 0.15s infinite;" />
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #6366f1; animation: bounce 1s 0.3s infinite;" />
              <span style="margin-left: 4px;">正在倾听...</span>
            </span>
            <span v-else>{{ guideText }}</span>
          </p>
        </div>
        <div style="position: relative; flex-shrink: 0; padding-right: 12px; display: flex; align-items: center;">
          <span
            v-if="isPressed"
            style="position: absolute; inset: -5px; border-radius: 50%; background: rgba(99,102,241,0.3); animation: ripple 1s ease-out infinite;"
          />
          <div style="width: 48px; height: 48px; border-radius: 50%; overflow: hidden; border: 2px solid #c7d2fe; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <img
              v-if="imgLoaded"
              src="https://pic.imgdb.cn/item/65fd1f459f345e8d0309990b.jpg"
              alt="客服助手"
              style="width: 100%; height: 100%; object-fit: cover;"
              @error="imgLoaded = false"
            />
            <span v-else style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #818cf8; font-size: 22px;">👩‍💼</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 非首页 & 非商品详情：悬浮球 ====== -->
    <div
      v-else-if="!isProduct"
      :style="{
        position: 'fixed',
        right: '16px',
        bottom: isProduct ? '80px' : '36px',
        zIndex: 9999,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }"
      @touchstart.prevent="onTouchStart"
      @touchend.prevent="onTouchEnd"
      @mousedown.prevent="onTouchStart"
      @mouseup.prevent="onTouchEnd"
      @mouseleave="isPressed && onTouchEnd()"
    >
      <div style="position: relative;">
        <span
          v-if="isPressed"
          style="position: absolute; inset: -8px; border-radius: 50%; background: rgba(99,102,241,0.4); animation: ripple 1s ease-out infinite;"
        />
        <span
          v-if="isPressed"
          style="position: absolute; inset: -8px; border-radius: 50%; background: rgba(99,102,241,0.25); animation: ripple 1s ease-out 0.4s infinite;"
        />
        <div
          style="position: relative; width: 64px; height: 64px; border-radius: 50%; overflow: hidden; border: 2.5px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
          :style="{ transform: isPressed ? 'scale(0.9)' : 'scale(1)', transition: 'transform 0.15s' }"
        >
          <img
            v-if="imgLoaded"
            src="https://pic.imgdb.cn/item/65fd1f459f345e8d0309990b.jpg"
            alt="客服助手"
            style="width: 100%; height: 100%; object-fit: cover;"
            @error="imgLoaded = false"
          />
          <span v-else style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #818cf8; font-size: 28px;">👩‍💼</span>
        </div>
      </div>
      <div
        style="position: relative; margin-top: -12px; width: 110px; padding: 8px 0; border-radius: 9999px; background: #818cf8; box-shadow: 0 4px 12px rgba(0,0,0,0.15); text-align: center;"
        :style="{ transform: isPressed ? 'scale(0.9)' : 'scale(1)', transition: 'transform 0.15s' }"
      >
        <p style="color: white; font-size: 13px; font-weight: bold; line-height: 1.4; padding: 0 8px; margin: 0;">
          {{ isPressed ? '松开结束' : '点我帮您找' }}
        </p>
      </div>
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
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
