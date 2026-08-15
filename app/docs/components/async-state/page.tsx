import type { Metadata } from "next"
import { Suspense } from "react"

import {
  AsyncStateDemo,
  CopyInstallCommand,
} from "@/components/docs/async-state-demo"

export const metadata: Metadata = {
  title: "AsyncState",
  description:
    "A declarative React boundary for loading, refreshing, empty, error, offline, forbidden, and successful content.",
}

const basicUsage = `import { AsyncState } from "@/components/async-state"

<AsyncState
  status={status}
  errorValue={error}
  onRetry={refetch}
>
  <UserList users={users} />
</AsyncState>`

export default function AsyncStatePage() {
  return (
    <article className="docs-article">
      <h1>AsyncState</h1>
      <p className="docs-lede">
        A data-library-agnostic boundary that makes loading, recovery, empty,
        offline, permission, and background-refresh behavior explicit.
      </p>

      <Suspense fallback={<div className="notice">Loading preview…</div>}>
        <AsyncStateDemo />
      </Suspense>

      <h2>Installation</h2>
      <p>
        The CLI copies editable source into your project. Elsecase does not add
        a proprietary runtime package.
      </p>
      <CopyInstallCommand />

      <h2>Basic usage</h2>
      <pre className="code-block">
        <code>{basicUsage}</code>
      </pre>

      <h2>API reference</h2>
      <div className="mt-6 overflow-x-auto rounded-md border">
        <table className="w-full min-w-2xl border-collapse text-left">
          <thead className="bg-muted/50 font-mono text-xs">
            <tr>
              <th className="border-b p-4">Prop</th>
              <th className="border-b p-4">Purpose</th>
              <th className="border-b p-4">Default</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b p-4">
                <code>status</code>
              </td>
              <td className="border-b p-4">The active asynchronous state.</td>
              <td className="border-b p-4">Required</td>
            </tr>
            <tr>
              <td className="border-b p-4">
                <code>children</code>
              </td>
              <td className="border-b p-4">Successful or idle content.</td>
              <td className="border-b p-4">Required</td>
            </tr>
            <tr>
              <td className="border-b p-4">
                <code>loading</code>, <code>empty</code>
              </td>
              <td className="border-b p-4">Custom loading and empty views.</td>
              <td className="border-b p-4">Built-in views</td>
            </tr>
            <tr>
              <td className="border-b p-4">
                <code>error</code>
              </td>
              <td className="border-b p-4">
                A node or renderer receiving <code>errorValue</code>.
              </td>
              <td className="border-b p-4">Built-in error</td>
            </tr>
            <tr>
              <td className="border-b p-4">
                <code>offline</code>, <code>forbidden</code>
              </td>
              <td className="border-b p-4">
                Custom connection and permission views.
              </td>
              <td className="border-b p-4">Built-in views</td>
            </tr>
            <tr>
              <td className="border-b p-4">
                <code>onRetry</code>
              </td>
              <td className="border-b p-4">
                Synchronous or asynchronous recovery callback.
              </td>
              <td className="border-b p-4">None</td>
            </tr>
            <tr>
              <td className="p-4">
                <code>preserveContentWhileRefreshing</code>
              </td>
              <td className="p-4">
                Keeps stale successful content mounted during refresh.
              </td>
              <td className="p-4">
                <code>true</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>States and edge cases</h2>
      <p>
        The simulator covers initial and slow loading, success, empty results,
        failed requests, retry success or failure, offline and forbidden views,
        stale-content refreshes, narrow viewports, and extreme content length.
        Its query string makes each configuration shareable.
      </p>

      <h2>Accessibility behavior</h2>
      <p>
        Loading and refreshing use polite live regions and{" "}
        <code>aria-busy</code>. Errors, offline states, and permission failures
        use assertive alerts. Decorative skeletons are hidden from assistive
        technology, and retry is natively disabled while its promise is pending.
      </p>

      <h2>Responsive behavior</h2>
      <p>
        AsyncState does not impose a content width. Its defaults work at 320px,
        and preserved content remains controlled by the consumer layout.
      </p>

      <h2>Testing example</h2>
      <pre className="code-block">
        <code>{`render(<AsyncState status="error" onRetry={retry}>Content</AsyncState>)
fireEvent.click(screen.getByRole("button", { name: "Try again" }))
expect(retry).toHaveBeenCalledOnce()`}</code>
      </pre>

      <h2>Customization</h2>
      <pre className="code-block">
        <code>{`<AsyncState
  status="empty"
  empty={<EmptySearchResults clearFilters={clearFilters} />}
>
  <Results />
</AsyncState>`}</code>
      </pre>

      <h2>Dependencies</h2>
      <p>
        React only. Default styling uses semantic Tailwind tokens created by
        shadcn initialization; there is no runtime dependency on Elsecase.
      </p>

      <h2>Known limitations</h2>
      <p>
        AsyncState does not fetch data, classify network errors, or manage cache
        state. Consumers map their data library’s state into the status union.
      </p>

      <h2>Source</h2>
      <p>
        Review the implementation in the public GitHub repository:
        <br />
        <a href="https://github.com/heysinghaaa/Elsecase/tree/main/registry/async-state">
          github.com/heysinghaaa/Elsecase/tree/main/registry/async-state
        </a>
      </p>
    </article>
  )
}
