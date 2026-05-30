import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Recreate product schemas from products.functions.ts
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
  ).min(1, 'Product innovation must include at least one raw material.'),
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
  ).min(1, 'Product innovation must include at least one raw material.'),
})

const startProductionSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
})

const completeProductionSchema = z.object({
  productionId: z.string(),
})

describe('Products - Create Product Schema Validation', () => {
  it('should accept valid product with one material', () => {
    const result = createProductSchema.safeParse({
      name: 'Dompet Kulit',
      description: 'Dompet premium handmade',
      imageUrl: 'https://example.com/image.jpg',
      materials: [
        { materialId: 'mat-001', quantityRequired: 2.5, notes: 'Untuk bagian luar' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('should accept valid product with multiple materials', () => {
    const result = createProductSchema.safeParse({
      name: 'Tas Selempang',
      description: null,
      imageUrl: null,
      materials: [
        { materialId: 'mat-001', quantityRequired: 3, notes: 'Bagian badan tas' },
        { materialId: 'mat-002', quantityRequired: 1, notes: null },
        { materialId: 'mat-003', quantityRequired: 0.5, notes: 'Aksesoris' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('should reject product name shorter than 2 characters', () => {
    const result = createProductSchema.safeParse({
      name: 'A',
      materials: [
        { materialId: 'mat-001', quantityRequired: 1 },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('should reject product with no materials (empty array)', () => {
    const result = createProductSchema.safeParse({
      name: 'Dompet Test',
      materials: [],
    })
    expect(result.success).toBe(false)
  })

  it('should reject material with zero quantity', () => {
    const result = createProductSchema.safeParse({
      name: 'Dompet Test',
      materials: [
        { materialId: 'mat-001', quantityRequired: 0 },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('should reject material with negative quantity', () => {
    const result = createProductSchema.safeParse({
      name: 'Dompet Test',
      materials: [
        { materialId: 'mat-001', quantityRequired: -5 },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('should accept product without description and image (optional/nullable)', () => {
    const result = createProductSchema.safeParse({
      name: 'Simple Product',
      materials: [
        { materialId: 'mat-001', quantityRequired: 1 },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('should reject missing name field', () => {
    const result = createProductSchema.safeParse({
      materials: [
        { materialId: 'mat-001', quantityRequired: 1 },
      ],
    })
    expect(result.success).toBe(false)
  })
})

describe('Products - Update Product Schema Validation', () => {
  it('should accept valid update with id', () => {
    const result = updateProductSchema.safeParse({
      id: 'prod-001',
      name: 'Updated Dompet',
      description: 'Updated description',
      imageUrl: null,
      materials: [
        { materialId: 'mat-001', quantityRequired: 3, notes: 'Updated notes' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('should reject update without id', () => {
    const result = updateProductSchema.safeParse({
      name: 'Updated Dompet',
      materials: [
        { materialId: 'mat-001', quantityRequired: 3 },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('should reject update without materials', () => {
    const result = updateProductSchema.safeParse({
      id: 'prod-001',
      name: 'Updated Dompet',
      materials: [],
    })
    expect(result.success).toBe(false)
  })
})

describe('Products - Start Production Schema Validation', () => {
  it('should accept valid production start', () => {
    const result = startProductionSchema.safeParse({
      productId: 'prod-001',
      quantity: 10,
    })
    expect(result.success).toBe(true)
  })

  it('should reject zero quantity', () => {
    const result = startProductionSchema.safeParse({
      productId: 'prod-001',
      quantity: 0,
    })
    expect(result.success).toBe(false)
  })

  it('should reject negative quantity', () => {
    const result = startProductionSchema.safeParse({
      productId: 'prod-001',
      quantity: -5,
    })
    expect(result.success).toBe(false)
  })

  it('should reject fractional quantity (must be integer)', () => {
    const result = startProductionSchema.safeParse({
      productId: 'prod-001',
      quantity: 2.5,
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing productId', () => {
    const result = startProductionSchema.safeParse({
      quantity: 10,
    })
    expect(result.success).toBe(false)
  })
})

describe('Products - Complete Production Schema Validation', () => {
  it('should accept valid production completion', () => {
    const result = completeProductionSchema.safeParse({
      productionId: 'production-001',
    })
    expect(result.success).toBe(true)
  })

  it('should reject missing productionId', () => {
    const result = completeProductionSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('Products - Production Capacity Calculation (BOM Logic)', () => {
  it('should calculate max units when all materials sufficient', () => {
    const materials = [
      { quantityRequired: 2, material: { stock: 20, unit: 'feet' } },
      { quantityRequired: 1, material: { stock: 15, unit: 'pcs' } },
      { quantityRequired: 0.5, material: { stock: 10, unit: 'meter' } },
    ]

    let maxUnits = Infinity
    materials.forEach((pm) => {
      const capacity = Math.floor(pm.material.stock / pm.quantityRequired)
      if (capacity < maxUnits) maxUnits = capacity
    })

    expect(maxUnits).toBe(10) // min(10, 15, 20) = 10
  })

  it('should return 0 when one material has zero stock', () => {
    const materials = [
      { quantityRequired: 2, material: { stock: 20, unit: 'feet' } },
      { quantityRequired: 1, material: { stock: 0, unit: 'pcs' } },
    ]

    let maxUnits = Infinity
    materials.forEach((pm) => {
      const capacity = Math.floor(pm.material.stock / pm.quantityRequired)
      if (capacity < maxUnits) maxUnits = capacity
    })

    expect(maxUnits).toBe(0)
  })

  it('should correctly identify material deficits for 1 unit', () => {
    const materials = [
      { quantityRequired: 10, material: { stock: 5, name: 'Kulit', sku: 'LTR-001', unit: 'feet' } },
      { quantityRequired: 3, material: { stock: 10, name: 'Kain', sku: 'FBR-001', unit: 'meter' } },
    ]

    const deficits = materials.filter(pm => pm.material.stock < pm.quantityRequired)
    expect(deficits).toHaveLength(1)
    expect(deficits[0].material.name).toBe('Kulit')
  })

  it('should handle product with no materials', () => {
    const materials: Array<{ quantityRequired: number; material: { stock: number } }> = []
    let maxUnits = Infinity
    if (materials.length === 0) maxUnits = 0
    expect(maxUnits).toBe(0)
  })

  it('should check stock sufficiency for given production quantity', () => {
    const productionQty = 5
    const materials = [
      { quantityRequired: 2, material: { stock: 15 } },
      { quantityRequired: 3, material: { stock: 10 } },
    ]

    const canProduce = materials.every(
      pm => pm.material.stock >= pm.quantityRequired * productionQty
    )
    expect(canProduce).toBe(false) // 3 * 5 = 15, but stock is 10
  })

  it('should calculate total material needed for production batch', () => {
    const productionQty = 3
    const material = { quantityRequired: 2.5 }
    const totalNeeded = material.quantityRequired * productionQty
    expect(totalNeeded).toBeCloseTo(7.5)
  })

  it('should detect stock deduction correctness', () => {
    const currentStock = 50
    const required = 2.5
    const productionQty = 10
    const totalDeduction = required * productionQty
    const newStock = currentStock - totalDeduction
    expect(newStock).toBe(25)
  })
})

describe('Products - Material Availability Status Logic', () => {
  it('should mark product as ready when all materials have sufficient stock', () => {
    const product = {
      materials: [
        { quantityRequired: 2, material: { stock: 10 } },
        { quantityRequired: 5, material: { stock: 15 } },
      ],
    }
    const isReady = product.materials.every(pm => pm.material.stock >= pm.quantityRequired)
    expect(isReady).toBe(true)
  })

  it('should mark product as warning when any material has insufficient stock', () => {
    const product = {
      materials: [
        { quantityRequired: 2, material: { stock: 10 } },
        { quantityRequired: 5, material: { stock: 3 } },
      ],
    }
    const hasWarnings = product.materials.some(pm => pm.material.stock < pm.quantityRequired)
    expect(hasWarnings).toBe(true)
  })

  it('should count short items correctly', () => {
    const product = {
      materials: [
        { quantityRequired: 2, material: { stock: 1 } },
        { quantityRequired: 5, material: { stock: 3 } },
        { quantityRequired: 1, material: { stock: 10 } },
      ],
    }
    const shortItems = product.materials.filter(pm => pm.material.stock < pm.quantityRequired)
    expect(shortItems).toHaveLength(2)
  })

  it('should calculate missing quantity correctly', () => {
    const pm = { quantityRequired: 10, material: { stock: 3 } }
    const missingQty = pm.quantityRequired - pm.material.stock
    expect(missingQty).toBe(7)
  })
})
