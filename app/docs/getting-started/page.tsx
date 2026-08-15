import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Getting started",
  description: "Set up the Elsecase project locally.",
}

export default function GettingStartedPage() {
  return (
    <article className="docs-article">
      <h1>Getting started</h1>
      <p className="docs-lede">
        The foundation is a single Next.js application that serves both the
        documentation and the shadcn-compatible registry.
      </p>

      <h2>Local development</h2>
      <pre className="code-block">
        <code>{`pnpm install
pnpm dev`}</code>
      </pre>

      <h2>Foundation checks</h2>
      <pre className="code-block">
        <code>{`pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm registry:validate
pnpm build`}</code>
      </pre>

      <div className="notice">
        <strong>Installation commands are not public yet</strong>
        <p>
          Registry commands will be documented only after each item passes
          clean-project installation verification.
        </p>
      </div>
    </article>
  )
}
