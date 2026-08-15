import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { axe } from "vitest-axe"

import {
  AsyncState,
  type AsyncStatus,
} from "../../registry/async-state/async-state"

describe("AsyncState accessibility", () => {
  it.each([
    "idle",
    "loading",
    "refreshing",
    "empty",
    "success",
    "error",
    "offline",
    "forbidden",
  ] satisfies AsyncStatus[])("has no axe violations in %s", async (status) => {
    const { container } = render(
      <AsyncState onRetry={() => undefined} status={status}>
        <article>
          <h2>Loaded content</h2>
          <p>The existing result remains available.</p>
        </article>
      </AsyncState>,
    )
    const results = await axe(container)

    expect(results.violations).toHaveLength(0)
  })
})
