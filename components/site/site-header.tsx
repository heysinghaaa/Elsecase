import Link from "next/link"

import { CommandMenu } from "@/components/site/command-menu"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { Wordmark } from "@/components/site/wordmark"

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Wordmark />
        <CommandMenu />
        <div className="header-actions">
          <Link className="header-link" href="/docs">
            Documentation
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
