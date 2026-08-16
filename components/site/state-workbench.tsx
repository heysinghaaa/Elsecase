"use client"

import Link from "next/link"
import { useState } from "react"

import {
  AsyncState,
  type AsyncStatus,
} from "@/registry/async-state/async-state"

const statuses: AsyncStatus[] = [
  "success",
  "loading",
  "refreshing",
  "empty",
  "error",
  "offline",
  "forbidden",
]

const stateDetails: Record<AsyncStatus, { code: string; event: string }> = {
  idle: { code: "request.idle", event: "No request started" },
  success: { code: "request.succeeded", event: "content.visible" },
  loading: { code: "request.pending", event: "loading.initial" },
  refreshing: { code: "request.refreshing", event: "content.preserved" },
  empty: { code: "request.succeeded.empty", event: "empty.visible" },
  error: { code: "request.failed", event: "error.visible" },
  offline: { code: "network.offline", event: "recovery.available" },
  forbidden: { code: "request.forbidden", event: "permission.visible" },
}

export function StateWorkbench() {
  const [status, setStatus] = useState<AsyncStatus>("error")
  const [lastEvent, setLastEvent] = useState("request.failed → error.visible")

  const changeStatus = (next: AsyncStatus) => {
    setStatus(next)
    const detail = stateDetails[next]
    setLastEvent(`${detail.code} → ${detail.event}`)
  }

  const retry = async () => {
    changeStatus("loading")
    await new Promise<void>((resolve) => window.setTimeout(resolve, 450))
    changeStatus("success")
  }

  return (
    <figure className="workbench" aria-labelledby="workbench-title">
      <div className="workbench__topline">
        <p className="workbench__title" id="workbench-title">
          AsyncState probe
        </p>
        <span className="workbench__status">
          <span
            className="status-dot"
            aria-hidden="true"
            data-status={status}
          />
          {stateDetails[status].code}
        </span>
      </div>
      <div className="workbench__body">
        <div className="workbench__preview">
          <AsyncState
            empty={
              <div className="state-message">
                <p className="state-message__code">ZERO_USERS</p>
                <h2>No users match this workspace.</h2>
                <p>Invite the first user or clear the active filters.</p>
              </div>
            }
            error={
              <div className="state-message">
                <p className="state-message__code">ERR_USERS_FETCH</p>
                <h2>The user list could not be loaded.</h2>
                <p>
                  Your filters are preserved. Retry when the service recovers.
                </p>
                <button
                  className="button-primary"
                  onClick={() => void retry()}
                  type="button"
                >
                  Try again
                </button>
              </div>
            }
            forbidden={
              <div className="state-message">
                <p className="state-message__code">ROLE_REQUIRED</p>
                <h2>This list needs administrator access.</h2>
                <p>Ask a workspace owner to change your role.</p>
              </div>
            }
            offline={
              <div className="state-message">
                <p className="state-message__code">NETWORK_OFFLINE</p>
                <h2>The network is unavailable.</h2>
                <p>Reconnect, then retry without losing this view.</p>
                <button
                  className="button-primary"
                  onClick={() => void retry()}
                  type="button"
                >
                  Try again
                </button>
              </div>
            }
            onRetry={retry}
            status={status}
          >
            <div className="probe-directory">
              <div>
                <strong>Ada Lovelace</strong>
                <span>Admin · Active</span>
              </div>
              <div>
                <strong>Grace Hopper</strong>
                <span>Member · Invited</span>
              </div>
              <div>
                <strong>Margaret Hamilton</strong>
                <span>Member · Active</span>
              </div>
            </div>
          </AsyncState>
        </div>
        <div
          className="workbench__inspector"
          aria-label="Scenario configuration"
        >
          <label className="workbench__control">
            <span>Rendered state</span>
            <select
              aria-label="Rendered state"
              onChange={(event) =>
                changeStatus(event.target.value as AsyncStatus)
              }
              value={status}
            >
              {statuses.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <div className="workbench__scenario">
            <span>Content</span>
            <strong>
              {status === "refreshing" ? "Preserved" : "Resolved"}
            </strong>
          </div>
          <div className="workbench__scenario">
            <span>Retry</span>
            <strong>
              {status === "error" || status === "offline"
                ? "Available"
                : "Not needed"}
            </strong>
          </div>
          <div className="workbench__scenario">
            <span>Announce</span>
            <strong>{status === "error" ? "Assertive" : "Polite"}</strong>
          </div>
        </div>
      </div>
      <div className="workbench__events">
        <p className="workbench__events-title">Transition record</p>
        <div className="workbench__event">
          <time>latest</time>
          <span>{lastEvent}</span>
        </div>
      </div>
      <figcaption className="workbench__footer">
        <span>Interactive registry specimen</span>
        <Link href="/docs/components/async-state">Inspect AsyncState</Link>
      </figcaption>
    </figure>
  )
}
