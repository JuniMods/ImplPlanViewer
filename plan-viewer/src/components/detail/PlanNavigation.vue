<script setup lang="ts">
import { computed } from 'vue'

import type { PlanMetadata } from '../../types'

interface NavigationPlan {
  id: string
  title: string
}

const props = withDefaults(
  defineProps<{
    plans: PlanMetadata[]
    currentPlanId: string | number
    basePath?: string
  }>(),
  {
    basePath: '',
  },
)

const currentId = computed(() => String(props.currentPlanId).trim())

const normalizedBasePath = computed(() => props.basePath.trim().replace(/\/+$/u, ''))

const getField = (plan: PlanMetadata, keys: string[]): string => {
  const record = plan as unknown as Record<string, unknown>

  for (const key of keys) {
    const value = record[key]

    if (typeof value === 'string') {
      const normalized = value.trim()
      if (normalized.length > 0) {
        return normalized
      }
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value)
    }
  }

  return ''
}

const navigationPlans = computed<NavigationPlan[]>(() =>
  props.plans
    .map((plan) => {
      const id = getField(plan, ['id', 'planId', 'number'])

      if (!id) {
        return null
      }

      const title = getField(plan, ['title', 'name']) || `Plan ${id}`
      return { id, title }
    })
    .filter((plan): plan is NavigationPlan => plan !== null),
)

const currentIndex = computed(() =>
  navigationPlans.value.findIndex((plan) => plan.id === currentId.value),
)

const previousPlan = computed(() => {
  if (currentIndex.value <= 0) {
    return null
  }

  return navigationPlans.value[currentIndex.value - 1] ?? null
})

const nextPlan = computed(() => {
  if (currentIndex.value < 0 || currentIndex.value >= navigationPlans.value.length - 1) {
    return null
  }

  return navigationPlans.value[currentIndex.value + 1] ?? null
})

const positionLabel = computed(() => {
  const total = navigationPlans.value.length

  if (total === 0) {
    return 'No plans available'
  }

  if (currentIndex.value < 0) {
    return 'Plan not in current list'
  }

  return `Plan ${currentIndex.value + 1} of ${total}`
})

const planHref = (plan: NavigationPlan): string => {
  const encodedPlanId = encodeURIComponent(plan.id)
  return normalizedBasePath.value ? `${normalizedBasePath.value}/${encodedPlanId}` : `/${encodedPlanId}`
}
</script>

<template>
  <nav class="plan-navigation" aria-label="Plan navigation" data-testid="plan-navigation">
    <div class="plan-navigation__controls">
      <a
        v-if="previousPlan"
        :href="planHref(previousPlan)"
        class="plan-navigation__button"
        data-testid="plan-navigation-prev"
      >
        ← Prev: {{ previousPlan.title }}
      </a>
      <span v-else class="plan-navigation__button plan-navigation__button--disabled" data-testid="plan-navigation-prev-disabled">
        ← Prev
      </span>

      <a v-if="nextPlan" :href="planHref(nextPlan)" class="plan-navigation__button" data-testid="plan-navigation-next">
        Next: {{ nextPlan.title }} →
      </a>
      <span v-else class="plan-navigation__button plan-navigation__button--disabled" data-testid="plan-navigation-next-disabled">
        Next →
      </span>
    </div>

    <p class="plan-navigation__meta" data-testid="plan-navigation-meta">
      {{ positionLabel }} · Use ← and → keys to navigate
    </p>
  </nav>
</template>

<style scoped>
.plan-navigation {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--bg);
  padding: 1rem;
  display: grid;
  gap: 0.65rem;
}

.plan-navigation__controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.6rem;
}

.plan-navigation__button {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--bg);
  color: var(--text-h);
  padding: 0.4rem 0.7rem;
  text-decoration: none;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plan-navigation__button--disabled {
  color: var(--text-m, var(--text));
  opacity: 0.65;
}

.plan-navigation__meta {
  margin: 0;
  color: var(--text-m, var(--text));
  font-size: 0.82rem;
}
</style>
