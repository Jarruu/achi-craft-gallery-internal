import '@tanstack/react-start/server-only'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

declare global {
  var __prisma: PrismaClient | undefined
}

export const prisma = (() => {
  const existing = globalThis.__prisma as any
  if (existing && 'typeOption' in existing) {
    return existing as PrismaClient
  }
  return new PrismaClient({ adapter })
})()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}
