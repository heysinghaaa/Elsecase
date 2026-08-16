import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { StateWorkbench } from "@/components/site/state-workbench"

const registryItems = [
  {
    index: "01",
    name: "AsyncState",
    href: "/docs/components/async-state",
    command: "@elsecase/async-state",
    description:
      "One boundary for initial loading, refreshing, empty data, request failure, offline access, permissions, and success.",
    coverage: "8 states · retry protection · live regions",
    specimen: "async",
  },
  {
    index: "02",
    name: "ResponsiveDataExplorer",
    href: "/docs/components/data-explorer",
    command: "@elsecase/data-explorer",
    description:
      "A complete local-data workflow with search, filters, sorting, selection, pagination, URL state, tables, and mobile cards.",
    coverage: "Table + cards · controlled state · URL restore",
    specimen: "data",
  },
  {
    index: "03",
    name: "FormWorkflow",
    href: "/docs/components/form-workflow",
    command: "@elsecase/form-workflow",
    description:
      "Form orchestration for client validation, server conflicts, focused summaries, autosave recovery, unsaved changes, and steps.",
    coverage: "Single + multi-step · autosave · server errors",
    specimen: "form",
  },
] as const

const commitments = [
  {
    term: "States",
    description:
      "Loading, refreshing, empty, error, offline, forbidden, recovery, and long-content behavior are product requirements.",
  },
  {
    term: "Accessibility",
    description:
      "Keyboard behavior, focus, announcements, reduced motion, and automated axe checks are part of the component contract.",
  },
  {
    term: "Ownership",
    description:
      "Every item installs as editable source through the shadcn CLI. Elsecase never becomes a proprietary runtime dependency.",
  },
] as const

function RegistrySpecimen({
  kind,
}: {
  kind: (typeof registryItems)[number]["specimen"]
}) {
  if (kind === "async") {
    return (
      <div className="catalogue-specimen__async" aria-hidden="true">
        <span>loading</span>
        <span>empty</span>
        <span className="is-active">error</span>
        <span>offline</span>
        <span>forbidden</span>
        <span>success</span>
      </div>
    )
  }

  if (kind === "data") {
    return (
      <div className="catalogue-specimen__data" aria-hidden="true">
        <div>
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
        </div>
        <div>
          <strong>AL</strong>
          <span>Admin</span>
          <i>Active</i>
        </div>
        <div>
          <strong>GH</strong>
          <span>Member</span>
          <i>Invited</i>
        </div>
        <div>
          <strong>MH</strong>
          <span>Member</span>
          <i>Active</i>
        </div>
      </div>
    )
  }

  return (
    <div className="catalogue-specimen__form" aria-hidden="true">
      <span>Organization name</span>
      <strong>Northstar Labs</strong>
      <span>Website</span>
      <strong>northstar.example</strong>
      <i>Changes save automatically</i>
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="home-main catalogue-home" id="main-content">
      <section className="catalogue-intro" aria-labelledby="hero-title">
        <div>
          <p className="catalogue-intro__inventory">
            Three workflows · v0.1 · source-owned
          </p>
          <h1 id="hero-title">Build every else case.</h1>
        </div>
        <div className="catalogue-intro__copy">
          <p>
            Elsecase is a shadcn-compatible registry for the production paths
            that appear after a clean mockup: failed requests, zero results,
            narrow screens, server conflicts, retries, and recovery.
          </p>
          <Link className="text-link" href="/docs/getting-started">
            Install from the registry{" "}
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </section>

      <section
        className="catalogue-inventory"
        aria-labelledby="inventory-title"
      >
        <h2 id="inventory-title">Available now</h2>
        <div className="catalogue-grid">
          {registryItems.map((item) => (
            <article className="catalogue-card" key={item.name}>
              <div className="catalogue-card__specimen">
                <RegistrySpecimen kind={item.specimen} />
              </div>
              <div className="catalogue-card__meta">
                <span>{item.index}</span>
                <span>Available</span>
              </div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <p className="catalogue-card__coverage">{item.coverage}</p>
              <code>{item.command}</code>
              <Link className="catalogue-card__link" href={item.href}>
                Open component <ArrowRight aria-hidden="true" size={15} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="catalogue-probe" aria-labelledby="probe-title">
        <div className="catalogue-probe__heading">
          <h2 id="probe-title">Change the state. Keep the contract.</h2>
          <p>
            This is the real AsyncState registry source, not a screenshot.
            Switch conditions and use recovery exactly as a consuming
            application would.
          </p>
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
