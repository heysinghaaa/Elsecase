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
        <strong>Foundation status</strong>
        <p>
          The documentation shell and registry contract are being established.
          Component source will be published one milestone at a time.
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
        Version 0.1 will not include authentication, persistence, paid plans, AI
        generation, framework adapters, or more than the three planned registry
        items.
      </p>
    </article>
  )
}
