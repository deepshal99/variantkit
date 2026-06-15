import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Self-contained: the demo uses its own copy of VariantKit under src/variantkit/ (refresh it
// from the canonical package with `npm run sync`). Runs in dev AND builds for production.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5188,
    strictPort: true,
  },
})
