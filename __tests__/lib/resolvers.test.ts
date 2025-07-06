import { z } from "zod"
import { zodFormResolver } from "@/lib/resolvers"

// Define a simple schema for testing
const testSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(18, "Must be at least 18"),
})

describe("zodFormResolver", () => {
  const resolver = zodFormResolver(testSchema)

  it("should return validated values and no errors for valid data", () => {
    const validData = { name: "John Doe", age: 30 }
    const result = resolver(validData)

    expect(result.values).toEqual(validData)
    expect(result.errors).toEqual({})
  })

  it("should return an empty values object and formatted errors for invalid data", () => {
    const invalidData = { name: "", age: 17 }
    const result = resolver(invalidData)

    expect(result.values).toEqual({})
    expect(result.errors).toHaveProperty("name")
    expect(result.errors).toHaveProperty("age")
    expect(result.errors.name?.message).toBe("Name is required")
    expect(result.errors.age?.message).toBe("Must be at least 18")
  })

  it("should handle partial invalid data correctly", () => {
    const partialInvalidData = { name: "Jane Doe", age: 16 }
    const result = resolver(partialInvalidData)

    expect(result.values).toEqual({})
    expect(result.errors).not.toHaveProperty("name")
    expect(result.errors).toHaveProperty("age")
    expect(result.errors.age?.message).toBe("Must be at least 18")
  })

  it("should handle unexpected errors gracefully", () => {
    const faultySchema = {
      parse: () => {
        throw new Error("Unexpected parsing error")
      },
    } as any

    const faultyResolver = zodFormResolver(faultySchema)
    const result = faultyResolver({ name: "Test" })

    expect(result.values).toEqual({})
    expect(result.errors.root?.message).toContain("An unexpected error occurred")
  })
})
