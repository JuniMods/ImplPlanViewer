<script setup lang="ts">
import { computed } from 'vue'

import type { Repository } from '../../types'
import { formatDate } from '../../utils'

const props = defineProps<{
  repository: Repository | null
}>()

const hasRepository = computed(() => props.repository !== null)

const planCount = computed(() => Math.max(0, Math.trunc(props.repository?.planCount ?? 0)))

const lastUpdated = computed(() => formatDate(props.repository?.updatedAt))
</script>

<template>
  <section class="repository-stats" data-testid="repository-stats">
    <template v-if="hasRepository && repository">
      <dl class="repository-stats__items">
        <div class="repository-stats__item">
          <dt>Plans</dt>
          <dd>{{ planCount }}</dd>
        </div>
        <div class="repository-stats__item">
          <dt>Last updated</dt>
          <dd>{{ lastUpdated || 'Unknown' }}</dd>
        </div>
      </dl>
    </template>

    <p v-else class="repository-stats__empty">No repository selected.</p>
  </section>
</template>

<style scoped>
.repository-stats {
  border: 1px solid color-mix(in srgb, var(--border) 76%, transparent);
  border-radius: 0.72rem;
  padding: 0.38rem 0.62rem;
  min-height: 2.15rem;
  display: inline-flex;
  align-items: center;
  background: color-mix(in srgb, var(--surface-1) 88%, transparent);
}

.repository-stats__items {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
}

.repository-stats__item {
  display: inline-flex;
  align-items: baseline;
  gap: 0.3rem;
}

.repository-stats__item dt {
  font-size: 0.75rem;
  color: var(--text-m);
}

.repository-stats__item dd {
  margin: 0;
  font-size: 0.82rem;
  color: var(--text-h);
  font-weight: 600;
}

.repository-stats__empty {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-m);
}
</style>
