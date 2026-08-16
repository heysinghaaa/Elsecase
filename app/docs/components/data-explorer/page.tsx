import type { Metadata } from "next"
import { Suspense } from "react"

import {
  CopyDataExplorerInstallCommand,
  DataExplorerDemo,
} from "@/components/docs/data-explorer-demo"

export const metadata: Metadata = {
  title: "ResponsiveDataExplorer",
  description:
    "A responsive, accessible data-management pattern with search, filters, sorting, pagination, selection, URL state, desktop tables, and mobile cards.",
}

const basicUsage = `import {
  ResponsiveDataExplorer,
  createDataExplorerColumnHelper,
} from "@/components/data-explorer"

const helper = createDataExplorerColumnHelper<User>()
const columns = helper.columns([
  helper.accessor("name", { header: "Name" }),
  helper.accessor("role", { header: "Role" }),
])

<ResponsiveDataExplorer
  data={users}
  columns={columns}
  getRowId={(user) => user.id}
  search={{ getSearchText: (user) => user.name }}
  mobileCard={(user) => <UserCard user={user} />}
  syncStateToUrl
/>`

const api = [
  [
    "data / columns / getRowId",
    "Rows, v9 column definitions, and stable identity.",
    "Required",
  ],
  [
    "mobileCard",
    "Accessible narrow-screen representation of one row.",
    "Required",
  ],
  [
    "status / error / onRetry",
    "AsyncState integration for request conditions.",
    "Derived success/empty",
  ],
  ["search", "Label, placeholder, and searchable-text accessor.", "None"],
  ["filters", "Named select filters with options and value accessors.", "[]"],
  [
    "pagination / sorting / selection",
    "Optional controlled state slices.",
    "Internally owned",
  ],
  ["on*Change", "Resolved controlled-state callbacks.", "None"],
  [
    "bulkActions",
    "Surface mounted only while at least one row is selected.",
    "None",
  ],
  [
    "emptyState / noResultsState",
    "Distinct zero-data and zero-match views.",
    "Built-in views",
  ],
  [
    "syncStateToUrl",
    "Restores and writes supported explorer query state.",
    "false",
  ],
] as const

export default function DataExplorerPage() {
  return (
    <article className="docs-article">
      <h1>ResponsiveDataExplorer</h1>
      <p className="docs-lede">
        A complete local-data workflow that stays a semantic table on desktop,
        becomes usable cards on mobile, and makes filtering, recovery,
        selection, and navigation state explicit.
      </p>

      <Suspense fallback={<div className="notice">Loading preview…</div>}>
        <DataExplorerDemo />
      </Suspense>

      <h2>Installation</h2>
      <p>
        The CLI installs editable source, AsyncState, and the compatible
        TanStack Table dependency. Elsecase itself is not a runtime package.
      </p>
      <CopyDataExplorerInstallCommand />

      <h2>Basic usage</h2>
      <pre className="code-block">
        <code>{basicUsage}</code>
      </pre>

      <h2>API reference</h2>
      <div className="mt-6 overflow-x-auto rounded-md border">
        <table className="w-full min-w-2xl border-collapse text-left">
          <thead className="bg-muted/50 font-mono text-xs">
            <tr>
              <th className="border-b p-4">Prop</th>
              <th className="border-b p-4">Purpose</th>
              <th className="border-b p-4">Default</th>
            </tr>
          </thead>
          <tbody>
            {api.map(([name, purpose, defaultValue]) => (
              <tr key={name}>
                <td className="border-b p-4">
                  <code>{name}</code>
                </td>
                <td className="border-b p-4">{purpose}</td>
                <td className="border-b p-4">{defaultValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>States and edge cases</h2>
      <p>
        The example covers initial loading, stale-content refreshing, empty
        source data, no matching results, request failure, offline recovery,
        long emails, multiple pages, and selected rows. Search and filter
        changes always return to the first page.
      </p>

      <h2>Accessibility behavior</h2>
      <p>
        Desktop output uses native table, header, and cell semantics. Sorting is
        operated by real buttons and exposed through <code>aria-sort</code>.
        Selection uses named native checkboxes, bulk-action changes are
        announced, and all controls meet a 44px minimum target. Async conditions
        inherit AsyncState’s live-region behavior.
      </p>

      <h2>Responsive behavior</h2>
      <p>
        At the medium breakpoint, the desktop table is removed from layout and
        the same paginated rows are rendered as consumer-defined cards. The
        mobile renderer receives the original typed row, so it can prioritize
        information instead of squeezing columns into a narrow table.
      </p>

      <h2>URL state</h2>
      <p>
        Search, filters, sorting, page, and page size use readable query keys.
        Unrelated parameters are preserved, defaults are omitted, and the
        component listens for browser back and forward navigation. This logic
        uses the browser History API, so the registry component is not coupled
        to Next.js.
      </p>

      <h2>Testing example</h2>
      <pre className="code-block">
        <code>{`fireEvent.change(screen.getByRole("searchbox"), {
  target: { value: "ada" },
})
expect(screen.getByText("Ada Lovelace")).toBeInTheDocument()
expect(screen.queryByText("Grace Hopper")).not.toBeInTheDocument()`}</code>
      </pre>

      <h2>Customization</h2>
      <pre className="code-block">
        <code>{`<ResponsiveDataExplorer
  {...props}
  emptyState={<InviteFirstMember />}
  noResultsState={<SavedSearchEmpty />}
  bulkActions={<MemberBulkActions />}
  mobileCard={(user) => <CompactUserCard user={user} />}
/>`}</code>
      </pre>

      <h2>Dependencies</h2>
      <p>
        React, AsyncState, and <code>@tanstack/react-table@^9.1.2</code>. The
        component intentionally targets TanStack Table v9 rather than its
        deprecated v8 compatibility adapter.
      </p>

      <h2>Known limitations</h2>
      <p>
        Version 0.1 processes local rows. Controlled sorting and pagination are
        designed to feed server requests, but fetching and cache ownership stay
        with the application. URL keys are intentionally human-readable, so use
        one synchronized explorer per route unless you scope it in a wrapper.
      </p>

      <h2>Source</h2>
      <p>
        Review the implementation and behavior tests on GitHub:
        <br />
        <a href="https://github.com/heysinghaaa/Elsecase/tree/main/registry/data-explorer">
          github.com/heysinghaaa/Elsecase/tree/main/registry/data-explorer
        </a>
      </p>
    </article>
  )
}
