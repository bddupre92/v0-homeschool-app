import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./lib/test-setup.ts"],
    globals: true,
    css: true,
    testTimeout: 10000,
    // atoz-store / quick-log-parser / compliance unit tests sit in lib/__tests__.
    // Component tests sit in app/__tests__ and components/__tests__.
    include: ["{lib,app,components}/**/__tests__/**/*.{test,spec}.{ts,tsx}"],
    deps: {
      inline: ["@testing-library/react", "@testing-library/jest-dom"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
})
