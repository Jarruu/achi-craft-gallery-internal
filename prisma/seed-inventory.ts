import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'url'
import path from 'path'
import { PrismaPg } from '@prisma/adapter-pg'

export async function seedInventory(prisma: PrismaClient) {
  console.log('🌱 Melakukan seeding inventaris Galeri Kriya Achi (Prototype Version)...')

  // Clear tables in reverse order of foreign key dependencies
  await prisma.productMaterial.deleteMany()
  await prisma.stockLog.deleteMany()
  await prisma.product.deleteMany()
  await prisma.material.deleteMany()
  
  await prisma.typeOption.deleteMany()
  await prisma.categoryOption.deleteMany()
  await prisma.qualityOption.deleteMany()
  await prisma.unitOption.deleteMany()

  // Seed default TypeOptions
  console.log('  Seeding TypeOptions...')
  await prisma.typeOption.createMany({
    data: [
      { name: 'LEATHER', label: 'Kulit (Leather)' },
      { name: 'FABRIC', label: 'Kain (Fabric)' },
      { name: 'ZIPPER', label: 'Resleting (Zipper)' },
      { name: 'GLUE', label: 'Lem (Glue)' },
      { name: 'ACCESSORY', label: 'Aksesori' }
    ]
  })

  // Seed default CategoryOptions
  console.log('  Seeding CategoryOptions...')
  await prisma.categoryOption.createMany({
    data: [
      { name: 'Kulit Asli' },
      { name: 'Lem Perekat' },
      { name: 'Kain Tekstil' }
    ]
  })

  // Seed default QualityOptions
  console.log('  Seeding QualityOptions...')
  await prisma.qualityOption.createMany({
    data: [
      { name: 'Premium' },
      { name: 'Standar' },
      { name: 'Grade A' }
    ]
  })

  // Seed default UnitOptions
  console.log('  Seeding UnitOptions...')
  await prisma.unitOption.createMany({
    data: [
      { name: 'feet' },
      { name: 'ml' },
      { name: 'meter' }
    ]
  })

  // 1. Create Raw Materials (Bahan Baku)
  console.log('  Seeding Materials...')
  const materials = [
    {
      sku: 'LTH-GEN-01',
      name: 'Kulit Sapi Asli',
      type: 'LEATHER',
      category: 'Kulit Asli',
      quality: 'Premium',
      size: 'Lembaran',
      stock: 50.0,
      unit: 'feet',
      colorPattern: 'Hitam',
      imageUrl: null,
      expiredAt: null,
    },
    {
      sku: 'GLU-STD-01',
      name: 'Lem Serbaguna',
      type: 'GLUE',
      category: 'Lem Perekat',
      quality: 'Standar',
      size: 'Botol',
      stock: 10.0,
      unit: 'ml',
      colorPattern: 'Bening',
      imageUrl: null,
      expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15), // Hampir kedaluwarsa (15 hari lagi)
    },
    {
      sku: 'FAB-LIN-01',
      name: 'Kain Linen',
      type: 'FABRIC',
      category: 'Kain Tekstil',
      quality: 'Grade A',
      size: 'Gulungan',
      stock: 5.0, // Stok menipis (threshold FABRIC adalah 20)
      unit: 'meter',
      colorPattern: 'Krem',
      imageUrl: null,
      expiredAt: null,
    }
  ]

  const createdMaterials = []
  for (const m of materials) {
    const created = await prisma.material.create({ data: m })
    createdMaterials.push(created)

    // Write initial stock log (intake)
    await prisma.stockLog.create({
      data: {
        materialId: created.id,
        quantity: m.stock,
        type: 'INCOMING',
        notes: `Stok awal masuk gudang sebanyak ${m.stock} ${m.unit} selama proses seeding.`
      }
    })
  }

  // 2. Create Product Innovations
  console.log('  Seeding Products...')
  const productA = await prisma.product.create({
    data: {
      name: 'DOMPET KULIT KLASIK',
      description: 'Dompet kulit asli dengan kompartemen kartu minimalis dan elegan.',
      imageUrl: null,
    }
  })

  // Link BOM for Product A (Bahan Siap)
  const mLeather = createdMaterials.find(m => m.sku === 'LTH-GEN-01')!
  await prisma.productMaterial.create({
    data: {
      productId: productA.id,
      materialId: mLeather.id,
      quantityRequired: 5.0, // Butuh 5.0, stok ada 50.0 (Bahan Siap)
      notes: 'Bahan utama bodi luar dompet'
    }
  })

  const productB = await prisma.product.create({
    data: {
      name: 'TAS TOTE LINEN',
      description: 'Tas jinjing (tote bag) dari bahan linen untuk kegiatan sehari-hari.',
      imageUrl: null,
    }
  })

  // Link BOM for Product B (Bahan Kurang)
  const mLinen = createdMaterials.find(m => m.sku === 'FAB-LIN-01')!
  await prisma.productMaterial.create({
    data: {
      productId: productB.id,
      materialId: mLinen.id,
      quantityRequired: 10.0, // Butuh 10.0, stok hanya ada 5.0 (Bahan Kurang)
      notes: 'Bahan utama kompartemen tas'
    }
  })

  console.log(`✅ Seeding inventaris selesai. Database berisi ${createdMaterials.length} bahan baku (1 aman, 1 hampir kedaluwarsa, 1 stok menipis), dan 2 produk (1 bahan siap, 1 bahan kurang).`)
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

  seedInventory(prisma)
    .catch((e) => {
      console.error('❌ Terjadi kesalahan saat melakukan seeding inventaris:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
