import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button } from "./Button"

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument()
  })

  it("handles click events", async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await userEvent.click(screen.getByRole("button"))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("is disabled when loading", () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("shows spinner when loading", () => {
    const { container } = render(<Button loading>Loading</Button>)
    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
    expect(svg?.classList.toString()).toContain("animate-spin")
  })

  it("applies primary variant by default", () => {
    render(<Button>Primary</Button>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("bg-brand")
  })

  it("applies danger variant", () => {
    render(<Button variant="danger">Delete</Button>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("bg-danger")
  })

  it("applies ghost variant", () => {
    render(<Button variant="ghost">Ghost</Button>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("hover:bg-surface-elevated")
  })

  it("applies size classes", () => {
    render(<Button size="lg">Large</Button>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("h-12")
  })

  it("applies custom className", () => {
    render(<Button className="w-full">Full</Button>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("w-full")
  })

  it("does not trigger click when disabled", async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>No Click</Button>)
    await userEvent.click(screen.getByRole("button"))
    expect(onClick).not.toHaveBeenCalled()
  })
})
