import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type RouteRecordRaw,
  type RouterHistory,
} from 'vue-router'

import { usePlansStore, useRepositoriesStore } from '../stores'
import type { PlanMetadata } from '../types'

const HomeView = () => import('../views/HomeView.vue')
const PlanDetailView = () => import('../views/PlanDetailView.vue')
const ErrorView = () => import('../views/ErrorView.vue')
const NotFoundView = () => import('../views/NotFoundView.vue')

const APP_TITLE = 'Implementation Plan Viewer'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: APP_TITLE },
  },
  {
    path: '/:repoId',
    name: 'repository',
    component: HomeView,
    meta: { title: 'Plans - :repoId' },
  },
  {
    path: '/:repoId/:planId',
    name: 'plan-detail',
    component: PlanDetailView,
    meta: { title: 'Plan :planId - :repoId' },
  },
  {
    path: '/error',
    name: 'error',
    component: ErrorView,
    meta: { title: 'Error' },
  },
  {
    path: '/404',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: 'Not Found' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

const normalizeParam = (value: unknown): string => {
  if (Array.isArray(value)) {
    return normalizeParam(value[0])
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim()
  }

  return ''
}

const normalizePlanId = (value: unknown): string => normalizeParam(value).replace(/^#/u, '').trim()

const resolveRepository = (repoId: string) => {
  const repositoriesStore = useRepositoriesStore()
  const lowered = repoId.toLowerCase()

  return (
    repositoriesStore.repoById(Number.isNaN(Number(repoId)) ? -1 : Number(repoId)) ??
    repositoriesStore.all.find((repository) => repository.id.toString() === repoId) ??
    repositoriesStore.all.find((repository) => repository.name.toLowerCase() === lowered) ??
    repositoriesStore.all.find((repository) => repository.fullName.toLowerCase() === lowered) ??
    repositoriesStore.all.find((repository) => repository.fullName.toLowerCase().endsWith(`/${lowered}`)) ??
    null
  )
}

const resolvePlan = (plans: PlanMetadata[], planId: string): PlanMetadata | null => {
  const normalizedTarget = normalizePlanId(planId)
  if (!normalizedTarget) {
    return null
  }

  const numericTarget = /^\d+$/u.test(normalizedTarget) ? Number(normalizedTarget) : null

  for (const plan of plans) {
    const record = plan as PlanMetadata & Record<string, unknown>
    const identifiers = [record.id, record.planId, record.number]

    for (const identifier of identifiers) {
      const normalized = normalizePlanId(identifier)
      if (!normalized) {
        continue
      }

      if (normalized === normalizedTarget) {
        return plan
      }

      if (numericTarget !== null && /^\d+$/u.test(normalized) && Number(normalized) === numericTarget) {
        return plan
      }
    }
  }

  return null
}

const resolveTitle = (to: RouteLocationNormalized): string => {
  const template = typeof to.meta.title === 'string' ? to.meta.title : APP_TITLE

  const resolved = template.replace(/:([a-zA-Z][\w-]*)/gu, (_match, key: string) => {
    const value = normalizeParam(to.params[key])
    return value || key
  })

  return resolved.trim() || APP_TITLE
}

const createDefaultHistory = (): RouterHistory =>
  typeof window === 'undefined'
    ? createMemoryHistory(import.meta.env.BASE_URL)
    : createWebHistory(import.meta.env.BASE_URL)

export const createAppRouter = (history: RouterHistory = createDefaultHistory()) => {
  const router = createRouter({
    history,
    routes,
  })

  router.beforeEach((to) => {
    const repoParam = normalizeParam(to.params.repoId)

    let repositoryFullName = ''

    if (repoParam) {
      const repository = resolveRepository(repoParam)

      if (!repository) {
        return { name: 'not-found' }
      }

      repositoryFullName = repository.fullName
    }

    const planParam = normalizeParam(to.params.planId)

    if (planParam && repositoryFullName) {
      const plansStore = usePlansStore()
      const plans = plansStore.byRepository[repositoryFullName] ?? []

      if (!resolvePlan(plans, planParam)) {
        return { name: 'not-found' }
      }
    }

    if (typeof document !== 'undefined') {
      document.title = resolveTitle(to)
    }

    return true
  })

  router.afterEach(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo(0, 0)
    }
  })

  return router
}

const router = createAppRouter(createDefaultHistory())

export default router
