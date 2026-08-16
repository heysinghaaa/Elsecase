import type { Metadata } from "next"
import { Suspense } from "react"

import {
  CopyFormWorkflowInstallCommand,
  FormWorkflowDemo,
} from "@/components/docs/form-workflow-demo"

export const metadata: Metadata = {
  title: "FormWorkflow",
  description:
    "A validated, recoverable form workflow for client errors, server errors, autosave, unsaved changes, and multi-step flows.",
}

const basicUsage = `import { z } from "zod"
import { useFormContext } from "react-hook-form"
import { FormWorkflow } from "@/components/form-workflow"

const schema = z.object({
  name: z.string().min(2),
  website: z.string().url(),
})

<FormWorkflow
  schema={schema}
  defaultValues={{ name: "", website: "" }}
  onSubmit={saveOrganization}
  warnOnUnsavedChanges
>
  <OrganizationFields />
</FormWorkflow>`

const api = [
  ["schema", "A Zod object schema used before submit or autosave.", "Required"],
  ["defaultValues", "Initial form values and reset target.", "Required"],
  ["onSubmit", "Async function returning a FormSubmissionResult.", "Required"],
  ["children", "Fields registered through useFormContext.", "Required"],
  ["mode", "Single-page or multi-step rendering.", '"single"'],
  ["autosave", "Debounced onSave callback, delay, and enabled flag.", "None"],
  [
    "warnOnUnsavedChanges",
    "Warn for page unload and clicked links while dirty.",
    "false",
  ],
  [
    "successBehavior",
    "Message, reset, or preserve behavior after success.",
    '"message"',
  ],
] as const

export default function FormWorkflowPage() {
  return (
    <article className="docs-article">
      <h1>FormWorkflow</h1>
      <p className="docs-lede">
        A form orchestration layer for the failure paths teams repeatedly
        rebuild: validation, server conflicts, focused summaries,
        duplicate-submit protection, draft recovery, unsaved changes, and step
        navigation.
      </p>

      <Suspense fallback={<div className="notice">Loading preview…</div>}>
        <FormWorkflowDemo />
      </Suspense>

      <h2>Installation</h2>
      <p>
        The CLI copies editable source and installs React Hook Form, its Zod
        resolver, and Zod. Elsecase is a shadcn registry, not a runtime package.
      </p>
      <CopyFormWorkflowInstallCommand />

      <h2>Basic usage</h2>
      <pre className="code-block">
        <code>{basicUsage}</code>
      </pre>

      <h2>API reference</h2>
      <div className="mt-6 overflow-x-auto rounded-md border">
        <table className="w-full min-w-2xl border-collapse text-left">
          <thead className="bg-muted/50 font-mono text-xs">
            <tr>
              <th className="border-b p-4">Prop</th>
              <th className="border-b p-4">Purpose</th>
              <th className="border-b p-4">Default</th>
            </tr>
          </thead>
          <tbody>
            {api.map(([name, purpose, defaultValue]) => (
              <tr key={name}>
                <td className="border-b p-4">
                  <code>{name}</code>
                </td>
                <td className="border-b p-4">{purpose}</td>
                <td className="border-b p-4">{defaultValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Submission result</h2>
      <pre className="code-block">
        <code>{`type FormSubmissionResult = {
  success: boolean
  message?: string
  fieldErrors?: Record<string, string>
  formError?: string
}`}</code>
      </pre>
      <p>
        Field errors are mapped back into React Hook Form. A form-level message
        and every field error appear in a focusable summary while the entered
        values stay intact.
      </p>

      <h2>Multi-step forms</h2>
      <p>
        Set <code>mode=&quot;multi-step&quot;</code> and wrap direct children in
        <code>FormWorkflowStep</code>. Each step declares the field paths it
        must validate before continuing; the final step owns submission.
      </p>

      <h2>Autosave and recovery</h2>
      <p>
        Autosave runs only after the current values pass the schema. The
        built-in status announces saving, success, and failure, and a failed
        draft exposes an explicit retry action.
      </p>

      <h2>Unsaved changes</h2>
      <p>
        The warning covers browser unloads and ordinary same-window anchor
        clicks. Router-specific programmatic navigation should be blocked by
        your routing layer because browsers do not expose one universal
        interception API.
      </p>

      <h2>Accessibility behavior</h2>
      <p>
        Invalid submissions move focus to a summary, summary actions focus the
        corresponding field, async statuses use live regions, steps use
        fieldsets and legends, and built-in actions meet a 44px minimum target.
      </p>

      <h2>Responsive behavior</h2>
      <p>
        Workflow actions stack at narrow widths, long summaries wrap, and the
        component imposes no fixed width. The application retains ownership of
        field layout and can collapse grids around the workflow.
      </p>

      <h2>Testing example</h2>
      <pre className="code-block">
        <code>{`fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
const summary = await screen.findByRole("alert")
await waitFor(() => expect(summary).toHaveFocus())
expect(onSubmit).not.toHaveBeenCalled()`}</code>
      </pre>

      <h2>Customization</h2>
      <p>
        FormWorkflow owns orchestration and its action/status surfaces. Your
        field components own labels, descriptions, inputs, and inline errors
        through
        <code>useFormContext</code>, so the copied source fits an existing
        design system.
      </p>

      <h2>Dependencies</h2>
      <p>
        React, <code>react-hook-form@^7.85.0</code>,
        <code>@hookform/resolvers@^5.8.0</code>, and <code>zod@^4.4.3</code>.
      </p>

      <h2>Known limitations</h2>
      <p>
        Version 0.1 supports Zod object schemas because registered form fields
        must have named paths. File upload transport, cross-tab draft merging,
        programmatic router guards, and remote step persistence remain
        application concerns.
      </p>

      <h2>Source</h2>
      <p>
        Review the implementation and tests on GitHub:
        <br />
        <a href="https://github.com/heysinghaaa/Elsecase/tree/main/registry/form-workflow">
          github.com/heysinghaaa/Elsecase/tree/main/registry/form-workflow
        </a>
      </p>
    </article>
  )
}
