import { createServerFn } from '@tanstack/react-start'

export const getDashboardStats = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { prisma } = await import('#/db.server')

    // 1. Total counts
    const totalMaterials = await prisma.material.count()
    const totalProducts = await prisma.product.count()
    const totalLogs = await prisma.stockLog.count()

    // 2. Stock logs count for the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const logsLast7Days = await prisma.stockLog.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    })

    // 3. Materials count and total stock by Material Type
    const materials = await prisma.material.findMany({
      select: {
        id: true,
        type: true,
        stock: true,
        unit: true,
      },
    })

    // Group materials by type: LEATHER, FABRIC, GLUE, ZIPPER, ACCESSORY
    const typeStats = {
      LEATHER: { count: 0, stock: 0 },
      FABRIC: { count: 0, stock: 0 },
      GLUE: { count: 0, stock: 0 },
      ZIPPER: { count: 0, stock: 0 },
      ACCESSORY: { count: 0, stock: 0 },
    }

    materials.forEach((m) => {
      const type = m.type as keyof typeof typeStats
      if (typeStats[type]) {
        typeStats[type].count += 1
        typeStats[type].stock += m.stock
      }
    })

    // 4. Low stock materials (stock <= 5.0)
    const lowStockMaterials = await prisma.material.findMany({
      where: {
        stock: {
          lte: 5.0,
        },
      },
      orderBy: {
        stock: 'asc',
      },
      take: 5,
    })

    // 5. Recent stock activities (last 5 logs)
    const recentLogs = await prisma.stockLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
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

    // 6. Products max capacity calculation
    // Get all products with their BOM (materials required)
    const products = await prisma.product.findMany({
      include: {
        materials: {
          include: {
            material: {
              select: {
                id: true,
                name: true,
                sku: true,
                stock: true,
                unit: true,
              },
            },
          },
        },
      },
    })

    const productCapacities = products.map((product) => {
      const materialsNeeded = product.materials

      let maxUnitsCanProduce = Infinity
      const materialDeficits: {
        materialName: string
        sku: string
        required: number
        available: number
        unit: string
      }[] = []

      if (materialsNeeded.length === 0) {
        maxUnitsCanProduce = 0
      } else {
        materialsNeeded.forEach((pm) => {
          const stockAvailable = pm.material.stock
          const qtyRequired = pm.quantityRequired
          const capacity = Math.floor(stockAvailable / qtyRequired)

          if (capacity < maxUnitsCanProduce) {
            maxUnitsCanProduce = capacity
          }

          if (stockAvailable < qtyRequired) {
            materialDeficits.push({
              materialName: pm.material.name,
              sku: pm.material.sku,
              required: qtyRequired,
              available: stockAvailable,
              unit: pm.material.unit,
            })
          }
        })
      }

      if (maxUnitsCanProduce === Infinity) {
        maxUnitsCanProduce = 0
      }

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        materialsCount: materialsNeeded.length,
        maxUnitsCanProduce,
        materialDeficits,
      }
    })

    // Sort product capacities: show products that can be produced (maxUnitsCanProduce > 0)
    // then show products that cannot be produced.
    productCapacities.sort((a, b) => b.maxUnitsCanProduce - a.maxUnitsCanProduce)

    return {
      totalMaterials,
      totalProducts,
      totalLogs,
      logsLast7Days,
      typeStats,
      lowStockMaterials,
      recentLogs,
      productCapacities: productCapacities.slice(0, 5), // top 5 products
    }
  })
