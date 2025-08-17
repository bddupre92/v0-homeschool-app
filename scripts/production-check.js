#!/usr/bin/env node

/**
 * Production Readiness Checker
 * Comprehensive script to verify the application is ready for production deployment
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class ProductionChecker {
  constructor() {
    this.checks = []
    this.warnings = []
    this.errors = []
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = {
      info: '✓',
      warning: '⚠️',
      error: '❌',
      section: '📋'
    }[type]
    
    console.log(`${prefix} ${message}`)
    
    if (type === 'warning') this.warnings.push(message)
    if (type === 'error') this.errors.push(message)
  }

  section(title) {
    console.log(`\n${'='.repeat(50)}`)
    this.log(title, 'section')
    console.log('='.repeat(50))
  }

  // Check environment variables
  checkEnvironmentVariables() {
    this.section('Environment Variables')
    
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID'
    ]

    const optionalEnvVars = [
      'FIREBASE_ADMIN_PROJECT_ID',
      'FIREBASE_ADMIN_CLIENT_EMAIL',
      'FIREBASE_ADMIN_PRIVATE_KEY'
    ]

    // Check .env.local
    const envPath = path.join(process.cwd(), '.env.local')
    if (!fs.existsSync(envPath)) {
      this.log('Missing .env.local file', 'error')
      return
    }

    const envContent = fs.readFileSync(envPath, 'utf8')
    
    requiredEnvVars.forEach(envVar => {
      if (!envContent.includes(envVar)) {
        this.log(`Missing required environment variable: ${envVar}`, 'error')
      } else if (envContent.includes(`${envVar}=your-`) || envContent.includes(`${envVar}=demo-`)) {
        this.log(`Environment variable ${envVar} contains placeholder value`, 'warning')
      } else {
        this.log(`Environment variable ${envVar} is configured`)
      }
    })

    optionalEnvVars.forEach(envVar => {
      if (!envContent.includes(envVar)) {
        this.log(`Optional environment variable ${envVar} not set`, 'warning')
      } else {
        this.log(`Environment variable ${envVar} is configured`)
      }
    })
  }

  // Check Firebase configuration
  checkFirebaseConfig() {
    this.section('Firebase Configuration')
    
    try {
      const firebaseConfigPath = path.join(process.cwd(), 'lib', 'firebase.ts')
      if (fs.existsSync(firebaseConfigPath)) {
        this.log('Firebase client configuration file exists')
      } else {
        this.log('Firebase client configuration file missing', 'error')
      }

      const firebaseAdminPath = path.join(process.cwd(), 'lib', 'firebase-admin.ts')
      if (fs.existsSync(firebaseAdminPath)) {
        this.log('Firebase admin configuration file exists')
      } else {
        this.log('Firebase admin configuration file missing', 'error')
      }

      // Check for service account key (optional but recommended)
      const serviceAccountPath = path.join(process.cwd(), 'service-account.json')
      if (fs.existsSync(serviceAccountPath)) {
        this.log('Service account key file found')
      } else {
        this.log('Service account key file not found (using environment variables)', 'warning')
      }
    } catch (error) {
      this.log(`Error checking Firebase configuration: ${error.message}`, 'error')
    }
  }

  // Run tests
  checkTests() {
    this.section('Test Suite')
    
    try {
      this.log('Running test suite...')
      execSync('npm run test:run', { stdio: 'pipe' })
      this.log('All tests passed')
    } catch (error) {
      this.log('Some tests failed', 'error')
      this.log('Run "npm run test" to see detailed test results', 'warning')
    }
  }

  // Check TypeScript compilation
  checkTypeScript() {
    this.section('TypeScript Compilation')
    
    try {
      this.log('Checking TypeScript compilation...')
      execSync('npx tsc --noEmit', { stdio: 'pipe' })
      this.log('TypeScript compilation successful')
    } catch (error) {
      this.log('TypeScript compilation errors found', 'error')
      this.log('Run "npx tsc --noEmit" to see detailed errors', 'warning')
    }
  }

  // Check build process
  checkBuild() {
    this.section('Build Process')
    
    try {
      this.log('Running production build...')
      execSync('npm run build', { stdio: 'pipe' })
      this.log('Production build successful')
      
      // Check if .next directory exists
      const nextDir = path.join(process.cwd(), '.next')
      if (fs.existsSync(nextDir)) {
        this.log('Build output directory exists')
      } else {
        this.log('Build output directory missing', 'error')
      }
    } catch (error) {
      this.log('Production build failed', 'error')
      this.log('Run "npm run build" to see detailed build errors', 'warning')
    }
  }

  // Check dependencies
  checkDependencies() {
    this.section('Dependencies')
    
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      // Check for security vulnerabilities
      try {
        execSync('npm audit --audit-level=high', { stdio: 'pipe' })
        this.log('No high-severity security vulnerabilities found')
      } catch (error) {
        this.log('Security vulnerabilities found', 'warning')
        this.log('Run "npm audit" to see details and "npm audit fix" to fix', 'warning')
      }

      // Check for outdated packages
      try {
        const outdated = execSync('npm outdated --json', { stdio: 'pipe' }).toString()
        const outdatedPackages = JSON.parse(outdated || '{}')
        const outdatedCount = Object.keys(outdatedPackages).length
        
        if (outdatedCount > 0) {
          this.log(`${outdatedCount} packages are outdated`, 'warning')
          this.log('Run "npm outdated" to see details', 'warning')
        } else {
          this.log('All packages are up to date')
        }
      } catch (error) {
        // npm outdated returns exit code 1 when packages are outdated
        this.log('Some packages may be outdated', 'warning')
      }

      this.log(`Total dependencies: ${Object.keys(packageJson.dependencies || {}).length}`)
      this.log(`Total dev dependencies: ${Object.keys(packageJson.devDependencies || {}).length}`)
      
    } catch (error) {
      this.log(`Error checking dependencies: ${error.message}`, 'error')
    }
  }

  // Check security headers and configuration
  checkSecurity() {
    this.section('Security Configuration')
    
    // Check for middleware.ts
    const middlewarePath = path.join(process.cwd(), 'middleware.ts')
    if (fs.existsSync(middlewarePath)) {
      this.log('Middleware configuration exists')
      
      const middlewareContent = fs.readFileSync(middlewarePath, 'utf8')
      if (middlewareContent.includes('X-Frame-Options')) {
        this.log('X-Frame-Options header configured')
      } else {
        this.log('X-Frame-Options header not configured', 'warning')
      }
      
      if (middlewareContent.includes('X-Content-Type-Options')) {
        this.log('X-Content-Type-Options header configured')
      } else {
        this.log('X-Content-Type-Options header not configured', 'warning')
      }
    } else {
      this.log('Middleware configuration missing', 'warning')
    }

    // Check for proper error handling
    const errorPagePath = path.join(process.cwd(), 'app', 'error.tsx')
    if (fs.existsSync(errorPagePath)) {
      this.log('Global error page exists')
    } else {
      this.log('Global error page missing', 'warning')
    }

    // Check for 404 page
    const notFoundPath = path.join(process.cwd(), 'app', 'not-found.tsx')
    if (fs.existsSync(notFoundPath)) {
      this.log('404 page exists')
    } else {
      this.log('404 page missing', 'warning')
    }
  }

  // Check performance optimizations
  checkPerformance() {
    this.section('Performance Optimizations')
    
    const nextConfigPath = path.join(process.cwd(), 'next.config.js')
    if (fs.existsSync(nextConfigPath)) {
      this.log('Next.js configuration exists')
      
      const nextConfig = fs.readFileSync(nextConfigPath, 'utf8')
      if (nextConfig.includes('images')) {
        this.log('Image optimization configured')
      } else {
        this.log('Image optimization not configured', 'warning')
      }
    } else {
      this.log('Next.js configuration missing', 'warning')
    }

    // Check for service worker
    const swPath = path.join(process.cwd(), 'public', 'sw.js')
    if (fs.existsSync(swPath)) {
      this.log('Service worker exists')
    } else {
      this.log('Service worker not found', 'warning')
    }
  }

  // Check accessibility
  checkAccessibility() {
    this.section('Accessibility')
    
    // Check if components use proper semantic HTML
    const componentsDir = path.join(process.cwd(), 'components')
    if (fs.existsSync(componentsDir)) {
      this.log('Components directory exists')
      // This is a basic check - in a real scenario, you'd use tools like axe-core
      this.log('Manual accessibility testing recommended', 'warning')
    }
  }

  // Generate final report
  generateReport() {
    this.section('Production Readiness Report')
    
    console.log(`\n📊 Summary:`)
    console.log(`✅ Checks completed`)
    console.log(`⚠️  Warnings: ${this.warnings.length}`)
    console.log(`❌ Errors: ${this.errors.length}`)

    if (this.errors.length > 0) {
      console.log(`\n❌ Critical Issues (must fix before production):`)
      this.errors.forEach(error => console.log(`   • ${error}`))
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  Warnings (recommended to fix):`)
      this.warnings.forEach(warning => console.log(`   • ${warning}`))
    }

    const isProductionReady = this.errors.length === 0
    
    console.log(`\n${isProductionReady ? '🎉' : '🚫'} Production Ready: ${isProductionReady ? 'YES' : 'NO'}`)
    
    if (isProductionReady) {
      console.log(`\n🚀 Your application is ready for production deployment!`)
      console.log(`\nNext steps:`)
      console.log(`1. Deploy to your hosting platform (Vercel, Netlify, etc.)`)
      console.log(`2. Set up monitoring and error tracking`)
      console.log(`3. Configure CI/CD pipeline`)
      console.log(`4. Set up backup and disaster recovery`)
    } else {
      console.log(`\n🔧 Please fix the critical issues above before deploying to production.`)
    }

    return isProductionReady
  }

  // Run all checks
  async runAllChecks() {
    console.log('🔍 Starting Production Readiness Check...\n')
    
    this.checkEnvironmentVariables()
    this.checkFirebaseConfig()
    this.checkDependencies()
    this.checkTypeScript()
    this.checkTests()
    this.checkBuild()
    this.checkSecurity()
    this.checkPerformance()
    this.checkAccessibility()
    
    return this.generateReport()
  }
}

// Run the checker if this script is executed directly
if (require.main === module) {
  const checker = new ProductionChecker()
  checker.runAllChecks().then(isReady => {
    process.exit(isReady ? 0 : 1)
  }).catch(error => {
    console.error('❌ Production check failed:', error)
    process.exit(1)
  })
}

module.exports = ProductionChecker