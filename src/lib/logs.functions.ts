import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const getStockLogs = createServerFn({ method: 'GET' })
  .inputValidator(z.object({
    type: z.string().optional(),
    materialId: z.string().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  }))
  .handler(async ({ data }) => {
    const { prisma } = await import('#/db.server')
    const { type, materialId, page, limit } = data

    const where: any = {}

    if (type && type !== 'ALL') {
      where.type = type
    }

    if (materialId) {
      where.materialId = materialId
    }

    const statsWhere: any = {}
    if (materialId) {
      statsWhere.materialId = materialId
    }

    // Query stats and items concurrently
    const [totalCount, incomingCount, outgoingCount, adjustmentCount] = await Promise.all([
      prisma.stockLog.count({ where }),
      prisma.stockLog.count({ where: { ...statsWhere, type: 'INCOMING' } }),
      prisma.stockLog.count({ where: { ...statsWhere, type: 'OUTGOING' } }),
      prisma.stockLog.count({ where: { ...statsWhere, type: 'ADJUSTMENT' } }),
    ])

    const findOptions: any = {
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        material: {
          select: {
            sku: true,
            name: true,
            unit: true,
            colorPattern: true,
          },
        },
      },
    }

    if (page && limit) {
      findOptions.skip = (page - 1) * limit
      findOptions.take = limit
    } else {
      findOptions.take = limit || 50
    }

    const items = await prisma.stockLog.findMany(findOptions)

    return { 
      items, 
      totalCount, 
      stats: {
        totalCount: materialId ? totalCount : await prisma.stockLog.count(),
        incomingCount,
        outgoingCount,
        adjustmentCount
      } 
    }
  })
