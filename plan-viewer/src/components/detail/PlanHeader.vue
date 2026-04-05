<script setup lang="ts">
import { computed, ref } from 'vue'

import type { PlanMetadata, Repository } from '../../types'
import PlanBadge from '../plan/PlanBadge.vue'

const props = defineProps<{
  plan: PlanMetadata
  repository: Repository
}>()

const planRecord = computed<Record<string, unknown>>(() => props.plan as unknown as Record<string, unknown>)

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

const planNumber = computed(() => {
  const raw = getStringField(['number', 'planNumber', 'id'])

  if (!raw) {
    return '#---'
  }

  if (/^\d+$/u.test(raw)) {
    return `#${raw.padStart(3, '0')}`
  }

  return raw.startsWith('#') ? raw : `#${raw}`
})

const planTitle = computed(() => getStringField(['title', 'name']) || 'Untitled plan')

const scopeValues = computed(() => {
  const tokens = props.plan.scope
    .split(/[,;|]/u)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)

  return tokens.length > 0 ? [...new Set(tokens)] : ['Unknown Scope']
})

const sourcePath = computed(() => getStringField(['path', 'sourcePath', 'filePath']))

const sourceUrl = computed(() => {
  const direct = getStringField(['sourceUrl', 'sourceFileUrl', 'fileUrl', 'githubUrl', 'url', 'htmlUrl'])
  if (direct) {
    return direct
  }

  if (sourcePath.value) {
    return `${props.repository.htmlUrl}/blob/${props.repository.defaultBranch}/${sourcePath.value}`
  }

  return props.repository.htmlUrl
})

const sourceLabel = computed(() => (sourcePath.value ? 'GitHub file' : 'Repository'))

const copyState = ref<'idle' | 'copied' | 'failed'>('idle')

const copyLink = async (): Promise<void> => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.clipboard) {
    copyState.value = 'failed'
    return
  }

  try {
    await navigator.clipboard.writeText(window.location.href)
    copyState.value = 'copied'
  } catch {
    copyState.value = 'failed'
  }
}
</script>

<template>
  <header class="plan-header" data-testid="plan-header">
    <div class="plan-header__top-row">
      <a class="plan-header__back-link" href="/" data-testid="plan-header-back">← Back to Index</a>

      <div class="plan-header__actions">
        <button type="button" class="plan-header__copy-button" data-testid="plan-header-copy" @click="copyLink">
          Copy Link
        </button>
        <a
          :href="sourceUrl"
          class="plan-header__source-link"
          target="_blank"
          rel="noreferrer noopener"
          data-testid="plan-header-source"
        >
          {{ sourceLabel }}
        </a>
      </div>
    </div>

    <nav class="plan-header__breadcrumb" aria-label="Plan breadcrumb">
      <a
        :href="repository.htmlUrl"
        class="plan-header__repo-badge"
        target="_blank"
        rel="noreferrer noopener"
        data-testid="plan-header-repository"
      >
        {{ repository.fullName }}
      </a>
      <span class="plan-header__breadcrumb-separator">›</span>
      <span>{{ planNumber }}</span>
    </nav>

    <h1 class="plan-header__title">Implementation Plan: {{ planTitle }}</h1>

    <div class="plan-header__badges">
      <PlanBadge kind="type" :value="plan.type" />
      <PlanBadge kind="priority" :value="plan.priority" />
      <PlanBadge v-for="scope in scopeValues" :key="scope" kind="scope" :value="scope" />
    </div>

    <p class="plan-header__copy-status" aria-live="polite">
      {{ copyState === 'copied' ? 'Link copied.' : copyState === 'failed' ? 'Unable to copy link.' : '' }}
    </p>
  </header>
</template>

<style scoped>
.plan-header {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--bg);
  padding: 1rem;
  display: grid;
  gap: 0.85rem;
}

.plan-header__top-row,
.plan-header__actions,
.plan-header__breadcrumb,
.plan-header__badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.plan-header__top-row {
  justify-content: space-between;
  flex-wrap: wrap;
}

.plan-header__back-link,
.plan-header__source-link,
.plan-header__repo-badge {
  color: var(--text-h);
  text-decoration: none;
  font-size: 0.9rem;
}

.plan-header__copy-button {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--bg);
  color: var(--text-h);
  padding: 0.35rem 0.6rem;
  cursor: pointer;
}

.plan-header__repo-badge {
  border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--border));
  border-radius: 0.3rem;
  padding: 0.2rem 0.65rem;
  font-weight: 600;
}

.plan-header__title {
  margin: 0;
  color: var(--text-h);
  font-size: 1.25rem;
}

.plan-header__badges {
  flex-wrap: wrap;
}

.plan-header__copy-status {
  margin: 0;
  min-height: 1.1em;
  color: var(--text-m, var(--text));
  font-size: 0.82rem;
}
</style>
