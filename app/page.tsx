import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { StateWorkbench } from "@/components/site/state-workbench"

const commitments = [
  {
    term: "States",
    description:
      "Loading, refreshing, empty, error, offline, forbidden, recovery, and long-content behavior are treated as product requirements.",
  },
  {
    term: "Accessibility",
    description:
      "Keyboard behavior, focus, announcements, reduced motion, and WCAG 2.2 AA checks are part of the component contract.",
  },
  {
    term: "Ownership",
    description:
      "Every registry item installs as editable source. Elsecase does not become a proprietary runtime dependency.",
  },
] as const

export default function HomePage() {
  return (
    <main className="home-main" id="main-content">
      <section className="hero-workbench" aria-labelledby="hero-title">
        <div className="hero-workbench__copy">
          <h1 id="hero-title">Build every else case.</h1>
          <p className="hero-workbench__lede">
            Production-ready React patterns for the loading, empty, error,
            offline, permission, and recovery states real users eventually meet.
          </p>
          <div className="hero-actions">
            <Link className="button-primary" href="/docs/getting-started">
              Read the foundation <ArrowRight aria-hidden="true" size={16} />
            </Link>
            <Link className="text-link" href="/docs/components">
              View the v0.1 catalogue
            </Link>
          </div>
        </div>
        <StateWorkbench />
      </section>

      <section className="foundation-section" aria-labelledby="standard-title">
        <div>
          <h2 id="standard-title">The state is part of the interface.</h2>
        </div>
        <dl className="spec-list">
          {commitments.map((commitment) => (
            <div className="spec-row" key={commitment.term}>
              <dt>{commitment.term}</dt>
              <dd>{commitment.description}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  )
}
