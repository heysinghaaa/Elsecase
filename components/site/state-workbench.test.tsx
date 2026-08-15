import { render, screen } from "@testing-library/react"

import { StateWorkbench } from "@/components/site/state-workbench"

describe("StateWorkbench", () => {
  it("labels the demonstrated failure and scenario configuration", () => {
    render(<StateWorkbench />)

    expect(
      screen.getByRole("heading", {
        name: "The user list could not be loaded.",
      }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Scenario configuration")).toHaveTextContent(
      "1,500 ms",
    )
    expect(screen.getByText("Static foundation specimen")).toBeInTheDocument()
  })
})
