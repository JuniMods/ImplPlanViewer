import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import './assets/styles/variables.css'
import './assets/styles/global.css'
import './assets/styles/responsive.css'
import App from './App.vue'
import router from './router'
import { initializeStoresFromBundledManifests } from './bootstrap/storeInitialization'
import pinia from './stores'
import { getAnalyticsConfig, registerPageViewTracking } from './utils/analytics'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#2196F3',
          secondary: '#FF9800',
          accent: '#4CAF50',
          error: '#F44336',
          warning: '#FF9800',
          info: '#2196F3',
          success: '#4CAF50',
          background: '#FFFFFF',
          surface: '#FAFAFA',
          'plan-feature': '#2196F3',
          'plan-enhancement': '#9C27B0',
          'plan-bug': '#F44336',
          'plan-refactor': '#FF9800',
          'plan-chore': '#9E9E9E',
          'priority-critical': '#F44336',
          'priority-high': '#FF9800',
          'priority-medium': '#2196F3',
          'priority-low': '#9E9E9E',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#42A5F5',
          secondary: '#FFA726',
          accent: '#66BB6A',
          error: '#EF5350',
          warning: '#FFA726',
          info: '#42A5F5',
          success: '#66BB6A',
          background: '#121212',
          surface: '#1E1E1E',
          'plan-feature': '#42A5F5',
          'plan-enhancement': '#AB47BC',
          'plan-bug': '#EF5350',
          'plan-refactor': '#FFA726',
          'plan-chore': '#BDBDBD',
          'priority-critical': '#EF5350',
          'priority-high': '#FFA726',
          'priority-medium': '#42A5F5',
          'priority-low': '#BDBDBD',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  defaults: {
    global: {
      ripple: true,
    },
  },
})

const app = createApp(App)

app.use(vuetify).use(pinia).use(router)

const initialization = initializeStoresFromBundledManifests(pinia)

if (!initialization.repositoriesLoaded || initialization.repositoryPlansLoaded === 0) {
  void router.replace({
    name: 'error',
    query: {
      message: initialization.issues.join('; ') || 'Manifest data is missing or invalid.',
    },
  })
}

app.config.errorHandler = (error) => {
  console.error('Unhandled application error', error)
  const message = error instanceof Error ? error.message : 'Unexpected application error.'
  void router.replace({
    name: 'error',
    query: { message },
  })
}

registerPageViewTracking(router, getAnalyticsConfig(import.meta.env))

app.mount('#app')
