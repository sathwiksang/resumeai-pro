import { describe, it, expect } from "vitest"
import {
  cn,
  scoreColor,
  scoreBgColor,
  scoreRingColor,
  gradeClass,
  truncate,
  initials,
  formatRelativeTime,
} from "./utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("handles conditionals", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz")
  })

  it("handles undefined and null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar")
  })
})

describe("scoreColor", () => {
  it("returns success for score >= 85", () => {
    expect(scoreColor(85)).toBe("text-success-600")
    expect(scoreColor(100)).toBe("text-success-600")
  })

  it("returns brand for score >= 70", () => {
    expect(scoreColor(70)).toBe("text-brand-600")
    expect(scoreColor(84)).toBe("text-brand-600")
  })

  it("returns warning for score >= 55", () => {
    expect(scoreColor(55)).toBe("text-warning-600")
    expect(scoreColor(69)).toBe("text-warning-600")
  })

  it("returns danger for score < 55", () => {
    expect(scoreColor(54)).toBe("text-danger-600")
    expect(scoreColor(0)).toBe("text-danger-600")
  })
})

describe("scoreBgColor", () => {
  it("returns appropriate bg colors", () => {
    expect(scoreBgColor(90)).toBe("bg-success-50")
    expect(scoreBgColor(75)).toBe("bg-brand-50")
    expect(scoreBgColor(60)).toBe("bg-warning-50")
    expect(scoreBgColor(30)).toBe("bg-danger-50")
  })
})

describe("scoreRingColor", () => {
  it("returns hex color for each range", () => {
    expect(scoreRingColor(90)).toBe("#059669")
    expect(scoreRingColor(75)).toBe("#2563EB")
    expect(scoreRingColor(60)).toBe("#D97706")
    expect(scoreRingColor(30)).toBe("#DC2626")
  })
})

describe("gradeClass", () => {
  it("maps grades to CSS classes", () => {
    expect(gradeClass("A+")).toBe("grade-a-plus")
    expect(gradeClass("A")).toBe("grade-a")
    expect(gradeClass("B+")).toBe("grade-b-plus")
    expect(gradeClass("B")).toBe("grade-b")
    expect(gradeClass("F")).toBe("grade-f")
  })

  it("returns grade-f for unknown grades", () => {
    expect(gradeClass("X")).toBe("grade-f")
  })
})

describe("truncate", () => {
  it("truncates strings longer than length", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...")
  })

  it("returns original string if within length", () => {
    expect(truncate("Hello", 10)).toBe("Hello")
  })

  it("handles exact length", () => {
    expect(truncate("Hello", 5)).toBe("Hello")
  })
})

describe("initials", () => {
  it("returns uppercase initials", () => {
    expect(initials("John", "Doe")).toBe("JD")
  })

  it("handles lowercase input", () => {
    expect(initials("john", "doe")).toBe("JD")
  })
})

describe("formatRelativeTime", () => {
  it("returns 'just now' for very recent dates", () => {
    const now = new Date().toISOString()
    expect(formatRelativeTime(now)).toBe("just now")
  })

  it("returns minutes for recent dates", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    expect(formatRelativeTime(fiveMinAgo)).toBe("5m ago")
  })

  it("returns hours for older dates", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(twoHoursAgo)).toBe("2h ago")
  })

  it("returns days for multi-day old dates", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(threeDaysAgo)).toBe("3d ago")
  })
})
