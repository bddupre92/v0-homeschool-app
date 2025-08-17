#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Orchestrates all testing phases for production readiness
 */

const { execSync } = require('child_process')
const ProductionChecker = require('./production-check.js')
const ProductionTestSuite = require('./production-test-suite.js')
const TestGenerator = require('./generate-tests.js')

class ComprehensiveTestRunner {
    constructor() {
        this.phases = []
        this.results = {
            generation: false,
            unit: false,
            integration: false,
            production: false,
            build: false
        }
    }

    log(message, type = 'info') {
        const prefix = {
            info: '✓',
            warning: '⚠️',
            error: '❌',
            section: '📋',
            phase: '🚀'
        }[type]

        console.log(`${prefix} ${message}`)
    }

    section(title) {
        console.log(`\n${'='.repeat(60)}`)
        this.log(title, 'section')
        console.log('='.repeat(60))
    }

    phase(title) {
        console.log(`\n${'🚀'.repeat(20)}`)
        this.log(`PHASE: ${title}`, 'phase')
        console.log('🚀'.repeat(20))
    }

    // Phase 1: Generate missing tests
    async runTestGeneration() {
        this.phase('Test Generation')

        try {
            const generator = new TestGenerator()
            const generated = await generator.runGeneration()
            this.results.generation = true

            if (generated) {
                this.log('New tests generated - running npm install to ensure dependencies')
                try {
                    execSync('npm install', { stdio: 'inherit' })
                } catch (error) {
                    this.log('npm install failed, continuing anyway', 'warning')
                }
            }

            return true
        } catch (error) {
            this.log(`Test generation failed: ${error.message}`, 'error')
            return false
        }
    }

    // Phase 2: Run unit tests
    async runUnitTests() {
        this.phase('Unit Tests')

        try {
            this.log('Running unit test suite...')
            execSync('npm run test:run', { stdio: 'inherit' })
            this.results.unit = true
            this.log('Unit tests passed')
            return true
        } catch (error) {
            this.log('Unit tests failed', 'error')
            this.log('Check test output above for details', 'warning')
            return false
        }
    }

    // Phase 3: Run integration tests
    async runIntegrationTests() {
        this.phase('Integration Tests')

        try {
            const testSuite = new ProductionTestSuite()
            const passed = await testSuite.runAllTests()
            this.results.integration = passed
            return passed
        } catch (error) {
            this.log(`Integration tests failed: ${error.message}`, 'error')
            return false
        }
    }

    // Phase 4: Run production checks
    async runProductionChecks() {
        this.phase('Production Readiness Checks')

        try {
            const checker = new ProductionChecker()
            const ready = await checker.runAllChecks()
            this.results.production = ready
            return ready
        } catch (error) {
            this.log(`Production checks failed: ${error.message}`, 'error')
            return false
        }
    }

    // Phase 5: Build verification
    async runBuildVerification() {
        this.phase('Build Verification')

        try {
            this.log('Running production build...')
            execSync('npm run build', { stdio: 'inherit' })
            this.results.build = true
            this.log('Production build successful')
            return true
        } catch (error) {
            this.log('Production build failed', 'error')
            return false
        }
    }

    // Generate final comprehensive report
    generateFinalReport() {
        this.section('🎯 COMPREHENSIVE TEST REPORT')

        const phases = [
            { name: 'Test Generation', key: 'generation', critical: false },
            { name: 'Unit Tests', key: 'unit', critical: true },
            { name: 'Integration Tests', key: 'integration', critical: true },
            { name: 'Production Checks', key: 'production', critical: true },
            { name: 'Build Verification', key: 'build', critical: true }
        ]

        console.log(`\n📊 Phase Results:`)
        phases.forEach(phase => {
            const status = this.results[phase.key]
            const icon = status ? '✅' : '❌'
            const critical = phase.critical ? ' (CRITICAL)' : ''
            console.log(`   ${icon} ${phase.name}${critical}: ${status ? 'PASSED' : 'FAILED'}`)
        })

        const criticalPhases = phases.filter(p => p.critical)
        const criticalPassed = criticalPhases.filter(p => this.results[p.key]).length
        const criticalTotal = criticalPhases.length

        const allCriticalPassed = criticalPassed === criticalTotal
        const successRate = ((criticalPassed / criticalTotal) * 100).toFixed(1)

        console.log(`\n🎯 Critical Success Rate: ${successRate}% (${criticalPassed}/${criticalTotal})`)
        console.log(`${allCriticalPassed ? '🎉' : '🚫'} PRODUCTION READY: ${allCriticalPassed ? 'YES' : 'NO'}`)

        if (allCriticalPassed) {
            console.log(`\n🚀 CONGRATULATIONS! Your application is ready for production deployment.`)
            console.log(`\n📋 Deployment Checklist:`)
            console.log(`   ✅ All tests passing`)
            console.log(`   ✅ Build successful`)
            console.log(`   ✅ Production checks passed`)
            console.log(`   ✅ Integration tests verified`)

            console.log(`\n🎯 Next Steps:`)
            console.log(`   1. Deploy to staging environment`)
            console.log(`   2. Run smoke tests in staging`)
            console.log(`   3. Deploy to production`)
            console.log(`   4. Monitor application health`)
            console.log(`   5. Set up alerts and monitoring`)

        } else {
            console.log(`\n🔧 ISSUES FOUND - Please address the following:`)

            phases.forEach(phase => {
                if (phase.critical && !this.results[phase.key]) {
                    console.log(`   ❌ ${phase.name} must pass before production deployment`)
                }
            })

            console.log(`\n🛠️  Recommended Actions:`)
            if (!this.results.unit) {
                console.log(`   • Fix failing unit tests: npm run test`)
            }
            if (!this.results.integration) {
                console.log(`   • Address integration test issues`)
            }
            if (!this.results.production) {
                console.log(`   • Fix production readiness issues`)
            }
            if (!this.results.build) {
                console.log(`   • Fix build errors: npm run build`)
            }
        }

        console.log(`\n📚 Additional Resources:`)
        console.log(`   • Run individual phases: node scripts/[script-name].js`)
        console.log(`   • Check PRODUCTION_CHECKLIST.md for manual verification`)
        console.log(`   • Review generated tests and customize as needed`)

        return allCriticalPassed
    }

    // Run all phases
    async runAllPhases() {
        console.log('🎯 Starting Comprehensive Production Test Suite...')
        console.log('This will run all phases: Generation → Unit → Integration → Production → Build\n')

        const startTime = Date.now()

        // Phase 1: Generate tests (non-critical)
        await this.runTestGeneration()

        // Phase 2: Unit tests (critical)
        await this.runUnitTests()

        // Phase 3: Integration tests (critical)
        await this.runIntegrationTests()

        // Phase 4: Production checks (critical)
        await this.runProductionChecks()

        // Phase 5: Build verification (critical)
        await this.runBuildVerification()

        const endTime = Date.now()
        const duration = ((endTime - startTime) / 1000).toFixed(1)

        console.log(`\n⏱️  Total execution time: ${duration} seconds`)

        return this.generateFinalReport()
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2)
    const runner = new ComprehensiveTestRunner()

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
🧪 Comprehensive Test Runner

Usage: node scripts/test-all.js [options]

Options:
  --help, -h          Show this help message
  --generate-only     Only run test generation
  --unit-only         Only run unit tests
  --integration-only  Only run integration tests
  --production-only   Only run production checks
  --build-only        Only run build verification

Examples:
  node scripts/test-all.js                    # Run all phases
  node scripts/test-all.js --unit-only        # Run only unit tests
  node scripts/test-all.js --generate-only    # Generate missing tests only
`)
        process.exit(0)
    }

    try {
        let success = false

        if (args.includes('--generate-only')) {
            success = await runner.runTestGeneration()
        } else if (args.includes('--unit-only')) {
            success = await runner.runUnitTests()
        } else if (args.includes('--integration-only')) {
            success = await runner.runIntegrationTests()
        } else if (args.includes('--production-only')) {
            success = await runner.runProductionChecks()
        } else if (args.includes('--build-only')) {
            success = await runner.runBuildVerification()
        } else {
            success = await runner.runAllPhases()
        }

        process.exit(success ? 0 : 1)

    } catch (error) {
        console.error('❌ Test runner failed:', error)
        process.exit(1)
    }
}

// Run if this script is executed directly
if (require.main === module) {
    main()
}

module.exports = ComprehensiveTestRunner