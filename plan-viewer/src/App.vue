<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useTheme as useVuetifyTheme } from 'vuetify'

import ErrorBoundary from './components/common/ErrorBoundary.vue'
import AppFooter from './components/common/AppFooter.vue'
import AppHeader from './components/common/AppHeader.vue'
import { useTheme } from './composables'
import { ThemePreference, type ThemePreference as ThemePreferenceType } from './types'

let vuetifyTheme: ReturnType<typeof useVuetifyTheme> | undefined
try {
  vuetifyTheme = useVuetifyTheme()
} catch {
  // Allows rendering environments without Vuetify injection.
}

useTheme({
  applyTheme: (theme: ThemePreferenceType) => {
    if (!vuetifyTheme) {
      return
    }

    vuetifyTheme.global.name.value = theme === ThemePreference.DARK ? 'dark' : 'light'
  },
})
</script>

<template>
  <div class="app-layout">
    <a href="#main-content" class="app-layout__skip-link">Skip to main content</a>

    <header class="app-layout__header">
      <slot name="header">
        <AppHeader />
      </slot>
    </header>

    <main id="main-content" class="app-layout__main" tabindex="-1">
      <ErrorBoundary>
        <RouterView />
      </ErrorBoundary>
    </main>

    <footer class="app-layout__footer">
      <slot name="footer">
        <AppFooter />
      </slot>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  width: min(1320px, calc(100% - 1.5rem));
  margin: 0 auto;
  border-left: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
  border-right: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
  background: linear-gradient(180deg, color-mix(in srgb, var(--bg) 72%, transparent), color-mix(in srgb, var(--surface) 80%, transparent));
  backdrop-filter: blur(12px);
}

.app-layout__header,
.app-layout__footer {
  border-block: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
  padding: 0.9rem 1.2rem;
  background: color-mix(in srgb, var(--surface-glass) 94%, transparent);
  backdrop-filter: blur(14px);
}

.app-layout__title {
  margin: 0;
  font-size: 1.25rem;
}

.app-layout__main {
  flex: 1;
  min-height: 0;
  padding: 1rem 1.2rem 1.35rem;
}

.app-layout__skip-link {
  position: absolute;
  left: -9999px;
  top: 0.5rem;
  z-index: 100;
  background: var(--bg);
  color: var(--text-h);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.45rem 0.65rem;
  box-shadow: var(--shadow-sm);
}

.app-layout__skip-link:focus-visible {
  left: 0.75rem;
}

@media (max-width: 860px) {
  .app-layout {
    width: 100%;
    border-left: 0;
    border-right: 0;
  }

  .app-layout__header,
  .app-layout__footer,
  .app-layout__main {
    padding-inline: 0.9rem;
  }
}
</style>
