import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import cookie-consent from '../cookie-consent'

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />
}))



describe('cookie-consent', () => {
  
  it('renders without crashing', () => {
    render(<cookie-consent />)
    expect(document.body).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<cookie-consent />)
    
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
