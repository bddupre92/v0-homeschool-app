import { ZodError, type ZodSchema } from "zod"
import type { FieldErrors, Resolver } from "react-hook-form"

// This function takes a Zod schema and returns a resolver compatible with React Hook Form.
// It is now fully synchronous to prevent unhandled promise rejections.
export const zodFormResolver = <T extends ZodSchema>(schema: T): Resolver<any> => {
  return (values) => {
    try {
      // Using synchronous `parse` instead of `parseAsync`
      const validatedData = schema.parse(values)
      return {
        values: validatedData,
        errors: {},
      }
    } catch (error) {
      if (error instanceof ZodError) {
        // If validation fails, format the errors for React Hook Form
        const fieldErrors: FieldErrors = {}
        for (const issue of error.issues) {
          if (issue.path.length > 0) {
            const fieldName = issue.path[0] as string
            if (!fieldErrors[fieldName]) {
              fieldErrors[fieldName] = { type: issue.code, message: issue.message }
            }
          }
        }
        return {
          values: {},
          errors: fieldErrors,
        }
      }
      // For any other unexpected errors
      console.error("An unexpected error occurred during validation:", error)
      return {
        values: {},
        errors: {
          root: {
            message: "An unexpected error occurred during validation.",
          },
        },
      }
    }
  }
}
