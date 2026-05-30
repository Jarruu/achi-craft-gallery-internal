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
        sku: true,
        name: true,
        type: true,
        stock: true,
        unit: true,
        expiredAt: true,
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

    // 4. Calculate warnings with consistent thresholds (30 days for expiration)
    const now = new Date()
    const lowStockThresholds: Record<string, number> = {
      LEATHER: 15,
      FABRIC: 20,
      ZIPPER: 10,
      GLUE: 5,
      ACCESSORY: 8,
    }

    const outOfStock: any[] = []
    const lowStock: any[] = []
    const expired: any[] = []
    const almostExpired: any[] = []

    materials.forEach(m => {
      const isOutOfStock = m.stock <= 0
      const isLowStock = m.stock > 0 && m.stock < (lowStockThresholds[m.type] || 10)
      
      let isExpired = false
      let isAlmostExpired = false
      if (m.expiredAt) {
        const expDate = new Date(m.expiredAt)
        const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays < 0) {
          isExpired = true
        } else if (diffDays <= 30) {
          isAlmostExpired = true
        }
      }

      if (isExpired) expired.push(m)
      else if (isAlmostExpired) almostExpired.push(m)

      if (isOutOfStock) outOfStock.push(m)
      else if (isLowStock) lowStock.push(m)
    })

    const warningList: any[] = []
    
    expired.forEach(m => {
      warningList.push({
        ...m,
        warningType: 'EXPIRED',
        severity: 1,
        message: 'Kedaluwarsa'
      })
    })

    outOfStock.forEach(m => {
      warningList.push({
        ...m,
        warningType: 'OUT_OF_STOCK',
        severity: 2,
        message: 'Stok Habis'
      })
    })

    almostExpired.forEach(m => {
      const exp = new Date(m.expiredAt!)
      const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      warningList.push({
        ...m,
        warningType: 'ALMOST_EXPIRED',
        severity: 3,
        message: `${daysLeft} hari lagi`
      })
    })

    lowStock.forEach(m => {
      warningList.push({
        ...m,
        warningType: 'LOW_STOCK',
        severity: 4,
        message: `Sisa ${m.stock} ${m.unit}`
      })
    })

    // Sort by severity (1 is most critical, 4 is least critical)
    warningList.sort((a, b) => a.severity - b.severity)

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
      outOfStockCount: outOfStock.length,
      lowStockCount: lowStock.length,
      expiredCount: expired.length,
      almostExpiredCount: almostExpired.length,
      warningMaterials: warningList.slice(0, 5), // top 5 critical materials
      recentLogs,
      productCapacities: productCapacities.slice(0, 5), // top 5 products
    }
  })
