import { describe, it, expect } from 'vitest'

describe('Dashboard - Warning Classification Logic', () => {
  const lowStockThresholds: Record<string, number> = {
    LEATHER: 15,
    FABRIC: 20,
    ZIPPER: 10,
    GLUE: 5,
    ACCESSORY: 8,
  }

  function classifyWarnings(materials: Array<{
    id: string; sku: string; name: string; type: string; stock: number; unit: string; expiredAt: string | null
  }>) {
    const now = new Date()
    const outOfStock: typeof materials = []
    const lowStock: typeof materials = []
    const expired: typeof materials = []
    const almostExpired: typeof materials = []

    materials.forEach(m => {
      const isOutOfStock = m.stock <= 0
      const isLowStock = m.stock > 0 && m.stock < (lowStockThresholds[m.type] || 10)

      let isExpired = false
      let isAlmostExpired = false
      if (m.expiredAt) {
        const expDate = new Date(m.expiredAt)
        const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays < 0) isExpired = true
        else if (diffDays <= 30) isAlmostExpired = true
      }

      if (isExpired) expired.push(m)
      else if (isAlmostExpired) almostExpired.push(m)
      if (isOutOfStock) outOfStock.push(m)
      else if (isLowStock) lowStock.push(m)
    })

    return { outOfStock, lowStock, expired, almostExpired }
  }

  it('should classify out-of-stock materials', () => {
    const materials = [
      { id: '1', sku: 'LTR-001', name: 'Kulit', type: 'LEATHER', stock: 0, unit: 'feet', expiredAt: null },
    ]
    const result = classifyWarnings(materials)
    expect(result.outOfStock).toHaveLength(1)
    expect(result.lowStock).toHaveLength(0)
  })

  it('should classify low-stock materials', () => {
    const materials = [
      { id: '2', sku: 'FBR-001', name: 'Kain', type: 'FABRIC', stock: 10, unit: 'meter', expiredAt: null },
    ]
    const result = classifyWarnings(materials)
    expect(result.lowStock).toHaveLength(1) // 10 < 20 threshold
    expect(result.outOfStock).toHaveLength(0)
  })

  it('should classify expired materials', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 10)
    const materials = [
      { id: '3', sku: 'GLU-001', name: 'Lem', type: 'GLUE', stock: 50, unit: 'ml', expiredAt: pastDate.toISOString() },
    ]
    const result = classifyWarnings(materials)
    expect(result.expired).toHaveLength(1)
    expect(result.almostExpired).toHaveLength(0)
  })

  it('should classify almost-expired materials (within 30 days)', () => {
    const soonDate = new Date()
    soonDate.setDate(soonDate.getDate() + 15)
    const materials = [
      { id: '4', sku: 'GLU-002', name: 'Lem 2', type: 'GLUE', stock: 50, unit: 'ml', expiredAt: soonDate.toISOString() },
    ]
    const result = classifyWarnings(materials)
    expect(result.almostExpired).toHaveLength(1)
    expect(result.expired).toHaveLength(0)
  })

  it('should not flag safe materials', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 90)
    const materials = [
      { id: '5', sku: 'LTR-002', name: 'Kulit Premium', type: 'LEATHER', stock: 50, unit: 'feet', expiredAt: futureDate.toISOString() },
    ]
    const result = classifyWarnings(materials)
    expect(result.outOfStock).toHaveLength(0)
    expect(result.lowStock).toHaveLength(0)
    expect(result.expired).toHaveLength(0)
    expect(result.almostExpired).toHaveLength(0)
  })

  it('should handle material that is both out-of-stock and expired', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 5)
    const materials = [
      { id: '6', sku: 'GLU-003', name: 'Lem Expired Habis', type: 'GLUE', stock: 0, unit: 'ml', expiredAt: pastDate.toISOString() },
    ]
    const result = classifyWarnings(materials)
    expect(result.outOfStock).toHaveLength(1)
    expect(result.expired).toHaveLength(1)
  })

  it('should handle materials without expiration date', () => {
    const materials = [
      { id: '7', sku: 'ACC-001', name: 'Aksesoris', type: 'ACCESSORY', stock: 50, unit: 'pcs', expiredAt: null },
    ]
    const result = classifyWarnings(materials)
    expect(result.expired).toHaveLength(0)
    expect(result.almostExpired).toHaveLength(0)
  })
})

describe('Dashboard - Warning Severity Sorting', () => {
  it('should sort warnings by severity (EXPIRED=1, OUT_OF_STOCK=2, ALMOST_EXPIRED=3, LOW_STOCK=4)', () => {
    const warningList = [
      { name: 'Low Stock Item', warningType: 'LOW_STOCK', severity: 4 },
      { name: 'Expired Item', warningType: 'EXPIRED', severity: 1 },
      { name: 'Almost Expired', warningType: 'ALMOST_EXPIRED', severity: 3 },
      { name: 'Out of Stock', warningType: 'OUT_OF_STOCK', severity: 2 },
    ]
    
    warningList.sort((a, b) => a.severity - b.severity)
    
    expect(warningList[0].warningType).toBe('EXPIRED')
    expect(warningList[1].warningType).toBe('OUT_OF_STOCK')
    expect(warningList[2].warningType).toBe('ALMOST_EXPIRED')
    expect(warningList[3].warningType).toBe('LOW_STOCK')
  })

  it('should limit warning materials to top 5', () => {
    const warningList = Array.from({ length: 10 }, (_, i) => ({
      name: `Material ${i}`,
      severity: i + 1,
    }))
    const top5 = warningList.slice(0, 5)
    expect(top5).toHaveLength(5)
  })
})

describe('Dashboard - Type Stats Aggregation', () => {
  it('should group materials by type and count them', () => {
    const materials = [
      { type: 'LEATHER', stock: 10 },
      { type: 'LEATHER', stock: 20 },
      { type: 'FABRIC', stock: 15 },
      { type: 'GLUE', stock: 5 },
      { type: 'GLUE', stock: 10 },
      { type: 'GLUE', stock: 3 },
    ]

    const typeStats: Record<string, { count: number; stock: number }> = {
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

    expect(typeStats.LEATHER.count).toBe(2)
    expect(typeStats.LEATHER.stock).toBe(30)
    expect(typeStats.FABRIC.count).toBe(1)
    expect(typeStats.FABRIC.stock).toBe(15)
    expect(typeStats.GLUE.count).toBe(3)
    expect(typeStats.GLUE.stock).toBe(18)
    expect(typeStats.ZIPPER.count).toBe(0)
    expect(typeStats.ACCESSORY.count).toBe(0)
  })
})

describe('Dashboard - Product Capacity Sorting', () => {
  it('should sort products by capacity descending', () => {
    const productCapacities = [
      { name: 'Product C', maxUnitsCanProduce: 0 },
      { name: 'Product A', maxUnitsCanProduce: 10 },
      { name: 'Product B', maxUnitsCanProduce: 5 },
    ]
    productCapacities.sort((a, b) => b.maxUnitsCanProduce - a.maxUnitsCanProduce)
    expect(productCapacities[0].name).toBe('Product A')
    expect(productCapacities[1].name).toBe('Product B')
    expect(productCapacities[2].name).toBe('Product C')
  })

  it('should limit product capacities to top 5', () => {
    const caps = Array.from({ length: 10 }, (_, i) => ({
      name: `Product ${i}`,
      maxUnitsCanProduce: i * 2,
    }))
    const top5 = caps.slice(0, 5)
    expect(top5).toHaveLength(5)
  })
})
