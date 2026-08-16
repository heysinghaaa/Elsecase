import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Documentation",
  description: "Learn how Elsecase approaches production application states.",
}

export default function DocsPage() {
  return (
    <article className="docs-article">
      <h1>Design the state, not just the screen.</h1>
      <p className="docs-lede">
        Elsecase is an open-source, shadcn-compatible registry for the loading,
        empty, error, offline, permission, responsive, and recovery workflows
        that production interfaces need.
      </p>

      <div className="notice">
        <strong>Version 0.1 catalogue is available</strong>
        <p>
          AsyncState, ResponsiveDataExplorer, and FormWorkflow install as
          editable source through the shadcn CLI. Each page includes a live,
          deterministic simulator and its public command.
        </p>
      </div>

      <h2>What belongs here</h2>
      <p>
        Elsecase provides complete patterns instead of basic visual primitives.
        Buttons, inputs, and dialogs continue to come from shadcn/ui. Elsecase
        composes those primitives into tested application behavior.
      </p>

      <h2>What does not belong here</h2>
      <p>
        Version 0.1 does not include authentication, persistence, paid plans, AI
        generation, framework adapters, or low-level visual primitives. Those
        remain application or shadcn/ui concerns.
      </p>
    </article>
  )
}
