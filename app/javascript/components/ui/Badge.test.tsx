import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Badge } from "./Badge"

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText("Active")).toBeInTheDocument()
  })

  it("applies default variant classes", () => {
    render(<Badge>Test</Badge>)
    const badge = screen.getByText("Test")
    expect(badge.className).toContain("bg-brand-50")
  })

  it("applies specified variant", () => {
    render(<Badge variant="success">Done</Badge>)
    const badge = screen.getByText("Done")
    expect(badge.className).toContain("bg-success-50")
  })

  it("applies danger variant", () => {
    render(<Badge variant="danger">Error</Badge>)
    const badge = screen.getByText("Error")
    expect(badge.className).toContain("bg-danger-50")
  })

  it("renders dot when dot prop is true", () => {
    const { container } = render(<Badge dot>Status</Badge>)
    const dot = container.querySelector(".rounded-full")
    expect(dot).toBeInTheDocument()
  })

  it("does not render dot by default", () => {
    const { container } = render(<Badge>Status</Badge>)
    const dots = container.querySelectorAll(".h-1\\.5")
    expect(dots.length).toBe(0)
  })

  it("applies size classes", () => {
    render(<Badge size="lg">Large</Badge>)
    const badge = screen.getByText("Large")
    expect(badge.className).toContain("text-sm")
  })

  it("applies custom className", () => {
    render(<Badge className="ml-2">Custom</Badge>)
    const badge = screen.getByText("Custom")
    expect(badge.className).toContain("ml-2")
  })
})
