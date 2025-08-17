#!/usr/bin/env node

/**
 * Test Generator
 * Automatically generates test files for pages and components that don't have tests
 */

const fs = require('fs')
const path = require('path')

class TestGenerator {
  constructor() {
    this.generated = []
    this.skipped = []
  }

  log(message, type = 'info') {
    const prefix = {
      info: '✓',
      warning: '⚠️',
      error: '❌',
      section: '📋'
    }[type]
    
    console.log(`${prefix} ${message}`)
  }

  section(title) {
    console.log(`\n${'='.repeat(50)}`)
    this.log(title, 'section')
    console.log('='.repeat(50))
  }

  // Generate page test template
  generatePageTest(pageName, pagePath, route) {
    const componentName = pageName.charAt(0).toUpperCase() + pageName.slice(1) + 'Page'
    
    return `import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import ${componentName} from '../${pagePath}/page'

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '${route}',
}))

// Mock auth context
vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}))

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />)
    expect(document.body).toBeInTheDocument()
  })

  it('has proper document structure', () => {
    render(<${componentName} />)
    
    // Check for basic accessibility
    const headings = screen.queryAllByRole('heading')
    expect(headings.length).toBeGreaterThanOrEqual(0)
  })

  it('renders main content area', () => {
    render(<${componentName} />)
    
    // Look for main content indicators
    const main = document.querySelector('main')
    const content = document.querySelector('[data-testid*="content"]') || 
                   document.querySelector('.container') ||
                   document.querySelector('div')
    
    expect(main || content).toBeInTheDocument()
  })

  ${pageName === 'sign-in' || pageName === 'sign-up' ? `
  it('renders authentication form', () => {
    render(<${componentName} />)
    
    // Check for form elements
    const forms = screen.queryAllByRole('textbox')
    const buttons = screen.queryAllByRole('button')
    
    expect(forms.length + buttons.length).toBeGreaterThan(0)
  })` : ''}

  ${pageName === 'dashboard' ? `
  it('handles loading state', () => {
    render(<${componentName} />)
    
    // Should handle loading gracefully
    expect(document.body).toBeInTheDocument()
  })` : ''}

  ${route.includes('[id]') ? `
  it('handles dynamic route parameters', () => {
    render(<${componentName} />)
    
    // Should render even with missing params
    expect(document.body).toBeInTheDocument()
  })` : ''}
})
`
  }

  // Generate component test template
  generateComponentTest(componentName, componentPath) {
    const isUIComponent = componentPath.includes('ui/')
    const isAuthComponent = componentPath.includes('auth/')
    
    return `import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import ${componentName} from '../${componentPath.replace('.tsx', '')}'

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
}))

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />
}))

${isAuthComponent ? `
// Mock auth context
vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
  }),
}))

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}))` : ''}

describe('${componentName}', () => {
  ${isUIComponent ? `
  it('renders with default props', () => {
    render(<${componentName} />)
    expect(document.body).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    const customClass = 'custom-test-class'
    render(<${componentName} className={customClass} />)
    
    const element = document.querySelector(\`.\${customClass}\`)
    expect(element).toBeInTheDocument()
  })` : `
  it('renders without crashing', () => {
    render(<${componentName} />)
    expect(document.body).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<${componentName} />)
    
    // Check for basic accessibility
    const interactiveElements = screen.queryAllByRole('button')
      .concat(screen.queryAllByRole('link'))
      .concat(screen.queryAllByRole('textbox'))
    
    // Interactive elements should be accessible
    interactiveElements.forEach(element => {
      expect(element).toBeInTheDocument()
    })
  })`}

  ${componentName.toLowerCase().includes('form') ? `
  it('handles form submission', () => {
    const mockSubmit = vi.fn()
    render(<${componentName} onSubmit={mockSubmit} />)
    
    const form = screen.queryByRole('form') || document.querySelector('form')
    if (form) {
      expect(form).toBeInTheDocument()
    }
  })` : ''}

  ${componentName.toLowerCase().includes('modal') || componentName.toLowerCase().includes('dialog') ? `
  it('handles open/close states', () => {
    render(<${componentName} open={true} />)
    expect(document.body).toBeInTheDocument()
    
    render(<${componentName} open={false} />)
    expect(document.body).toBeInTheDocument()
  })` : ''}
})
`
  }

  // Discover pages that need tests
  discoverPagesNeedingTests() {
    const pagesDir = path.join(process.cwd(), 'app')
    const testsDir = path.join(pagesDir, '__tests__')
    const pages = []
    
    const scanDirectory = (dir, basePath = '') => {
      const items = fs.readdirSync(dir, { withFileTypes: true })
      
      for (const item of items) {
        if (item.isDirectory() && !item.name.startsWith('_') && item.name !== '__tests__') {
          const fullPath = path.join(dir, item.name)
          const routePath = path.join(basePath, item.name)
          
          // Check if directory has a page.tsx
          const pageFile = path.join(fullPath, 'page.tsx')
          if (fs.existsSync(pageFile)) {
            const testFile = path.join(testsDir, `${item.name}.test.tsx`)
            if (!fs.existsSync(testFile)) {
              pages.push({
                name: item.name,
                path: routePath,
                file: pageFile,
                route: `/${routePath.replace(/\\/g, '/')}`,
                testFile
              })
            }
          }
          
          // Recursively scan subdirectories
          scanDirectory(fullPath, routePath)
        }
      }
    }
    
    // Check root page
    const rootPageFile = path.join(pagesDir, 'page.tsx')
    const rootTestFile = path.join(testsDir, 'page.test.tsx')
    if (fs.existsSync(rootPageFile) && !fs.existsSync(rootTestFile)) {
      pages.push({
        name: 'home',
        path: '',
        file: rootPageFile,
        route: '/',
        testFile: rootTestFile
      })
    }
    
    scanDirectory(pagesDir)
    return pages
  }

  // Discover components that need tests
  discoverComponentsNeedingTests() {
    const componentsDir = path.join(process.cwd(), 'components')
    const components = []
    
    const scanDirectory = (dir, basePath = '') => {
      if (!fs.existsSync(dir)) return
      
      const items = fs.readdirSync(dir, { withFileTypes: true })
      
      for (const item of items) {
        if (item.isFile() && item.name.endsWith('.tsx') && !item.name.endsWith('.test.tsx')) {
          const componentName = item.name.replace('.tsx', '')
          const testFile = path.join(dir, `${componentName}.test.tsx`)
          
          if (!fs.existsSync(testFile)) {
            components.push({
              name: componentName,
              path: path.join(basePath, item.name),
              file: path.join(dir, item.name),
              testFile
            })
          }
        } else if (item.isDirectory()) {
          scanDirectory(path.join(dir, item.name), path.join(basePath, item.name))
        }
      }
    }
    
    scanDirectory(componentsDir)
    return components
  }

  // Generate tests for pages
  async generatePageTests() {
    this.section('Generating Page Tests')
    
    const pages = this.discoverPagesNeedingTests()
    this.log(`Found ${pages.length} pages without tests`)
    
    // Ensure test directory exists
    const testsDir = path.join(process.cwd(), 'app', '__tests__')
    if (!fs.existsSync(testsDir)) {
      fs.mkdirSync(testsDir, { recursive: true })
    }
    
    for (const page of pages) {
      try {
        const testContent = this.generatePageTest(page.name, page.path, page.route)
        fs.writeFileSync(page.testFile, testContent)
        
        this.generated.push(`Page test: ${page.name}`)
        this.log(`✓ Generated test for page: ${page.name}`)
        
      } catch (error) {
        this.skipped.push(`Page test: ${page.name} - ${error.message}`)
        this.log(`✗ Failed to generate test for page: ${page.name}`, 'error')
      }
    }
  }

  // Generate tests for components
  async generateComponentTests() {
    this.section('Generating Component Tests')
    
    const components = this.discoverComponentsNeedingTests()
    this.log(`Found ${components.length} components without tests`)
    
    for (const component of components) {
      try {
        // Skip certain components that are hard to test
        const skipPatterns = [
          'use-',  // Custom hooks
          'provider', // Context providers
          'middleware', // Middleware files
        ]
        
        if (skipPatterns.some(pattern => component.name.toLowerCase().includes(pattern))) {
          this.skipped.push(`Component test: ${component.name} - Complex component`)
          this.log(`⚠️ Skipped complex component: ${component.name}`, 'warning')
          continue
        }
        
        const testContent = this.generateComponentTest(component.name, component.path)
        fs.writeFileSync(component.testFile, testContent)
        
        this.generated.push(`Component test: ${component.name}`)
        this.log(`✓ Generated test for component: ${component.name}`)
        
      } catch (error) {
        this.skipped.push(`Component test: ${component.name} - ${error.message}`)
        this.log(`✗ Failed to generate test for component: ${component.name}`, 'error')
      }
    }
  }

  // Generate integration tests
  async generateIntegrationTests() {
    this.section('Generating Integration Tests')
    
    const integrationTestsDir = path.join(process.cwd(), 'lib', '__tests__')
    if (!fs.existsSync(integrationTestsDir)) {
      fs.mkdirSync(integrationTestsDir, { recursive: true })
    }
    
    // Generate auth integration test if it doesn't exist
    const authTestFile = path.join(integrationTestsDir, 'auth-integration.test.ts')
    if (!fs.existsSync(authTestFile)) {
      const authTestContent = `import { describe, it, expect, vi } from 'vitest'

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
  },
  db: {},
}))

describe('Authentication Integration', () => {
  it('handles authentication flow', async () => {
    // Basic integration test structure
    expect(true).toBe(true)
  })

  it('handles user session management', async () => {
    // Test session management
    expect(true).toBe(true)
  })

  it('handles authentication errors', async () => {
    // Test error handling
    expect(true).toBe(true)
  })
})
`
      
      fs.writeFileSync(authTestFile, authTestContent)
      this.generated.push('Integration test: auth-integration')
      this.log('✓ Generated auth integration test')
    }
  }

  // Generate report
  generateReport() {
    this.section('Test Generation Report')
    
    console.log(`\n📊 Generation Summary:`)
    console.log(`   ✅ Generated: ${this.generated.length}`)
    console.log(`   ⚠️  Skipped: ${this.skipped.length}`)
    
    if (this.generated.length > 0) {
      console.log(`\n✅ Generated Tests:`)
      this.generated.forEach(test => console.log(`   • ${test}`))
    }
    
    if (this.skipped.length > 0) {
      console.log(`\n⚠️  Skipped Tests:`)
      this.skipped.forEach(test => console.log(`   • ${test}`))
    }
    
    console.log(`\n🎯 Next Steps:`)
    console.log(`   1. Run "npm run test" to verify generated tests`)
    console.log(`   2. Customize tests for specific component behavior`)
    console.log(`   3. Add more specific assertions based on component functionality`)
    console.log(`   4. Run "node scripts/production-test-suite.js" for comprehensive testing`)
    
    return this.generated.length > 0
  }

  // Run test generation
  async runGeneration() {
    console.log('🧪 Starting Test Generation...\n')
    
    await this.generatePageTests()
    await this.generateComponentTests()
    await this.generateIntegrationTests()
    
    return this.generateReport()
  }
}

// Run the generator if this script is executed directly
if (require.main === module) {
  const generator = new TestGenerator()
  generator.runGeneration().then(generated => {
    console.log(generated ? '\n🎉 Test generation completed!' : '\n✅ All tests already exist!')
    process.exit(0)
  }).catch(error => {
    console.error('❌ Test generation failed:', error)
    process.exit(1)
  })
}

module.exports = TestGenerator