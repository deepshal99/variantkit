/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Let the example import VariantKit's shipped stylesheets straight from the repo source
  // (../../variantkit) so the demo always reflects the real product — one source of truth.
  server: { fs: { allow: ['..', '../..'] } },
  test: { environment: 'node' },
})
