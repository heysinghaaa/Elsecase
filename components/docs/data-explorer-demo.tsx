"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import type { RowSelectionState } from "@tanstack/react-table"

import {
  ResponsiveDataExplorer,
  createDataExplorerColumnHelper,
  type DataExplorerPagination,
} from "@/registry/data-explorer/data-explorer"
import type { AsyncStatus } from "@/registry/async-state/async-state"

type User = {
  id: string
  name: string
  email: string
  role: "Admin" | "Member" | "Viewer"
  status: "Active" | "Invited" | "Suspended"
  lastActive: string
  initials: string
}

const names = [
  "Ada Lovelace",
  "Grace Hopper",
  "Margaret Hamilton",
  "Alan Turing",
  "Katherine Johnson",
  "Edsger Dijkstra",
  "Barbara Liskov",
  "Donald Knuth",
  "Frances Allen",
  "Tim Berners-Lee",
  "Radia Perlman",
  "Ken Thompson",
  "Dennis Ritchie",
  "Anita Borg",
  "Guido van Rossum",
  "James Gosling",
  "Brendan Eich",
  "Linus Torvalds",
  "Mary Jackson",
  "John McCarthy",
  "Jean Sammet",
  "Hedy Lamarr",
  "Sophie Wilson",
  "Mark Dean",
  "Carol Shaw",
] as const

const roles = ["Admin", "Member", "Viewer"] as const
const statuses = ["Active", "Invited", "Suspended"] as const

const users: User[] = names.map((name, index) => ({
  id: `user-${index + 1}`,
  name,
  email:
    index === 6
      ? "barbara.liskov+extremely-long-workspace-alias@example-enterprise.test"
      : `${name.toLocaleLowerCase().replaceAll(" ", ".")}@example.com`,
  role: roles[index % roles.length],
  status: statuses[index % statuses.length],
  lastActive: index % 4 === 0 ? "Just now" : `${index + 1} hours ago`,
  initials: name
    .split(" ")
    .map((part) => part[0])
    .join(""),
}))

const helper = createDataExplorerColumnHelper<User>()
const columns = helper.columns([
  helper.accessor("name", {
    header: "User",
    cell: ({ row }) => (
      <div className="flex min-w-52 items-center gap-3">
        <span
          aria-hidden="true"
          className="bg-primary/10 text-primary grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold"
        >
          {row.original.initials}
        </span>
        <span className="min-w-0">
          <strong className="block">{row.original.name}</strong>
          <span className="text-muted-foreground block max-w-64 truncate text-xs">
            {row.original.email}
          </span>
        </span>
      </div>
    ),
  }),
  helper.accessor("role", { header: "Role" }),
  helper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => (
      <span className="bg-muted rounded-full px-2.5 py-1 text-xs font-semibold">
        {getValue()}
      </span>
    ),
  }),
  helper.accessor("lastActive", { header: "Last activity" }),
])

const installCommand =
  "pnpm dlx shadcn@latest add https://elsecase.vercel.app/r/data-explorer.json"

const asyncStatuses: AsyncStatus[] = [
  "success",
  "loading",
  "refreshing",
  "empty",
  "error",
  "offline",
]

function readStatus(value: string | null): AsyncStatus {
  return asyncStatuses.includes(value as AsyncStatus)
    ? (value as AsyncStatus)
    : "success"
}

export function CopyDataExplorerInstallCommand() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(installCommand)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="bg-muted/30 mt-6 flex items-center gap-4 rounded-md border p-3 max-sm:flex-col max-sm:items-stretch">
      <code className="min-w-0 flex-1 overflow-x-auto px-3 font-mono text-sm whitespace-nowrap">
        {installCommand}
      </code>
      <button
        className="bg-background hover:bg-muted focus-visible:ring-ring min-h-11 rounded-md border px-4 font-semibold focus-visible:ring-2"
        onClick={() => void copy()}
        type="button"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  )
}

function UserCard({ user }: { user: User }) {
  return (
    <article aria-label={user.name} className="grid gap-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold"
        >
          {user.initials}
        </span>
        <div className="min-w-0">
          <h3 className="m-0 text-base">{user.name}</h3>
          <p className="text-muted-foreground m-0 text-xs break-all">
            {user.email}
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground text-xs">Role</dt>
          <dd className="m-0 font-medium">{user.role}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Status</dt>
          <dd className="m-0 font-medium">{user.status}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground text-xs">Last activity</dt>
          <dd className="m-0 font-medium">{user.lastActive}</dd>
        </div>
      </dl>
    </article>
  )
}

export function DataExplorerDemo() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<AsyncStatus>(() =>
    readStatus(searchParams.get("demoState")),
  )
  const [recordCount, setRecordCount] = useState(() => {
    const parameter = searchParams.get("records")
    const count = parameter === null ? Number.NaN : Number(parameter)
    return [0, 5, 25].includes(count) ? count : 25
  })
  const [viewport, setViewport] = useState<"desktop" | "mobile">(
    searchParams.get("demoViewport") === "mobile" ? "mobile" : "desktop",
  )
  const [selection, setSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState<DataExplorerPagination>({
    pageIndex: 0,
    pageSize: 5,
  })

  const data = useMemo(() => users.slice(0, recordCount), [recordCount])

  const updateUrl = (values: Record<string, string | number>) => {
    const next = new URLSearchParams(window.location.search)
    Object.entries(values).forEach(([key, value]) =>
      next.set(key, String(value)),
    )
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
  }

  const reset = () => {
    setStatus("success")
    setRecordCount(25)
    setViewport("desktop")
    setSelection({})
    setPagination({ pageIndex: 0, pageSize: 5 })
    router.replace(pathname, { scroll: false })
  }

  const selectClassName =
    "bg-background text-foreground focus-visible:ring-ring min-h-11 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"

  return (
    <section
      aria-labelledby="data-explorer-preview-title"
      className="bg-muted/30 mt-12 overflow-hidden rounded-lg border"
    >
      <div className="flex items-center justify-between gap-6 border-b p-6 max-sm:flex-col max-sm:items-stretch">
        <div>
          <p className="text-muted-foreground m-0 font-mono text-xs">
            Deterministic user directory
          </p>
          <h2 className="mt-1 mb-0 text-2xl" id="data-explorer-preview-title">
            Interactive preview
          </h2>
        </div>
        <button
          className="bg-background hover:bg-muted focus-visible:ring-ring min-h-11 rounded-md border px-4 font-semibold focus-visible:ring-2"
          onClick={reset}
          type="button"
        >
          Reset scenario
        </button>
      </div>

      <div className="grid gap-4 border-b p-6 sm:grid-cols-3">
        <label className="text-muted-foreground grid gap-2 font-mono text-xs">
          Response state
          <select
            className={selectClassName}
            onChange={(event) => {
              const next = event.target.value as AsyncStatus
              setStatus(next)
              updateUrl({ demoState: next })
            }}
            value={status}
          >
            {asyncStatuses.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-muted-foreground grid gap-2 font-mono text-xs">
          Record count
          <select
            className={selectClassName}
            onChange={(event) => {
              const next = Number(event.target.value)
              setRecordCount(next)
              setSelection({})
              updateUrl({ records: next })
            }}
            value={recordCount}
          >
            {[0, 5, 25].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-muted-foreground grid gap-2 font-mono text-xs">
          Preview width
          <select
            className={selectClassName}
            onChange={(event) => {
              const next = event.target.value as "desktop" | "mobile"
              setViewport(next)
              updateUrl({ demoViewport: next })
            }}
            value={viewport}
          >
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
          </select>
        </label>
      </div>

      <div className="bg-background overflow-auto p-6 max-sm:p-3">
        <div
          className="mx-auto min-w-0 transition-[max-width] data-[viewport=mobile]:max-w-sm motion-reduce:transition-none"
          data-viewport={viewport}
        >
          <ResponsiveDataExplorer
            bulkActions={
              <button
                className="bg-primary text-primary-foreground focus-visible:ring-ring min-h-11 rounded-md px-4 text-sm font-semibold focus-visible:ring-2"
                onClick={() => setSelection({})}
                type="button"
              >
                Mark active
              </button>
            }
            columns={columns}
            data={data}
            error={new Error("GET /api/users returned 503")}
            filters={[
              {
                id: "role",
                label: "Role",
                getValue: (user) => user.role,
                options: roles.map((role) => ({ label: role, value: role })),
              },
              {
                id: "status",
                label: "Status",
                getValue: (user) => user.status,
                options: statuses.map((value) => ({
                  label: value,
                  value,
                })),
              },
            ]}
            getRowId={(user) => user.id}
            mobileCard={(user) => <UserCard user={user} />}
            onRetry={async () => setStatus("success")}
            onPaginationChange={setPagination}
            onSelectionChange={setSelection}
            pagination={pagination}
            search={{
              getSearchText: (user) => `${user.name} ${user.email}`,
              label: "Search users",
              placeholder: "Name or email…",
            }}
            selection={selection}
            status={status}
            syncStateToUrl
          />
        </div>
      </div>

      <p className="text-muted-foreground m-0 border-t px-6 py-4 font-mono text-xs break-words">
        state={status} · records={recordCount} · viewport={viewport} · search,
        filters, sorting, and page are synchronized above
      </p>
    </section>
  )
}
