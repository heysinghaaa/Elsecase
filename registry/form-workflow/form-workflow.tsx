"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import {
  FormProvider,
  useForm,
  useWatch,
  type DefaultValues,
  type FieldErrors,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"
import { z } from "zod"

export interface FormSubmissionResult {
  success: boolean
  message?: string
  fieldErrors?: Record<string, string>
  formError?: string
}

export interface FormAutosaveConfig<TValues> {
  onSave: (values: TValues) => Promise<FormSubmissionResult | void>
  delay?: number
  enabled?: boolean
}

export interface FormWorkflowProps<
  TInput extends FieldValues,
  TOutput extends FieldValues = TInput,
> {
  schema: z.ZodType<TOutput, TInput>
  defaultValues: TInput
  onSubmit: (values: TOutput) => Promise<FormSubmissionResult>
  children: ReactNode
  mode?: "single" | "multi-step"
  autosave?: FormAutosaveConfig<TOutput>
  warnOnUnsavedChanges?: boolean
  successBehavior?: "message" | "reset" | "preserve"
}

export interface FormWorkflowStepProps {
  title: string
  children: ReactNode
  description?: string
  fields?: string[]
}

type AutosaveStatus = "idle" | "saving" | "saved" | "error"
type SubmissionStatus = "idle" | "submitting" | "success" | "error"

function fieldErrorEntries(errors: FieldErrors): Array<[string, string]> {
  const entries: Array<[string, string]> = []

  const visit = (value: unknown, path: string) => {
    if (!value || typeof value !== "object") return
    const candidate = value as Record<string, unknown>
    if (typeof candidate.message === "string") {
      entries.push([path, candidate.message])
      return
    }
    Object.entries(candidate).forEach(([key, child]) => {
      if (key === "ref" || key === "type" || key === "types") return
      visit(child, path ? `${path}.${key}` : key)
    })
  }

  Object.entries(errors).forEach(([key, value]) => visit(value, key))
  return entries
}

export function FormWorkflowStep({
  title,
  description,
  children,
}: FormWorkflowStepProps) {
  return (
    <fieldset className="grid min-w-0 gap-5 border-0 p-0">
      <legend className="text-lg font-semibold">{title}</legend>
      {description ? (
        <p className="text-muted-foreground -mt-3 text-sm">{description}</p>
      ) : null}
      {children}
    </fieldset>
  )
}

function getStepFields(step: ReactNode) {
  if (!isValidElement<FormWorkflowStepProps>(step)) return []
  return step.props.fields ?? []
}

function getStepTitle(step: ReactNode, index: number) {
  if (!isValidElement<FormWorkflowStepProps>(step)) return `Step ${index + 1}`
  return step.props.title
}

export function FormWorkflow<
  TInput extends FieldValues,
  TOutput extends FieldValues = TInput,
>({
  schema,
  defaultValues,
  onSubmit,
  children,
  mode = "single",
  autosave,
  warnOnUnsavedChanges = false,
  successBehavior = "message",
}: FormWorkflowProps<TInput, TOutput>) {
  const form = useForm<TInput, unknown, TOutput>({
    resolver: zodResolver<TInput, unknown, TOutput>(schema),
    defaultValues: defaultValues as DefaultValues<TInput>,
    shouldFocusError: false,
  })
  const {
    control,
    formState,
    getValues,
    handleSubmit,
    reset,
    setError,
    trigger,
  } = form
  const values = useWatch({ control })
  const steps = useMemo(() => Children.toArray(children), [children])
  const [currentStep, setCurrentStep] = useState(0)
  const [formError, setFormError] = useState<string>()
  const [successMessage, setSuccessMessage] = useState<string>()
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>("idle")
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>("idle")
  const [autosaveError, setAutosaveError] = useState<string>()
  const summaryRef = useRef<HTMLDivElement>(null)
  const submitInFlight = useRef(false)
  const autosaveInFlight = useRef(false)
  const autosaveTimer = useRef<number | undefined>(undefined)
  const mounted = useRef(false)

  const isMultiStep = mode === "multi-step" && steps.length > 1
  const visibleContent = isMultiStep ? steps[currentStep] : children
  const errorEntries = fieldErrorEntries(formState.errors)
  const hasErrors = Boolean(formError) || errorEntries.length > 0

  const focusSummary = useCallback(() => {
    window.requestAnimationFrame(() => summaryRef.current?.focus())
  }, [])

  const clearMessages = () => {
    setFormError(undefined)
    setSuccessMessage(undefined)
    setSubmissionStatus("idle")
  }

  const applySubmissionFailure = useCallback(
    (result: FormSubmissionResult) => {
      Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) =>
        setError(field as FieldPath<TInput>, {
          type: "server",
          message,
        }),
      )
      setFormError(
        result.formError ??
          (Object.keys(result.fieldErrors ?? {}).length === 0
            ? (result.message ?? "The form could not be saved.")
            : undefined),
      )
      setSubmissionStatus("error")
      focusSummary()
    },
    [focusSummary, setError],
  )

  const submitValid = async (submittedValues: TOutput) => {
    if (submitInFlight.current) return
    submitInFlight.current = true
    setSubmissionStatus("submitting")
    setFormError(undefined)
    setSuccessMessage(undefined)

    try {
      const result = await onSubmit(submittedValues)
      if (!result.success) {
        applySubmissionFailure(result)
        return
      }

      const message = result.message ?? "Changes saved."
      setSuccessMessage(message)
      setSubmissionStatus("success")
      if (successBehavior === "reset") {
        reset(defaultValues as DefaultValues<TInput>)
        setCurrentStep(0)
      } else {
        reset(getValues() as DefaultValues<TInput>, { keepValues: true })
      }
    } catch {
      applySubmissionFailure({
        success: false,
        formError: "The form could not be saved. Try again.",
      })
    } finally {
      submitInFlight.current = false
    }
  }

  const submitInvalid = (errors: FieldErrors<TInput>) => {
    setSubmissionStatus("error")
    setFormError(undefined)
    if (isMultiStep) {
      const firstError = fieldErrorEntries(errors)[0]?.[0]
      const errorStep = steps.findIndex((step) =>
        getStepFields(step).some(
          (field) =>
            firstError === field || firstError?.startsWith(`${field}.`),
        ),
      )
      if (errorStep >= 0) setCurrentStep(errorStep)
    }
    focusSummary()
  }

  const saveDraft = useCallback(async () => {
    if (
      !autosave ||
      autosave.enabled === false ||
      autosaveInFlight.current ||
      submitInFlight.current
    ) {
      return
    }

    const parsed = schema.safeParse(getValues())
    if (!parsed.success) return

    autosaveInFlight.current = true
    setAutosaveStatus("saving")
    setAutosaveError(undefined)
    try {
      const result = await autosave.onSave(parsed.data)
      if (result && !result.success) {
        setAutosaveStatus("error")
        setAutosaveError(
          result.formError ?? result.message ?? "Draft could not be saved.",
        )
        return
      }
      setAutosaveStatus("saved")
      reset(getValues() as DefaultValues<TInput>, { keepValues: true })
    } catch {
      setAutosaveStatus("error")
      setAutosaveError("Draft could not be saved.")
    } finally {
      autosaveInFlight.current = false
    }
  }, [autosave, getValues, reset, schema])

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    if (
      !autosave ||
      autosave.enabled === false ||
      !formState.isDirty ||
      formState.isSubmitting
    ) {
      return
    }

    if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current)
    autosaveTimer.current = window.setTimeout(
      () => void saveDraft(),
      autosave.delay ?? 800,
    )
    return () => {
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current)
    }
  }, [autosave, formState.isDirty, formState.isSubmitting, saveDraft, values])

  useEffect(() => {
    if (!warnOnUnsavedChanges || !formState.isDirty) return

    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    const click = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest("a[href]")
      if (!anchor || anchor.getAttribute("target") === "_blank") return
      if (!window.confirm("You have unsaved changes. Leave this page?")) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    window.addEventListener("beforeunload", beforeUnload)
    document.addEventListener("click", click, true)
    return () => {
      window.removeEventListener("beforeunload", beforeUnload)
      document.removeEventListener("click", click, true)
    }
  }, [formState.isDirty, warnOnUnsavedChanges])

  const nextStep = async () => {
    const fields = getStepFields(steps[currentStep]) as FieldPath<TInput>[]
    const valid = fields.length === 0 ? true : await trigger(fields)
    if (!valid) {
      setSubmissionStatus("error")
      focusSummary()
      return
    }
    clearMessages()
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1))
  }

  return (
    <FormProvider {...form}>
      <form
        className="grid min-w-0 gap-6"
        data-mode={mode}
        data-slot="form-workflow"
        noValidate
        onChange={clearMessages}
        onSubmit={(event) =>
          void handleSubmit(submitValid, submitInvalid)(event)
        }
      >
        {isMultiStep ? (
          <div className="grid gap-2" aria-label="Form progress">
            <p className="text-muted-foreground m-0 font-mono text-xs">
              Step {currentStep + 1} of {steps.length}
            </p>
            <ol
              className="grid list-none grid-cols-[repeat(var(--step-count),minmax(0,1fr))] gap-2 p-0"
              style={{ "--step-count": steps.length } as CSSProperties}
            >
              {steps.map((step, index) => (
                <li
                  aria-current={index === currentStep ? "step" : undefined}
                  className="bg-muted data-[complete=true]:bg-primary data-[current=true]:bg-primary h-1.5 rounded-full"
                  data-complete={index < currentStep}
                  data-current={index === currentStep}
                  key={`${getStepTitle(step, index)}-${index}`}
                >
                  <span className="sr-only">
                    {getStepTitle(step, index)}
                    {index === currentStep ? ", current step" : ""}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {hasErrors ? (
          <div
            aria-labelledby="form-workflow-errors-title"
            className="border-destructive/40 bg-destructive/5 text-foreground rounded-lg border p-5"
            data-slot="form-workflow-error-summary"
            ref={summaryRef}
            role="alert"
            tabIndex={-1}
          >
            <h2
              className="m-0 text-base font-semibold"
              id="form-workflow-errors-title"
            >
              Check the form
            </h2>
            {formError ? (
              <p className="mt-2 mb-0 text-sm">{formError}</p>
            ) : null}
            {errorEntries.length > 0 ? (
              <ul className="mt-3 mb-0 grid gap-1 pl-5 text-sm">
                {errorEntries.map(([field, message]) => (
                  <li key={field}>
                    <button
                      className="focus-visible:ring-ring rounded text-left hover:underline focus-visible:ring-2"
                      onClick={() => form.setFocus(field as FieldPath<TInput>)}
                      type="button"
                    >
                      {message}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {visibleContent}

        {autosave ? (
          <div
            aria-live="polite"
            className="text-muted-foreground flex min-h-11 items-center justify-between gap-4 rounded-md border px-4 text-sm"
            data-status={autosaveStatus}
          >
            <span>
              {autosaveStatus === "saving"
                ? "Saving draft…"
                : autosaveStatus === "saved"
                  ? "Draft saved"
                  : autosaveStatus === "error"
                    ? autosaveError
                    : "Changes save automatically"}
            </span>
            {autosaveStatus === "error" ? (
              <button
                className="hover:bg-muted focus-visible:ring-ring min-h-9 rounded-md border px-3 font-semibold focus-visible:ring-2"
                onClick={() => void saveDraft()}
                type="button"
              >
                Retry autosave
              </button>
            ) : null}
          </div>
        ) : null}

        {submissionStatus === "success" && successMessage ? (
          <p
            aria-live="polite"
            className="border-primary/30 bg-primary/5 m-0 rounded-md border p-4 text-sm font-medium"
            role="status"
          >
            {successMessage}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3 max-sm:flex-col-reverse max-sm:items-stretch">
          {isMultiStep && currentStep > 0 ? (
            <button
              className="bg-background hover:bg-muted focus-visible:ring-ring min-h-11 rounded-md border px-4 font-semibold focus-visible:ring-2"
              onClick={() => {
                clearMessages()
                setCurrentStep((step) => Math.max(0, step - 1))
              }}
              type="button"
            >
              Previous step
            </button>
          ) : (
            <span />
          )}

          {isMultiStep && currentStep < steps.length - 1 ? (
            <button
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring min-h-11 rounded-md px-4 font-semibold focus-visible:ring-2"
              onClick={(event) => {
                event.preventDefault()
                void nextStep()
              }}
              type="button"
            >
              Continue
            </button>
          ) : (
            <button
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring min-h-11 rounded-md px-4 font-semibold focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-55"
              disabled={
                formState.isSubmitting || submissionStatus === "submitting"
              }
              type="submit"
            >
              {formState.isSubmitting || submissionStatus === "submitting"
                ? "Saving…"
                : "Save changes"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  )
}
