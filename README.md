# Elsecase

Production-ready React workflows for every else case.

[Live documentation](https://elsecase.vercel.app) ·
[Component catalogue](https://elsecase.vercel.app/docs) ·
[v0.1.0 release](https://github.com/heysinghaaa/Elsecase/releases/tag/v0.1.0) ·
[MIT license](./LICENSE)

Elsecase is an open-source, shadcn-compatible registry for the application
conditions that rarely fit inside a primitive component: loading, refreshing,
empty data, request failures, offline behavior, permission restrictions,
responsive data workflows, server validation, autosave, retry, and recovery.

It installs editable source into your project. There is no Elsecase runtime
dependency, theme lock-in, or black box between your application and the code.

## Catalogue

| Workflow                 | Use it for                                                                                   | Documentation                                                          |
| ------------------------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `AsyncState`             | Loading, refreshing, empty, error, offline, forbidden, and success states                    | [Open docs](https://elsecase.vercel.app/docs/components/async-state)   |
| `ResponsiveDataExplorer` | Search, filters, sorting, pagination, selection, URL state, desktop tables, and mobile cards | [Open docs](https://elsecase.vercel.app/docs/components/data-explorer) |
| `FormWorkflow`           | Client and server validation, autosave, unsaved changes, recovery, and multi-step forms      | [Open docs](https://elsecase.vercel.app/docs/components/form-workflow) |

## Install

Install a component directly through the shadcn CLI:

```bash
pnpm dlx shadcn@latest add https://elsecase.vercel.app/r/async-state.json
pnpm dlx shadcn@latest add https://elsecase.vercel.app/r/data-explorer.json
pnpm dlx shadcn@latest add https://elsecase.vercel.app/r/form-workflow.json
```

The data explorer installs its `AsyncState` registry dependency. Form workflow
installs React Hook Form, the Zod resolver, and Zod.

### Use the `@elsecase` namespace

Register the public URL template once:

```bash
pnpm dlx shadcn@latest registry add @elsecase=https://elsecase.vercel.app/r/{name}.json
```

Then install by namespace:

```bash
pnpm dlx shadcn@latest add @elsecase/async-state
pnpm dlx shadcn@latest add @elsecase/data-explorer
pnpm dlx shadcn@latest add @elsecase/form-workflow
```

You can inspect a registry item before installing it:

```bash
pnpm dlx shadcn@latest view @elsecase/form-workflow
```

## Why Elsecase

Primitive libraries solve visual building blocks. Elsecase focuses on the
orchestration around them:

- Distinguishing initial loading from background refresh.
- Preserving useful content and entered values while requests are in flight.
- Making empty data, filtered-out data, permission failures, and network errors
  different states.
- Keeping data tools usable on narrow screens without turning a semantic table
  into horizontal overflow.
- Returning server conflicts to the correct fields and a focused error summary.
- Providing explicit retry, autosave, duplicate-request, and unsaved-change
  behavior.

The components are intentionally application-agnostic. Authentication,
persistence, routing policy, and backend adapters remain under the consuming
application's control.

## Quality contract

Elsecase v0.1 is verified with:

- Strict TypeScript and ESLint.
- 58 unit and accessibility tests with Testing Library and axe.
- 28 Playwright checks across desktop and mobile behavior.
- Keyboard, focus, URL-state, responsive-overflow, and recovery scenarios.
- Production and Storybook builds in CI.
- Clean installation and production builds in fresh Next.js projects.

The complete evidence is documented in [release evidence](./docs/release-evidence.md).

## Local development

```bash
pnpm install
pnpm dev
```

Run the complete local quality suite:

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

## Architecture

Registry source, documentation, examples, tests, and generated shadcn-compatible
JSON live in one Next.js application. Consumers receive editable source rather
than a proprietary runtime dependency.

Read the [architecture](./docs/architecture.md),
[technical case study](./docs/case-study.md), and
[changelog](./CHANGELOG.md) for the design decisions and release history.

## Contributing

Bug reports, accessibility findings, documentation improvements, and focused
component refinements are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md)
before opening a pull request. Please discuss new workflow proposals before
implementing them.

## Technology

Next.js App Router, React, strict TypeScript, Tailwind CSS, shadcn/ui, Vitest,
Testing Library, Playwright, axe, Storybook, React Hook Form, Zod, TanStack
Table, pnpm, and GitHub Actions.

## License

[MIT](./LICENSE)
