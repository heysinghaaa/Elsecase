# Version 0.1 release evidence

This record describes the checks required on the release commit. Command output
is produced locally and repeated by GitHub Actions from a clean checkout.

## Automated gates

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm registry:validate
pnpm storybook:build
pnpm build
pnpm test:e2e
```

The test suite covers component behavior and axe accessibility checks. Playwright
runs the public workflows in desktop Chromium and a mobile viewport, including
focus recovery, URL restoration, responsive overflow, and install commands.

Release-candidate execution on 2026-08-16:

- 58 component and accessibility tests passed across eight test files.
- 28 Playwright checks passed across desktop Chromium and a mobile project.
- Registry generation, Storybook, and the production Next.js build completed.

## Clean installation contract

Each public item is verified in a newly created shadcn project using its deployed
URL, followed by TypeScript and production-build checks:

```bash
pnpm dlx shadcn@latest add https://elsecase.vercel.app/r/async-state.json
pnpm dlx shadcn@latest add https://elsecase.vercel.app/r/data-explorer.json
pnpm dlx shadcn@latest add https://elsecase.vercel.app/r/form-workflow.json
```

`data-explorer` resolves `async-state` through the registry dependency graph.
`form-workflow` installs React Hook Form, the Zod resolver, and Zod from its item
metadata.

All three items were installed independently from the locally generated registry
into fresh Next.js 16.3.1 and shadcn 4.18.0 projects. Each disposable project
then passed TypeScript and a production build. The same URL checks are repeated
against Vercel after the release commit deploys.

## Manual review contract

- Homepage proposition identifies the audience, source-ownership model, and three
  available workflows without invented adoption or performance claims.
- Documentation contains installation, usage, API, states, accessibility,
  responsive behavior, testing, customization, dependencies, limitations, and
  source links.
- Responsive review covers 320, 375, 414, and 768 CSS-pixel widths.
- Public registry JSON and documentation routes return successfully after Vercel
  deploys the release commit.
