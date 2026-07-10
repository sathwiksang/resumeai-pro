import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { UpgradeBanner } from "./UpgradeBanner"

// Mock @inertiajs/react
vi.mock("@inertiajs/react", () => ({
  router: { visit: vi.fn() },
}))

describe("UpgradeBanner", () => {
  it("renders the message", () => {
    render(<UpgradeBanner message="You've hit the limit" plan="free" />)
    expect(screen.getByText("You've hit the limit")).toBeInTheDocument()
  })

  it("renders the upgrade button with plan name", () => {
    render(<UpgradeBanner message="Limit reached" plan="free" />)
    expect(screen.getByRole("button", { name: "Upgrade from free" })).toBeInTheDocument()
  })

  it("renders warning icon", () => {
    const { container } = render(<UpgradeBanner message="Test" plan="free" />)
    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
  })

  it("applies amber styling", () => {
    const { container } = render(<UpgradeBanner message="Test" plan="free" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain("border-amber-200")
    expect(wrapper.className).toContain("bg-amber-50")
  })

  it("navigates to billing on click", async () => {
    const { router } = await import("@inertiajs/react")
    const { default: userEvent } = await import("@testing-library/user-event")
    render(<UpgradeBanner message="Test" plan="free" />)
    await userEvent.click(screen.getByRole("button"))
    expect(router.visit).toHaveBeenCalledWith("/admin/billing")
  })

  it("applies custom className", () => {
    const { container } = render(<UpgradeBanner message="Test" plan="free" className="mb-4" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain("mb-4")
  })
})
