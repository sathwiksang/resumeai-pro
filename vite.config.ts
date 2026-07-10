import { defineConfig } from "vite"
import RubyPlugin from "vite-plugin-ruby"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { resolve } from "path"

export default defineConfig({
  plugins: [
    RubyPlugin(),
    react(),
    tailwindcss(),
  ],
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
