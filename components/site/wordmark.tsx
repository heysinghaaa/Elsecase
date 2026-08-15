import Link from "next/link"

export function Wordmark() {
  return (
    <Link className="wordmark" href="/" aria-label="Elsecase home">
      <span className="wordmark__mark" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span>Elsecase</span>
    </Link>
  )
}
