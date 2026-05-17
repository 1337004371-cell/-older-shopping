import { ref, onMounted, type Ref } from 'vue'

export function useStickyHeader(headerRef: Ref<HTMLElement | null>) {
  const headerHeight = ref(0)

  onMounted(() => {
    if (headerRef.value) {
      headerHeight.value = headerRef.value.offsetHeight
    }
  })

  return { headerHeight }
}
