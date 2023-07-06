// vite.config.js
/// <reference types="vitest" />

import { defineConfig } from 'vite'
export default defineConfig(() => {
  return {
    test: {
      browser: {
        enabled: true,
        name: 'chrome'
      }
    }
  }
})
