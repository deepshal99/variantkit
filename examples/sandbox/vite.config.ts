/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import variantkit from './vite-plugin.mjs'

export default defineConfig({
  plugins: [react(), variantkit()],
  test: { environment: 'node' },
})
