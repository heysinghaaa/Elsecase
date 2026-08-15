"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { KeyboardEvent as ReactKeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Search } from "lucide-react"

const destinations = [
  { label: "Documentation", detail: "Overview", href: "/docs" },
  {
    label: "Getting started",
    detail: "Foundation",
    href: "/docs/getting-started",
  },
  {
    label: "Component catalogue",
    detail: "v0.1 scope",
    href: "/docs/components",
  },
] as const

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  const resetSearch = () => {
    setQuery("")
    setActiveIndex(0)
  }

  const openMenu = () => {
    resetSearch()
    setOpen(true)
  }

  const close = () => {
    resetSearch()
    setOpen(false)
    window.requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return destinations
    return destinations.filter((item) =>
      `${item.label} ${item.detail}`.toLowerCase().includes(normalizedQuery),
    )
  }, [query])

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setQuery("")
        setActiveIndex(0)
        setOpen(!open)
        if (open) {
          window.requestAnimationFrame(() => triggerRef.current?.focus())
        }
      }
    }

    window.addEventListener("keydown", onShortcut)
    return () => window.removeEventListener("keydown", onShortcut)
  }, [open])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  const select = (href: (typeof destinations)[number]["href"]) => {
    resetSearch()
    setOpen(false)
    router.push(href)
  }

  const onDialogKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault()
      close()
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((index) =>
        results.length ? (index + 1) % results.length : 0,
      )
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) =>
        results.length ? (index - 1 + results.length) % results.length : 0,
      )
    }

    if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault()
      select(results[activeIndex].href)
    }

    if (event.key === "Tab") {
      event.preventDefault()
      inputRef.current?.focus()
    }
  }

  return (
    <>
      <button
        aria-label="Search documentation"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="search-trigger"
        onClick={openMenu}
        ref={triggerRef}
        type="button"
      >
        <span className="search-trigger__label">
          <Search aria-hidden="true" size={16} />
          <span>Search documentation</span>
        </span>
        <span className="search-trigger__meta" aria-hidden="true">
          <kbd>⌘K</kbd>
        </span>
      </button>

      {open ? (
        <div
          aria-label="Search documentation"
          className="command-dialog"
          onKeyDown={onDialogKeyDown}
          role="dialog"
          aria-modal="true"
        >
          <button
            aria-label="Close search"
            className="command-dialog__backdrop"
            onClick={close}
            tabIndex={-1}
            type="button"
          />
          <div className="command-dialog__panel">
            <div className="command-dialog__field">
              <Search aria-hidden="true" size={18} />
              <input
                aria-label="Search documentation"
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActiveIndex(0)
                }}
                placeholder="Search documentation…"
                ref={inputRef}
                value={query}
              />
              <kbd aria-hidden="true">esc</kbd>
            </div>
            <div className="command-dialog__group" role="listbox">
              <p className="command-dialog__label">Documentation</p>
              {results.length ? (
                results.map((item, index) => (
                  <button
                    aria-selected={index === activeIndex}
                    className={`command-dialog__result ${index === activeIndex ? "is-active" : ""}`}
                    key={item.href}
                    onClick={() => select(item.href)}
                    onMouseEnter={() => setActiveIndex(index)}
                    role="option"
                    type="button"
                  >
                    <span>{item.label}</span>
                    <span>
                      {item.detail} <ArrowRight aria-hidden="true" size={12} />
                    </span>
                  </button>
                ))
              ) : (
                <p className="command-dialog__empty">No matching page.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
