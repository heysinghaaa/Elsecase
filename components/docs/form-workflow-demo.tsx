"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { z } from "zod"

import {
  FormWorkflow,
  FormWorkflowStep,
  type FormSubmissionResult,
} from "@/registry/form-workflow/form-workflow"

const organizationSchema = z.object({
  name: z.string().trim().min(2, "Enter an organization name"),
  website: z.string().url("Enter a complete URL, including https://"),
  industry: z.string().min(1, "Choose an industry"),
  description: z
    .string()
    .max(180, "Keep the description to 180 characters or fewer"),
  productUpdates: z.boolean(),
  securityAlerts: z.boolean(),
})

type OrganizationValues = z.input<typeof organizationSchema>
type Outcome = "success" | "duplicate" | "failure"

const defaults: OrganizationValues = {
  name: "Northstar Labs",
  website: "https://northstar.example",
  industry: "Software",
  description: "Internal tooling for teams that operate critical systems.",
  productUpdates: true,
  securityAlerts: true,
}

const inputClassName =
  "bg-background text-foreground focus-visible:ring-ring min-h-11 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p className="text-destructive m-0 text-sm" id={id}>
      {message}
    </p>
  ) : null
}

function IdentityFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OrganizationValues>()

  return (
    <div className="grid gap-5">
      <label className="grid gap-2 text-sm font-semibold">
        Organization name
        <input
          aria-describedby={errors.name ? "organization-name-error" : undefined}
          aria-invalid={Boolean(errors.name)}
          className={inputClassName}
          {...register("name")}
        />
        <FieldError
          id="organization-name-error"
          message={errors.name?.message}
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold">
        Website
        <input
          aria-describedby={errors.website ? "website-error" : undefined}
          aria-invalid={Boolean(errors.website)}
          className={inputClassName}
          inputMode="url"
          {...register("website")}
        />
        <FieldError id="website-error" message={errors.website?.message} />
      </label>

      <label className="grid gap-2 text-sm font-semibold">
        Industry
        <select
          aria-describedby={errors.industry ? "industry-error" : undefined}
          aria-invalid={Boolean(errors.industry)}
          className={inputClassName}
          {...register("industry")}
        >
          <option value="">Choose an industry</option>
          <option>Software</option>
          <option>Financial services</option>
          <option>Healthcare</option>
          <option>Public sector</option>
        </select>
        <FieldError id="industry-error" message={errors.industry?.message} />
      </label>
    </div>
  )
}

function ProfileFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OrganizationValues>()

  return (
    <div className="grid gap-5">
      <label className="grid gap-2 text-sm font-semibold">
        Description
        <textarea
          aria-describedby={
            errors.description ? "description-error" : undefined
          }
          aria-invalid={Boolean(errors.description)}
          className={`${inputClassName} min-h-28 resize-y py-3`}
          {...register("description")}
        />
        <FieldError
          id="description-error"
          message={errors.description?.message}
        />
      </label>

      <div className="grid gap-2">
        <p className="m-0 text-sm font-semibold">Organization logo</p>
        <div className="bg-muted/40 flex min-h-24 items-center justify-between gap-4 rounded-md border border-dashed p-4 max-sm:items-start">
          <span className="text-muted-foreground text-sm">
            Logo upload is deliberately a placeholder in this local demo.
          </span>
          <button
            className="min-h-11 rounded-md border px-4 font-semibold"
            disabled
            type="button"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  )
}

function NotificationFields() {
  const { register } = useFormContext<OrganizationValues>()

  return (
    <div className="grid gap-3">
      <label className="flex min-h-11 items-center gap-3 rounded-md border p-3 text-sm font-medium">
        <input
          className="size-4"
          type="checkbox"
          {...register("productUpdates")}
        />
        Product and workflow updates
      </label>
      <label className="flex min-h-11 items-center gap-3 rounded-md border p-3 text-sm font-medium">
        <input
          className="size-4"
          type="checkbox"
          {...register("securityAlerts")}
        />
        Security alerts
      </label>
    </div>
  )
}

function readOutcome(value: string | null): Outcome {
  return value === "duplicate" || value === "failure" ? value : "success"
}

const installCommand =
  "pnpm dlx shadcn@latest add https://elsecase.vercel.app/r/form-workflow.json"

export function CopyFormWorkflowInstallCommand() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(installCommand)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="bg-muted/30 mt-6 flex items-center gap-4 rounded-md border p-3 max-sm:flex-col max-sm:items-stretch">
      <code className="min-w-0 flex-1 overflow-x-auto px-3 font-mono text-sm whitespace-nowrap">
        {installCommand}
      </code>
      <button
        className="bg-background hover:bg-muted focus-visible:ring-ring min-h-11 rounded-md border px-4 font-semibold focus-visible:ring-2"
        onClick={() => void copy()}
        type="button"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  )
}

export function FormWorkflowDemo() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<"single" | "multi-step">(
    searchParams.get("formMode") === "multi-step" ? "multi-step" : "single",
  )
  const [outcome, setOutcome] = useState<Outcome>(() =>
    readOutcome(searchParams.get("formOutcome")),
  )
  const [delay, setDelay] = useState(() => {
    const value = Number(searchParams.get("formDelay"))
    return [0, 500, 1500].includes(value) ? value : 500
  })
  const [autosaveFailure, setAutosaveFailure] = useState(
    searchParams.get("autosave") === "failure",
  )
  const [resetKey, setResetKey] = useState(0)

  const updateUrl = (values: Record<string, string | number>) => {
    const next = new URLSearchParams(window.location.search)
    Object.entries(values).forEach(([key, value]) =>
      next.set(key, String(value)),
    )
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
  }

  const wait = () =>
    new Promise<void>((resolve) => window.setTimeout(resolve, delay))

  const submit = async (): Promise<FormSubmissionResult> => {
    await wait()
    if (outcome === "duplicate") {
      return {
        success: false,
        fieldErrors: { name: "That organization name is already in use" },
        formError: "Resolve the conflict before saving.",
      }
    }
    if (outcome === "failure") {
      return {
        success: false,
        formError:
          "The settings service is unavailable. Your values are preserved.",
      }
    }
    return { success: true, message: "Organization settings saved." }
  }

  const autosave = async (): Promise<FormSubmissionResult> => {
    await wait()
    return autosaveFailure
      ? { success: false, formError: "Draft sync failed. Retry when ready." }
      : { success: true }
  }

  const controlClassName =
    "bg-background text-foreground focus-visible:ring-ring min-h-11 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"

  const formContent =
    mode === "multi-step" ? (
      [
        <FormWorkflowStep
          description="The public identity attached to this workspace."
          fields={["name", "website", "industry"]}
          key="identity"
          title="Organization identity"
        >
          <IdentityFields />
        </FormWorkflowStep>,
        <FormWorkflowStep
          description="Context and notifications for the team."
          fields={["description", "productUpdates", "securityAlerts"]}
          key="profile"
          title="Profile and notifications"
        >
          <ProfileFields />
          <NotificationFields />
        </FormWorkflowStep>,
      ]
    ) : (
      <>
        <FormWorkflowStep title="Organization identity">
          <IdentityFields />
        </FormWorkflowStep>
        <FormWorkflowStep title="Profile and notifications">
          <ProfileFields />
          <NotificationFields />
        </FormWorkflowStep>
      </>
    )

  return (
    <section
      aria-labelledby="form-workflow-preview-title"
      className="bg-muted/30 mt-12 overflow-hidden rounded-lg border"
    >
      <div className="flex items-center justify-between gap-6 border-b p-6 max-sm:flex-col max-sm:items-stretch">
        <div>
          <p className="text-muted-foreground m-0 font-mono text-xs">
            Deterministic organization settings
          </p>
          <h2 className="mt-1 mb-0 text-2xl" id="form-workflow-preview-title">
            Interactive preview
          </h2>
        </div>
        <button
          className="bg-background hover:bg-muted focus-visible:ring-ring min-h-11 rounded-md border px-4 font-semibold focus-visible:ring-2"
          onClick={() => {
            setMode("single")
            setOutcome("success")
            setDelay(500)
            setAutosaveFailure(false)
            setResetKey((value) => value + 1)
            router.replace(pathname, { scroll: false })
          }}
          type="button"
        >
          Reset scenario
        </button>
      </div>

      <div className="grid gap-4 border-b p-6 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-muted-foreground grid gap-2 font-mono text-xs">
          Form mode
          <select
            aria-label="Form mode"
            className={controlClassName}
            onChange={(event) => {
              const value = event.target.value as "single" | "multi-step"
              setMode(value)
              updateUrl({ formMode: value })
            }}
            value={mode}
          >
            <option value="single">Single page</option>
            <option value="multi-step">Multi-step</option>
          </select>
        </label>
        <label className="text-muted-foreground grid gap-2 font-mono text-xs">
          Submit result
          <select
            aria-label="Submit result"
            className={controlClassName}
            onChange={(event) => {
              const value = event.target.value as Outcome
              setOutcome(value)
              updateUrl({ formOutcome: value })
            }}
            value={outcome}
          >
            <option value="success">Success</option>
            <option value="duplicate">Field conflict</option>
            <option value="failure">Service failure</option>
          </select>
        </label>
        <label className="text-muted-foreground grid gap-2 font-mono text-xs">
          Network delay
          <select
            aria-label="Form network delay"
            className={controlClassName}
            onChange={(event) => {
              const value = Number(event.target.value)
              setDelay(value)
              updateUrl({ formDelay: value })
            }}
            value={delay}
          >
            <option value={0}>None</option>
            <option value={500}>500 ms</option>
            <option value={1500}>1.5 seconds</option>
          </select>
        </label>
        <label className="text-muted-foreground grid gap-2 font-mono text-xs">
          Autosave result
          <select
            aria-label="Autosave result"
            className={controlClassName}
            onChange={(event) => {
              const failure = event.target.value === "failure"
              setAutosaveFailure(failure)
              updateUrl({ autosave: failure ? "failure" : "success" })
            }}
            value={autosaveFailure ? "failure" : "success"}
          >
            <option value="success">Success</option>
            <option value="failure">Failure</option>
          </select>
        </label>
      </div>

      <div className="mx-auto max-w-2xl p-6 sm:p-8">
        <FormWorkflow
          autosave={{ delay: 800, onSave: autosave }}
          defaultValues={defaults}
          key={`${mode}-${resetKey}`}
          mode={mode}
          onSubmit={submit}
          schema={organizationSchema}
          warnOnUnsavedChanges
        >
          {formContent}
        </FormWorkflow>
      </div>
    </section>
  )
}
