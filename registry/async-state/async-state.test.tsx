import { useState } from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { AsyncState, type AsyncStatus } from "./async-state"

describe("AsyncState", () => {
  it.each([
    ["loading", "Loading content"],
    ["empty", "No results"],
    ["error", "Something went wrong"],
    ["offline", "You are offline"],
    ["forbidden", "Access denied"],
  ] satisfies Array<[AsyncStatus, string]>)(
    "renders the %s state",
    (status, expectedText) => {
      render(<AsyncState status={status}>Loaded content</AsyncState>)

      expect(screen.getByText(expectedText)).toBeInTheDocument()
      expect(screen.queryByText("Loaded content")).not.toBeInTheDocument()
    },
  )

  it.each(["idle", "success"] satisfies AsyncStatus[])(
    "renders children for %s",
    (status) => {
      render(<AsyncState status={status}>Loaded content</AsyncState>)

      expect(screen.getByText("Loaded content")).toBeInTheDocument()
    },
  )

  it("passes the error value to a custom renderer", () => {
    render(
      <AsyncState
        error={(value) => <p>{String(value)}</p>}
        errorValue="Request 503"
        status="error"
      >
        Loaded content
      </AsyncState>,
    )

    expect(screen.getByText("Request 503")).toBeInTheDocument()
  })

  it("preserves stale content while refreshing by default", () => {
    render(<AsyncState status="refreshing">Loaded content</AsyncState>)

    expect(screen.getByText("Loaded content")).toBeInTheDocument()
    expect(screen.getByText("Refreshing content")).toBeInTheDocument()
  })

  it("can replace stale content while refreshing", () => {
    render(
      <AsyncState preserveContentWhileRefreshing={false} status="refreshing">
        Loaded content
      </AsyncState>,
    )

    expect(screen.queryByText("Loaded content")).not.toBeInTheDocument()
    expect(screen.getByText("Refreshing content")).toBeInTheDocument()
  })

  it("locks retry while the callback is pending", async () => {
    let resolveRetry: (() => void) | undefined
    const onRetry = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRetry = resolve
        }),
    )

    render(
      <AsyncState onRetry={onRetry} status="error">
        Loaded content
      </AsyncState>,
    )

    const retry = screen.getByRole("button", { name: "Try again" })
    fireEvent.click(retry)
    fireEvent.click(retry)

    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("button", { name: "Retrying…" })).toBeDisabled()

    resolveRetry?.()

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled(),
    )
  })

  it("supports a successful retry transition controlled by the consumer", async () => {
    function RetryExample() {
      const [status, setStatus] = useState<AsyncStatus>("error")

      return (
        <AsyncState onRetry={() => setStatus("success")} status={status}>
          Recovered content
        </AsyncState>
      )
    }

    render(<RetryExample />)
    fireEvent.click(screen.getByRole("button", { name: "Try again" }))

    expect(await screen.findByText("Recovered content")).toBeInTheDocument()
  })
})
