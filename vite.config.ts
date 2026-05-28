import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  ssr: {
    external: ['@prisma/client', '@prisma/client-runtime-utils'],
  },
  build: {
    rollupOptions: {
      external: ['@prisma/client', '@prisma/client-runtime-utils'],
    },
  },
  plugins: [
    devtools(),
    nitro({ 
      rollupConfig: { 
        external: [/^@sentry\//, /^@prisma\//, '@prisma/client', '@prisma/client-runtime-utils'] 
      } 
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
