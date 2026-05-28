import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import crypto from 'crypto'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Melakukan seeding inventaris Galeri Kriya Achi...')

  // Clear tables in reverse order of foreign key dependencies
  await prisma.user.deleteMany()
  await prisma.productMaterial.deleteMany()
  await prisma.stockLog.deleteMany()
  await prisma.product.deleteMany()
  await prisma.material.deleteMany()

  // 1. Create Raw Materials (Bahan Baku)
  const materials = [
    {
      sku: 'LTH-SYN-PY01',
      name: 'Kulit Suede Motif Python',
      type: 'LEATHER',
      category: 'Kulit Sintetis',
      quality: 'Kualitas Premium',
      size: 'Lembaran 5x5 kaki (feet)',
      stock: 12.5,
      unit: 'feet',
      colorPattern: 'Cokelat Python (Tan)',
      imageUrl: null,
      expiredAt: null,
    },
    {
      sku: 'LTH-GEN-SD02',
      name: 'Kulit Suede Anak Sapi Asli',
      type: 'LEATHER',
      category: 'Suede Non-Sintetis',
      quality: 'Kualitas Ultra-Premium',
      size: 'Lembaran 6x4 kaki (feet)',
      stock: 35.0,
      unit: 'feet',
      colorPattern: 'Suede Hijau Zamrud',
      imageUrl: null,
      expiredAt: null,
    },
    {
      sku: 'FAB-BLG-LN01',
      name: 'Kain Linen Belgia Kualitas A',
      type: 'FABRIC',
      category: 'Kain Kualitas A',
      quality: 'Tenunan Kualitas Tinggi',
      size: 'Gulungan Lebar 1,5m',
      stock: 8.0,
      unit: 'meter',
      colorPattern: 'Tenunan Krem',
      imageUrl: null,
      expiredAt: null,
    },
    {
      sku: 'GLU-QDK-MP01',
      name: 'Lem Neoprene Cepat Kering',
      type: 'GLUE',
      category: 'Lem Solvent (Bahan Pelarut)',
      quality: 'Standar Industri',
      size: 'Kaleng 250ml',
      stock: 4.0,
      unit: 'ml',
      colorPattern: 'Cairan Kuning Bening',
      imageUrl: null,
      expiredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // Expired 15 days ago
    },
    {
      sku: 'GLU-UV-RES02',
      name: 'Resin UV Bening Epoxy',
      type: 'GLUE',
      category: 'Resin Epoxy',
      quality: 'Bening Kristal',
      size: 'Botol 100ml',
      stock: 15.0,
      unit: 'ml',
      colorPattern: 'Bening Transparan',
      imageUrl: null,
      expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45), // Expiring in 45 days
    },
    {
      sku: 'ZIP-HDY-BR01',
      name: 'Ritsleting Kuningan Kuat YKK',
      type: 'ZIPPER',
      category: 'Ritsleting Logam',
      quality: 'Kuningan Kelas A',
      size: 'Panjang 30cm',
      stock: 25.0,
      unit: 'pcs',
      colorPattern: 'Hitam / Emas Kuningan',
      imageUrl: null,
      expiredAt: null,
    },
    {
      sku: 'ACC-SLD-BK01',
      name: 'Set Gesper Kuningan Solid',
      type: 'ACCESSORY',
      category: 'Gesper Logam',
      quality: 'Polesan Premium',
      size: 'Lebar Dalam 2,5cm',
      stock: 12.0,
      unit: 'pcs',
      colorPattern: 'Emas Kuningan Mengkilap',
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
  const productA = await prisma.product.create({
    data: {
      name: 'RANSEL SUEDE NORDIC',
      description: 'Ransel mewah kontemporer yang memadukan kulit suede anak sapi berwarna hijau zamrud dengan aksesoris kuningan mengkilap serta sekat linen premium.',
      imageUrl: null,
    }
  })

  // Link BOM for Backpack (Deficits & sufficiency check)
  const mSuede = createdMaterials.find(m => m.sku === 'LTH-GEN-SD02')!
  const mLinen = createdMaterials.find(m => m.sku === 'FAB-BLG-LN01')!
  const mZipper = createdMaterials.find(m => m.sku === 'ZIP-HDY-BR01')!
  const mBuckle = createdMaterials.find(m => m.sku === 'ACC-SLD-BK01')!

  await prisma.productMaterial.createMany({
    data: [
      { productId: productA.id, materialId: mSuede.id, quantityRequired: 8.0, notes: 'Panel bodi bagian luar' },
      { productId: productA.id, materialId: mLinen.id, quantityRequired: 2.0, notes: 'Sekat pembatas bagian dalam' },
      { productId: productA.id, materialId: mZipper.id, quantityRequired: 2.0, notes: 'Penutup kompartemen utama' },
      { productId: productA.id, materialId: mBuckle.id, quantityRequired: 4.0, notes: 'Pengait pengatur tali bahu' },
    ]
  })

  const productB = await prisma.product.create({
    data: {
      name: 'CLUTCH TIPIS PYTHON GEOMETRIS',
      description: 'Tas genggam (clutch) lipat geometris asimetris dengan bahan kulit motif python premium dan aksesoris logam yang kokoh.',
      imageUrl: null,
    }
  })

  // Link BOM for Clutch
  const mPython = createdMaterials.find(m => m.sku === 'LTH-SYN-PY01')!

  await prisma.productMaterial.createMany({
    data: [
      { productId: productB.id, materialId: mPython.id, quantityRequired: 15.0, notes: 'Pelapis bagian luar secara keseluruhan' },
      { productId: productB.id, materialId: mZipper.id, quantityRequired: 1.0, notes: 'Ritsleting saku depan model amplop' },
      { productId: productB.id, materialId: mBuckle.id, quantityRequired: 1.0, notes: 'Set kunci pengait penutup' },
    ]
  })

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'adminacg@gmail.com',
      password: crypto.createHash('sha256').update('123456').digest('hex'),
    }
  })

  console.log(`👤 Admin user seeded: ${adminUser.email}`)
  console.log(`✅ Database berhasil diseed. Terdaftar ${createdMaterials.length} bahan baku, 2 cetak biru produk, dan 1 akun admin.`)
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat melakukan seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
