import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import HomePage from '../page'

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />
}))

// Mock components
vi.mock('@/components/navigation', () => ({
  default: () => <nav data-testid="navigation">Navigation</nav>
}))

vi.mock('@/components/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>
}))

// Mock auth context to avoid authentication-related errors
vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('HomePage', () => {
  it('renders the main hero section with correct content', () => {
    render(<HomePage />)
    
    expect(screen.getByRole('heading', { name: /Inspire Your Homeschool Journey/i })).toBeInTheDocument()
    expect(screen.getByText(/Discover, organize, and share homeschool resources/)).toBeInTheDocument()
  })

  it('displays call-to-action buttons', () => {
    render(<HomePage />)
    
    expect(screen.getAllByRole('link', { name: /get started/i })).toHaveLength(2)
    expect(screen.getByRole('link', { name: /learn more/i })).toBeInTheDocument()
  })

  it('renders the watch video button without functionality', () => {
    render(<HomePage />)
    
    const watchVideoButton = screen.getByRole('button', { name: /video coming soon/i })
    expect(watchVideoButton).toBeInTheDocument()
    expect(watchVideoButton).toBeDisabled()
    expect(watchVideoButton).not.toHaveAttribute('onClick')
  })

  it('displays all four feature cards', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Curated Resources')).toBeInTheDocument()
    expect(screen.getByText('Community')).toBeInTheDocument()
    expect(screen.getByText('Planner')).toBeInTheDocument()
    expect(screen.getByText('Achievement')).toBeInTheDocument()
  })

  it('renders the final CTA section', () => {
    render(<HomePage />)
    
    expect(screen.getByText(/Ready to Transform Your Homeschool/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /get started for free/i })).toBeInTheDocument()
  })

  it('includes proper navigation and footer', () => {
    render(<HomePage />)
    
    expect(screen.getByTestId('navigation')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<HomePage />)
    
    // Check for proper heading hierarchy
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4)
    
    // Check for proper link accessibility
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveAttribute('href')
    })
  })

  it('displays hero image with proper alt text', () => {
    render(<HomePage />)
    
    const heroImage = screen.getByAltText(/child's desk with books/i)
    expect(heroImage).toBeInTheDocument()
    expect(heroImage).toHaveAttribute('src', '/images/atozfamily-hero.jpg')
  })
})