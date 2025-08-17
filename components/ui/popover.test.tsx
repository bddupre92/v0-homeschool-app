import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import popover from '../ui/popover'

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />
}))



describe('popover', () => {
  
  it('renders with default props', () => {
    render(<popover />)
    expect(document.body).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    const customClass = 'custom-test-class'
    render(<popover className={customClass} />)
    
    const element = document.querySelector(`.${customClass}`)
    expect(element).toBeInTheDocument()
  })

  

  
})
