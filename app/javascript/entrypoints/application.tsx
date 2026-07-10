import { createInertiaApp } from "@inertiajs/react"
import { createRoot } from "react-dom/client"
import "../css/application.css"

// Eager-load all page components from the pages directory
const pages = import.meta.glob("../pages/**/*.tsx", { eager: true }) as Record<
  string,
  { default: React.ComponentType }
>

function resolvePage(name: string) {
  const path = `../pages/${name}.tsx`
  const page = pages[path]
  if (!page) {
    throw new Error(
      `Page not found: ${name}. Available pages: ${Object.keys(pages).join(", ")}`
    )
  }
  return page.default
}

createInertiaApp({
  title: (title) => (title ? `${title} — ResumeAI Pro` : "ResumeAI Pro"),
  resolve: resolvePage,
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
})
