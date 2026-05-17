import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0, behavior: 'instant' as ScrollBehavior }
  },
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/detail/:id',
      name: 'detail',
      component: () => import('@/views/DetailView.vue'),
      props: true,
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchResultView.vue'),
    },
    {
      path: '/product/:id',
      name: 'product',
      component: () => import('@/views/ProductDetail.vue'),
    },
    {
      path: '/order-success',
      name: 'order-success',
      component: () => import('@/views/OrderSuccess.vue'),
    },
    {
      path: '/video/:id',
      name: 'video-player',
      component: () => import('@/views/VideoPlayerView.vue'),
    },
    {
      path: '/category/:id',
      name: 'category',
      component: () => import('@/views/CategoryView.vue'),
    },
  ],
})

export default router
