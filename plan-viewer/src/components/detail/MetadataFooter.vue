<script setup lang="ts">
import { computed } from 'vue'

import type { PlanMetadata, Repository } from '../../types'
import { formatDate } from '../../utils'

const props = withDefaults(
  defineProps<{
    plan: PlanMetadata
    repository: Repository
    generatedAt?: string
  }>(),
  {
    generatedAt: '',
  },
)

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
  }

  return ''
}

const sourcePath = computed(() => getStringField(['path', 'sourcePath', 'filePath']))

const sourceUrl = computed(() => {
  const direct = getStringField([
    'sourceUrl',
    'sourceFileUrl',
    'fileUrl',
    'githubUrl',
    'url',
    'htmlUrl',
    'rawUrl',
  ])

  if (direct) {
    return direct
  }

  if (sourcePath.value) {
    return `${props.repository.htmlUrl}/blob/${props.repository.defaultBranch}/${sourcePath.value}`
  }

  return props.repository.htmlUrl
})

const createdDate = computed(() =>
  formatDate(getStringField(['createdAt', 'created', 'firstCommitAt'])) || 'Unknown',
)

const updatedDate = computed(() => {
  const explicit = formatDate(getStringField(['updatedAt', 'lastUpdatedAt', 'date']))
  return explicit || formatDate(props.repository.updatedAt) || 'Unknown'
})

const generatedDate = computed(() =>
  formatDate(props.generatedAt || getStringField(['generatedAt', 'manifestGeneratedAt'])) || 'Unknown',
)
</script>

<template>
  <footer class="metadata-footer" data-testid="metadata-footer">
    <h2 class="metadata-footer__title">Metadata</h2>

    <dl class="metadata-footer__list">
      <div class="metadata-footer__row">
        <dt>Source URL</dt>
        <dd>
          <a
            :href="sourceUrl"
            target="_blank"
            rel="noreferrer noopener"
            data-testid="metadata-footer-source-url"
          >
            {{ sourceUrl }}
          </a>
        </dd>
      </div>

      <div class="metadata-footer__row">
        <dt>Created</dt>
        <dd data-testid="metadata-footer-created">{{ createdDate }}</dd>
      </div>

      <div class="metadata-footer__row">
        <dt>Updated</dt>
        <dd data-testid="metadata-footer-updated">{{ updatedDate }}</dd>
      </div>

      <div class="metadata-footer__row">
        <dt>Generated</dt>
        <dd data-testid="metadata-footer-generated">{{ generatedDate }}</dd>
      </div>
    </dl>
  </footer>
</template>

<style scoped>
.metadata-footer {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--bg);
  padding: 1rem;
  display: grid;
  gap: 0.85rem;
}

.metadata-footer__title {
  margin: 0;
  color: var(--text-h);
  font-size: 1.1rem;
}

.metadata-footer__list {
  margin: 0;
  display: grid;
  gap: 0.55rem;
}

.metadata-footer__row {
  display: grid;
  grid-template-columns: minmax(5.5rem, auto) 1fr;
  gap: 0.5rem;
  align-items: baseline;
}

.metadata-footer__row dt {
  color: var(--text-m, var(--text));
  font-weight: 600;
}

.metadata-footer__row dd {
  margin: 0;
  color: var(--text);
  min-width: 0;
  overflow-wrap: anywhere;
}

.metadata-footer__row a {
  color: var(--accent);
}
</style>
