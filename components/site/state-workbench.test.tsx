import { fireEvent, render, screen, waitFor } from "@testing-library/react"

import { StateWorkbench } from "@/components/site/state-workbench"

describe("StateWorkbench", () => {
  it("switches states and records the selected transition", () => {
    render(<StateWorkbench />)
    expect(
      screen.getByRole("heading", {
        name: "The user list could not be loaded.",
      }),
    ).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText("Rendered state"), {
      target: { value: "empty" },
    })
    expect(
      screen.getByRole("heading", { name: "No users match this workspace." }),
    ).toBeInTheDocument()
    expect(
      screen.getByText("request.succeeded.empty → empty.visible"),
    ).toBeInTheDocument()
  })

  it("recovers from a failed request", async () => {
    render(<StateWorkbench />)
    fireEvent.click(screen.getByRole("button", { name: "Try again" }))
    expect(
      screen.getByText("request.pending → loading.initial"),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByText("Ada Lovelace")).toBeInTheDocument(),
    )
  })
})
