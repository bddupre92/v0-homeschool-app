import { describe, expect, it } from "vitest"
import { isValidZip, lookupZip } from "@/lib/zipcodes"

describe("isValidZip", () => {
  it.each([
    ["10001", true],
    ["00501", true],
    ["1234", false],
    ["123456", false],
    ["abcde", false],
    ["", false],
    ["10001-1234", false],
  ])("isValidZip(%s) === %s", (input, expected) => {
    expect(isValidZip(input)).toBe(expected)
  })
})

describe("lookupZip", () => {
  it.each([
    ["10001", { city: "New York", state: "NY" }],
    ["90210", { city: "Beverly Hills", state: "CA" }],
    ["55105", { city: "Saint Paul", state: "MN" }],
    ["33101", { city: "Miami", state: "FL" }],
    ["98101", { city: "Seattle", state: "WA" }],
  ])("resolves %s to a real US city", (zip, expected) => {
    const result = lookupZip(zip)
    expect(result).not.toBeNull()
    expect(result!.zip).toBe(zip)
    expect(result!.city).toBe(expected.city)
    expect(result!.state).toBe(expected.state)
    expect(typeof result!.lat).toBe("number")
    expect(typeof result!.lng).toBe("number")
  })

  it("returns null for invalid ZIPs", () => {
    expect(lookupZip("abcde")).toBeNull()
    expect(lookupZip("1234")).toBeNull()
    expect(lookupZip("")).toBeNull()
  })

  it("returns null for unassigned ZIPs", () => {
    expect(lookupZip("99999")).toBeNull()
  })

  it("ignores ZIP+4 suffix", () => {
    // Should treat the 5-digit prefix as the lookup key.
    const result = lookupZip("10001-1234")
    expect(result).not.toBeNull()
    expect(result!.zip).toBe("10001")
  })
})
