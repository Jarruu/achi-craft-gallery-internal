import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

export const getStockLogs = createServerFn({ method: 'GET' })
  .inputValidator(z.object({
    type: z.string().optional(),
    materialId: z.string().optional(),
    limit: z.number().default(50),
  }))
  .handler(async ({ data }) => {
    const { prisma } = await import('#/db.server')
    const { type, materialId, limit } = data

    const where: any = {}

    if (type && type !== 'ALL') {
      where.type = type
    }

    if (materialId) {
      where.materialId = materialId
    }

    return await prisma.stockLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
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
    })
  })
