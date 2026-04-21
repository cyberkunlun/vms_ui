import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

// ✅ 加这两行
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

createApp(App)
  .use(ElementPlus)   // ⭐关键
  .mount('#app')