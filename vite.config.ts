import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages deploys to https://<user>.github.io/<repo>/, so all asset paths
// must be prefixed with /<repo>/. Keep this aligned with the remote repo name.
export default defineConfig({
  base: '/-AI-PRD-AI-/',
  plugins: [react(), tailwindcss()],
})
