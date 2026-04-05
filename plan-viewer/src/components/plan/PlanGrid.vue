<script setup lang="ts">
import { computed } from 'vue'

import type { PlanMetadata } from '../../types'
import EmptyState from './EmptyState.vue'
import PlanCard from './PlanCard.vue'

const props = withDefaults(
  defineProps<{
    plans: PlanMetadata[]
    compact?: boolean
    emptyMessage?: string
    showClearFilters?: boolean
  }>(),
  {
    compact: false,
    emptyMessage: '',
    showClearFilters: false,
  },
)

const emit = defineEmits<{
  select: [plan: PlanMetadata]
  'clear-filters': []
}>()

const hasPlans = computed(() => props.plans.length > 0)

const getPlanKey = (plan: PlanMetadata, index: number): string => {
  const candidate = plan as unknown as Record<string, unknown>
  const number = candidate.number
  const title = candidate.title

  if (typeof number === 'number' || typeof number === 'string') {
    return String(number)
  }

  if (typeof title === 'string' && title.trim()) {
    return `${title.trim()}-${index}`
  }

  return `plan-${index}`
}

const onPlanClick = (plan: PlanMetadata): void => {
  emit('select', plan)
}

const onClearFilters = (): void => {
  emit('clear-filters')
}
</script>

<template>
  <section class="plan-grid" data-testid="plan-grid">
    <ul v-if="hasPlans" class="plan-grid__list" role="list">
      <li v-for="(plan, index) in plans" :key="getPlanKey(plan, index)" class="plan-grid__item">
        <PlanCard :plan="plan" :compact="compact" @click="onPlanClick(plan)" />
      </li>
    </ul>
    <EmptyState v-else :filtered="showClearFilters" :message="emptyMessage" @clear="onClearFilters" />
  </section>
</template>

<style scoped>
.plan-grid {
  width: 100%;
}

.plan-grid__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}

@media (min-width: 768px) {
  .plan-grid__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1200px) {
  .plan-grid__list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.plan-grid__item {
  min-width: 0;
}
</style>
