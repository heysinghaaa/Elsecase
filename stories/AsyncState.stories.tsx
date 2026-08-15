import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { AsyncState } from "@/registry/async-state/async-state"

const content = (
  <article style={{ padding: 24, border: "1px solid currentColor" }}>
    <strong>Loaded content</strong>
    <p>The existing result remains visible during background refresh.</p>
  </article>
)

const meta = {
  title: "Registry/AsyncState",
  component: AsyncState,
  args: {
    children: content,
    status: "success",
  },
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof AsyncState>

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {}
export const Loading: Story = { args: { status: "loading" } }
export const Refreshing: Story = { args: { status: "refreshing" } }
export const Empty: Story = { args: { status: "empty" } }
export const ErrorState: Story = {
  args: { status: "error", onRetry: async () => undefined },
}
export const Offline: Story = {
  args: { status: "offline", onRetry: async () => undefined },
}
export const Forbidden: Story = { args: { status: "forbidden" } }
