<script setup lang="ts">
import { computed } from 'vue'

import type { PlanMetadata } from '../../types'
import { formatDate, getTypeBadgeStyle, truncateText } from '../../utils'
import PlanBadge from './PlanBadge.vue'

const props = withDefaults(
  defineProps<{
    plan: PlanMetadata
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)

const emit = defineEmits<{
  click: []
}>()

const planRecord = computed<Record<string, unknown>>(
  () => props.plan as unknown as Record<string, unknown>,
)

const getStringField = (keys: string[]): string => {
  for (const key of keys) {
    const value = planRecord.value[key]
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

const getNumberField = (keys: string[]): number | null => {
  for (const key of keys) {
    const value = planRecord.value[key]

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }

    if (typeof value === 'string') {
      const normalized = value.trim().replace('%', '')
      if (normalized.length === 0) {
        continue
      }

      const parsed = Number(normalized)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }

  return null
}

const numberText = computed(() => {
  const raw = getStringField(['number', 'planNumber', 'id'])
  if (!raw) {
    return '#---'
  }

  if (/^\d+$/u.test(raw)) {
    return `#${raw.padStart(3, '0')}`
  }

  return raw.startsWith('#') ? raw : `#${raw}`
})

const title = computed(() => {
  const raw = getStringField(['title', 'name'])
  if (!raw) {
    return 'Untitled plan'
  }

  return truncateText(raw, { maxChars: props.compact ? 64 : 88 })
})

const objective = computed(() => {
  const raw = getStringField(['objective', 'summary', 'excerpt', 'description'])
  if (!raw) {
    return 'No objective summary available.'
  }

  return truncateText(raw, { maxChars: props.compact ? 90 : 130, maxLines: 2 })
})

const repositoryName = computed(() => getStringField(['repositoryName', 'repository', 'repo']) || 'Unknown repository')

const dateLabel = computed(() => {
  const raw = getStringField(['updatedAt', 'date', 'createdAt'])
  return formatDate(raw) || 'Unknown date'
})

const completion = computed(() => {
  const raw = getNumberField(['completion', 'progress', 'completionPercent'])
  const value = raw ?? 0
  return Math.max(0, Math.min(100, Math.round(value)))
})

const typeColorClass = computed(() => `plan-card--${getTypeBadgeStyle(props.plan.type).color}`)

const onClick = () => emit('click')

const onKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return
  }

  event.preventDefault()
  onClick()
}
</script>

<template>
  <article
    class="plan-card"
    :class="[typeColorClass, { 'plan-card--compact': compact }]"
    data-testid="plan-card"
    role="button"
    tabindex="0"
    @click="onClick"
    @keydown="onKeydown"
  >
    <header class="plan-card__header">
      <p class="plan-card__number">{{ numberText }}</p>
      <PlanBadge kind="type" :value="plan.type" />
    </header>

    <h3 class="plan-card__title">{{ title }}</h3>
    <p class="plan-card__objective">{{ objective }}</p>

    <div class="plan-card__badges">
      <PlanBadge kind="scope" :value="plan.scope" />
      <PlanBadge kind="priority" :value="plan.priority" />
    </div>

    <div class="plan-card__progress" aria-label="Completion progress">
      <div class="plan-card__progress-track">
        <div class="plan-card__progress-fill" :style="{ width: `${completion}%` }" />
      </div>
      <span class="plan-card__progress-value">{{ completion }}%</span>
    </div>

    <footer class="plan-card__meta">
      <span class="plan-card__repository">{{ repositoryName }}</span>
      <span class="plan-card__date">{{ dateLabel }}</span>
    </footer>
  </article>
</template>

<style scoped>
.plan-card {
  border: 1px solid var(--color-gray-200);
  border-left-width: 4px;
  border-radius: var(--radius-md);
  padding: var(--card-padding-default);
  background: var(--color-white);
  display: grid;
  gap: var(--space-3);
  text-align: left;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition:
    box-shadow calc(var(--transition-normal) * 1ms) var(--ease-out),
    border-color calc(var(--transition-normal) * 1ms) var(--ease-out),
    transform calc(var(--transition-normal) * 1ms) var(--ease-out);
}

.plan-card:hover,
.plan-card:focus-visible {
  box-shadow: var(--shadow-md);
  border-color: var(--color-gray-300);
  transform: translateY(-2px);
}

.plan-card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.plan-card--compact {
  gap: var(--space-2);
  padding: var(--card-padding-compact);
}

.plan-card__header,
.plan-card__meta,
.plan-card__progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.plan-card__number {
  margin: 0;
  color: var(--color-gray-500);
  font-weight: var(--font-weight-semibold);
  font-size: var(--text-caption);
  letter-spacing: var(--letter-spacing-wider);
  text-transform: uppercase;
}

.plan-card__title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--text-h3);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-h3);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.plan-card__objective {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--text-body-small);
  line-height: var(--line-height-body-small);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(var(--line-height-body-small) * 2);
}

.plan-card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.plan-card__progress-track {
  flex: 1;
  min-width: 0;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-gray-200);
  overflow: hidden;
}

.plan-card__progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--color-primary);
  transition: width calc(var(--transition-moderate) * 1ms) var(--ease-out);
}

.plan-card__progress-value {
  font-size: var(--text-caption);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
  min-width: 40px;
  text-align: right;
}

.plan-card__repository,
.plan-card__date {
  font-size: var(--text-caption);
  color: var(--color-gray-500);
}

.plan-card__meta {
  gap: var(--space-2);
}

.plan-card__repository,
.plan-card__date {
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plan-card__repository {
  max-width: 65%;
}

.plan-card__date {
  flex-shrink: 0;
}

/* Type color indicators */
.plan-card--plan-feature {
  border-left-color: var(--color-success);
}

.plan-card--plan-enhancement {
  border-left-color: var(--color-primary);
}

.plan-card--plan-bug {
  border-left-color: var(--color-error);
}

.plan-card--plan-refactor {
  border-left-color: var(--color-warning);
}

.plan-card--plan-chore,
.plan-card--grey {
  border-left-color: var(--color-gray-400);
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .plan-card {
    transition: none;
  }

  .plan-card:hover {
    transform: none;
  }

  .plan-card__progress-fill {
    transition: none;
  }
}
</style>
