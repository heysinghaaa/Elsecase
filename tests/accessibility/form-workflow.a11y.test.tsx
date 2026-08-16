import { fireEvent, render, screen } from "@testing-library/react"
import { useFormContext } from "react-hook-form"
import { axe } from "vitest-axe"
import { z } from "zod"

import {
  FormWorkflow,
  FormWorkflowStep,
} from "@/registry/form-workflow/form-workflow"

const schema = z.object({ name: z.string().min(2, "Enter a name") })
type Values = z.input<typeof schema>

function Field() {
  const {
    register,
    formState: { errors },
  } = useFormContext<Values>()
  return (
    <label>
      Organization name
      <input
        aria-describedby={errors.name ? "name-error" : undefined}
        aria-invalid={Boolean(errors.name)}
        {...register("name")}
      />
      {errors.name ? <span id="name-error">{errors.name.message}</span> : null}
    </label>
  )
}

describe("FormWorkflow accessibility", () => {
  it("has no axe violations in its default state", async () => {
    const { container } = render(
      <FormWorkflow
        defaultValues={{ name: "Elsecase" }}
        onSubmit={async () => ({ success: true })}
        schema={schema}
      >
        <Field />
      </FormWorkflow>,
    )
    expect((await axe(container)).violations).toHaveLength(0)
  })

  it("has no axe violations in its error state", async () => {
    const { container } = render(
      <FormWorkflow
        defaultValues={{ name: "" }}
        onSubmit={async () => ({ success: true })}
        schema={schema}
      >
        <Field />
      </FormWorkflow>,
    )
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
    await screen.findByRole("alert")
    expect((await axe(container)).violations).toHaveLength(0)
  })

  it("has no axe violations in multi-step mode", async () => {
    const { container } = render(
      <FormWorkflow
        defaultValues={{ name: "Elsecase" }}
        mode="multi-step"
        onSubmit={async () => ({ success: true })}
        schema={schema}
      >
        <FormWorkflowStep fields={["name"]} title="Identity">
          <Field />
        </FormWorkflowStep>
        <FormWorkflowStep title="Review">
          <p>Ready to save.</p>
        </FormWorkflowStep>
      </FormWorkflow>,
    )
    expect((await axe(container)).violations).toHaveLength(0)
  })
})
