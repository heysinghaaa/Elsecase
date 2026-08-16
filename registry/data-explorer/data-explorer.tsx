"use client"

import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_alphanumericCaseSensitive,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  sortFn_textCaseSensitive,
  tableFeatures,
  useTable,
  type CellData,
  type ColumnDef,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Updater,
} from "@tanstack/react-table"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react"

import { AsyncState, type AsyncStatus } from "@/components/async-state"

export interface DataExplorerPagination {
  pageIndex: number
  pageSize: number
}

export interface DataExplorerSearchConfig<TData> {
  getSearchText: (row: TData) => string
  label?: string
  placeholder?: string
}

export interface DataExplorerFilterOption {
  label: string
  value: string
}

export interface DataExplorerFilterConfig<TData> {
  id: string
  label: string
  getValue: (row: TData) => string
  options: DataExplorerFilterOption[]
}

export interface DataExplorerUrlState {
  search: string
  filters: Record<string, string>
  pagination: DataExplorerPagination
  sorting: SortingState
}

const dataExplorerFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    alphanumericCaseSensitive: sortFn_alphanumericCaseSensitive,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
    textCaseSensitive: sortFn_textCaseSensitive,
  },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature,
})

export type DataExplorerColumnDef<TData extends RowData> = ColumnDef<
  typeof dataExplorerFeatures,
  TData,
  CellData
>

export function createDataExplorerColumnHelper<TData extends RowData>() {
  return createColumnHelper<typeof dataExplorerFeatures, TData>()
}

export interface DataExplorerProps<TData extends RowData> {
  data: TData[]
  columns: DataExplorerColumnDef<TData>[]
  getRowId: (row: TData) => string
  status?: AsyncStatus
  error?: unknown
  search?: DataExplorerSearchConfig<TData>
  filters?: DataExplorerFilterConfig<TData>[]
  pagination?: DataExplorerPagination
  sorting?: SortingState
  selection?: RowSelectionState
  mobileCard: (row: TData) => ReactNode
  bulkActions?: ReactNode
  emptyState?: ReactNode
  noResultsState?: ReactNode
  onRetry?: () => void | Promise<void>
  onPaginationChange?: (pagination: DataExplorerPagination) => void
  onSortingChange?: (sorting: SortingState) => void
  onSelectionChange?: (selection: RowSelectionState) => void
  syncStateToUrl?: boolean
}

const defaultPagination: DataExplorerPagination = {
  pageIndex: 0,
  pageSize: 10,
}
const emptyFilters: [] = []

const searchParameter = "q"
const sortParameter = "sort"
const pageParameter = "page"
const pageSizeParameter = "size"
const filterPrefix = "filter."

function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === "function"
    ? (updater as (value: T) => T)(previous)
    : updater
}

function validPositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function parseSorting(value: string | null): SortingState {
  if (!value) return []

  return value
    .split(",")
    .map((entry) => {
      const separator = entry.lastIndexOf(".")
      if (separator < 1) return null
      let id: string
      try {
        id = decodeURIComponent(entry.slice(0, separator))
      } catch {
        return null
      }
      const direction = entry.slice(separator + 1)
      if (!id || (direction !== "asc" && direction !== "desc")) return null
      return { id, desc: direction === "desc" }
    })
    .filter((entry): entry is SortingState[number] => entry !== null)
}

function serializeSorting(sorting: SortingState) {
  return sorting
    .map(({ id, desc }) => `${encodeURIComponent(id)}.${desc ? "desc" : "asc"}`)
    .join(",")
}

export function parseDataExplorerUrlState(
  parameters: URLSearchParams,
  filterIds: string[],
  fallbackPagination: DataExplorerPagination = defaultPagination,
): DataExplorerUrlState {
  const filters = Object.fromEntries(
    filterIds.map((id) => [id, parameters.get(`${filterPrefix}${id}`) ?? ""]),
  )

  return {
    search: parameters.get(searchParameter) ?? "",
    filters,
    sorting: parseSorting(parameters.get(sortParameter)),
    pagination: {
      pageIndex: validPositiveInteger(parameters.get(pageParameter), 1) - 1,
      pageSize: validPositiveInteger(
        parameters.get(pageSizeParameter),
        fallbackPagination.pageSize,
      ),
    },
  }
}

export function serializeDataExplorerUrlState(
  current: URLSearchParams,
  state: DataExplorerUrlState,
  filterIds: string[],
  fallbackPagination: DataExplorerPagination = defaultPagination,
) {
  const parameters = new URLSearchParams(current.toString())
  const setOrDelete = (key: string, value: string, defaultValue = "") => {
    if (value === defaultValue) parameters.delete(key)
    else parameters.set(key, value)
  }

  setOrDelete(searchParameter, state.search.trim())
  setOrDelete(sortParameter, serializeSorting(state.sorting))
  setOrDelete(pageParameter, String(state.pagination.pageIndex + 1), "1")
  setOrDelete(
    pageSizeParameter,
    String(state.pagination.pageSize),
    String(fallbackPagination.pageSize),
  )
  filterIds.forEach((id) =>
    setOrDelete(`${filterPrefix}${id}`, state.filters[id] ?? ""),
  )

  return parameters
}

export function filterDataExplorerRows<TData>(
  data: TData[],
  search: string,
  searchConfig: DataExplorerSearchConfig<TData> | undefined,
  filters: DataExplorerFilterConfig<TData>[],
  filterValues: Record<string, string>,
) {
  const normalizedSearch = search.trim().toLocaleLowerCase()

  return data.filter((row) => {
    const matchesSearch =
      !normalizedSearch ||
      !searchConfig ||
      searchConfig
        .getSearchText(row)
        .toLocaleLowerCase()
        .includes(normalizedSearch)
    const matchesFilters = filters.every((filter) => {
      const expected = filterValues[filter.id]
      return !expected || filter.getValue(row) === expected
    })
    return matchesSearch && matchesFilters
  })
}

function IndeterminateCheckbox({
  className,
  indeterminate,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { indeterminate?: boolean }) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = Boolean(indeterminate)
  }, [indeterminate])

  return (
    <input
      {...props}
      className={joinClassNames(
        "border-input accent-primary focus-visible:ring-ring size-5 shrink-0 rounded border focus-visible:ring-2 focus-visible:ring-offset-2",
        className,
      )}
      ref={ref}
      type="checkbox"
    />
  )
}

function DefaultEmptyState() {
  return (
    <div className="bg-card flex min-h-52 flex-col items-center justify-center gap-2 rounded-lg border p-8 text-center">
      <p className="font-semibold">No records yet</p>
      <p className="text-muted-foreground max-w-sm text-sm">
        Data will appear here when records are available.
      </p>
    </div>
  )
}

function joinClassNames(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ")
}

export function ResponsiveDataExplorer<TData extends RowData>({
  data,
  columns,
  getRowId,
  status,
  error,
  search: searchConfig,
  filters,
  pagination,
  sorting,
  selection,
  mobileCard,
  bulkActions,
  emptyState,
  noResultsState,
  onRetry,
  onPaginationChange,
  onSortingChange,
  onSelectionChange,
  syncStateToUrl = false,
}: DataExplorerProps<TData>) {
  const activeFilters = filters ?? emptyFilters
  const initialPagination = pagination ?? defaultPagination
  const [searchValue, setSearchValue] = useState("")
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [internalPagination, setInternalPagination] =
    useState<DataExplorerPagination>(initialPagination)
  const [internalSorting, setInternalSorting] = useState<SortingState>(
    sorting ?? [],
  )
  const [internalSelection, setInternalSelection] = useState<RowSelectionState>(
    selection ?? {},
  )
  const [urlReady, setUrlReady] = useState(!syncStateToUrl)

  const activePagination = pagination ?? internalPagination
  const activeSorting = sorting ?? internalSorting
  const activeSelection = selection ?? internalSelection
  const filterIds = useMemo(
    () => activeFilters.map(({ id }) => id),
    [activeFilters],
  )
  const filterIdsKey = filterIds.join("\u001f")
  const didRestoreUrl = useRef(false)

  const changePagination = useCallback(
    (updater: Updater<DataExplorerPagination>) => {
      const next = resolveUpdater(updater, activePagination)
      if (pagination === undefined) setInternalPagination(next)
      onPaginationChange?.(next)
    },
    [activePagination, onPaginationChange, pagination],
  )

  const changeSorting = useCallback(
    (updater: Updater<SortingState>) => {
      const next = resolveUpdater(updater, activeSorting)
      if (sorting === undefined) setInternalSorting(next)
      onSortingChange?.(next)
    },
    [activeSorting, onSortingChange, sorting],
  )

  const changeSelection = useCallback(
    (updater: Updater<RowSelectionState>) => {
      const next = resolveUpdater(updater, activeSelection)
      if (selection === undefined) setInternalSelection(next)
      onSelectionChange?.(next)
    },
    [activeSelection, onSelectionChange, selection],
  )

  useEffect(() => {
    if (!syncStateToUrl) return
    const restoreUrlState = () => {
      const restored = parseDataExplorerUrlState(
        new URLSearchParams(window.location.search),
        filterIdsKey ? filterIdsKey.split("\u001f") : [],
        initialPagination,
      )
      setSearchValue(restored.search)
      setFilterValues(restored.filters)
      if (pagination === undefined) setInternalPagination(restored.pagination)
      onPaginationChange?.(restored.pagination)
      if (sorting === undefined) setInternalSorting(restored.sorting)
      onSortingChange?.(restored.sorting)
      setUrlReady(true)
    }
    if (!didRestoreUrl.current) {
      didRestoreUrl.current = true
      restoreUrlState()
    }
    window.addEventListener("popstate", restoreUrlState)
    return () => window.removeEventListener("popstate", restoreUrlState)
  }, [
    filterIdsKey,
    initialPagination,
    onPaginationChange,
    onSortingChange,
    pagination,
    sorting,
    syncStateToUrl,
  ])

  useEffect(() => {
    if (!syncStateToUrl || !urlReady) return
    const next = serializeDataExplorerUrlState(
      new URLSearchParams(window.location.search),
      {
        search: searchValue,
        filters: filterValues,
        pagination: activePagination,
        sorting: activeSorting,
      },
      filterIds,
      initialPagination,
    )
    const query = next.toString()
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
    window.history.replaceState(window.history.state, "", nextUrl)
  }, [
    activePagination,
    activeSorting,
    filterIds,
    filterIdsKey,
    filterValues,
    initialPagination,
    searchValue,
    syncStateToUrl,
    urlReady,
  ])

  const filteredData = useMemo(
    () =>
      filterDataExplorerRows(
        data,
        searchValue,
        searchConfig,
        activeFilters,
        filterValues,
      ),
    [activeFilters, data, filterValues, searchConfig, searchValue],
  )

  const table = useTable({
    features: dataExplorerFeatures,
    columns,
    data: filteredData,
    getRowId,
    state: {
      pagination: activePagination,
      rowSelection: activeSelection,
      sorting: activeSorting,
    },
    onPaginationChange: changePagination,
    onRowSelectionChange: changeSelection,
    onSortingChange: changeSorting,
  })

  const resetPage = () =>
    changePagination({ ...activePagination, pageIndex: 0 })
  const hasActiveQuery =
    Boolean(searchValue.trim()) || Object.values(filterValues).some(Boolean)
  const resolvedStatus =
    status === undefined || status === "success"
      ? data.length === 0
        ? "empty"
        : "success"
      : status
  const rows = table.getRowModel().rows
  const selectedCount = Object.values(activeSelection).filter(Boolean).length
  const firstVisible =
    filteredData.length === 0
      ? 0
      : activePagination.pageIndex * activePagination.pageSize + 1
  const lastVisible = Math.min(
    filteredData.length,
    firstVisible + rows.length - 1,
  )

  const clearQuery = () => {
    setSearchValue("")
    setFilterValues({})
    resetPage()
  }

  const results =
    filteredData.length === 0 && data.length > 0 ? (
      (noResultsState ?? (
        <div className="bg-card flex min-h-52 flex-col items-center justify-center gap-3 rounded-lg border p-8 text-center">
          <div>
            <p className="font-semibold">No matching results</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Try changing or clearing the current search and filters.
            </p>
          </div>
          <button
            className="bg-background hover:bg-muted focus-visible:ring-ring min-h-11 rounded-md border px-4 text-sm font-semibold focus-visible:ring-2"
            onClick={clearQuery}
            type="button"
          >
            Clear search and filters
          </button>
        </div>
      ))
    ) : (
      <>
        <div className="hidden overflow-x-auto rounded-lg border md:block">
          <table className="w-full min-w-184 border-collapse text-left text-sm">
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  <th className="w-12 border-b p-4" scope="col">
                    <IndeterminateCheckbox
                      aria-label="Select all rows on this page"
                      checked={table.getIsAllPageRowsSelected()}
                      indeterminate={table.getIsSomePageRowsSelected()}
                      onChange={table.getToggleAllPageRowsSelectedHandler()}
                    />
                  </th>
                  {headerGroup.headers.map((header) => {
                    const direction = header.column.getIsSorted()
                    return (
                      <th
                        aria-sort={
                          direction === "asc"
                            ? "ascending"
                            : direction === "desc"
                              ? "descending"
                              : undefined
                        }
                        className="border-b p-4 font-semibold"
                        key={header.id}
                        scope="col"
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <button
                            className="focus-visible:ring-ring -m-2 inline-flex min-h-11 items-center gap-2 rounded px-2 text-left focus-visible:ring-2"
                            onClick={header.column.getToggleSortingHandler()}
                            type="button"
                          >
                            <table.FlexRender header={header} />
                            <span aria-hidden="true">
                              {direction === "asc"
                                ? "↑"
                                : direction === "desc"
                                  ? "↓"
                                  : "↕"}
                            </span>
                          </button>
                        ) : (
                          <table.FlexRender header={header} />
                        )}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  className="hover:bg-muted/30 data-[selected=true]:bg-muted/50"
                  data-selected={row.getIsSelected()}
                  key={row.id}
                >
                  <td className="border-b p-4">
                    <IndeterminateCheckbox
                      aria-label={`Select row ${row.id}`}
                      checked={row.getIsSelected()}
                      disabled={!row.getCanSelect()}
                      onChange={row.getToggleSelectedHandler()}
                    />
                  </td>
                  {row.getAllCells().map((cell) => (
                    <td className="border-b p-4 align-middle" key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="grid list-none gap-3 p-0 md:hidden">
          {rows.map((row) => (
            <li
              className="bg-card data-[selected=true]:ring-ring relative rounded-lg border p-5 pl-14 data-[selected=true]:ring-2"
              data-selected={row.getIsSelected()}
              key={row.id}
            >
              <IndeterminateCheckbox
                aria-label={`Select row ${row.id}`}
                checked={row.getIsSelected()}
                className="absolute top-5 left-5"
                disabled={!row.getCanSelect()}
                onChange={row.getToggleSelectedHandler()}
              />
              {mobileCard(row.original)}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
          <p aria-live="polite" className="text-muted-foreground m-0 text-sm">
            Showing {firstVisible}–{lastVisible} of {filteredData.length}
          </p>
          <div className="flex items-center gap-2 max-sm:grid max-sm:grid-cols-2">
            <button
              className="bg-background hover:bg-muted focus-visible:ring-ring min-h-11 rounded-md border px-4 text-sm font-semibold focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              type="button"
            >
              Previous
            </button>
            <span className="text-muted-foreground px-2 text-center text-sm max-sm:col-span-2 max-sm:row-start-1">
              Page {activePagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              className="bg-background hover:bg-muted focus-visible:ring-ring min-h-11 rounded-md border px-4 text-sm font-semibold focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </>
    )

  return (
    <section className="min-w-0" data-slot="responsive-data-explorer">
      {(searchConfig || activeFilters.length > 0) && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:flex">
          {searchConfig ? (
            <label className="grid min-w-0 flex-1 gap-2 text-sm font-medium">
              {searchConfig.label ?? "Search"}
              <input
                className="bg-background focus-visible:ring-ring min-h-11 w-full rounded-md border px-3 outline-none focus-visible:ring-2"
                onChange={(event) => {
                  setSearchValue(event.target.value)
                  resetPage()
                }}
                placeholder={searchConfig.placeholder ?? "Search records…"}
                type="search"
                value={searchValue}
              />
            </label>
          ) : null}
          {activeFilters.map((filter) => (
            <label
              className="grid min-w-40 gap-2 text-sm font-medium"
              key={filter.id}
            >
              {filter.label}
              <select
                className="bg-background focus-visible:ring-ring min-h-11 rounded-md border px-3 outline-none focus-visible:ring-2"
                onChange={(event) => {
                  setFilterValues((current) => ({
                    ...current,
                    [filter.id]: event.target.value,
                  }))
                  resetPage()
                }}
                value={filterValues[filter.id] ?? ""}
              >
                <option value="">All {filter.label.toLocaleLowerCase()}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}

      {selectedCount > 0 ? (
        <div
          className="mb-4 flex items-center justify-between gap-4 rounded-lg border p-4"
          data-slot="data-explorer-bulk-actions"
        >
          <p aria-live="polite" className="m-0 text-sm font-semibold">
            {selectedCount} {selectedCount === 1 ? "row" : "rows"} selected
          </p>
          {bulkActions}
        </div>
      ) : null}

      <AsyncState
        empty={emptyState ?? <DefaultEmptyState />}
        errorValue={error}
        onRetry={onRetry}
        status={resolvedStatus}
      >
        {results}
      </AsyncState>

      {hasActiveQuery ? (
        <p className="sr-only" aria-live="polite">
          {filteredData.length} matching records
        </p>
      ) : null}
    </section>
  )
}
