import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import {
  ResponsiveDataExplorer,
  createDataExplorerColumnHelper,
} from "@/registry/data-explorer/data-explorer"
import type { AsyncStatus } from "@/registry/async-state/async-state"

type User = {
  id: string
  name: string
  role: string
  status: string
}

const data: User[] = [
  { id: "1", name: "Ada Lovelace", role: "Admin", status: "Active" },
  { id: "2", name: "Grace Hopper", role: "Member", status: "Invited" },
  { id: "3", name: "Margaret Hamilton", role: "Member", status: "Active" },
]
const helper = createDataExplorerColumnHelper<User>()
const columns = helper.columns([
  helper.accessor("name", { header: "Name" }),
  helper.accessor("role", { header: "Role" }),
  helper.accessor("status", { header: "Status" }),
])

function Example({ status = "success" }: { status?: AsyncStatus }) {
  return (
    <ResponsiveDataExplorer
      bulkActions={<button type="button">Mark active</button>}
      columns={columns}
      data={data}
      filters={[
        {
          id: "role",
          label: "Role",
          getValue: (user) => user.role,
          options: [
            { label: "Admin", value: "Admin" },
            { label: "Member", value: "Member" },
          ],
        },
      ]}
      getRowId={(user) => user.id}
      mobileCard={(user) => (
        <article>
          <strong>{user.name}</strong>
          <p>{user.role}</p>
        </article>
      )}
      onRetry={async () => undefined}
      search={{ getSearchText: (user) => user.name }}
      status={status}
    />
  )
}

const meta = {
  title: "Registry/ResponsiveDataExplorer",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = { render: () => <Example /> }
export const Loading: Story = { render: () => <Example status="loading" /> }
export const Refreshing: Story = {
  render: () => <Example status="refreshing" />,
}
export const Empty: Story = {
  render: () => (
    <ResponsiveDataExplorer
      columns={columns}
      data={[]}
      getRowId={(user) => user.id}
      mobileCard={(user) => <p>{user.name}</p>}
    />
  ),
}
export const ErrorState: Story = { render: () => <Example status="error" /> }
export const Offline: Story = { render: () => <Example status="offline" /> }
