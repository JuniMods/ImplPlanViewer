<template>
  <section class="not-found-view" data-testid="not-found-view">
    <h1 class="not-found-view__title">404 — Page not found</h1>
    <p class="not-found-view__copy">The page you requested does not exist.</p>
    <a href="/" class="not-found-view__link" data-testid="not-found-home-link">← Back to plans</a>
  </section>
</template>

<style scoped>
.not-found-view {
  padding: 1rem;
  display: grid;
  gap: 0.55rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
}

.not-found-view__title {
  margin: 0;
  font-size: 1.3rem;
}

.not-found-view__copy {
  margin: 0;
  color: var(--text-m, var(--text));
}

.not-found-view__link {
  color: var(--accent);
  text-decoration: none;
}
</style>
