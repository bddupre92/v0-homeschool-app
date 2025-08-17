import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { useAuth } from '@/contexts/auth-context'
import BoardsPage from '@/app/boards/page'

// Mock the auth context
vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn(),
}))

// Mock the server action
vi.mock('@/app/actions/board-actions', () => ({
  createBoard: vi.fn(),
}))

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}))

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

// Mock the protected route component
vi.mock('@/components/auth/protected-route', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

// Mock the navigation component
vi.mock('@/components/navigation', () => ({
  default: () => <nav data-testid="navigation">Navigation</nav>
}))

describe('BoardsPage', () => {
  const mockUser = {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuth as any).mockReturnValue({
      user: mockUser,
      loading: false,
    })
  })

  it('renders the boards page with correct title and description', () => {
    render(<BoardsPage />)
    
    expect(screen.getByText('My Boards')).toBeInTheDocument()
    expect(screen.getByText(/Create and organize collections/)).toBeInTheDocument()
  })

  it('displays sample boards in grid view by default', () => {
    render(<BoardsPage />)
    
    expect(screen.getByText('Science Experiments')).toBeInTheDocument()
    expect(screen.getByText('Math Games')).toBeInTheDocument()
    expect(screen.getByText('History Timeline')).toBeInTheDocument()
  })

  it('allows switching between grid and list view', () => {
    render(<BoardsPage />)
    
    const listViewButton = screen.getByRole('button', { name: /list view/i })
    fireEvent.click(listViewButton)
    
    // In list view, boards should still be visible but with different layout
    expect(screen.getByText('Science Experiments')).toBeInTheDocument()
  })

  it('filters boards based on search query', () => {
    render(<BoardsPage />)
    
    const searchInput = screen.getByPlaceholderText('Search boards...')
    fireEvent.change(searchInput, { target: { value: 'Science' } })
    
    expect(screen.getByText('Science Experiments')).toBeInTheDocument()
    expect(screen.queryByText('Math Games')).not.toBeInTheDocument()
  })

  it('opens create board dialog when New Board button is clicked', () => {
    render(<BoardsPage />)
    
    const newBoardButton = screen.getByRole('button', { name: /new board/i })
    fireEvent.click(newBoardButton)
    
    expect(screen.getByText('Create New Board')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
  })

  it('validates required title field in create board form', async () => {
    const { toast } = await import('@/hooks/use-toast')
    
    render(<BoardsPage />)
    
    const newBoardButton = screen.getByRole('button', { name: /new board/i })
    fireEvent.click(newBoardButton)
    
    const createButton = screen.getByRole('button', { name: /create board/i })
    fireEvent.click(createButton)
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "Validation Error",
        description: "Please enter a board title",
        variant: "destructive",
      })
    })
  })

  it('successfully creates a board with valid data', async () => {
    const { createBoard } = await import('@/app/actions/board-actions')
    const { toast } = await import('@/hooks/use-toast')
    
    ;(createBoard as any).mockResolvedValue({ success: true, id: 'new-board-id' })
    
    render(<BoardsPage />)
    
    const newBoardButton = screen.getByRole('button', { name: /new board/i })
    fireEvent.click(newBoardButton)
    
    const titleInput = screen.getByLabelText('Title')
    const descriptionInput = screen.getByLabelText('Description')
    
    fireEvent.change(titleInput, { target: { value: 'Test Board' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } })
    
    const createButton = screen.getByRole('button', { name: /create board/i })
    fireEvent.click(createButton)
    
    await waitFor(() => {
      expect(createBoard).toHaveBeenCalledWith(expect.any(FormData))
      expect(toast).toHaveBeenCalledWith({
        title: "Success",
        description: "Board created successfully!",
      })
    })
  })

  it('handles server action errors gracefully', async () => {
    const { createBoard } = await import('@/app/actions/board-actions')
    const { toast } = await import('@/hooks/use-toast')
    
    ;(createBoard as any).mockResolvedValue({ 
      success: false, 
      error: 'Database connection failed' 
    })
    
    render(<BoardsPage />)
    
    const newBoardButton = screen.getByRole('button', { name: /new board/i })
    fireEvent.click(newBoardButton)
    
    const titleInput = screen.getByLabelText('Title')
    fireEvent.change(titleInput, { target: { value: 'Test Board' } })
    
    const createButton = screen.getByRole('button', { name: /create board/i })
    fireEvent.click(createButton)
    
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "Error",
        description: "Database connection failed",
        variant: "destructive",
      })
    })
  })

  it('shows empty state when no boards match search', () => {
    render(<BoardsPage />)
    
    const searchInput = screen.getByPlaceholderText('Search boards...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
    
    expect(screen.getByText('No boards found')).toBeInTheDocument()
    expect(screen.getByText(/No boards match your search/)).toBeInTheDocument()
  })

  it('disables form during board creation', async () => {
    const { createBoard } = await import('@/app/actions/board-actions')
    
    // Mock a slow server action
    ;(createBoard as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
    )
    
    render(<BoardsPage />)
    
    const newBoardButton = screen.getByRole('button', { name: /new board/i })
    fireEvent.click(newBoardButton)
    
    const titleInput = screen.getByLabelText('Title')
    fireEvent.change(titleInput, { target: { value: 'Test Board' } })
    
    const createButton = screen.getByRole('button', { name: /create board/i })
    fireEvent.click(createButton)
    
    // Button should show loading state
    expect(screen.getByText('Creating...')).toBeInTheDocument()
    expect(createButton).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
  })
})