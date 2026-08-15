"use client"

import { useRef, useState, type ReactNode } from "react"

export type AsyncStatus =
  | "idle"
  | "loading"
  | "refreshing"
  | "empty"
  | "success"
  | "error"
  | "offline"
  | "forbidden"

export interface AsyncStateProps {
  status: AsyncStatus
  children: ReactNode
  loading?: ReactNode
  empty?: ReactNode
  error?: ReactNode | ((error: unknown) => ReactNode)
  offline?: ReactNode
  forbidden?: ReactNode
  refreshingIndicator?: ReactNode
  errorValue?: unknown
  onRetry?: () => void | Promise<void>
  preserveContentWhileRefreshing?: boolean
  className?: string
}

const copy = {
  empty: {
    label: "No results",
    description: "There is nothing to show yet.",
  },
  error: {
    label: "Something went wrong",
    description: "The request could not be completed.",
  },
  offline: {
    label: "You are offline",
    description: "Check your connection and try again.",
  },
  forbidden: {
    label: "Access denied",
    description: "You do not have permission to view this content.",
  },
} as const

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ")
}

function LoadingView({ label = "Loading content" }: { label?: string }) {
  return (
    <div
      className="bg-card text-card-foreground flex min-h-40 w-full flex-col justify-center gap-3 rounded-lg border p-6"
      data-slot="async-state-loading"
    >
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="grid gap-3">
        <span className="bg-muted h-3 w-28 animate-pulse rounded-full motion-reduce:animate-none" />
        <span className="bg-muted h-3 w-full animate-pulse rounded-full motion-reduce:animate-none" />
        <span className="bg-muted h-3 w-4/5 animate-pulse rounded-full motion-reduce:animate-none" />
      </div>
    </div>
  )
}

function StateView({
  kind,
  onRetry,
  retrying,
}: {
  kind: keyof typeof copy
  onRetry?: () => void
  retrying?: boolean
}) {
  const message = copy[kind]

  return (
    <div
      className="bg-card text-card-foreground flex min-h-40 w-full flex-col items-start justify-center gap-3 rounded-lg border p-6"
      data-slot={`async-state-${kind}`}
    >
      <div className="grid gap-1">
        <p className="font-semibold">{message.label}</p>
        <p className="text-muted-foreground text-sm">{message.description}</p>
      </div>
      {onRetry ? (
        <button
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring active:bg-primary/80 inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55"
          disabled={retrying}
          onClick={onRetry}
          type="button"
        >
          {retrying ? "Retrying…" : "Try again"}
        </button>
      ) : null}
    </div>
  )
}

function DefaultRefreshingIndicator() {
  return (
    <span className="bg-background text-muted-foreground inline-flex min-h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium shadow-sm">
      <span
        aria-hidden="true"
        className="bg-primary size-2 animate-pulse rounded-full motion-reduce:animate-none"
      />
      Refreshing content
    </span>
  )
}

export function AsyncState({
  status,
  children,
  loading,
  empty,
  error: errorContent,
  offline,
  forbidden,
  refreshingIndicator,
  errorValue,
  onRetry,
  preserveContentWhileRefreshing = true,
  className,
}: AsyncStateProps) {
  const [retrying, setRetrying] = useState(false)
  const retryInFlight = useRef(false)

  const handleRetry = async () => {
    if (!onRetry || retryInFlight.current) return

    retryInFlight.current = true
    setRetrying(true)

    try {
      await onRetry()
    } catch {
      // The consumer owns the request error and keeps status="error" on failure.
    } finally {
      retryInFlight.current = false
      setRetrying(false)
    }
  }

  const rootClassName = joinClassNames("relative min-w-0", className)

  if (status === "idle" || status === "success") {
    return (
      <div
        className={rootClassName}
        data-status={status}
        data-slot="async-state"
      >
        {children}
      </div>
    )
  }

  if (status === "refreshing") {
    const indicator = refreshingIndicator ?? <DefaultRefreshingIndicator />

    if (!preserveContentWhileRefreshing) {
      return (
        <div
          aria-busy="true"
          aria-live="polite"
          className={rootClassName}
          data-status={status}
          data-slot="async-state"
          role="status"
        >
          {refreshingIndicator ?? <LoadingView label="Refreshing content" />}
        </div>
      )
    }

    return (
      <div
        aria-busy="true"
        className={rootClassName}
        data-status={status}
        data-slot="async-state"
      >
        {children}
        <div
          aria-atomic="true"
          aria-live="polite"
          className="absolute top-3 right-3"
          role="status"
        >
          {indicator}
        </div>
      </div>
    )
  }

  if (status === "loading") {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className={rootClassName}
        data-status={status}
        data-slot="async-state"
        role="status"
      >
        {loading ?? <LoadingView />}
      </div>
    )
  }

  const retry = onRetry ? () => void handleRetry() : undefined
  let content: ReactNode

  if (status === "empty") {
    content = empty ?? <StateView kind="empty" />
  } else if (status === "offline") {
    content = offline ?? (
      <StateView kind="offline" onRetry={retry} retrying={retrying} />
    )
  } else if (status === "forbidden") {
    content = forbidden ?? <StateView kind="forbidden" />
  } else {
    content = (typeof errorContent === "function"
      ? errorContent(errorValue)
      : errorContent) ?? (
      <StateView kind="error" onRetry={retry} retrying={retrying} />
    )
  }

  return (
    <div
      aria-atomic="true"
      aria-busy={retrying || undefined}
      aria-live={status === "empty" ? "polite" : "assertive"}
      className={rootClassName}
      data-status={status}
      data-slot="async-state"
      role={status === "empty" ? "status" : "alert"}
    >
      {content}
    </div>
  )
}
