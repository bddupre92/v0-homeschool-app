// Custom error classes for better error handling

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message, 400)
    this.errors = errors
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "You don't have permission to perform this action") {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests. Please try again later") {
    super(message, 429)
  }
}

// Error response formatter for API routes
export interface ErrorResponse {
  error: string
  message: string
  statusCode: number
  errors?: Record<string, string[]>
  stack?: string
}

export function formatErrorResponse(error: unknown): ErrorResponse {
  // Handle AppError instances
  if (error instanceof AppError) {
    const response: ErrorResponse = {
      error: error.name,
      message: error.message,
      statusCode: error.statusCode,
    }

    if (error instanceof ValidationError) {
      response.errors = error.errors
    }

    // Include stack trace in development
    if (process.env.NODE_ENV === "development") {
      response.stack = error.stack
    }

    return response
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      error: "InternalServerError",
      message: error.message || "An unexpected error occurred",
      statusCode: 500,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    }
  }

  // Handle unknown errors
  return {
    error: "UnknownError",
    message: "An unexpected error occurred",
    statusCode: 500,
  }
}

// Helper to send error responses in API routes
export function sendErrorResponse(error: unknown) {
  const errorResponse = formatErrorResponse(error)

  return Response.json(errorResponse, {
    status: errorResponse.statusCode,
  })
}
