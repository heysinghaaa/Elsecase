import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useFormContext } from "react-hook-form"
import { z } from "zod"

import {
  FormWorkflow,
  FormWorkflowStep,
  type FormSubmissionResult,
} from "./form-workflow"

const schema = z.object({
  name: z.string().min(2, "Organization name is required"),
  website: z.string().url("Enter a valid website"),
})
type Values = z.input<typeof schema>

const defaults: Values = {
  name: "Acme",
  website: "https://example.com",
}

function Fields({ includeLink = false }: { includeLink?: boolean }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<Values>()

  return (
    <div>
      <label>
        Organization name
        <input
          aria-describedby={errors.name ? "name-error" : undefined}
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
      </label>
      {errors.name ? <p id="name-error">{errors.name.message}</p> : null}
      <label>
        Website
        <input
          aria-describedby={errors.website ? "website-error" : undefined}
          aria-invalid={Boolean(errors.website)}
          {...register("website")}
        />
      </label>
      {errors.website ? (
        <p id="website-error">{errors.website.message}</p>
      ) : null}
      {includeLink ? <a href="/elsewhere">Leave form</a> : null}
    </div>
  )
}

function SingleWorkflow({
  onSubmit = async () => ({ success: true, message: "Settings saved" }),
  successBehavior,
  warnOnUnsavedChanges,
  autosave,
  includeLink,
}: {
  onSubmit?: (values: Values) => Promise<FormSubmissionResult>
  successBehavior?: "message" | "reset" | "preserve"
  warnOnUnsavedChanges?: boolean
  autosave?: {
    onSave: (values: Values) => Promise<FormSubmissionResult | void>
    delay?: number
  }
  includeLink?: boolean
}) {
  return (
    <FormWorkflow
      autosave={autosave}
      defaultValues={defaults}
      onSubmit={onSubmit}
      schema={schema}
      successBehavior={successBehavior}
      warnOnUnsavedChanges={warnOnUnsavedChanges}
    >
      <Fields includeLink={includeLink} />
    </FormWorkflow>
  )
}

describe("FormWorkflow", () => {
  it("validates on the client and focuses the error summary", async () => {
    const onSubmit = vi.fn()
    render(<SingleWorkflow onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText("Organization name"), {
      target: { value: "" },
    })
    fireEvent.change(screen.getByLabelText("Website"), {
      target: { value: "invalid" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }))

    const summary = await screen.findByRole("alert")
    await waitFor(() => expect(summary).toHaveFocus())
    expect(screen.getAllByText("Organization name is required")).toHaveLength(2)
    expect(screen.getAllByText("Enter a valid website")).toHaveLength(2)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("submits parsed values and announces success", async () => {
    const onSubmit = vi.fn(async () => ({
      success: true,
      message: "Organization saved",
    }))
    render(<SingleWorkflow onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText("Organization name"), {
      target: { value: "Elsecase" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Elsecase",
        website: "https://example.com",
      }),
    )
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Organization saved",
    )
  })

  it("maps server errors, focuses the summary, and preserves values", async () => {
    const onSubmit = vi.fn(async () => ({
      success: false,
      fieldErrors: { name: "That organization name already exists" },
      formError: "Resolve the conflict and try again",
    }))
    render(<SingleWorkflow onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText("Organization name"), {
      target: { value: "Existing org" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }))

    const summary = await screen.findByRole("alert")
    await waitFor(() => expect(summary).toHaveFocus())
    expect(summary).toHaveTextContent("Resolve the conflict and try again")
    expect(summary).toHaveTextContent("That organization name already exists")
    expect(screen.getByLabelText("Organization name")).toHaveValue(
      "Existing org",
    )
  })

  it("prevents duplicate asynchronous submissions", async () => {
    let resolveSubmission: ((result: FormSubmissionResult) => void) | undefined
    const onSubmit = vi.fn(
      () =>
        new Promise<FormSubmissionResult>((resolve) => {
          resolveSubmission = resolve
        }),
    )
    render(<SingleWorkflow onSubmit={onSubmit} />)

    const submit = screen.getByRole("button", { name: "Save changes" })
    fireEvent.click(submit)
    fireEvent.click(submit)
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled()

    resolveSubmission?.({ success: true })
    expect(await screen.findByText("Changes saved.")).toBeInTheDocument()
  })

  it("resets values after a successful reset submission", async () => {
    render(<SingleWorkflow successBehavior="reset" />)
    fireEvent.change(screen.getByLabelText("Organization name"), {
      target: { value: "Changed" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
    await screen.findByText("Settings saved")
    expect(screen.getByLabelText("Organization name")).toHaveValue("Acme")
  })

  it("autosaves valid dirty values after the debounce", async () => {
    const onSave = vi.fn(async () => ({ success: true }))
    render(<SingleWorkflow autosave={{ onSave, delay: 10 }} />)

    fireEvent.change(screen.getByLabelText("Organization name"), {
      target: { value: "Autosaved org" },
    })

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1))
    expect(onSave).toHaveBeenCalledWith({
      name: "Autosaved org",
      website: "https://example.com",
    })
    expect(await screen.findByText("Draft saved")).toBeInTheDocument()
  })

  it("shows and retries an autosave failure", async () => {
    const onSave = vi
      .fn()
      .mockResolvedValueOnce({ success: false, formError: "Autosave offline" })
      .mockResolvedValueOnce({ success: true })
    render(<SingleWorkflow autosave={{ onSave, delay: 10 }} />)

    fireEvent.change(screen.getByLabelText("Organization name"), {
      target: { value: "Retry org" },
    })
    expect(await screen.findByText("Autosave offline")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Retry autosave" }))

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(2))
    expect(await screen.findByText("Draft saved")).toBeInTheDocument()
  })

  it("warns before external navigation while dirty", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false)
    render(<SingleWorkflow includeLink warnOnUnsavedChanges />)
    fireEvent.change(screen.getByLabelText("Organization name"), {
      target: { value: "Dirty org" },
    })

    const unload = new Event("beforeunload", { cancelable: true })
    window.dispatchEvent(unload)
    expect(unload.defaultPrevented).toBe(true)
    expect(
      fireEvent.click(screen.getByRole("link", { name: "Leave form" })),
    ).toBe(false)
    expect(confirm).toHaveBeenCalled()
    confirm.mockRestore()
  })

  it("validates each declared step before advancing", async () => {
    function NameStep() {
      const { register, formState } = useFormContext<Values>()
      return (
        <>
          <label>
            Organization name
            <input {...register("name")} />
          </label>
          {formState.errors.name ? (
            <p>{formState.errors.name.message}</p>
          ) : null}
        </>
      )
    }
    function WebsiteStep() {
      const { register } = useFormContext<Values>()
      return (
        <label>
          Website
          <input {...register("website")} />
        </label>
      )
    }

    render(
      <FormWorkflow
        defaultValues={defaults}
        mode="multi-step"
        onSubmit={async () => ({ success: true })}
        schema={schema}
      >
        <FormWorkflowStep fields={["name"]} title="Profile">
          <NameStep />
        </FormWorkflowStep>
        <FormWorkflowStep fields={["website"]} title="Presence">
          <WebsiteStep />
        </FormWorkflowStep>
      </FormWorkflow>,
    )

    fireEvent.change(screen.getByLabelText("Organization name"), {
      target: { value: "" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))
    expect(await screen.findByRole("alert")).toHaveFocus()
    expect(screen.queryByLabelText("Website")).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText("Organization name"), {
      target: { value: "Valid org" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))
    expect(await screen.findByLabelText("Website")).toBeInTheDocument()
    expect(screen.getByText("Step 2 of 2")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Previous step" }))
    expect(screen.getByLabelText("Organization name")).toHaveValue("Valid org")
  })
})
