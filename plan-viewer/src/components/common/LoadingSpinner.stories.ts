import type { Meta, StoryObj } from '@storybook/vue3-vite'

import LoadingSpinner from './LoadingSpinner.vue'

const meta = {
  title: 'Common/LoadingSpinner',
  component: LoadingSpinner,
  tags: ['autodocs'],
  args: {
    label: 'Loading…',
    showLabel: true,
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['spinner', 'skeleton'],
    },
    skeletonLines: {
      control: { type: 'number', min: 1, max: 8, step: 1 },
    },
  },
} satisfies Meta<typeof LoadingSpinner>

export default meta
type Story = StoryObj<typeof meta>

export const Spinner: Story = {
  args: {
    variant: 'spinner',
  },
}

export const Skeleton: Story = {
  args: {
    variant: 'skeleton',
    skeletonLines: 4,
  },
}
