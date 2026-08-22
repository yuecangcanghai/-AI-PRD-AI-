import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages deploys to https://<user>.github.io/<repo>/, so all asset paths
// must be prefixed with /<repo>/. Use root path for local dev, repo path for prod build.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/-AI-PRD-AI-/' : '/',
  plugins: [react(), tailwindcss()],
}))
