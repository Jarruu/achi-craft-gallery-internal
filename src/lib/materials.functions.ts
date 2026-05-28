import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

// Material Types
export type MaterialType = 'LEATHER' | 'FABRIC' | 'GLUE' | 'ZIPPER' | 'ACCESSORY'

const createMaterialSchema = z.object({
  sku: z.string().min(3),
  name: z.string().min(2),
  type: z.string(),
  category: z.string().min(2),
  quality: z.string().min(2),
  size: z.string().min(1),
  stock: z.number().default(0),
  unit: z.string(),
  colorPattern: z.string().min(2),
  imageUrl: z.string().optional().nullable(),
  expiredAt: z.string().optional().nullable(), // Receive string and parse to Date
})

const updateStockSchema = z.object({
  materialId: z.string(),
  quantity: z.number(), // positive or negative change
  type: z.enum(['INCOMING', 'OUTGOING', 'ADJUSTMENT']),
  notes: z.string().optional(),
})

export const getMaterials = createServerFn({ method: 'GET' })
  .inputValidator(z.object({
    search: z.string().optional(),
    type: z.string().optional(),
    category: z.string().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  }))
  .handler(async ({ data }) => {
    const { prisma } = await import('#/db.server')
    const { search, type, category, page, limit } = data

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { colorPattern: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (type && type !== 'ALL') {
      where.type = type
    }

    if (category && category !== 'ALL') {
      where.category = category
    }

    const totalCount = await prisma.material.count({ where })

    const findOptions: any = {
      where,
      orderBy: [
        { createdAt: 'desc' }
      ],
      include: {
        stockLogs: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    }

    if (page && limit) {
      findOptions.skip = (page - 1) * limit
      findOptions.take = limit
    }

    const items = await prisma.material.findMany(findOptions)

    return { items, totalCount }
  })

export const createMaterial = createServerFn({ method: 'POST' })
  .inputValidator(createMaterialSchema)
  .handler(async ({ data }) => {
    const { prisma } = await import('#/db.server')
    const { expiredAt, ...rest } = data
    const parsedExpiredAt = expiredAt ? new Date(expiredAt) : null

    // Run in transaction to create material and write initial stock log if stock > 0
    return await prisma.$transaction(async (tx) => {
      const material = await tx.material.create({
        data: {
          ...rest,
          expiredAt: parsedExpiredAt,
        },
      })

      if (rest.stock > 0) {
        await tx.stockLog.create({
          data: {
            materialId: material.id,
            quantity: rest.stock,
            type: 'INCOMING',
            notes: 'Stok awal saat pendaftaran bahan baku.',
          },
        })
      }

      return material
    })
  })

export const updateStock = createServerFn({ method: 'POST' })
  .inputValidator(updateStockSchema)
  .handler(async ({ data }) => {
    const { prisma } = await import('#/db.server')
    const { materialId, quantity, type, notes } = data

    return await prisma.$transaction(async (tx) => {
      // 1. Fetch material to confirm existence and current stock
      const material = await tx.material.findUnique({
        where: { id: materialId },
      })

      if (!material) {
        throw new Error('Bahan baku tidak ditemukan')
      }

      // Calculate new stock
      const newStock = material.stock + quantity
      if (newStock < 0) {
        throw new Error(`Stok tidak mencukupi. Pencatatan ini akan mengakibatkan jumlah stok negatif (${newStock} ${material.unit}).`)
      }

      // 2. Update material stock
      const updatedMaterial = await tx.material.update({
        where: { id: materialId },
        data: { stock: newStock },
      })

      // 3. Create stock log entry
      const defaultNotes = `Penyesuaian stok (${type === 'INCOMING' ? 'Masuk' : type === 'OUTGOING' ? 'Keluar' : 'Audit'}) sebesar ${quantity} ${material.unit}.`
      await tx.stockLog.create({
        data: {
          materialId,
          quantity,
          type,
          notes: notes || defaultNotes,
        },
      })

      return updatedMaterial
    })
  })

export const deleteMaterial = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { prisma } = await import('#/db.server')
    const { id } = data
    return await prisma.material.delete({
      where: { id },
    })
  })
