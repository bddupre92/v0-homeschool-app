import { ZodError, type ZodSchema } from "zod"
import type { FieldErrors, Resolver } from "react-hook-form"

// This function takes a Zod schema and returns a resolver compatible with React Hook Form.
export const zodFormResolver =
  <T extends ZodSchema>(schema: T): Resolver<any> =>
  async (values) => {
    try {
      // Validate the form values against the schema
      const validatedData = await schema.parseAsync(values)
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
