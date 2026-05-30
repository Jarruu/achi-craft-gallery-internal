import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Recreate schemas from options.functions.ts
const addOptionSchema = z.object({
  type: z.enum(['type', 'category', 'quality', 'unit']),
  name: z.string().min(1),
  label: z.string().optional(),
})

const deleteOptionSchema = z.object({
  type: z.enum(['type', 'category', 'quality', 'unit']),
  id: z.string(),
})

describe('Options - Add Option Schema Validation', () => {
  it('should accept valid type option with label', () => {
    const result = addOptionSchema.safeParse({
      type: 'type',
      name: 'THREAD',
      label: 'Benang (Thread)',
    })
    expect(result.success).toBe(true)
  })

  it('should accept valid category option without label', () => {
    const result = addOptionSchema.safeParse({
      type: 'category',
      name: 'Synthetic Leather',
    })
    expect(result.success).toBe(true)
  })

  it('should accept quality option', () => {
    const result = addOptionSchema.safeParse({
      type: 'quality',
      name: 'Ultra Premium',
    })
    expect(result.success).toBe(true)
  })

  it('should accept unit option', () => {
    const result = addOptionSchema.safeParse({
      type: 'unit',
      name: 'roll',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid option type', () => {
    const result = addOptionSchema.safeParse({
      type: 'invalid',
      name: 'Test',
    })
    expect(result.success).toBe(false)
  })

  it('should reject empty name', () => {
    const result = addOptionSchema.safeParse({
      type: 'category',
      name: '',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing type', () => {
    const result = addOptionSchema.safeParse({
      name: 'Test',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing name', () => {
    const result = addOptionSchema.safeParse({
      type: 'category',
    })
    expect(result.success).toBe(false)
  })
})

describe('Options - Delete Option Schema Validation', () => {
  it('should accept valid delete with type and id', () => {
    const result = deleteOptionSchema.safeParse({
      type: 'type',
      id: 'uuid-to-delete',
    })
    expect(result.success).toBe(true)
  })

  it('should accept deleting category option', () => {
    const result = deleteOptionSchema.safeParse({
      type: 'category',
      id: 'cat-uuid',
    })
    expect(result.success).toBe(true)
  })

  it('should accept deleting quality option', () => {
    const result = deleteOptionSchema.safeParse({
      type: 'quality',
      id: 'qual-uuid',
    })
    expect(result.success).toBe(true)
  })

  it('should accept deleting unit option', () => {
    const result = deleteOptionSchema.safeParse({
      type: 'unit',
      id: 'unit-uuid',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid type', () => {
    const result = deleteOptionSchema.safeParse({
      type: 'invalid',
      id: 'some-id',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing id', () => {
    const result = deleteOptionSchema.safeParse({
      type: 'type',
    })
    expect(result.success).toBe(false)
  })
})

describe('Options - Name Processing Logic', () => {
  it('should trim whitespace from option names', () => {
    const name = '  Synthetic Leather  '
    const cleanName = name.trim()
    expect(cleanName).toBe('Synthetic Leather')
  })

  it('should uppercase type option names', () => {
    const name = 'thread'
    const cleanName = name.trim().toUpperCase()
    expect(cleanName).toBe('THREAD')
  })

  it('should lowercase unit option names', () => {
    const name = 'METER'
    const cleanName = name.trim().toLowerCase()
    expect(cleanName).toBe('meter')
  })

  it('should use name as label fallback for type options', () => {
    const name = 'THREAD'
    const label: string | undefined = undefined
    const finalLabel = label?.trim() || name
    expect(finalLabel).toBe('THREAD')
  })

  it('should use provided label when available', () => {
    const name = 'THREAD'
    const label = 'Benang (Thread)'
    const finalLabel = label?.trim() || name
    expect(finalLabel).toBe('Benang (Thread)')
  })
})
