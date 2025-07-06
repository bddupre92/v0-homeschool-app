import type React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AIResearchPhase from "@/components/ai-research-phase"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock the useToast hook
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock the fetch API
global.fetch = jest.fn()

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

const renderWithClient = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient()
  return render(<QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>)
}

describe("AIResearchPhase", () => {
  const onResearchComplete = jest.fn()

  beforeEach(() => {
    // Reset mocks before each test
    onResearchComplete.mockClear()
    ;(fetch as jest.Mock).mockClear()
  })

  it("renders the form with all fields", () => {
    renderWithClient(<AIResearchPhase onResearchComplete={onResearchComplete} />)

    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/grade level/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/key topics or interests/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /start research/i })).toBeInTheDocument()
  })

  it("shows validation errors for empty fields on submit", async () => {
    const user = userEvent.setup()
    renderWithClient(<AIResearchPhase onResearchComplete={onResearchComplete} />)

    await user.click(screen.getByRole("button", { name: /start research/i }))

    expect(await screen.findByText("Subject is required")).toBeInTheDocument()
    expect(await screen.findByText("Grade level is required")).toBeInTheDocument()
    expect(await screen.findByText("Please specify topics of interest.")).toBeInTheDocument()
    expect(onResearchComplete).not.toHaveBeenCalled()
  })

  it("submits the form and calls onResearchComplete on successful API response", async () => {
    const user = userEvent.setup()
    const mockResponse = [{ title: "Test Resource", url: "https://example.com", snippet: "A great resource." }]
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    renderWithClient(<AIResearchPhase onResearchComplete={onResearchComplete} />)

    // Fill out the form
    await user.click(screen.getByLabelText(/subject/i))
    await user.click(await screen.findByText("Science"))

    await user.click(screen.getByLabelText(/grade level/i))
    await user.click(await screen.findByText("Grade 5"))

    await user.type(screen.getByLabelText(/key topics or interests/i), "Photosynthesis")

    // Submit the form
    await user.click(screen.getByRole("button", { name: /start research/i }))

    // Check for loading state
    expect(screen.getByRole("button", { name: /researching/i })).toBeDisabled()

    // Wait for the mutation to complete and check the result
    await waitFor(() => {
      expect(onResearchComplete).toHaveBeenCalledWith(
        {
          subject: "Science",
          grade: "5",
          topics: "Photosynthesis",
        },
        mockResponse,
      )
    })
  })
})
