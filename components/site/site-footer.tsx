import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="site-footer__line">
        <span>Elsecase · MIT licensed · three installable workflows</span>
        <span className="site-footer__links">
          <Link href="/docs">Documentation</Link>
          <a href="https://github.com/heysinghaaa/Elsecase">GitHub</a>
        </span>
      </p>
    </footer>
  )
}
