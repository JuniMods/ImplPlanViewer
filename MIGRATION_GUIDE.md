# Design System Migration Guide

Quick reference for migrating components to the new design system.

---

## 🎨 Design Tokens Reference

### Colors

**Old Variables** → **New Tokens**

```css
/* Primary/Accent Colors */
--accent → --color-primary
--focus-ring → --color-primary

/* Text Colors */
--text → --color-text-primary
--text-h → --color-text-primary
--text-m → --color-text-secondary

/* Background Colors */
--bg → --color-bg-primary
--surface → --color-white
--code-bg → --color-gray-100

/* Border Colors */
--border → --color-gray-200
--border-strong → --color-gray-300 (or --color-gray-400)
```

### Typography

```css
/* Font Families */
--font-family-base → --font-primary
--font-family-mono → --font-mono

/* Font Sizes */
font-size: 0.75rem → font-size: var(--text-caption)      /* 12px */
font-size: 0.85rem → font-size: var(--text-body-small)   /* 13px */
font-size: 0.9rem  → font-size: var(--text-body)         /* 14px */
font-size: 1rem    → font-size: var(--text-body-large)   /* 16px */
font-size: 1.1rem  → font-size: var(--text-h3)           /* 16px */
font-size: 1.25rem → font-size: var(--text-h2)           /* 20px */
font-size: 1.5rem  → font-size: var(--text-h1)           /* 24px */
font-size: 2rem    → font-size: var(--text-display)      /* 32px */

/* Font Weights */
font-weight: 400 → font-weight: var(--font-weight-regular)
font-weight: 500 → font-weight: var(--font-weight-medium)
font-weight: 600 → font-weight: var(--font-weight-semibold)
font-weight: 700 → font-weight: var(--font-weight-bold)
```

### Spacing

```css
/* Old (rem/px) → New (tokens) */
0.25rem / 4px   → var(--space-1)
0.5rem  / 8px   → var(--space-2)
0.75rem / 12px  → var(--space-3)
1rem    / 16px  → var(--space-4)
1.25rem / 20px  → var(--space-5)
1.5rem  / 24px  → var(--space-6)
2rem    / 32px  → var(--space-8)
2.5rem  / 40px  → var(--space-10)
3rem    / 48px  → var(--space-12)
4rem    / 64px  → var(--space-16)
```

### Border Radius

```css
border-radius: 0.2rem / 4px  → var(--radius-sm)
border-radius: 0.35rem / 6px → var(--radius-default)
border-radius: 0.5rem / 8px  → var(--radius-md)
border-radius: 0.75rem / 12px → var(--radius-lg)
border-radius: 9999px → var(--radius-full)
```

### Shadows

```css
box-shadow: /* custom */ → var(--shadow-sm)
--shadow-sm → var(--shadow-sm)
--shadow-md → var(--shadow-md)
--shadow-lg → var(--shadow-lg)
```

### Transitions

```css
/* Old */
transition: all 0.2s ease;

/* New */
transition: 
  property calc(var(--transition-normal) * 1ms) var(--ease-out);

/* Available durations */
--transition-fast      /* 100ms */
--transition-normal    /* 150ms */
--transition-moderate  /* 200ms */
--transition-slow      /* 300ms */

/* Easing functions */
--ease-out      /* cubic-bezier(0, 0, 0.2, 1) */
--ease-in       /* cubic-bezier(0.4, 0, 1, 1) */
--ease-in-out   /* cubic-bezier(0.4, 0, 0.2, 1) */
```

---

## 🔧 Common Migration Patterns

### 1. Button Styling

**Before:**
```vue
<style scoped>
.my-button {
  border: 1px solid var(--border);
  border-radius: 0.35rem;
  padding: 0.35rem 0.9rem;
  background: var(--accent);
  color: white;
  font-size: 0.85rem;
}
</style>
```

**After (using BaseButton):**
```vue
<script setup lang="ts">
import { BaseButton } from '@/components/ui'
</script>

<template>
  <BaseButton variant="primary" size="default">
    Click me
  </BaseButton>
</template>
```

**After (custom styling):**
```vue
<style scoped>
.my-button {
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-default);
  padding: var(--space-2) var(--space-4);
  background: var(--color-primary);
  color: var(--color-white);
  font-size: var(--text-body-small);
  font-weight: var(--font-weight-medium);
  transition: 
    background-color calc(var(--transition-fast) * 1ms) var(--ease-out);
}

.my-button:hover {
  background: var(--color-primary-hover);
}
</style>
```

### 2. Card Styling

**Before:**
```vue
<style scoped>
.card {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1.1rem;
  background: var(--surface);
  box-shadow: var(--shadow-md);
}
</style>
```

**After (using BaseCard):**
```vue
<script setup lang="ts">
import { BaseCard } from '@/components/ui'
</script>

<template>
  <BaseCard variant="standard" padding="default">
    <slot />
  </BaseCard>
</template>
```

**After (custom styling):**
```vue
<style scoped>
.card {
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  padding: var(--card-padding-default);
  background: var(--color-white);
  box-shadow: var(--shadow-sm);
}
</style>
```

### 3. Input Styling

**Before:**
```vue
<style scoped>
.input {
  border: 1px solid var(--border);
  border-radius: 0.35rem;
  padding: 0.52rem 0.75rem;
  background: var(--bg);
}

.input:focus {
  outline: 2px solid var(--focus-ring);
}
</style>
```

**After:**
```vue
<style scoped>
.input {
  height: 36px;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-default);
  padding: var(--space-2) var(--space-3);
  background: var(--color-white);
  font-size: var(--text-body);
  transition: 
    border-color calc(var(--transition-fast) * 1ms) var(--ease-out),
    box-shadow calc(var(--transition-fast) * 1ms) var(--ease-out);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
</style>
```

### 4. Typography

**Before:**
```vue
<style scoped>
.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-h);
  line-height: 1.3;
}

.description {
  font-size: 0.9rem;
  color: var(--text);
  line-height: 1.5;
}
</style>
```

**After:**
```vue
<style scoped>
.title {
  font-size: var(--text-h2);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-h2);
  color: var(--color-text-primary);
}

.description {
  font-size: var(--text-body);
  line-height: var(--line-height-body);
  color: var(--color-text-secondary);
}
</style>
```

### 5. Layout Spacing

**Before:**
```vue
<style scoped>
.container {
  padding: 1.25rem;
  gap: 0.95rem;
  margin-bottom: 1.5rem;
}
</style>
```

**After:**
```vue
<style scoped>
.container {
  padding: var(--space-5);  /* 20px */
  gap: var(--space-4);      /* 16px */
  margin-bottom: var(--space-6);  /* 24px */
}
</style>
```

---

## ✅ Migration Checklist

For each component:

- [ ] Replace color variables with design tokens
- [ ] Replace font-size values with typography tokens
- [ ] Replace spacing (padding, margin, gap) with space tokens
- [ ] Replace border-radius with radius tokens
- [ ] Replace transitions with token-based transitions
- [ ] Replace font-family with --font-primary or --font-mono
- [ ] Add focus-visible states with Primary color ring
- [ ] Use semantic colors (Success, Warning, Error) where applicable
- [ ] Ensure hover states use proper color tokens
- [ ] Add reduced-motion support for animations
- [ ] Test in both light and dark mode (if applicable)

---

## 🎯 Quick Wins

### Replace These Immediately:

1. **Colors:**
   - `#7c3aed`, `#aa3bff`, `purple` → `var(--color-primary)`
   - `#fff`, `white` → `var(--color-white)`
   - Hard-coded grays → `var(--color-gray-XXX)`

2. **Spacing:**
   - `0.5rem`, `8px` → `var(--space-2)`
   - `1rem`, `16px` → `var(--space-4)`
   - `1.5rem`, `24px` → `var(--space-6)`

3. **Border Radius:**
   - `4px` → `var(--radius-sm)`
   - `6px` → `var(--radius-default)`
   - `8px` → `var(--radius-md)`

4. **Font Sizes:**
   - `12px` → `var(--text-caption)`
   - `14px` → `var(--text-body)`
   - `16px` → `var(--text-h3)` or `var(--text-body-large)`

---

## 📚 Resources

- **Design System:** `DESIGN.md`
- **Design Tokens:** `src/assets/styles/design-tokens.css`
- **Base Components:** `src/components/ui/`
- **Implementation Plan:** `REWORK_UI.md`
- **Summary:** `UI_IMPLEMENTATION_SUMMARY.md`

---

**Questions?** Check the design-tokens.css file for the complete list of available tokens!
