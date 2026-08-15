# Elsecase

Production-ready React patterns for every else case.

Elsecase is an open-source, shadcn-compatible registry focused on application
conditions that are often left until the end: loading, empty data, request
errors, offline behavior, permission restrictions, responsive data workflows,
validation failures, retry, and recovery.

## Project status

Milestone 1 is complete locally. The application foundation, documentation
shell, registry pipeline, Storybook, tests, and CI workflow are in place. The
workflow still needs its first hosted pull-request run after a remote repository
is connected. No registry component is published yet; installation commands
will only be documented after each item passes clean-project verification.

## Planned v0.1 catalogue

- `AsyncState`
- `ResponsiveDataExplorer`
- `FormWorkflow`

No additional registry items will be added before these three meet their release
criteria.

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

Elsecase uses one Next.js application. Registry source will live beside the
documentation and be compiled into shadcn-compatible JSON under `public/r`.
Consumers receive editable source code instead of a proprietary runtime
dependency.

The public registry alias is `@elsecase`. It is reserved in `components.json`,
but component commands are intentionally withheld until the corresponding item
passes installation verification.

## Technology

Next.js App Router, React, strict TypeScript, Tailwind CSS, shadcn/ui, Vitest,
Testing Library, Playwright, axe, Storybook, pnpm, and GitHub Actions.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). The scope for v0.1 is intentionally
narrow; discuss additions before implementing them.

## Roadmap

1. Foundation and documentation shell
2. `AsyncState`
3. `ResponsiveDataExplorer`
4. `FormWorkflow`
5. Documentation, installation verification, and v0.1 release

## License

[MIT](./LICENSE)
