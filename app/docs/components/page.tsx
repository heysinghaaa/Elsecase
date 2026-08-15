import type { Metadata } from "next"
import Link from "next/link"

const components = [
  ["AsyncState", "Available", "Async content and recovery states"],
  [
    "ResponsiveDataExplorer",
    "Milestone 3",
    "Responsive data-management workflows",
  ],
  ["FormWorkflow", "Milestone 4", "Validated and recoverable forms"],
] as const

export const metadata: Metadata = {
  title: "Component catalogue",
  description: "The three registry items planned for Elsecase v0.1.",
}

export default function ComponentsPage() {
  return (
    <article className="docs-article">
      <h1>Component catalogue</h1>
      <p className="docs-lede">
        Version 0.1 is deliberately limited to three production workflows. Their
        status remains visible instead of being disguised as finished work.
      </p>

      <dl className="spec-list">
        {components.map(([name, status, purpose]) => (
          <div className="spec-row" key={name}>
            <dt>{name}</dt>
            <dd>
              <strong>{status}</strong>
              <br />
              {purpose}
            </dd>
          </div>
        ))}
      </dl>

      <p>
        <Link className="text-link" href="/docs/components/async-state">
          Open the AsyncState documentation
        </Link>
      </p>
    </article>
  )
}
