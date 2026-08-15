# Elsecase — Project Specification

## 1. Project Summary

Build an open-source, shadcn-compatible React component registry focused on production application states and workflows.

The project will not compete with conventional libraries by recreating buttons, cards, dialogs, or inputs. Its differentiator is providing complete, accessible patterns for conditions that generated frontend code frequently overlooks:

- Loading and background refreshing
- Empty results
- API and validation errors
- Offline conditions
- Permission restrictions
- Slow networks
- Responsive data presentation
- Retry and recovery workflows
- Accessible user feedback

### Product statement

> Production-ready React patterns for everything beyond the happy path.

### Primary objective

Create a hero project that demonstrates advanced capabilities in:

- React component architecture
- TypeScript API design
- Responsive interfaces
- Accessibility
- Asynchronous state management
- Form architecture
- Testing and continuous integration
- Technical documentation
- Open-source library design
- Developer experience

### Project identity

- Project folder: `Elsecase`
- Product name: `Elsecase`
- Product tagline: `Production-ready React patterns for every else case.`
- Public domain target: `elsecase.dev`
- Do not use `StateKit`; that name is already occupied
- License: MIT

---

## 2. Target Audience

The initial users are:

- React and Next.js developers
- Developers using shadcn/ui
- Freelancers building SaaS dashboards
- Agencies repeatedly building portals and admin panels
- Small product teams without a dedicated design-system team
- Developers reviewing or improving AI-generated frontend code

### Primary user problem

Existing tools generate attractive interfaces for successful scenarios, but developers still repeatedly implement error, loading, empty, permission, validation, mobile, and recovery states.

The registry should make these production states installable, customizable, testable, and visible.

---

## 3. Product Boundaries

### Version 0.1 includes

1. `AsyncState`
2. `ResponsiveDataExplorer`
3. `FormWorkflow`
4. Interactive documentation website
5. Failure-state simulator
6. shadcn-compatible registry endpoints
7. Automated tests and CI
8. Public Vercel deployment
9. Installation verification in a clean Next.js project

### Version 0.1 excludes

- Basic UI primitives
- Vue or Svelte support
- Separate npm component package
- User authentication
- Database persistence
- Paid plans
- Theme marketplace
- Figma plugin
- MCP server
- Drag-and-drop page builder
- AI component generation
- Supabase-specific components
- More than three registry components

Do not begin post-MVP features until version 0.1 satisfies every release criterion.

---

## 4. Technology Decisions

Use:

- Next.js App Router
- React
- Strict TypeScript
- Tailwind CSS
- shadcn/ui
- Radix primitives where accessibility behavior is complex
- Zod
- React Hook Form
- TanStack Table
- Storybook
- Vitest
- Testing Library
- Playwright
- axe accessibility testing
- GitHub Actions
- pnpm
- Vercel

### Distribution

Components will be distributed through a shadcn-compatible source registry:

```bash
pnpm dlx shadcn@latest add @elsecase/async-state
pnpm dlx shadcn@latest add @elsecase/data-explorer
pnpm dlx shadcn@latest add @elsecase/form-workflow
```

The `@elsecase` namespace is the public registry alias.

Consumers receive editable component source code. Do not create a runtime dependency on a proprietary component package.

### Architecture

Use one repository and one Next.js application. Do not introduce Turborepo for version 0.1.

Suggested structure:

```text
production-ui-registry/
├── app/
│   ├── (marketing)/
│   ├── docs/
│   ├── playground/
│   └── r/
├── components/
│   ├── docs/
│   ├── playground/
│   └── shared/
├── registry/
│   ├── async-state/
│   ├── data-explorer/
│   └── form-workflow/
├── examples/
│   ├── dashboard/
│   ├── user-management/
│   └── settings/
├── lib/
├── tests/
│   ├── accessibility/
│   ├── integration/
│   └── e2e/
├── .storybook/
├── registry.json
├── components.json
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## 5. Design Direction

The visual system should feel technical, calm, precise, and intentionally restrained.

### Principles

- Documentation-first presentation
- Neutral palette with one recognizable accent
- High information density without visual clutter
- Clear state transitions
- Strong typography and spacing
- Light and dark themes
- Responsive from 320px upward
- Minimal decorative animation
- Motion used only to clarify state changes
- No generic gradient-heavy “AI product” appearance

### Documentation layout

Use:

- Persistent desktop sidebar
- Mobile documentation navigation
- Component preview area
- Configuration panel
- Code and installation tabs
- Accessibility and testing sections
- Copy-command controls
- Viewport switcher
- Theme switcher

---

## 6. Public Component Interfaces

## 6.1 AsyncState

Provide a declarative boundary for asynchronous content.

```tsx
type AsyncStatus =
  | "idle"
  | "loading"
  | "refreshing"
  | "empty"
  | "success"
  | "error"
  | "offline"
  | "forbidden"

interface AsyncStateProps {
  status: AsyncStatus
  children: React.ReactNode
  loading?: React.ReactNode
  empty?: React.ReactNode
  error?: React.ReactNode | ((error: unknown) => React.ReactNode)
  offline?: React.ReactNode
  forbidden?: React.ReactNode
  refreshingIndicator?: React.ReactNode
  errorValue?: unknown
  onRetry?: () => void | Promise<void>
  preserveContentWhileRefreshing?: boolean
  className?: string
}
```

Required behavior:

- Render the correct state without layout instability
- Preserve successful content during background refresh by default
- Provide accessible status announcements
- Avoid announcing decorative skeleton elements
- Disable repeated retry actions while a retry is pending
- Allow consumers to replace every visual state
- Never assume a particular data-fetching library

Required demonstrations:

- Initial loading
- Slow loading
- Successful response
- Empty response
- Failed request
- Successful retry
- Offline state
- Forbidden state
- Background refresh with stale content
- Mobile layout
- Excessively long content

---

## 6.2 ResponsiveDataExplorer

Provide a responsive data-management pattern built on TanStack Table.

```tsx
interface DataExplorerProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  getRowId: (row: TData) => string
  status?: AsyncStatus
  error?: unknown
  search?: DataExplorerSearchConfig<TData>
  filters?: DataExplorerFilterConfig<TData>[]
  pagination?: DataExplorerPagination
  sorting?: SortingState
  selection?: RowSelectionState
  mobileCard: (row: TData) => React.ReactNode
  bulkActions?: React.ReactNode
  emptyState?: React.ReactNode
  noResultsState?: React.ReactNode
  onRetry?: () => void | Promise<void>
  onPaginationChange?: (pagination: DataExplorerPagination) => void
  onSortingChange?: (sorting: SortingState) => void
  onSelectionChange?: (selection: RowSelectionState) => void
  syncStateToUrl?: boolean
}
```

Required behavior:

- Render a semantic table on desktop
- Render accessible cards on smaller screens
- Support local data in version 0.1
- Expose controlled pagination and sorting interfaces suitable for server data
- Distinguish “no data” from “no matching results”
- Synchronize supported filters, search, sorting, and page state to the URL
- Preserve unrelated query parameters
- Restore state correctly through browser navigation
- Reset pagination when filters change
- Provide a bulk-action surface only when rows are selected
- Support keyboard-accessible controls
- Handle loading, refreshing, empty, error, and offline states

Required example:

A user-management dashboard containing:

- Avatar
- Name
- Email
- Role
- Status
- Last activity
- Search
- Role and status filters
- Sorting
- Pagination
- Row selection
- Bulk status action
- Mobile-card transformation

---

## 6.3 FormWorkflow

Provide a structured form workflow using React Hook Form and Zod.

```tsx
interface FormWorkflowProps<TSchema extends z.ZodType> {
  schema: TSchema
  defaultValues: z.input<TSchema>
  onSubmit: (values: z.output<TSchema>) => Promise<FormSubmissionResult>
  children: React.ReactNode
  mode?: "single" | "multi-step"
  autosave?: FormAutosaveConfig<z.output<TSchema>>
  warnOnUnsavedChanges?: boolean
  successBehavior?: "message" | "reset" | "preserve"
}

interface FormSubmissionResult {
  success: boolean
  message?: string
  fieldErrors?: Record<string, string>
  formError?: string
}
```

Required behavior:

- Perform client validation through Zod
- Support asynchronous server submission
- Map server errors back to fields
- Show a form-level error summary
- Move focus to the error summary after failed submission
- Prevent duplicate submissions
- Preserve entered values after server failure
- Announce submission and success states accessibly
- Warn before leaving with unsaved changes
- Support optional debounced autosave
- Show saving, saved, and failed-autosave states
- Support single-page and multi-step examples

Required example:

An organization-settings form containing:

- Organization name
- Website
- Industry
- Description
- Notification preferences
- Logo input placeholder
- Client validation
- Simulated duplicate-name server error
- Autosave
- Unsaved-change warning
- Successful submission state

---

## 7. Interactive Failure Simulator

The documentation site must include a shared simulator capable of controlling examples without editing code.

Controls:

```text
Network delay:       0 / 500 / 1500 / 3000 / 5000 ms
Response state:      Success / Empty / Error / Malformed
Connection:          Online / Offline
Permission:          Admin / Member / Denied
Viewport:            Desktop / Tablet / Mobile
Content length:      Normal / Long / Extreme
Record count:        0 / 5 / 25 / 100
Retry result:        Success / Failure
Theme:               Light / Dark / System
```

Simulator requirements:

- Use deterministic fixtures
- Never call an external API
- Allow states to be reproduced through a shareable URL
- Reset cleanly to default conditions
- Display the current simulated scenario
- Work with keyboard navigation
- Avoid placing simulator-only logic inside distributable registry components

---

## 8. Documentation Requirements

Every component page must contain:

1. Purpose
2. Interactive preview
3. Installation command
4. Basic usage
5. API reference
6. State and edge-case examples
7. Accessibility behavior
8. Responsive behavior
9. Testing example
10. Customization example
11. Dependencies
12. Known limitations
13. Source-code link

### Homepage sections

- Product proposition
- Live interactive demonstration
- Problem explanation
- Three MVP components
- Installation example
- Quality commitments
- Architecture explanation
- GitHub call to action

### README

The root README must include:

- Product purpose
- Live documentation link
- Component catalogue
- Installation instructions
- Technology stack
- Local development commands
- Testing commands
- Registry architecture
- Contribution workflow
- Roadmap
- License
- Honest project status

Do not display fake adoption numbers, testimonials, downloads, companies, or GitHub statistics.

---

## 9. Accessibility Requirements

Components should target WCAG 2.2 AA behavior.

Verify:

- Complete keyboard operation
- Visible focus indicators
- Semantic headings and landmarks
- Accessible form names and descriptions
- Error association through ARIA
- Status announcements through appropriate live regions
- No unnecessary repeated announcements
- Screen-reader-compatible loading states
- Sufficient text and control contrast
- Touch targets appropriate for mobile
- Reduced-motion preference
- Focus restoration after dialogs or temporary workflows
- Error summary focus after submission failure

Use Radix primitives for complex focus and keyboard behavior rather than recreating them.

---

## 10. Testing Strategy

### Unit tests

Test:

- State-to-rendered-output mapping
- Retry behavior
- Refresh preservation
- Form validation
- Server-error mapping
- Autosave transitions
- Filtering and sorting helpers
- URL-state serialization
- Pagination resets
- Controlled state callbacks

### Component interaction tests

Test:

- Search and filter behavior
- Column sorting
- Row selection
- Bulk-action visibility
- Mobile-card rendering
- Form submission
- Retry transitions
- Multi-step navigation
- Keyboard operation

### Accessibility tests

Run axe against:

- Every component state
- Light and dark themes
- Desktop and mobile examples
- Validation errors
- Empty and failure states
- Selected-row and bulk-action states

### End-to-end tests

Verify:

- Registry items can be installed in a clean test application
- Installed components compile
- Documentation navigation works
- Simulator URLs restore the intended state
- Mobile and desktop demos behave correctly
- Theme selection persists
- Copy-install controls contain correct commands

### CI gates

A pull request cannot pass unless:

- Formatting check succeeds
- ESLint succeeds
- Type checking succeeds
- Unit tests succeed
- Component tests succeed
- Accessibility tests succeed
- Production build succeeds
- Registry schema validation succeeds

Run full Playwright tests on the main branch and release candidates.

---

## 11. Implementation Sequence

### Milestone 1 — Foundation

Status: complete locally. Verified across the production build, Storybook,
registry schema, unit/accessibility tests, browser tests, and responsive layouts.
The configured CI workflow still needs its first hosted pull-request run.

- Initialize the Next.js project
- Enable strict TypeScript
- Configure Tailwind and shadcn/ui
- Establish design tokens
- Add light and dark themes
- Configure the registry
- Add linting, formatting, testing, Storybook, and CI
- Create the documentation shell
- Add the initial README and MIT license

Acceptance:

- Application builds
- Storybook runs
- Registry schema validates
- CI runs on a sample pull request
- Documentation shell works on mobile and desktop

### Milestone 2 — AsyncState

- Finalize its public interface
- Implement all required states
- Add accessible announcements
- Add customizable default views
- Build deterministic examples
- Connect the failure simulator
- Add unit, interaction, and accessibility tests
- Publish its documentation page

Acceptance:

- Every status has a verified demonstration
- Retry cannot be triggered repeatedly while pending
- Refreshing content remains visible by default
- Registry installation succeeds in a clean project

### Milestone 3 — ResponsiveDataExplorer

- Build the controlled data interface
- Add desktop table and mobile cards
- Add search, filters, sorting, pagination, and selection
- Add URL synchronization
- Integrate AsyncState
- Build the user-management example
- Add tests and documentation

Acceptance:

- All controls work with keyboard input
- URL state survives reload and browser navigation
- Mobile presentation remains fully usable
- Empty data and empty search results are distinct
- Registry installation succeeds independently

### Milestone 4 — FormWorkflow

- Build the React Hook Form and Zod integration
- Implement client and server errors
- Add accessible error summary
- Add submission protection
- Add autosave and unsaved-change handling
- Add multi-step example
- Add tests and documentation

Acceptance:

- Invalid submissions focus the error summary
- Field values survive server failures
- Duplicate submissions are prevented
- Autosave failure is visible and recoverable
- Registry installation succeeds independently

### Milestone 5 — Documentation and release

- Complete homepage
- Finish the shared simulator
- Add API tables and code examples
- Test all installation commands
- Complete repository documentation
- Deploy to Vercel
- Tag `v0.1.0`
- Record the walkthrough
- Write the portfolio case study

Acceptance:

- Public documentation is operational
- All CI gates pass
- Every registry item installs into a clean project
- No placeholder or fabricated content remains
- The product proposition is understandable from the homepage
- GitHub repository and portfolio entry link to the live documentation

---

## 12. Twelve-Day Delivery Schedule

### Day 1

Project foundation, registry setup, testing configuration, documentation shell, design tokens.

### Days 2–3

`AsyncState`, simulator integration, tests, and documentation.

### Days 4–6

`ResponsiveDataExplorer`, responsive adaptation, URL state, tests, and documentation.

### Days 7–8

`FormWorkflow`, validation, server errors, autosave, tests, and documentation.

### Days 9–10

Homepage, component documentation, simulator refinement, responsive polish.

### Day 11

Clean-project installation testing, CI verification, accessibility audit, production deployment.

### Day 12

Release, walkthrough video, case study, GitHub presentation, portfolio and Upwork updates.

If quality slips, reduce optional examples rather than weakening component behavior or tests.

---

## 13. Release and Portfolio Deliverables

Produce:

- Public GitHub repository
- Public documentation website
- Three installable registry components
- Versioned `v0.1.0` release
- Changelog
- Architecture diagram
- Database-free deterministic examples
- Test and accessibility evidence
- 60–90 second demonstration video
- Technical case study
- Upwork portfolio entry
- Updated personal portfolio entry

### Suggested portfolio title

**Production UI Registry — Resilient React Components for Real Application States**

### Suggested short description

> An open-source, shadcn-compatible React registry providing accessible patterns for asynchronous states, responsive data exploration, form validation, API failures, recovery workflows, and mobile behavior. Built with Next.js, TypeScript, Storybook, Vitest and Playwright.

---

## 14. Post-MVP Roadmap

Only begin after `v0.1.0` is released.

### Version 0.2

- `PermissionGate`
- `FileUploadWorkflow`
- `ActivityTimeline`

### Version 0.3

- `OptimisticAction`
- `ConfirmationWorkflow`
- `NotificationCenter`
- `FilterBuilder`

### Version 0.4

- Supabase adapters
- TanStack Query adapters
- Next.js Server Action examples
- Additional production dashboard blocks

Do not promise dates for post-MVP versions in the initial release.

---

## 15. Final Success Criteria

The project succeeds when:

- Developers can install all three components using the shadcn CLI
- Components work in a clean Next.js application
- Every important state is visually demonstrable
- Tests verify behavior rather than only snapshots
- Accessibility checks pass
- Documentation explains the component APIs and engineering decisions
- Mobile layouts are genuinely functional
- The repository contains professional release and contribution documentation
- The project can credibly support proposals for design systems, component libraries, dashboards, frontend architecture, accessibility and production React work

Initial success is not measured by stars or downloads. Its first purpose is to provide strong, verifiable evidence of advanced frontend engineering.

---

## 16. Instructions for the New Codex Chat

Use this opening request:

> Read `PROJECT_PLAN.md` completely and treat it as the implementation specification. Begin with Milestone 1 only: inspect the empty project, propose the exact initialization and architecture steps, then implement the approved foundation. Do not implement AsyncState or later milestones until the foundation passes its acceptance criteria. Preserve the MVP boundaries and do not add unplanned features.

After Milestone 1 is verified, continue one milestone at a time. Each milestone must finish with:

- Type checking
- Tests
- Production build
- Visual verification
- Accessibility verification where applicable
- Updated documentation
- A concise implementation report
