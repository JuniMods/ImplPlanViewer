<script setup lang="ts">
import { computed } from 'vue'

import { getPriorityBadgeStyle, getTypeBadgeStyle, type BadgeStyle } from '../../utils/formatters/badge'

type PlanBadgeKind = 'type' | 'priority' | 'scope'

interface PlanBadgeProps {
  kind: PlanBadgeKind
  value?: string | null
}

const props = defineProps<PlanBadgeProps>()

const normalizedValue = computed(() => props.value?.trim() ?? '')

const scopeBadgeStyle = computed<BadgeStyle>(() => ({
  label: normalizedValue.value || 'Unknown Scope',
  color: 'plan-scope',
  variant: 'outlined',
}))

const badgeStyle = computed<BadgeStyle>(() => {
  if (props.kind === 'type') {
    return getTypeBadgeStyle(normalizedValue.value)
  }

  if (props.kind === 'priority') {
    return getPriorityBadgeStyle(normalizedValue.value)
  }

  return scopeBadgeStyle.value
})
</script>

<template>
  <span
    class="plan-badge"
    :class="[
      `plan-badge--${badgeStyle.variant}`,
      `plan-badge--${badgeStyle.color}`,
      `plan-badge--${kind}`,
    ]"
    data-testid="plan-badge"
  >
    {{ badgeStyle.label }}
  </span>
</template>

<style scoped>
.plan-badge {
  display: inline-flex;
  align-items: center;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  padding: 0 var(--space-2);
  height: 22px;
  font-size: var(--text-overline);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
}

.plan-badge--tonal {
  border-color: transparent;
}

.plan-badge--outlined {
  background: transparent;
}

/* Type badges */
.plan-badge--plan-feature {
  color: var(--color-success);
  background: var(--color-success-light);
}

.plan-badge--plan-enhancement {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.plan-badge--plan-bug {
  color: var(--color-error);
  background: var(--color-error-light);
}

.plan-badge--plan-refactor {
  color: var(--color-warning);
  background: var(--color-warning-light);
}

.plan-badge--plan-chore {
  color: var(--color-gray-700);
  background: var(--color-gray-100);
}

/* Priority badges */
.plan-badge--priority-critical {
  color: var(--color-error);
  background: var(--color-error-light);
}

.plan-badge--priority-high {
  color: var(--color-warning);
  background: var(--color-warning-light);
}

.plan-badge--priority-medium {
  color: var(--color-info);
  background: var(--color-info-light);
}

.plan-badge--priority-low {
  color: var(--color-success);
  background: var(--color-success-light);
}

/* Scope badge */
.plan-badge--plan-scope {
  color: var(--color-primary);
  border-color: var(--color-primary-light);
  background: var(--color-primary-light);
}

/* Grey/Unknown */
.plan-badge--grey {
  color: var(--color-gray-600);
  border-color: var(--color-gray-200);
  background: var(--color-gray-100);
}
</style>
