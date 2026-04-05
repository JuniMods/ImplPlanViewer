import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

export { usePlansStore } from './plans'
export { useRepositoriesStore } from './repositories'
export { useFiltersStore } from './filters'

export { useThemeStore } from './theme'
