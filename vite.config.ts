import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
  resolve: { tsconfigPaths: true },

  ssr: {
    noExternal: [
      '@prisma/client',
      '@prisma/client/*',
      '.prisma',
      '@prisma/adapter-pg'
    ],
  },

  plugins: [
    devtools(),
    nitro({
      preset: 'vercel',
      vercel: {
        functions: {
          runtime: 'nodejs24.x'
        }
      },
      rollupConfig: {
        external: [/^@sentry\//]
      }
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})