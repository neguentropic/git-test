import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
  // Allow importing .glsl files as raw strings via ?raw query (built-in Vite).
  // No extra plugin needed — Vite supports ?raw out of the box.
  assetsInclude: [],
})
