<script setup lang="ts">
import { computed } from 'vue'

import type { Phase } from '../../types'

const props = withDefaults(
  defineProps<{
    phases?: Phase[]
  }>(),
  {
    phases: () => [],
  },
)

const totalSteps = computed(() =>
  props.phases.reduce((total, phase) => total + phase.steps.length, 0),
)

const completedSteps = computed(() =>
  props.phases.reduce(
    (total, phase) => total + phase.steps.filter((step) => step.completed).length,
    0,
  ),
)

const completionPercentage = computed(() =>
  totalSteps.value === 0 ? 0 : Math.round((completedSteps.value / totalSteps.value) * 100),
)

const progressLabel = computed(() =>
  totalSteps.value === 0
    ? 'No implementation steps available yet.'
    : `${completedSteps.value}/${totalSteps.value} steps complete (${completionPercentage.value}%)`,
)
</script>

<template>
  <section class="phase-timeline" data-testid="phase-timeline">
    <header class="phase-timeline__header">
      <h2 class="phase-timeline__title">Phase Timeline</h2>
      <p class="phase-timeline__progress" data-testid="phase-timeline-progress">{{ progressLabel }}</p>
    </header>

    <p v-if="phases.length === 0" class="phase-timeline__empty" data-testid="phase-timeline-empty">
      No phases defined.
    </p>

    <ol v-else class="phase-timeline__list" data-testid="phase-timeline-list">
      <li
        v-for="phase in phases"
        :key="`${phase.number}-${phase.name}`"
        class="phase-timeline__item"
        data-testid="phase-timeline-phase"
      >
        <article class="phase-timeline__card">
          <p class="phase-timeline__phase-label">Phase {{ phase.number }}</p>
          <h3 class="phase-timeline__phase-name">{{ phase.name || 'Untitled phase' }}</h3>
          <p class="phase-timeline__phase-summary">
            {{ phase.steps.filter((step) => step.completed).length }}/{{ phase.steps.length }} steps complete
          </p>

          <p v-if="phase.steps.length === 0" class="phase-timeline__step-empty">No steps defined.</p>

          <ul v-else class="phase-timeline__steps">
            <li
              v-for="step in phase.steps"
              :key="step.text"
              class="phase-timeline__step"
              data-testid="phase-timeline-step"
              :class="{ 'phase-timeline__step--completed': step.completed }"
            >
              <span class="phase-timeline__step-state" aria-hidden="true">{{ step.completed ? '✓' : '○' }}</span>
              <span>{{ step.text }}</span>
            </li>
          </ul>
        </article>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.phase-timeline {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--bg);
  padding: 1rem;
  display: grid;
  gap: 1rem;
}

.phase-timeline__header {
  display: grid;
  gap: 0.3rem;
}

.phase-timeline__title,
.phase-timeline__phase-name {
  margin: 0;
  color: var(--text-h);
}

.phase-timeline__title {
  font-size: 1.1rem;
}

.phase-timeline__progress,
.phase-timeline__phase-summary,
.phase-timeline__empty,
.phase-timeline__step-empty {
  margin: 0;
  color: var(--text-m, var(--text));
}

.phase-timeline__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.9rem;
}

.phase-timeline__item {
  position: relative;
  padding-left: 1rem;
}

.phase-timeline__item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.3rem;
  bottom: -0.9rem;
  width: 2px;
  background: color-mix(in srgb, var(--accent) 45%, var(--border));
}

.phase-timeline__item::after {
  content: '';
  position: absolute;
  left: -0.25rem;
  top: 0.25rem;
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 999px;
  background: var(--accent);
}

.phase-timeline__item:last-child::before {
  bottom: 0.3rem;
}

.phase-timeline__card {
  border: 1px solid color-mix(in srgb, var(--accent) 15%, var(--border));
  border-radius: 0.65rem;
  background: color-mix(in srgb, var(--accent) 4%, var(--bg));
  padding: 0.75rem;
  display: grid;
  gap: 0.55rem;
}

.phase-timeline__phase-label {
  margin: 0;
  color: var(--accent);
  font-weight: 600;
  font-size: 0.82rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.phase-timeline__steps {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.4rem;
}

.phase-timeline__step {
  display: flex;
  gap: 0.45rem;
  color: var(--text);
}

.phase-timeline__step-state {
  color: color-mix(in srgb, var(--accent) 80%, var(--text));
}

.phase-timeline__step--completed {
  color: var(--text-m, var(--text));
  text-decoration: line-through;
}

@media (min-width: 900px) {
  .phase-timeline__list {
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  }

  .phase-timeline__item {
    padding-left: 0;
    padding-top: 1rem;
  }

  .phase-timeline__item::before {
    left: 0;
    right: -0.9rem;
    top: 0;
    bottom: auto;
    width: auto;
    height: 2px;
  }

  .phase-timeline__item::after {
    left: 0.1rem;
    top: -0.25rem;
  }

  .phase-timeline__item:last-child::before {
    right: 0.3rem;
  }
}
</style>
