import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useIntersectionObserver(
  target: Ref<HTMLElement | null>,
  threshold = 0.4,
) {
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!target.value) return
    observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.value = entry.isIntersecting && entry.intersectionRatio >= threshold
      },
      { threshold },
    )
    observer.observe(target.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { isVisible }
}
