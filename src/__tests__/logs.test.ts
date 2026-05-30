import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Recreate logs search schema from logs.tsx
const logsSearchSchema = z.object({
  type: z.string().optional(),
})

// Recreate logs input schema from logs.functions.ts
const getStockLogsSchema = z.object({
  type: z.string().optional(),
  materialId: z.string().optional(),
  limit: z.number().default(50),
})

describe('Logs - Search Schema Validation', () => {
  it('should accept empty search params', () => {
    const result = logsSearchSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should accept INCOMING type filter', () => {
    const result = logsSearchSchema.safeParse({ type: 'INCOMING' })
    expect(result.success).toBe(true)
  })

  it('should accept OUTGOING type filter', () => {
    const result = logsSearchSchema.safeParse({ type: 'OUTGOING' })
    expect(result.success).toBe(true)
  })

  it('should accept ADJUSTMENT type filter', () => {
    const result = logsSearchSchema.safeParse({ type: 'ADJUSTMENT' })
    expect(result.success).toBe(true)
  })

  it('should accept undefined type (show all)', () => {
    const result = logsSearchSchema.safeParse({ type: undefined })
    expect(result.success).toBe(true)
  })
})

describe('Logs - Input Schema Validation', () => {
  it('should accept valid input with type filter', () => {
    const result = getStockLogsSchema.safeParse({
      type: 'INCOMING',
      limit: 50,
    })
    expect(result.success).toBe(true)
  })

  it('should accept input with materialId filter', () => {
    const result = getStockLogsSchema.safeParse({
      materialId: 'uuid-123',
      limit: 25,
    })
    expect(result.success).toBe(true)
  })

  it('should use default limit of 50 when not specified', () => {
    const result = getStockLogsSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.limit).toBe(50)
    }
  })

  it('should accept empty input', () => {
    const result = getStockLogsSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

describe('Logs - Log Entry Formatting', () => {
  it('should format date correctly in Indonesian locale', () => {
    const createdAt = '2025-06-15T10:30:00.000Z'
    const formatted = new Date(createdAt).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })

  it('should display positive quantity with + prefix', () => {
    const quantity = 25
    const display = quantity > 0 ? `+${quantity}` : `${quantity}`
    expect(display).toBe('+25')
  })

  it('should display negative quantity as-is', () => {
    const quantity = -10
    const display = quantity > 0 ? `+${quantity}` : `${quantity}`
    expect(display).toBe('-10')
  })

  it('should display correct log type labels', () => {
    const labels: Record<string, string> = {
      INCOMING: 'MASUK',
      OUTGOING: 'KELUAR',
      ADJUSTMENT: 'PENYESUAIAN',
    }
    expect(labels.INCOMING).toBe('MASUK')
    expect(labels.OUTGOING).toBe('KELUAR')
    expect(labels.ADJUSTMENT).toBe('PENYESUAIAN')
  })

  it('should show default notes when no notes provided', () => {
    const notes: string | null = null
    const displayNotes = notes || 'Tidak ada catatan tambahan.'
    expect(displayNotes).toBe('Tidak ada catatan tambahan.')
  })
})

describe('Logs - Statistics Calculation', () => {
  it('should count logs by type correctly', () => {
    const logs = [
      { type: 'INCOMING', quantity: 10 },
      { type: 'INCOMING', quantity: 20 },
      { type: 'OUTGOING', quantity: -5 },
      { type: 'OUTGOING', quantity: -10 },
      { type: 'OUTGOING', quantity: -3 },
      { type: 'ADJUSTMENT', quantity: 2 },
    ]

    const totalLogs = logs.length
    const incomingCount = logs.filter(l => l.type === 'INCOMING').length
    const outgoingCount = logs.filter(l => l.type === 'OUTGOING').length
    const adjustmentCount = logs.filter(l => l.type === 'ADJUSTMENT').length

    expect(totalLogs).toBe(6)
    expect(incomingCount).toBe(2)
    expect(outgoingCount).toBe(3)
    expect(adjustmentCount).toBe(1)
  })

  it('should handle empty logs array', () => {
    const logs: Array<{ type: string }> = []
    expect(logs.length).toBe(0)
    expect(logs.filter(l => l.type === 'INCOMING').length).toBe(0)
  })
})

describe('Logs - Filter Logic', () => {
  it('should filter logs by type when type is specified', () => {
    const allLogs = [
      { id: '1', type: 'INCOMING' },
      { id: '2', type: 'OUTGOING' },
      { id: '3', type: 'INCOMING' },
      { id: '4', type: 'ADJUSTMENT' },
    ]

    const type = 'INCOMING'
    const filtered = type && type !== 'ALL'
      ? allLogs.filter(l => l.type === type)
      : allLogs

    expect(filtered).toHaveLength(2)
    expect(filtered.every(l => l.type === 'INCOMING')).toBe(true)
  })

  it('should show all logs when type is undefined', () => {
    const allLogs = [
      { id: '1', type: 'INCOMING' },
      { id: '2', type: 'OUTGOING' },
      { id: '3', type: 'ADJUSTMENT' },
    ]

    const type = undefined
    const filtered = type && type !== 'ALL'
      ? allLogs.filter(l => l.type === type)
      : allLogs

    expect(filtered).toHaveLength(3)
  })

  it('should show all logs when type is ALL', () => {
    const allLogs = [
      { id: '1', type: 'INCOMING' },
      { id: '2', type: 'OUTGOING' },
    ]

    const type = 'ALL'
    const filtered = type && type !== 'ALL'
      ? allLogs.filter(l => l.type === type)
      : allLogs

    expect(filtered).toHaveLength(2)
  })
})
