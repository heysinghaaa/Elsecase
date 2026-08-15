import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { StateWorkbench } from "@/components/site/state-workbench"

const meta = {
  title: "Foundation/State workbench",
  component: StateWorkbench,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "min(760px, calc(100vw - 32px))" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StateWorkbench>

export default meta
type Story = StoryObj<typeof meta>

export const ErrorScenario: Story = {}
