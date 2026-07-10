import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { UsageBar } from "./UsageBar"

describe("UsageBar", () => {
  it("renders label and usage count", () => {
    render(<UsageBar used={3} limit={10} label="Resumes" />)
    expect(screen.getByText("Resumes")).toBeInTheDocument()
    expect(screen.getByText("3 / 10")).toBeInTheDocument()
  })

  it("shows infinity symbol for unlimited", () => {
    render(<UsageBar used={5} limit={-1} label="Analyses" />)
    expect(screen.getByText("5 / \u221e")).toBeInTheDocument()
  })

  it("renders progress bar for limited usage", () => {
    const { container } = render(<UsageBar used={5} limit={10} label="Resumes" />)
    const bar = container.querySelector("[style]")
    expect(bar).toBeInTheDocument()
    expect(bar?.getAttribute("style")).toContain("width: 50%")
  })

  it("uses green bar for unlimited", () => {
    const { container } = render(<UsageBar used={5} limit={-1} label="Test" />)
    const greenBar = container.querySelector(".bg-green-500")
    expect(greenBar).toBeInTheDocument()
  })

  it("uses red color for >= 90% usage", () => {
    const { container } = render(<UsageBar used={9} limit={10} label="Test" />)
    const redBar = container.querySelector(".bg-red-500")
    expect(redBar).toBeInTheDocument()
  })

  it("uses yellow color for >= 80% usage", () => {
    const { container } = render(<UsageBar used={8} limit={10} label="Test" />)
    const yellowBar = container.querySelector(".bg-yellow-500")
    expect(yellowBar).toBeInTheDocument()
  })

  it("uses indigo color for normal usage", () => {
    const { container } = render(<UsageBar used={3} limit={10} label="Test" />)
    const indigoBar = container.querySelector(".bg-indigo-500")
    expect(indigoBar).toBeInTheDocument()
  })

  it("caps percentage at 100%", () => {
    const { container } = render(<UsageBar used={15} limit={10} label="Test" />)
    const bar = container.querySelector("[style]")
    expect(bar?.getAttribute("style")).toContain("width: 100%")
  })

  it("applies custom className", () => {
    const { container } = render(<UsageBar used={1} limit={5} label="Test" className="mt-4" />)
    expect(container.firstChild).toHaveClass("mt-4")
  })
})
