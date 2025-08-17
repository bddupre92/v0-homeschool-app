import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./lib/test-setup.ts'],
    globals: true,
    css: true,
    // Increase timeout for slower tests
    testTimeout: 10000,
    // Handle static imports
    deps: {
      inline: ['@testing-library/react', '@testing-library/jest-dom']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  esbuild: {
    // Handle JSX in test files
    jsx: 'automatic',
  },
})