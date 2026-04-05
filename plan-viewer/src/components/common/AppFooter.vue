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
  gap: 0.4rem 0.85rem;
  align-items: center;
  font-size: 0.85rem;
  border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
  border-radius: 0.5rem;
  padding: 0.8rem 1rem;
  background: color-mix(in srgb, var(--surface-2) 92%, transparent);
}

.app-footer__tagline {
  color: var(--text-h);
}

.app-footer__meta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.app-footer__meta a {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid color-mix(in srgb, var(--border) 65%, transparent);
}

.app-footer__meta a:hover {
  border-bottom-color: var(--border-strong);
}

@media (max-width: 700px) {
  .app-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
