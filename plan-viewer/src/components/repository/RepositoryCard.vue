<script setup lang="ts">
import { computed } from 'vue'

import type { Repository } from '../../types'
import { formatDate } from '../../utils'

const props = withDefaults(
  defineProps<{
    repository: Repository | null
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)

const hasRepository = computed(() => props.repository !== null)

const repositoryDescription = computed(() => {
  const description = props.repository?.description?.trim()
  return description?.length ? description : 'No description provided.'
})

const repositoryTopics = computed(() => props.repository?.topics.filter((topic) => topic.trim().length > 0) ?? [])

const updatedAt = computed(() => formatDate(props.repository?.updatedAt))

const visibilityLabel = computed(() => (props.repository?.private ? 'Private' : 'Public'))
</script>

<template>
  <article class="repository-card" :class="{ 'repository-card--compact': compact }" data-testid="repository-card">
    <template v-if="hasRepository && repository">
      <header class="repository-card__header">
        <h2 class="repository-card__name">{{ repository.name }}</h2>
        <span class="repository-card__badge">{{ visibilityLabel }}</span>
      </header>

      <p class="repository-card__full-name">{{ repository.fullName }}</p>
      <p class="repository-card__description">{{ repositoryDescription }}</p>

      <dl class="repository-card__meta">
        <div>
          <dt>Plans</dt>
          <dd>{{ repository.planCount }}</dd>
        </div>
        <div>
          <dt>Default branch</dt>
          <dd>{{ repository.defaultBranch }}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{{ updatedAt || 'Unknown' }}</dd>
        </div>
      </dl>

      <ul class="repository-card__states">
        <li v-if="repository.archived">Archived</li>
        <li v-if="repository.disabled">Disabled</li>
      </ul>

      <p v-if="repositoryTopics.length === 0" class="repository-card__topics-empty">No topics</p>
      <ul v-else class="repository-card__topics" aria-label="Repository topics">
        <li v-for="topic in repositoryTopics" :key="topic">{{ topic }}</li>
      </ul>

      <a :href="repository.htmlUrl" target="_blank" rel="noreferrer noopener" class="repository-card__link">
        Open repository
      </a>
    </template>

    <p v-else class="repository-card__empty">Select a repository to view details.</p>
  </article>
</template>

<style scoped>
.repository-card {
  border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
  border-radius: 1rem;
  padding: 1rem;
  background: var(--gradient-surface), color-mix(in srgb, var(--surface-2) 94%, transparent);
  display: grid;
  gap: 0.75rem;
  box-shadow: var(--shadow-sm);
}

.repository-card--compact {
  gap: 0.5rem;
  padding: 0.75rem;
}

.repository-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.repository-card__name {
  margin: 0;
  font-size: 1.05rem;
  color: var(--text-h);
}

.repository-card__badge {
  border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
  border-radius: 999px;
  padding: 0.12rem 0.52rem;
  font-size: 0.75rem;
  color: var(--text-h);
  background: color-mix(in srgb, var(--accent) 14%, transparent);
}

.repository-card__full-name,
.repository-card__description,
.repository-card__topics-empty,
.repository-card__empty {
  margin: 0;
  color: var(--text-m);
}

.repository-card__description {
  color: var(--text-h);
}

.repository-card__meta {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}

.repository-card__meta dt {
  font-size: 0.75rem;
  color: var(--text-m);
}

.repository-card__meta dd {
  margin: 0.1rem 0 0;
  color: var(--text-h);
  font-weight: 600;
}

.repository-card__states,
.repository-card__topics {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.repository-card__states li,
.repository-card__topics li {
  border: 1px solid color-mix(in srgb, var(--border) 78%, transparent);
  border-radius: 999px;
  padding: 0.18rem 0.52rem;
  font-size: 0.75rem;
  color: var(--text-m);
  background: color-mix(in srgb, var(--surface-1) 90%, transparent);
}

.repository-card__link {
  justify-self: start;
  color: var(--text-h);
  font-weight: 600;
  text-decoration: none;
  border: 1px solid color-mix(in srgb, var(--border) 76%, transparent);
  border-radius: 999px;
  padding: 0.3rem 0.62rem;
  background: color-mix(in srgb, var(--surface-1) 90%, transparent);
}

.repository-card__link:hover {
  border-color: var(--border-strong);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 10%, transparent);
}

@media (max-width: 520px) {
  .repository-card__meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
