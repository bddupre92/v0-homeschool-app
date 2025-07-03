import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient()

export async function apiRequest(method: string, url: string, data?: any) {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  })

  if (!response.ok) {
    const error: any = new Error("An error occurred while fetching the data.")
    try {
      error.info = await response.json()
    } catch (e) {
      error.info = { message: "Failed to parse error response." }
    }
    error.status = response.status
    throw error
  }

  return response
}
