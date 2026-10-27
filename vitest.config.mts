import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Los tests corren con la zona horaria de Argentina: es donde aparecían los bugs
// de "día anterior" con new Date('YYYY-MM-DD'). Los workers heredan esta variable.
process.env.TZ = 'America/Argentina/Buenos_Aires'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
})
