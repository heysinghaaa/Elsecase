"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  {
    title: "Foundation",
    items: [
      { href: "/docs", label: "Overview" },
      { href: "/docs/getting-started", label: "Getting started" },
    ],
  },
  {
    title: "Registry",
    items: [
      { href: "/docs/components", label: "Component catalogue" },
      { href: "/docs/components/async-state", label: "AsyncState" },
      {
        href: "/docs/components/data-explorer",
        label: "ResponsiveDataExplorer",
      },
    ],
  },
] as const

function DocsNavigation() {
  const pathname = usePathname()

  return (
    <nav className="docs-nav" aria-label="Documentation">
      {navigation.map((group) => (
        <div className="docs-nav__group" key={group.title}>
          <p className="docs-nav__title">{group.title}</p>
          {group.items.map((item) => (
            <Link
              aria-current={pathname === item.href ? "page" : undefined}
              className="docs-nav__link"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  )
}

export function DocsShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="docs-mobile-nav">
        <details>
          <summary>Documentation menu</summary>
          <DocsNavigation />
        </details>
      </div>
      <div className="docs-shell">
        <aside className="docs-sidebar">
          <DocsNavigation />
        </aside>
        <main className="docs-content" id="main-content">
          {children}
        </main>
      </div>
    </>
  )
}
