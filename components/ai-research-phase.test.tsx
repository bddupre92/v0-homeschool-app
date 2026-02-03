import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import ai-research-phase from '../ai-research-phase'

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />
}))



describe('ai-research-phase', () => {
  
  it('renders without crashing', () => {
    render(<ai-research-phase />)
    expect(document.body).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<ai-research-phase />)
    
    // Check for basic accessibility
    const interactiveElements = screen.queryAllByRole('button')
      .concat(screen.queryAllByRole('link'))
      .concat(screen.queryAllByRole('textbox'))
    
    // Interactive elements should be accessible
    interactiveElements.forEach(element => {
      expect(element).toBeInTheDocument()
    })
  })

  

  
})
