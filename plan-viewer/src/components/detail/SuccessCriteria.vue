<script setup lang="ts">
import { computed } from 'vue'

import type { Criterion } from '../../types'

const props = withDefaults(
  defineProps<{
    criteria?: Criterion[]
  }>(),
  {
    criteria: () => [],
  },
)

const totalCriteria = computed(() => props.criteria.length)

const completedCriteria = computed(
  () => props.criteria.filter((criterion) => criterion.completed).length,
)

const completionPercentage = computed(() =>
  totalCriteria.value === 0 ? 0 : Math.round((completedCriteria.value / totalCriteria.value) * 100),
)

const progressLabel = computed(() =>
  totalCriteria.value === 0
    ? 'No success criteria available yet.'
    : `${completedCriteria.value}/${totalCriteria.value} criteria complete (${completionPercentage.value}%)`,
)
</script>

<template>
  <section class="success-criteria" data-testid="success-criteria">
    <header class="success-criteria__header">
      <h2 class="success-criteria__title">Success Criteria</h2>
      <p class="success-criteria__progress" data-testid="success-criteria-progress">{{ progressLabel }}</p>
    </header>

    <div
      class="success-criteria__progressbar"
      role="progressbar"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuenow="completionPercentage"
      :aria-label="`Success criteria completion ${completionPercentage}%`"
      data-testid="success-criteria-progressbar"
    >
      <span
        class="success-criteria__progressbar-fill"
        :style="{ width: `${completionPercentage}%` }"
      />
    </div>

    <p
      v-if="criteria.length === 0"
      class="success-criteria__empty"
      data-testid="success-criteria-empty"
    >
      No success criteria defined.
    </p>

    <ul v-else class="success-criteria__list" data-testid="success-criteria-list">
      <li
        v-for="criterion in criteria"
        :key="criterion.text"
        class="success-criteria__item"
        :class="{ 'success-criteria__item--completed': criterion.completed }"
        data-testid="success-criteria-item"
      >
        <span class="success-criteria__item-state" aria-hidden="true">
          {{ criterion.completed ? '✓' : '○' }}
        </span>
        <span>{{ criterion.text || 'Untitled criterion' }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.success-criteria {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--bg);
  padding: 1rem;
  display: grid;
  gap: 0.85rem;
}

.success-criteria__header {
  display: grid;
  gap: 0.25rem;
}

.success-criteria__title {
  margin: 0;
  color: var(--text-h);
  font-size: 1.1rem;
}

.success-criteria__progress,
.success-criteria__empty {
  margin: 0;
  color: var(--text-m, var(--text));
}

.success-criteria__progressbar {
  height: 0.65rem;
  border-radius: 0.2rem;
  background: color-mix(in srgb, var(--accent) 12%, var(--border));
  overflow: hidden;
}

.success-criteria__progressbar-fill {
  display: block;
  height: 100%;
  background: color-mix(in srgb, var(--accent) 74%, #2d4a86);
  transition: width 200ms ease-in-out;
}

.success-criteria__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.45rem;
}

.success-criteria__item {
  display: flex;
  gap: 0.45rem;
  color: var(--text);
}

.success-criteria__item-state {
  color: color-mix(in srgb, var(--accent) 80%, var(--text));
}

.success-criteria__item--completed {
  color: var(--text-m, var(--text));
  text-decoration: line-through;
}
</style>
