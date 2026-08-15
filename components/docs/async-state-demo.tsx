"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import {
  AsyncState,
  type AsyncStatus,
} from "@/registry/async-state/async-state"

const statuses: AsyncStatus[] = [
  "idle",
  "loading",
  "refreshing",
  "empty",
  "success",
  "error",
  "offline",
  "forbidden",
]

const installCommand =
  "pnpm dlx shadcn@latest add https://elsecase.vercel.app/r/async-state.json"

function readStatus(value: string | null): AsyncStatus {
  return statuses.includes(value as AsyncStatus)
    ? (value as AsyncStatus)
    : "error"
}

function DemoContent({ length }: { length: "normal" | "long" | "extreme" }) {
  const paragraphs = length === "normal" ? 1 : length === "long" ? 4 : 10

  return (
    <article className="bg-background min-w-0 rounded-md border p-6">
      <p className="text-muted-foreground m-0 font-mono text-xs">
        users.response
      </p>
      <h3 className="my-3 text-xl font-semibold break-words">
        12 active workspace members
      </h3>
      {Array.from({ length: paragraphs }, (_, index) => (
        <p className="text-muted-foreground max-w-2xl" key={index}>
          The successful response remains mounted while a background refresh is
          in progress. This line represents deterministic application content.
        </p>
      ))}
    </article>
  )
}

export function CopyInstallCommand() {
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
        className="bg-background hover:bg-muted focus-visible:ring-ring active:text-primary min-h-11 rounded-md border px-4 font-semibold focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-55"
        onClick={() => void copy()}
        type="button"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  )
}

export function AsyncStateDemo() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<AsyncStatus>(() =>
    readStatus(searchParams.get("state")),
  )
  const [retryResult, setRetryResult] = useState<"success" | "failure">(
    searchParams.get("retry") === "failure" ? "failure" : "success",
  )
  const [delay, setDelay] = useState(() =>
    [0, 500, 1500, 3000, 5000].includes(Number(searchParams.get("delay")))
      ? Number(searchParams.get("delay"))
      : 1500,
  )
  const [length, setLength] = useState<"normal" | "long" | "extreme">(
    searchParams.get("length") === "long" ||
      searchParams.get("length") === "extreme"
      ? (searchParams.get("length") as "long" | "extreme")
      : "normal",
  )
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">(
    searchParams.get("viewport") === "tablet" ||
      searchParams.get("viewport") === "mobile"
      ? (searchParams.get("viewport") as "tablet" | "mobile")
      : "desktop",
  )

  const updateUrl = (values: Record<string, string | number>) => {
    const next = new URLSearchParams(searchParams.toString())
    Object.entries(values).forEach(([key, value]) =>
      next.set(key, String(value)),
    )
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
  }

  const retry = async () => {
    await new Promise((resolve) => window.setTimeout(resolve, delay))
    if (retryResult === "success") setStatus("success")
  }

  const reset = () => {
    setStatus("error")
    setRetryResult("success")
    setDelay(1500)
    setLength("normal")
    setViewport("desktop")
    router.replace(pathname, { scroll: false })
  }

  const fieldClassName = "grid gap-2 font-mono text-xs text-muted-foreground"
  const selectClassName =
    "min-h-11 w-full rounded-md border bg-background px-3 font-sans text-sm text-foreground outline-2 outline-transparent hover:bg-muted focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-55"

  return (
    <section
      aria-labelledby="async-preview-title"
      className="bg-muted/30 mt-12 overflow-hidden rounded-lg border"
    >
      <div className="flex items-center justify-between gap-6 border-b p-6 max-sm:flex-col max-sm:items-stretch">
        <div>
          <p className="text-muted-foreground m-0 font-mono text-xs">
            Deterministic simulator
          </p>
          <h2 className="mt-1 mb-0 text-2xl" id="async-preview-title">
            Interactive preview
          </h2>
        </div>
        <button
          className="bg-background hover:bg-muted focus-visible:ring-ring active:text-primary min-h-11 rounded-md border px-4 font-semibold whitespace-nowrap focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-55"
          onClick={reset}
          type="button"
        >
          Reset scenario
        </button>
      </div>

      <div className="grid min-w-0 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="grid content-start gap-4 border-b p-6 max-lg:grid-cols-2 max-sm:grid-cols-1 lg:border-r lg:border-b-0">
          <label className={fieldClassName}>
            Rendered state
            <select
              className={selectClassName}
              onChange={(event) => {
                const value = event.target.value as AsyncStatus
                setStatus(value)
                updateUrl({ state: value })
              }}
              value={status}
            >
              {statuses.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className={fieldClassName}>
            Retry result
            <select
              className={selectClassName}
              onChange={(event) => {
                const value = event.target.value as "success" | "failure"
                setRetryResult(value)
                updateUrl({ retry: value })
              }}
              value={retryResult}
            >
              <option value="success">Success</option>
              <option value="failure">Failure</option>
            </select>
          </label>

          <label className={fieldClassName}>
            Network delay
            <select
              className={selectClassName}
              onChange={(event) => {
                const value = Number(event.target.value)
                setDelay(value)
                updateUrl({ delay: value })
              }}
              value={delay}
            >
              {[0, 500, 1500, 3000, 5000].map((value) => (
                <option key={value} value={value}>
                  {value.toLocaleString()} ms
                </option>
              ))}
            </select>
          </label>

          <label className={fieldClassName}>
            Content length
            <select
              className={selectClassName}
              onChange={(event) => {
                const value = event.target.value as typeof length
                setLength(value)
                updateUrl({ length: value })
              }}
              value={length}
            >
              <option value="normal">Normal</option>
              <option value="long">Long</option>
              <option value="extreme">Extreme</option>
            </select>
          </label>

          <label className={fieldClassName}>
            Viewport
            <select
              className={selectClassName}
              onChange={(event) => {
                const value = event.target.value as typeof viewport
                setViewport(value)
                updateUrl({ viewport: value })
              }}
              value={viewport}
            >
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
              <option value="mobile">Mobile</option>
            </select>
          </label>
        </div>

        <div className="bg-muted min-w-0 overflow-auto p-8 max-sm:p-4">
          <div
            className="mx-auto min-w-0 transition-[max-width] data-[viewport=mobile]:max-w-sm data-[viewport=tablet]:max-w-2xl motion-reduce:transition-none"
            data-viewport={viewport}
          >
            <AsyncState
              errorValue={new Error("GET /api/users returned 503")}
              onRetry={retry}
              status={status}
            >
              <DemoContent length={length} />
            </AsyncState>
          </div>
        </div>
      </div>

      <p
        aria-live="polite"
        className="text-muted-foreground m-0 border-t px-6 py-4 font-mono text-xs break-words"
      >
        state={status} · retry={retryResult} · delay={delay}ms · length={length}{" "}
        · viewport={viewport}
      </p>
    </section>
  )
}
