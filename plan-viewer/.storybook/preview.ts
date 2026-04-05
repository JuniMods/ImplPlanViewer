import type { Preview } from '@storybook/vue3-vite'

import '../src/assets/styles/variables.css'
import '../src/assets/styles/global.css'
import '../src/assets/styles/responsive.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/iu,
        date: /Date$/u,
      },
    },
  },
}

export default preview
