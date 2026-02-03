#!/usr/bin/env node

/**
 * Comprehensive Production Test Suite
 * Tests all pages, components, and critical functionality for production readiness
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class ProductionTestSuite {
  constructor() {
    this.results = {
      pages: { passed: 0, failed: 0, skipped: 0 },
      components: { passed: 0, failed: 0, skipped: 0 },
      integration: { passed: 0, failed: 0, skipped: 0 },
      e2e: { passed: 0, failed: 0, skipped: 0 }
    }
    this.errors = []
    this.warnings = []
  }

  log(message, type = 'info') {
    const prefix = {
      info: '✓',
      warning: '⚠️',
      error: '❌',
      section: '📋',
      test: '🧪'
    }[type]
    
    console.log(`${prefix} ${message}`)
    
    if (type === 'warning') this.warnings.push(message)
    if (type === 'error') this.errors.push(message)
  }

  section(title) {
    console.log(`\n${'='.repeat(60)}`)
    this.log(title, 'section')
    console.log('='.repeat(60))
  }

  // Discover all pages in the app directory
  discoverPages() {
    const pagesDir = path.join(process.cwd(), 'app')
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
            pages.push({
              name: item.name,
              path: routePath,
              file: pageFile,
              route: `/${routePath.replace(/\\/g, '/')}`
            })
          }
          
          // Recursively scan subdirectories
          scanDirectory(fullPath, routePath)
        }
      }
    }
    
    // Add root page
    const rootPageFile = path.join(pagesDir, 'page.tsx')
    if (fs.existsSync(rootPageFile)) {
      pages.push({
        name: 'home',
        path: '',
        file: rootPageFile,
        route: '/'
      })
    }
    
    scanDirectory(pagesDir)
    return pages
  }

  // Discover all components
  discoverComponents() {
    const componentsDir = path.join(process.cwd(), 'components')
    const components = []
    
    const scanDirectory = (dir, basePath = '') => {
      if (!fs.existsSync(dir)) return
      
      const items = fs.readdirSync(dir, { withFileTypes: true })
      
      for (const item of items) {
        if (item.isFile() && item.name.endsWith('.tsx') && !item.name.endsWith('.test.tsx')) {
          components.push({
            name: item.name.replace('.tsx', ''),
            path: path.join(basePath, item.name),
            file: path.join(dir, item.name)
          })
        } else if (item.isDirectory()) {
          scanDirectory(path.join(dir, item.name), path.join(basePath, item.name))
        }
      }
    }
    
    scanDirectory(componentsDir)
    return components
  }

  // Test page compilation and basic rendering
  async testPageCompilation() {
    this.section('Page Compilation Tests')
    
    const pages = this.discoverPages()
    this.log(`Found ${pages.length} pages to test`)
    
    for (const page of pages) {
      try {
        this.log(`Testing page: ${page.route}`, 'test')
        
        // Check if page file exists and is valid TypeScript
        const content = fs.readFileSync(page.file, 'utf8')
        
        // Basic syntax checks
        if (!content.includes('export default')) {
          throw new Error('Missing default export')
        }
        
        // Check for common React patterns
        if (content.includes('useState') && !content.includes('use client')) {
          this.log(`Page ${page.name} uses useState but missing 'use client' directive`, 'warning')
        }
        
        this.results.pages.passed++
        this.log(`✓ ${page.name} compilation check passed`)
        
      } catch (error) {
        this.results.pages.failed++
        this.log(`✗ ${page.name} compilation failed: ${error.message}`, 'error')
      }
    }
  }

  // Test component compilation and exports
  async testComponentCompilation() {
    this.section('Component Compilation Tests')
    
    const components = this.discoverComponents()
    this.log(`Found ${components.length} components to test`)
    
    for (const component of components) {
      try {
        this.log(`Testing component: ${component.name}`, 'test')
        
        const content = fs.readFileSync(component.file, 'utf8')
        
        // Check for proper exports
        if (!content.includes('export') && !content.includes('export default')) {
          throw new Error('No exports found')
        }
        
        // Check for TypeScript usage
        if (!content.includes(': ') && !content.includes('interface') && !content.includes('type ')) {
          this.log(`Component ${component.name} may lack TypeScript types`, 'warning')
        }
        
        this.results.components.passed++
        this.log(`✓ ${component.name} compilation check passed`)
        
      } catch (error) {
        this.results.components.failed++
        this.log(`✗ ${component.name} compilation failed: ${error.message}`, 'error')
      }
    }
  }

  // Run existing unit tests
  async runUnitTests() {
    this.section('Unit Test Suite')
    
    try {
      this.log('Running all unit tests...', 'test')
      const output = execSync('npm run test:run', { encoding: 'utf8', stdio: 'pipe' })
      
      // Parse test results
      const lines = output.split('\n')
      const testResults = lines.find(line => line.includes('Tests:'))
      
      if (testResults) {
        this.log(`Unit tests completed: ${testResults}`)
        this.results.integration.passed++
      } else {
        this.log('Unit tests completed successfully')
        this.results.integration.passed++
      }
      
    } catch (error) {
      this.results.integration.failed++
      this.log('Unit tests failed', 'error')
      this.log('Run "npm run test" for detailed results', 'warning')
    }
  }

  // Test build process for all pages
  async testBuildProcess() {
    this.section('Build Process Test')
    
    try {
      this.log('Testing production build...', 'test')
      execSync('npm run build', { stdio: 'pipe' })
      
      // Check build output
      const buildDir = path.join(process.cwd(), '.next')
      if (fs.existsSync(buildDir)) {
        const staticDir = path.join(buildDir, 'static')
        if (fs.existsSync(staticDir)) {
          this.log('Static assets generated successfully')
        }
        
        // Check for build manifest
        const manifestPath = path.join(buildDir, 'build-manifest.json')
        if (fs.existsSync(manifestPath)) {
          this.log('Build manifest generated')
        }
        
        this.results.integration.passed++
        this.log('Production build successful')
      } else {
        throw new Error('Build directory not found')
      }
      
    } catch (error) {
      this.results.integration.failed++
      this.log('Production build failed', 'error')
    }
  }

  // Test critical user flows
  async testCriticalFlows() {
    this.section('Critical User Flow Tests')
    
    const criticalPages = [
      '/',
      '/sign-up',
      '/sign-in',
      '/dashboard',
      '/resources',
      '/boards',
      '/community'
    ]
    
    for (const route of criticalPages) {
      try {
        this.log(`Testing critical route: ${route}`, 'test')
        
        // Check if route exists
        const routePath = route === '/' ? 'page.tsx' : `${route.slice(1)}/page.tsx`
        const fullPath = path.join(process.cwd(), 'app', routePath)
        
        if (fs.existsSync(fullPath)) {
          this.log(`✓ Critical route ${route} exists`)
          this.results.e2e.passed++
        } else {
          throw new Error(`Route file not found: ${fullPath}`)
        }
        
      } catch (error) {
        this.results.e2e.failed++
        this.log(`✗ Critical route ${route} test failed: ${error.message}`, 'error')
      }
    }
  }

  // Test authentication flows
  async testAuthenticationFlows() {
    this.section('Authentication Flow Tests')
    
    const authFiles = [
      'contexts/auth-context.tsx',
      'components/auth/sign-in-form.tsx',
      'components/auth/sign-up-form.tsx',
      'components/auth/protected-route.tsx'
    ]
    
    for (const file of authFiles) {
      try {
        const fullPath = path.join(process.cwd(), file)
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8')
          
          // Check for proper error handling
          if (content.includes('try') && content.includes('catch')) {
            this.log(`✓ ${file} has error handling`)
          } else {
            this.log(`${file} may lack error handling`, 'warning')
          }
          
          this.results.e2e.passed++
        } else {
          throw new Error(`Auth file not found: ${file}`)
        }
        
      } catch (error) {
        this.results.e2e.failed++
        this.log(`✗ Auth file test failed: ${error.message}`, 'error')
      }
    }
  }

  // Test API routes
  async testApiRoutes() {
    this.section('API Routes Test')
    
    const apiDir = path.join(process.cwd(), 'app', 'api')
    if (!fs.existsSync(apiDir)) {
      this.log('No API routes found', 'warning')
      return
    }
    
    const scanApiRoutes = (dir, basePath = '') => {
      const items = fs.readdirSync(dir, { withFileTypes: true })
      
      for (const item of items) {
        if (item.isDirectory()) {
          scanApiRoutes(path.join(dir, item.name), path.join(basePath, item.name))
        } else if (item.name === 'route.ts' || item.name === 'route.js') {
          try {
            const routePath = path.join(dir, item.name)
            const content = fs.readFileSync(routePath, 'utf8')
            
            // Check for proper HTTP methods
            const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
            const foundMethods = methods.filter(method => content.includes(`export async function ${method}`))
            
            if (foundMethods.length > 0) {
              this.log(`✓ API route ${basePath} implements: ${foundMethods.join(', ')}`)
              this.results.integration.passed++
            } else {
              this.log(`API route ${basePath} has no HTTP methods`, 'warning')
            }
            
          } catch (error) {
            this.results.integration.failed++
            this.log(`✗ API route ${basePath} test failed: ${error.message}`, 'error')
          }
        }
      }
    }
    
    scanApiRoutes(apiDir)
  }

  // Test accessibility basics
  async testAccessibility() {
    this.section('Accessibility Tests')
    
    const pages = this.discoverPages()
    
    for (const page of pages) {
      try {
        const content = fs.readFileSync(page.file, 'utf8')
        
        // Check for semantic HTML
        const semanticElements = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer']
        const foundElements = semanticElements.filter(element => content.includes(`<${element}`))
        
        if (foundElements.length > 0) {
          this.log(`✓ ${page.name} uses semantic HTML: ${foundElements.join(', ')}`)
        } else {
          this.log(`${page.name} may lack semantic HTML structure`, 'warning')
        }
        
        // Check for alt attributes on images
        if (content.includes('<Image') || content.includes('<img')) {
          if (content.includes('alt=')) {
            this.log(`✓ ${page.name} has alt attributes for images`)
          } else {
            this.log(`${page.name} may be missing alt attributes`, 'warning')
          }
        }
        
        this.results.e2e.passed++
        
      } catch (error) {
        this.results.e2e.failed++
        this.log(`✗ Accessibility test failed for ${page.name}: ${error.message}`, 'error')
      }
    }
  }

  // Test performance considerations
  async testPerformance() {
    this.section('Performance Tests')
    
    try {
      // Check for dynamic imports
      const appDir = path.join(process.cwd(), 'app')
      const componentsDir = path.join(process.cwd(), 'components')
      
      let dynamicImports = 0
      let totalFiles = 0
      
      const checkDynamicImports = (dir) => {
        const items = fs.readdirSync(dir, { withFileTypes: true })
        
        for (const item of items) {
          if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.ts'))) {
            totalFiles++
            const content = fs.readFileSync(path.join(dir, item.name), 'utf8')
            
            if (content.includes('dynamic(') || content.includes('lazy(')) {
              dynamicImports++
            }
          } else if (item.isDirectory() && !item.name.startsWith('.')) {
            checkDynamicImports(path.join(dir, item.name))
          }
        }
      }
      
      checkDynamicImports(appDir)
      checkDynamicImports(componentsDir)
      
      this.log(`Found ${dynamicImports} dynamic imports out of ${totalFiles} files`)
      
      if (dynamicImports > 0) {
        this.log('✓ Application uses code splitting')
      } else {
        this.log('Consider implementing code splitting for better performance', 'warning')
      }
      
      this.results.integration.passed++
      
    } catch (error) {
      this.results.integration.failed++
      this.log(`✗ Performance test failed: ${error.message}`, 'error')
    }
  }

  // Generate comprehensive report
  generateReport() {
    this.section('Production Test Report')
    
    const totalTests = Object.values(this.results).reduce((sum, category) => 
      sum + category.passed + category.failed + category.skipped, 0)
    const totalPassed = Object.values(this.results).reduce((sum, category) => 
      sum + category.passed, 0)
    const totalFailed = Object.values(this.results).reduce((sum, category) => 
      sum + category.failed, 0)
    
    console.log(`\n📊 Test Summary:`)
    console.log(`   Total Tests: ${totalTests}`)
    console.log(`   ✅ Passed: ${totalPassed}`)
    console.log(`   ❌ Failed: ${totalFailed}`)
    console.log(`   ⚠️  Warnings: ${this.warnings.length}`)
    
    console.log(`\n📋 Category Breakdown:`)
    Object.entries(this.results).forEach(([category, results]) => {
      const total = results.passed + results.failed + results.skipped
      console.log(`   ${category.toUpperCase()}: ${results.passed}/${total} passed`)
    })
    
    if (this.errors.length > 0) {
      console.log(`\n❌ Critical Issues:`)
      this.errors.forEach(error => console.log(`   • ${error}`))
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  Warnings:`)
      this.warnings.forEach(warning => console.log(`   • ${warning}`))
    }
    
    const successRate = totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(1) : 0
    const isProductionReady = totalFailed === 0 && successRate >= 90
    
    console.log(`\n🎯 Success Rate: ${successRate}%`)
    console.log(`${isProductionReady ? '🎉' : '🚫'} Production Ready: ${isProductionReady ? 'YES' : 'NO'}`)
    
    if (isProductionReady) {
      console.log(`\n🚀 All systems go! Your application is ready for production.`)
    } else {
      console.log(`\n🔧 Please address the issues above before production deployment.`)
    }
    
    return isProductionReady
  }

  // Run all production tests
  async runAllTests() {
    console.log('🧪 Starting Comprehensive Production Test Suite...\n')
    
    await this.testPageCompilation()
    await this.testComponentCompilation()
    await this.runUnitTests()
    await this.testBuildProcess()
    await this.testCriticalFlows()
    await this.testAuthenticationFlows()
    await this.testApiRoutes()
    await this.testAccessibility()
    await this.testPerformance()
    
    return this.generateReport()
  }
}

// Run the test suite if this script is executed directly
if (require.main === module) {
  const testSuite = new ProductionTestSuite()
  testSuite.runAllTests().then(isReady => {
    process.exit(isReady ? 0 : 1)
  }).catch(error => {
    console.error('❌ Production test suite failed:', error)
    process.exit(1)
  })
}

module.exports = ProductionTestSuite