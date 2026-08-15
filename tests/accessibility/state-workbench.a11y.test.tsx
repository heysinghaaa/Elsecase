import { render } from "@testing-library/react"
import { axe } from "vitest-axe"

import { StateWorkbench } from "@/components/site/state-workbench"

describe("StateWorkbench accessibility", () => {
  it("has no detectable axe violations", async () => {
    const { container } = render(<StateWorkbench />)
    const results = await axe(container)

    expect(results.violations).toHaveLength(0)
  })
})
