import { createApp } from 'vue'
import vant from 'vant'
import router from './router'
import 'vant/lib/index.css'
import './style.css'
import App from './App.vue'

createApp(App).use(vant).use(router).mount('#app')
