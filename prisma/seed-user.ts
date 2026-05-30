import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import path from 'path'
import { PrismaPg } from '@prisma/adapter-pg'

export async function seedUser(prisma: PrismaClient) {
  console.log('🌱 Melakukan seeding User (Admin)...')

  // Clear user table
  await prisma.user.deleteMany()

  // Create admin user
  console.log('  Seeding Admin User...')
  const adminUser = await prisma.user.create({
    data: {
      email: 'adminacg@gmail.com',
      password: crypto.createHash('sha256').update('achiinternal').digest('hex'),
    }
  })

  console.log(`👤 Admin user seeded: ${adminUser.email}`)
}

// Check if this script is run directly
const isMain = process.argv[1] && (
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
)

if (isMain) {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  })
  const prisma = new PrismaClient({ adapter })

  seedUser(prisma)
    .catch((e) => {
      console.error('❌ Terjadi kesalahan saat melakukan seeding user:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
