import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useFormContext } from "react-hook-form"
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
    <label className="grid gap-2">
      Organization name
      <input
        aria-invalid={Boolean(errors.name)}
        className="min-h-11 rounded-md border px-3"
        {...register("name")}
      />
      {errors.name ? <span>{errors.name.message}</span> : null}
    </label>
  )
}

const meta = {
  title: "Registry/FormWorkflow",
  parameters: { layout: "padded" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const SinglePage: Story = {
  render: () => (
    <FormWorkflow
      defaultValues={{ name: "Elsecase" }}
      onSubmit={async () => ({ success: true, message: "Saved" })}
      schema={schema}
    >
      <Field />
    </FormWorkflow>
  ),
}

export const MultiStep: Story = {
  render: () => (
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
        <p>Review the organization before saving.</p>
      </FormWorkflowStep>
    </FormWorkflow>
  ),
}

export const ServerFailure: Story = {
  render: () => (
    <FormWorkflow
      defaultValues={{ name: "Elsecase" }}
      onSubmit={async () => ({
        success: false,
        fieldErrors: { name: "That name is already used" },
        formError: "Resolve the conflict.",
      })}
      schema={schema}
    >
      <Field />
    </FormWorkflow>
  ),
}
