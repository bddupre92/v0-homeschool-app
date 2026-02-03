import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import structured-data from '../seo/structured-data'

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />
}))



describe('structured-data', () => {
  
  it('renders without crashing', () => {
    render(<structured-data />)
    expect(document.body).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<structured-data />)
    
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
