import { createApp } from 'vue'
import './style.css'
import './app/styles/game.css'
import App from './App.vue'
import pinia from './app/main.js'

const app = createApp(App)
app.use(pinia)
app.mount('#app')
