import type { Meta, StoryObj } from '@storybook/vue3-vite'

import PlanBadge from './PlanBadge.vue'

const meta = {
  title: 'Plan/PlanBadge',
  component: PlanBadge,
  tags: ['autodocs'],
  args: {
    kind: 'type',
    value: 'feature',
  },
  argTypes: {
    kind: {
      control: 'inline-radio',
      options: ['type', 'priority', 'scope'],
    },
  },
} satisfies Meta<typeof PlanBadge>

export default meta
type Story = StoryObj<typeof meta>

export const TypeBadge: Story = {
  args: {
    kind: 'type',
    value: 'enhancement',
  },
}

export const PriorityBadge: Story = {
  args: {
    kind: 'priority',
    value: 'high',
  },
}

export const ScopeBadge: Story = {
  args: {
    kind: 'scope',
    value: 'frontend',
  },
}
