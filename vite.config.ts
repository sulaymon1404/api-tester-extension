import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.config'

export default defineConfig({
  plugins: [react(), tailwindcss(), crx({ manifest })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      // src/panel/index.html is only referenced at runtime as a string inside
      // chrome.devtools.panels.create(), so crx's manifest-based entry detection
      // never sees it — it must be added as an explicit build input.
      input: {
        panel: path.resolve(__dirname, 'src/panel/index.html'),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
