import type { ReactNode } from "react"
import type { Metadata, Viewport } from "next"
import { IBM_Plex_Mono, Instrument_Sans } from "next/font/google"

import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { ThemeProvider } from "@/components/site/theme-provider"

import "./globals.css"

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://elsecase.vercel.app"),
  title: {
    default: "Elsecase — React patterns beyond the happy path",
    template: "%s · Elsecase",
  },
  description:
    "Production-ready React patterns for loading, empty, error, offline, permission, responsive, and recovery states.",
  openGraph: {
    title: "Elsecase",
    description: "Production-ready React patterns for every else case.",
    type: "website",
  },
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "oklch(98% 0.006 248)" },
    { media: "(prefers-color-scheme: dark)", color: "oklch(16% 0.014 248)" },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <body className={`${instrumentSans.variable} ${ibmPlexMono.variable}`}>
        <ThemeProvider>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <SiteHeader />
          {children}
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  )
}
