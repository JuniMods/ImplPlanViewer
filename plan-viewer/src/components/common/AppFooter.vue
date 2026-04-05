<script setup lang="ts">
const GITHUB_REPO_URL = 'https://github.com/JuniMods/ImplPlanViewer'
const GITHUB_ORG_URL = 'https://github.com/JuniMods'
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="app-footer" data-testid="app-footer">
    <small class="app-footer__tagline">Built for AI-assisted development workflows</small>

    <div class="app-footer__meta">
      <span>© {{ currentYear }} JuniMods</span>
      <span aria-hidden="true">•</span>
      <a :href="GITHUB_REPO_URL" target="_blank" rel="noreferrer noopener">Repository</a>
      <span aria-hidden="true">•</span>
      <a :href="GITHUB_ORG_URL" target="_blank" rel="noreferrer noopener">JuniMods</a>
    </div>
  </div>
</template>

<style scoped>
.app-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-2) var(--space-3);
  align-items: center;
  font-size: var(--text-body-small);
  line-height: var(--line-height-body-small);
  padding: var(--space-4) var(--space-6);
  background: var(--color-white);
  border-top: 1px solid var(--color-gray-200);
}

.app-footer__tagline {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-regular);
}

.app-footer__meta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-gray-600);
}

.app-footer__meta a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color calc(var(--transition-fast) * 1ms) var(--ease-out);
}

.app-footer__meta a:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

@media (max-width: 700px) {
  .app-footer {
    flex-direction: column;
    align-items: flex-start;
    padding: var(--space-3) var(--space-4);
  }
}
</style>
