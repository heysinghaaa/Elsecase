import { fireEvent, render, screen, within } from "@testing-library/react"
import { axe } from "vitest-axe"

import {
  ResponsiveDataExplorer,
  createDataExplorerColumnHelper,
} from "@/registry/data-explorer/data-explorer"
import type { AsyncStatus } from "@/registry/async-state/async-state"

type User = { id: string; name: string; role: string }
const data: User[] = [
  { id: "1", name: "Ada Lovelace", role: "Admin" },
  { id: "2", name: "Grace Hopper", role: "Member" },
]
const helper = createDataExplorerColumnHelper<User>()
const columns = helper.columns([
  helper.accessor("name", { header: "Name" }),
  helper.accessor("role", { header: "Role" }),
])

function Example({
  status,
  rows = data,
}: {
  status?: AsyncStatus
  rows?: User[]
}) {
  return (
    <ResponsiveDataExplorer
      bulkActions={<button type="button">Archive selected</button>}
      columns={columns}
      data={rows}
      getRowId={(user) => user.id}
      mobileCard={(user) => (
        <article aria-label={user.name}>
          <h3>{user.name}</h3>
          <p>{user.role}</p>
        </article>
      )}
      onRetry={async () => undefined}
      search={{ getSearchText: (user) => user.name }}
      status={status}
    />
  )
}

describe("ResponsiveDataExplorer accessibility", () => {
  it.each<AsyncStatus>([
    "success",
    "loading",
    "refreshing",
    "error",
    "offline",
  ])("has no axe violations in the %s state", async (status) => {
    const { container } = render(<Example status={status} />)
    expect((await axe(container)).violations).toHaveLength(0)
  })

  it("has no axe violations with empty source data", async () => {
    const { container } = render(<Example rows={[]} />)
    expect((await axe(container)).violations).toHaveLength(0)
  })

  it("has no axe violations with no results", async () => {
    const { container } = render(<Example />)
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "nobody" },
    })
    expect((await axe(container)).violations).toHaveLength(0)
  })

  it("has no axe violations with selected rows and bulk actions", async () => {
    const { container } = render(<Example />)
    fireEvent.click(
      within(screen.getByRole("table")).getByRole("checkbox", {
        name: "Select row 1",
      }),
    )
    expect(
      screen.getByRole("button", { name: "Archive selected" }),
    ).toBeVisible()
    expect((await axe(container)).violations).toHaveLength(0)
  })

  it("has no axe violations in a dark theme container", async () => {
    const { container } = render(
      <div className="dark">
        <Example />
      </div>,
    )
    expect((await axe(container)).violations).toHaveLength(0)
  })
})
