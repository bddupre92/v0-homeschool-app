import { render, screen } from "@testing-library/react"
import Footer from "@/components/footer"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock Next.js Link component
jest.mock("next/link", () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>
  }
})

describe("Footer", () => {
  it("renders the footer with navigation links and social media icons", () => {
    render(<Footer />)

    // Check for key text content
    expect(screen.getByText("AtoZ Family")).toBeInTheDocument()
    expect(screen.getByText(/Discover, organize, and share homeschool resources./i)).toBeInTheDocument()
    expect(screen.getByText(/© .* AtoZ Family. All rights reserved./i)).toBeInTheDocument()

    // Check for navigation links
    expect(screen.getByRole("link", { name: /about/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /resources/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /community/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /privacy policy/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /terms of service/i })).toBeInTheDocument()

    // Check for social media links by their accessible name (title)
    expect(screen.getByTitle(/twitter/i)).toBeInTheDocument()
    expect(screen.getByTitle(/facebook/i)).toBeInTheDocument()
    expect(screen.getByTitle(/instagram/i)).toBeInTheDocument()
  })
})
