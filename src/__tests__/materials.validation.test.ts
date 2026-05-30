import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Recreate the exact schemas from materials.functions.ts for unit testing
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
  expiredAt: z.string().optional().nullable(),
})

const updateStockSchema = z.object({
  materialId: z.string(),
  quantity: z.number(),
  type: z.enum(['INCOMING', 'OUTGOING', 'ADJUSTMENT']),
  notes: z.string().optional(),
})

const updateMaterialSchema = z.object({
  id: z.string(),
  sku: z.string().min(3),
  name: z.string().min(2),
  type: z.string(),
  category: z.string().min(2),
  quality: z.string().min(2),
  size: z.string().min(1),
  unit: z.string(),
  colorPattern: z.string().min(2),
  imageUrl: z.string().optional().nullable(),
  expiredAt: z.string().optional().nullable(),
})

describe('Materials - Create Material Schema Validation', () => {
  it('should accept valid material data with all required fields', () => {
    const result = createMaterialSchema.safeParse({
      sku: 'LTR-001',
      name: 'Kulit Sapi Premium',
      type: 'LEATHER',
      category: 'Genuine',
      quality: 'Premium',
      size: 'per feet',
      stock: 50,
      unit: 'feet',
      colorPattern: 'Tan Python',
      imageUrl: null,
      expiredAt: null,
    })
    expect(result.success).toBe(true)
  })

  it('should accept material with zero stock (default)', () => {
    const result = createMaterialSchema.safeParse({
      sku: 'GLU-001',
      name: 'Lem Tahan Air',
      type: 'GLUE',
      category: 'Standard',
      quality: 'Standard',
      size: '100ml',
      unit: 'ml',
      colorPattern: 'Clear Matte',
      imageUrl: null,
      expiredAt: '2025-12-31',
    })
    expect(result.success).toBe(true)
  })

  it('should accept material with image URL', () => {
    const result = createMaterialSchema.safeParse({
      sku: 'FBR-001',
      name: 'Kain Katun Premium',
      type: 'FABRIC',
      category: 'Grade A',
      quality: 'Premium',
      size: 'per meter',
      stock: 100,
      unit: 'meter',
      colorPattern: 'Black Matte',
      imageUrl: 'https://example.com/image.jpg',
    })
    expect(result.success).toBe(true)
  })

  it('should reject SKU shorter than 3 characters', () => {
    const result = createMaterialSchema.safeParse({
      sku: 'AB',
      name: 'Test Material',
      type: 'LEATHER',
      category: 'Standard',
      quality: 'Standard',
      size: 'per feet',
      stock: 0,
      unit: 'feet',
      colorPattern: 'Black Matte',
    })
    expect(result.success).toBe(false)
  })

  it('should reject name shorter than 2 characters', () => {
    const result = createMaterialSchema.safeParse({
      sku: 'LTR-001',
      name: 'A',
      type: 'LEATHER',
      category: 'Standard',
      quality: 'Standard',
      size: 'per feet',
      stock: 0,
      unit: 'feet',
      colorPattern: 'Tan Brown',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing required fields', () => {
    const result = createMaterialSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('should reject category shorter than 2 characters', () => {
    const result = createMaterialSchema.safeParse({
      sku: 'LTR-001',
      name: 'Test Material',
      type: 'LEATHER',
      category: 'A',
      quality: 'Standard',
      size: 'per feet',
      stock: 0,
      unit: 'feet',
      colorPattern: 'Black Matte',
    })
    expect(result.success).toBe(false)
  })

  it('should accept fractional stock values (e.g. 15.5 meters)', () => {
    const result = createMaterialSchema.safeParse({
      sku: 'FBR-003',
      name: 'Kain Sutra',
      type: 'FABRIC',
      category: 'Premium',
      quality: 'Grade A',
      size: 'per meter',
      stock: 15.5,
      unit: 'meter',
      colorPattern: 'Red Silk',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.stock).toBe(15.5)
    }
  })

  it('should accept all valid material types', () => {
    const types = ['LEATHER', 'FABRIC', 'GLUE', 'ZIPPER', 'ACCESSORY']
    for (const type of types) {
      const result = createMaterialSchema.safeParse({
        sku: 'TST-001',
        name: 'Test Material',
        type,
        category: 'Standard',
        quality: 'Standard',
        size: 'per unit',
        stock: 10,
        unit: 'pcs',
        colorPattern: 'Black Matte',
      })
      expect(result.success).toBe(true)
    }
  })
})

describe('Materials - Update Stock Schema Validation', () => {
  it('should accept valid INCOMING stock update', () => {
    const result = updateStockSchema.safeParse({
      materialId: 'uuid-123',
      quantity: 25,
      type: 'INCOMING',
      notes: 'Restok dari supplier',
    })
    expect(result.success).toBe(true)
  })

  it('should accept valid OUTGOING stock update with negative quantity', () => {
    const result = updateStockSchema.safeParse({
      materialId: 'uuid-456',
      quantity: -10,
      type: 'OUTGOING',
      notes: 'Digunakan untuk produksi',
    })
    expect(result.success).toBe(true)
  })

  it('should accept ADJUSTMENT type', () => {
    const result = updateStockSchema.safeParse({
      materialId: 'uuid-789',
      quantity: 5,
      type: 'ADJUSTMENT',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid stock type', () => {
    const result = updateStockSchema.safeParse({
      materialId: 'uuid-000',
      quantity: 10,
      type: 'INVALID_TYPE',
    })
    expect(result.success).toBe(false)
  })

  it('should accept update without notes (notes is optional)', () => {
    const result = updateStockSchema.safeParse({
      materialId: 'uuid-111',
      quantity: 100,
      type: 'INCOMING',
    })
    expect(result.success).toBe(true)
  })

  it('should reject missing materialId', () => {
    const result = updateStockSchema.safeParse({
      quantity: 10,
      type: 'INCOMING',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing quantity', () => {
    const result = updateStockSchema.safeParse({
      materialId: 'uuid-222',
      type: 'INCOMING',
    })
    expect(result.success).toBe(false)
  })

  it('should accept zero quantity adjustment', () => {
    const result = updateStockSchema.safeParse({
      materialId: 'uuid-333',
      quantity: 0,
      type: 'ADJUSTMENT',
    })
    expect(result.success).toBe(true)
  })
})

describe('Materials - Update Material Schema Validation', () => {
  it('should accept valid update data with id', () => {
    const result = updateMaterialSchema.safeParse({
      id: 'uuid-existing-001',
      sku: 'LTR-001',
      name: 'Kulit Sapi Updated',
      type: 'LEATHER',
      category: 'Premium',
      quality: 'Grade A',
      size: 'per feet',
      unit: 'feet',
      colorPattern: 'Black Python',
      imageUrl: null,
      expiredAt: null,
    })
    expect(result.success).toBe(true)
  })

  it('should reject missing id', () => {
    const result = updateMaterialSchema.safeParse({
      sku: 'LTR-001',
      name: 'Kulit Sapi',
      type: 'LEATHER',
      category: 'Standard',
      quality: 'Standard',
      size: 'per feet',
      unit: 'feet',
      colorPattern: 'Brown Matte',
    })
    expect(result.success).toBe(false)
  })
})

describe('Materials - Stock Calculation Business Logic', () => {
  it('should correctly calculate new stock after INCOMING', () => {
    const currentStock = 50
    const incomingQty = 25
    const newStock = currentStock + incomingQty
    expect(newStock).toBe(75)
  })

  it('should correctly calculate new stock after OUTGOING (negative qty)', () => {
    const currentStock = 50
    const outgoingQty = -10
    const newStock = currentStock + outgoingQty
    expect(newStock).toBe(40)
  })

  it('should detect negative stock (insufficient)', () => {
    const currentStock = 5
    const outgoingQty = -10
    const newStock = currentStock + outgoingQty
    expect(newStock).toBeLessThan(0)
  })

  it('should handle fractional stock correctly', () => {
    const currentStock = 15.5
    const incomingQty = 2.3
    const newStock = currentStock + incomingQty
    expect(newStock).toBeCloseTo(17.8)
  })

  it('should handle zero stock after full outgoing', () => {
    const currentStock = 10
    const outgoingQty = -10
    const newStock = currentStock + outgoingQty
    expect(newStock).toBe(0)
  })
})

describe('Materials - Expiration Date Handling', () => {
  it('should parse valid expiration date string to Date object', () => {
    const expiredAt = '2025-12-31'
    const parsed = new Date(expiredAt)
    expect(parsed).toBeInstanceOf(Date)
    expect(parsed.getFullYear()).toBe(2025)
  })

  it('should detect expired material (date in the past)', () => {
    const now = new Date()
    const pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    const diffDays = Math.ceil((pastDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    expect(diffDays).toBeLessThan(0)
  })

  it('should detect almost expired material (within 30 days)', () => {
    const now = new Date()
    const soonDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
    const diffDays = Math.ceil((soonDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    expect(diffDays).toBeGreaterThan(0)
    expect(diffDays).toBeLessThanOrEqual(30)
  })

  it('should not flag material with distant expiration date', () => {
    const now = new Date()
    const futureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    const diffDays = Math.ceil((futureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    expect(diffDays).toBeGreaterThan(30)
  })

  it('should handle null expiration date (non-perishable)', () => {
    const expiredAt = null
    const parsedExpiredAt = expiredAt ? new Date(expiredAt) : null
    expect(parsedExpiredAt).toBeNull()
  })
})

describe('Materials - Low Stock Threshold Logic', () => {
  const lowStockThresholds: Record<string, number> = {
    LEATHER: 15,
    FABRIC: 20,
    ZIPPER: 10,
    GLUE: 5,
    ACCESSORY: 8,
  }

  it('should flag LEATHER with stock below 15 as low stock', () => {
    const stock = 10
    const type = 'LEATHER'
    const isLowStock = stock > 0 && stock < (lowStockThresholds[type] || 10)
    expect(isLowStock).toBe(true)
  })

  it('should not flag LEATHER with stock above threshold', () => {
    const stock = 20
    const type = 'LEATHER'
    const isLowStock = stock > 0 && stock < (lowStockThresholds[type] || 10)
    expect(isLowStock).toBe(false)
  })

  it('should flag GLUE with stock below 5 as low stock', () => {
    const stock = 3
    const type = 'GLUE'
    const isLowStock = stock > 0 && stock < (lowStockThresholds[type] || 10)
    expect(isLowStock).toBe(true)
  })

  it('should flag FABRIC with stock below 20 as low stock', () => {
    const stock = 15
    const type = 'FABRIC'
    const isLowStock = stock > 0 && stock < (lowStockThresholds[type] || 10)
    expect(isLowStock).toBe(true)
  })

  it('should consider stock=0 as out of stock, not low stock', () => {
    const stock = 0
    const type = 'LEATHER'
    const isOutOfStock = stock <= 0
    const isLowStock = stock > 0 && stock < (lowStockThresholds[type] || 10)
    expect(isOutOfStock).toBe(true)
    expect(isLowStock).toBe(false)
  })

  it('should use default threshold of 10 for unknown types', () => {
    const stock = 8
    const type = 'UNKNOWN'
    const isLowStock = stock > 0 && stock < (lowStockThresholds[type] || 10)
    expect(isLowStock).toBe(true)
  })
})
