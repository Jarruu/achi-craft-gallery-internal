import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  materials: z.array(
    z.object({
      materialId: z.string(),
      quantityRequired: z.number().positive(),
      notes: z.string().optional().nullable(),
    })
  ).min(1, "Product innovation must include at least one raw material."),
})

export const getProducts = createServerFn({ method: 'GET' })
  .inputValidator(z.object({
    search: z.string().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  }))
  .handler(async ({ data }) => {
    const { prisma } = await import('#/db.server')
    const { search, page, limit } = data

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const totalCount = await prisma.product.count({ where })

    const findOptions: any = {
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        materials: {
          include: {
            material: true,
          },
        },
        productions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    }

    if (page && limit) {
      findOptions.skip = (page - 1) * limit
      findOptions.take = limit
    }

    const items = await prisma.product.findMany(findOptions)

    return { items, totalCount }
  })

export const createProduct = createServerFn({ method: 'POST' })
  .inputValidator(createProductSchema)
  .handler(async ({ data }) => {
    const { prisma } = await import('#/db.server')
    const { name, description, imageUrl, materials } = data

    return await prisma.$transaction(async (tx) => {
      // 1. Create the product innovation
      const product = await tx.product.create({
        data: {
          name,
          description,
          imageUrl,
        },
      })

      // 2. Create the Bill of Materials (BOM) links
      const bomData = materials.map((item) => ({
        productId: product.id,
        materialId: item.materialId,
        quantityRequired: item.quantityRequired,
        notes: item.notes || null,
      }))

      await tx.productMaterial.createMany({
        data: bomData,
      })

      return await tx.product.findUnique({
        where: { id: product.id },
        include: {
          materials: {
            include: {
              material: true,
            },
          },
          productions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    })
  })

const updateProductSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  materials: z.array(
    z.object({
      materialId: z.string(),
      quantityRequired: z.number().positive(),
      notes: z.string().optional().nullable(),
    })
  ).min(1, "Product innovation must include at least one raw material."),
})

export const updateProduct = createServerFn({ method: 'POST' })
  .inputValidator(updateProductSchema)
  .handler(async ({ data }) => {
    const { prisma } = await import('#/db.server')
    const { id, name, description, imageUrl, materials } = data

    return await prisma.$transaction(async (tx) => {
      // 1. Update the product innovation metadata
      const product = await tx.product.update({
        where: { id },
        data: {
          name,
          description,
          imageUrl,
        },
      })

      // 2. Delete all existing BOM references
      await tx.productMaterial.deleteMany({
        where: { productId: id },
      })

      // 3. Create the new BOM links
      const bomData = materials.map((item) => ({
        productId: id,
        materialId: item.materialId,
        quantityRequired: item.quantityRequired,
        notes: item.notes || null,
      }))

      await tx.productMaterial.createMany({
        data: bomData,
      })

      return await tx.product.findUnique({
        where: { id },
        include: {
          materials: {
            include: {
              material: true,
            },
          },
          productions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    })
  })

export const deleteProduct = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { prisma } = await import('#/db.server')
    const { id } = data
    return await prisma.product.delete({
      where: { id },
    })
  })

const startProductionSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
})

export const startProduction = createServerFn({ method: 'POST' })
  .inputValidator(startProductionSchema)
  .handler(async ({ data }) => {
    const { prisma } = await import('#/db.server')
    const { productId, quantity } = data

    return await prisma.$transaction(async (tx) => {
      // 1. Fetch product with materials
      const product = await tx.product.findUniqueOrThrow({
        where: { id: productId },
        include: {
          materials: {
            include: {
              material: true,
            },
          },
        },
      })

      // 2. Check if all materials are sufficient
      for (const pm of product.materials) {
        const required = pm.quantityRequired * quantity
        if (pm.material.stock < required) {
          throw new Error(`Stok '${pm.material.name}' kurang. Dibutuhkan: ${required} ${pm.material.unit}, Tersedia: ${pm.material.stock} ${pm.material.unit}`)
        }
      }

      // 3. Deduct stock and write logs for each material
      for (const pm of product.materials) {
        const required = pm.quantityRequired * quantity
        await tx.material.update({
          where: { id: pm.materialId },
          data: {
            stock: {
              decrement: required
            }
          }
        })

        await tx.stockLog.create({
          data: {
            materialId: pm.materialId,
            quantity: -required,
            type: 'OUTGOING',
            notes: `Produksi ${quantity} unit '${product.name}'`
          }
        })
      }

      // 4. Create the Production record
      await tx.production.create({
        data: {
          productId,
          quantity,
          status: 'ONGOING'
        }
      })

      // 5. Return the updated product with associations
      return await tx.product.findUnique({
        where: { id: productId },
        include: {
          materials: {
            include: {
              material: true,
            },
          },
          productions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    })
  })

const completeProductionSchema = z.object({
  productionId: z.string(),
})

export const completeProduction = createServerFn({ method: 'POST' })
  .inputValidator(completeProductionSchema)
  .handler(async ({ data }) => {
    const { prisma } = await import('#/db.server')
    const { productionId } = data

    const production = await prisma.production.update({
      where: { id: productionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    })

    return await prisma.product.findUnique({
      where: { id: production.productId },
      include: {
        materials: {
          include: {
            material: true,
          },
        },
        productions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  })

export const getOngoingProductions = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { prisma } = await import('#/db.server')
    return await prisma.production.findMany({
      where: { status: 'ONGOING' },
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    })
  })
