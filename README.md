# Elsecase

Production-ready React patterns for every else case.

Elsecase is an open-source, shadcn-compatible registry focused on application
conditions that are often left until the end: loading, empty data, request
errors, offline behavior, permission restrictions, responsive data workflows,
validation failures, retry, and recovery.

Live documentation: [elsecase.vercel.app](https://elsecase.vercel.app)

## Project status

`AsyncState` and `ResponsiveDataExplorer` are installable registry components.
The application foundation, documentation shell, registry pipeline, Storybook,
automated tests, and CI workflow are operational. `FormWorkflow` remains planned
work rather than a finished component.

## Version 0.1 catalogue

- `AsyncState` — available
- `ResponsiveDataExplorer` — available
- `FormWorkflow` — planned

No additional registry items will be added before these three meet their release
criteria.

## Install AsyncState

```bash
pnpm dlx shadcn@latest add https://elsecase.vercel.app/r/async-state.json
```

The command copies editable source into the consuming project. It does not add
an Elsecase runtime dependency.

To use the shorter namespace command, add this registry mapping to the consuming
project's `components.json`:

```json
{
  "registries": {
    "@elsecase": "https://elsecase.vercel.app/r/{name}.json"
  }
}
```

Then run:

```bash
pnpm dlx shadcn@latest add @elsecase/async-state
```

## Install ResponsiveDataExplorer

```bash
pnpm dlx shadcn@latest add https://elsecase.vercel.app/r/data-explorer.json
```

The registry item installs its AsyncState dependency and the compatible
TanStack Table version. With the namespace mapping above, the shorter command
is:

```bash
pnpm dlx shadcn@latest add @elsecase/data-explorer
```

## Local development

```bash
pnpm install
pnpm dev
```

The application runs at `http://localhost:3000`.

## Quality checks

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm registry:validate
pnpm storybook:build
pnpm build
```

Playwright tests run on the main branch and release candidates:

```bash
pnpm exec playwright install chromium webkit
pnpm test:e2e
```

## Registry architecture

Elsecase uses one Next.js application. Registry source lives beside the
documentation and is compiled into shadcn-compatible JSON under `public/r`.
Consumers receive editable source code instead of a proprietary runtime
dependency.

The public registry alias is `@elsecase`, mapped to
`https://elsecase.vercel.app/r/{name}.json`.

## Technology

Next.js App Router, React, strict TypeScript, Tailwind CSS, shadcn/ui, Vitest,
Testing Library, Playwright, axe, Storybook, pnpm, and GitHub Actions.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). The scope for v0.1 is intentionally
narrow; discuss additions before implementing them.

## Roadmap

1. Foundation and documentation shell — complete
2. `AsyncState` — available
3. `ResponsiveDataExplorer` — available
4. `FormWorkflow`
5. Documentation, installation verification, and v0.1 release

## License

[MIT](./LICENSE)
