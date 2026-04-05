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
  position: relative;
  border: 1px solid color-mix(in srgb, var(--border) 78%, transparent);
  border-left-width: 4px;
  border-radius: 1rem;
  padding: 1rem;
  background: var(--gradient-surface), color-mix(in srgb, var(--surface-1) 94%, transparent);
  display: grid;
  gap: 0.75rem;
  text-align: left;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s ease;
  overflow: hidden;
}

.plan-card::before {
  content: '';
  position: absolute;
  inset: -45% auto auto -10%;
  width: 54%;
  aspect-ratio: 1;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent) 18%, transparent), transparent 68%);
  pointer-events: none;
  transition: transform 0.25s ease, opacity 0.25s ease;
  opacity: 0.78;
}

.plan-card:hover,
.plan-card:focus-visible {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px color-mix(in srgb, var(--accent-glow) 46%, transparent);
  border-color: var(--border-strong);
}

.plan-card:hover::before,
.plan-card:focus-visible::before {
  transform: translate(10%, -4%) scale(1.08);
  opacity: 1;
}

.plan-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.plan-card--compact {
  gap: 0.5rem;
  padding: 0.75rem;
}

.plan-card__header,
.plan-card__meta,
.plan-card__progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.plan-card__number {
  margin: 0;
  color: var(--text-m, var(--text));
  font-weight: 600;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.plan-card__title {
  margin: 0;
  color: var(--text-h);
  font-size: 1.04rem;
  font-weight: 650;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.plan-card__objective {
  margin: 0;
  color: var(--text);
  font-size: 0.9rem;
  line-height: 1.52;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6em;
}

.plan-card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.plan-card__progress-track {
  flex: 1;
  min-width: 0;
  height: 0.45rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--border) 68%, transparent);
  overflow: hidden;
}

.plan-card__progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--gradient-secondary);
  box-shadow: 0 0 10px color-mix(in srgb, var(--accent) 36%, transparent);
}

.plan-card__progress-value,
.plan-card__repository,
.plan-card__date {
  font-size: 0.8rem;
  color: var(--text-m, var(--text));
}

.plan-card__meta {
  gap: 0.5rem;
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

.plan-card--plan-feature {
  border-left-color: #22c55e;
}

.plan-card--plan-enhancement {
  border-left-color: #0ea5e9;
}

.plan-card--plan-bug {
  border-left-color: #f97316;
}

.plan-card--plan-refactor {
  border-left-color: #8b5cf6;
}

.plan-card--plan-chore,
.plan-card--grey {
  border-left-color: #9ca3af;
}
</style>
