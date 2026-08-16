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
        Elsecase copies editable workflow source into an existing shadcn
        project. There is no Elsecase runtime package to keep updated.
      </p>

      <h2>Configure the registry alias</h2>
      <p>
        Add the mapping to your project&apos;s <code>components.json</code>:
      </p>
      <pre className="code-block">
        <code>{`{
  "registries": {
    "@elsecase": "https://elsecase.vercel.app/r/{name}.json"
  }
}`}</code>
      </pre>

      <h2>Install a workflow</h2>
      <pre className="code-block">
        <code>{`pnpm dlx shadcn@latest add @elsecase/async-state
pnpm dlx shadcn@latest add @elsecase/data-explorer
pnpm dlx shadcn@latest add @elsecase/form-workflow`}</code>
      </pre>
      <p>
        Use one command at a time. The CLI installs peer source and package
        dependencies declared by that registry item.
      </p>

      <h2>Local development</h2>
      <pre className="code-block">
        <code>{`pnpm install
pnpm dev`}</code>
      </pre>

      <h2>Repository checks</h2>
      <pre className="code-block">
        <code>{`pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm registry:validate
pnpm build`}</code>
      </pre>
    </article>
  )
}
