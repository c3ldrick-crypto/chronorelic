import type { Metadata, Viewport } from "next"
import { Orbitron, Space_Grotesk } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const orbitron = Orbitron({
  subsets:  ["latin"],
  variable: "--font-display",
  weight:   ["400", "500", "600", "700", "800", "900"],
  display:  "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets:  ["latin"],
  variable: "--font-body",
  weight:   ["300", "400", "500", "600", "700"],
  display:  "swap",
})

export const metadata: Metadata = {
  title: {
    default:  "ChronoRelic — RPG du Temps",
    template: "%s | ChronoRelic",
  },
  description:
    "Capturez chaque minute du temps comme une relique. Un RPG de collection unique basé sur le temps réel.",
  keywords:  ["RPG", "jeu", "temps", "collection", "relique", "historique"],
  authors:   [{ name: "ChronoRelic" }],
}

export const viewport: Viewport = {
  themeColor:   "#06050d",
  colorScheme:  "dark",
  width:        "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${orbitron.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body
        className="nebula-bg stars-bg min-h-screen antialiased"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#171428",
              border:     "1px solid rgba(155, 93, 229, 0.3)",
              color:      "#e2e8f0",
            },
          }}
        />
      </body>
    </html>
  )
}
