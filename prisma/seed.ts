import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { seedUser } from './seed-user.ts'
import { seedInventory } from './seed-inventory.ts'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Melakukan seeding database Galeri Kriya Achi (Prototype Version)...')
  
  // Run both seeders using the same prisma client instance
  await seedInventory(prisma)
  await seedUser(prisma)

  console.log('✅ Seeding database selesai.')
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat melakukan seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
