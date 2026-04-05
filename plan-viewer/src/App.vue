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
  max-width: var(--container-width-wide);
  margin: 0 auto;
  background: var(--color-bg-primary);
}

.app-layout__header,
.app-layout__footer {
  background: var(--color-white);
}

.app-layout__header {
  border-bottom: 1px solid var(--color-gray-200);
}

.app-layout__footer {
  border-top: 1px solid var(--color-gray-200);
}

.app-layout__title {
  margin: 0;
  font-size: var(--text-h2);
  font-weight: var(--font-weight-semibold);
}

.app-layout__main {
  flex: 1;
  min-height: 0;
  padding: var(--space-6);
}

.app-layout__skip-link {
  position: absolute;
  left: -9999px;
  top: var(--space-2);
  z-index: var(--z-raised);
  background: var(--color-white);
  color: var(--color-text-primary);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-default);
  padding: var(--space-2) var(--space-3);
  box-shadow: var(--shadow-sm);
  font-size: var(--text-body-small);
  text-decoration: none;
}

.app-layout__skip-link:focus-visible {
  left: var(--space-3);
}

@media (max-width: 1024px) {
  .app-layout {
    width: 100%;
  }

  .app-layout__main {
    padding: var(--space-4);
  }

  .app-layout__header,
  .app-layout__footer {
    padding-inline: var(--space-4);
  }
}
</style>
