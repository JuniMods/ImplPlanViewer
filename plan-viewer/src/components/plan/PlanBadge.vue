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
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: 0.02em;
}

.plan-badge--tonal {
  border-color: transparent;
}

.plan-badge--outlined {
  background: transparent;
}

.plan-badge--plan-feature {
  color: #05603a;
  background: #d9fbe8;
}

.plan-badge--plan-enhancement {
  color: #075985;
  background: #d9f0ff;
}

.plan-badge--plan-bug {
  color: #9a3412;
  background: #ffe4d6;
}

.plan-badge--plan-refactor {
  color: #6d28d9;
  background: #ede2ff;
}

.plan-badge--plan-chore {
  color: #374151;
  background: #e5e7eb;
}

.plan-badge--priority-critical {
  color: #991b1b;
  background: #fee2e2;
}

.plan-badge--priority-high {
  color: #9a3412;
  background: #ffedd5;
}

.plan-badge--priority-medium {
  color: #92400e;
  background: #fef3c7;
}

.plan-badge--priority-low {
  color: #166534;
  background: #dcfce7;
}

.plan-badge--plan-scope {
  color: #1d4ed8;
  border-color: #bfdbfe;
  background: rgba(191, 219, 254, 0.22);
}

.plan-badge--grey {
  color: #4b5563;
  border-color: #d1d5db;
  background: rgba(209, 213, 219, 0.25);
}
</style>
