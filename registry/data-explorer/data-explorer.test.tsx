import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
import { useState } from "react"

import {
  ResponsiveDataExplorer,
  createDataExplorerColumnHelper,
  filterDataExplorerRows,
  parseDataExplorerUrlState,
  serializeDataExplorerUrlState,
  type DataExplorerPagination,
} from "./data-explorer"

type Person = {
  id: string
  name: string
  email: string
  role: "Admin" | "Member"
}

const people: Person[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.com", role: "Admin" },
  { id: "2", name: "Grace Hopper", email: "grace@example.com", role: "Member" },
  {
    id: "3",
    name: "Linus Torvalds",
    email: "linus@example.com",
    role: "Member",
  },
]

const helper = createDataExplorerColumnHelper<Person>()
const columns = helper.columns([
  helper.accessor("name", { header: "Name" }),
  helper.accessor("email", { header: "Email", enableSorting: false }),
  helper.accessor("role", { header: "Role" }),
])

const filters = [
  {
    id: "role",
    label: "Role",
    getValue: (person: Person) => person.role,
    options: [
      { label: "Admin", value: "Admin" },
      { label: "Member", value: "Member" },
    ],
  },
]

function Explorer(
  props: Partial<
    React.ComponentProps<typeof ResponsiveDataExplorer<Person>>
  > = {},
) {
  return (
    <ResponsiveDataExplorer
      columns={columns}
      data={people}
      filters={filters}
      getRowId={(person) => person.id}
      mobileCard={(person) => <p>Card: {person.name}</p>}
      search={{
        getSearchText: (person) => `${person.name} ${person.email}`,
        placeholder: "Search people",
      }}
      {...props}
    />
  )
}

describe("data explorer helpers", () => {
  it("filters rows with search and filters", () => {
    expect(
      filterDataExplorerRows(
        people,
        "grace",
        { getSearchText: (person) => `${person.name} ${person.email}` },
        filters,
        { role: "Member" },
      ),
    ).toEqual([people[1]])
  })

  it("parses and serializes URL state while preserving unrelated parameters", () => {
    const parsed = parseDataExplorerUrlState(
      new URLSearchParams(
        "workspace=alpha&q=ada&filter.role=Admin&sort=name.desc&page=2&size=25",
      ),
      ["role"],
    )

    expect(parsed).toEqual({
      search: "ada",
      filters: { role: "Admin" },
      sorting: [{ id: "name", desc: true }],
      pagination: { pageIndex: 1, pageSize: 25 },
    })

    const serialized = serializeDataExplorerUrlState(
      new URLSearchParams("workspace=alpha&ignored=yes"),
      parsed,
      ["role"],
    )
    expect(serialized.get("workspace")).toBe("alpha")
    expect(serialized.get("ignored")).toBe("yes")
    expect(serialized.get("q")).toBe("ada")
    expect(serialized.get("page")).toBe("2")
  })

  it("ignores malformed URL sorting instead of crashing", () => {
    const parsed = parseDataExplorerUrlState(
      new URLSearchParams("sort=%25E0%25A4%25A.desc"),
      [],
    )
    expect(parsed.sorting).toEqual([])
  })
})

describe("ResponsiveDataExplorer", () => {
  it("renders a semantic desktop table and mobile cards", () => {
    render(<Explorer />)

    expect(screen.getByRole("table")).toBeInTheDocument()
    expect(
      screen.getByRole("columnheader", { name: /Name/ }),
    ).toBeInTheDocument()
    expect(screen.getByText("Card: Ada Lovelace")).toBeInTheDocument()
  })

  it("distinguishes no records from no matching results", () => {
    const { rerender } = render(
      <Explorer data={[]} emptyState={<p>The directory is empty</p>} />,
    )
    expect(screen.getByText("The directory is empty")).toBeInTheDocument()

    rerender(<Explorer />)
    fireEvent.change(screen.getByPlaceholderText("Search people"), {
      target: { value: "nobody" },
    })
    expect(screen.getByText("No matching results")).toBeInTheDocument()
    expect(screen.queryByText("The directory is empty")).not.toBeInTheDocument()
  })

  it("searches, filters, and resets pagination", () => {
    const onPaginationChange = vi.fn()
    render(
      <Explorer
        onPaginationChange={onPaginationChange}
        pagination={{ pageIndex: 2, pageSize: 1 }}
      />,
    )

    fireEvent.change(screen.getByPlaceholderText("Search people"), {
      target: { value: "ada" },
    })
    expect(onPaginationChange).toHaveBeenLastCalledWith({
      pageIndex: 0,
      pageSize: 1,
    })

    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "Admin" },
    })
    expect(onPaginationChange).toHaveBeenLastCalledWith({
      pageIndex: 0,
      pageSize: 1,
    })
  })

  it("exposes controlled sorting callbacks", () => {
    const onSortingChange = vi.fn()
    render(<Explorer onSortingChange={onSortingChange} sorting={[]} />)

    fireEvent.click(screen.getByRole("button", { name: /Name/ }))
    expect(onSortingChange).toHaveBeenCalledWith([{ id: "name", desc: false }])
  })

  it("sorts the rendered local row model", () => {
    render(<Explorer />)
    const table = screen.getByRole("table")
    const sort = within(table).getByRole("button", { name: /Name/ })

    fireEvent.click(sort)
    fireEvent.click(sort)

    const rows = within(table).getAllByRole("row")
    expect(rows[1]).toHaveTextContent("Linus Torvalds")
    expect(
      within(table).getByRole("columnheader", { name: /Name/ }),
    ).toHaveAttribute("aria-sort", "descending")
  })

  it("shows bulk actions only after selection", () => {
    render(<Explorer bulkActions={<button type="button">Archive</button>} />)
    expect(
      screen.queryByRole("button", { name: "Archive" }),
    ).not.toBeInTheDocument()

    const table = screen.getByRole("table")
    fireEvent.click(
      within(table).getByRole("checkbox", { name: "Select row 1" }),
    )
    expect(screen.getByText("1 row selected")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Archive" })).toBeInTheDocument()
  })

  it("supports a controlled selection owner", () => {
    function ControlledSelection() {
      const [selection, setSelection] = useState({})
      return (
        <Explorer
          bulkActions={<button type="button">Archive</button>}
          onSelectionChange={setSelection}
          selection={selection}
        />
      )
    }

    render(<ControlledSelection />)
    fireEvent.click(
      within(screen.getByRole("table")).getByRole("checkbox", {
        name: "Select row 1",
      }),
    )
    expect(screen.getByText("1 row selected")).toBeInTheDocument()
  })

  it("paginates local data", () => {
    render(<Explorer pagination={{ pageIndex: 0, pageSize: 2 }} />)
    expect(screen.getByText("Showing 1–2 of 3")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled()
  })

  it("restores URL state and preserves unrelated query parameters", async () => {
    window.history.replaceState(
      {},
      "",
      "/docs?workspace=alpha&q=grace&filter.role=Member&page=1",
    )
    render(<Explorer syncStateToUrl />)

    await waitFor(() =>
      expect(screen.getByPlaceholderText("Search people")).toHaveValue("grace"),
    )
    expect(screen.getByLabelText("Role")).toHaveValue("Member")
    expect(new URLSearchParams(window.location.search).get("workspace")).toBe(
      "alpha",
    )
  })

  it("restores state on browser navigation", async () => {
    window.history.replaceState({}, "", "/docs?q=ada")
    render(<Explorer syncStateToUrl />)
    await waitFor(() =>
      expect(screen.getByPlaceholderText("Search people")).toHaveValue("ada"),
    )

    window.history.pushState({}, "", "/docs?q=linus")
    window.dispatchEvent(new PopStateEvent("popstate"))
    await waitFor(() =>
      expect(screen.getByPlaceholderText("Search people")).toHaveValue("linus"),
    )
  })

  it("supports a controlled pagination owner", () => {
    function ControlledExplorer() {
      const [pagination, setPagination] = useState<DataExplorerPagination>({
        pageIndex: 0,
        pageSize: 1,
      })
      return (
        <Explorer onPaginationChange={setPagination} pagination={pagination} />
      )
    }

    render(<ControlledExplorer />)
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    expect(screen.getByText("Showing 2–2 of 3")).toBeInTheDocument()
  })
})
