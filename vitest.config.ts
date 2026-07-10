import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./app/javascript/test/setup.ts"],
    include: ["app/javascript/**/*.test.{ts,tsx}"],
    css: false,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "app/javascript"),
      "@components": resolve(__dirname, "app/javascript/components"),
      "@layouts": resolve(__dirname, "app/javascript/layouts"),
      "@pages": resolve(__dirname, "app/javascript/pages"),
      "@lib": resolve(__dirname, "app/javascript/lib"),
      "@hooks": resolve(__dirname, "app/javascript/hooks"),
      "@types": resolve(__dirname, "app/javascript/types"),
    },
  },
})
