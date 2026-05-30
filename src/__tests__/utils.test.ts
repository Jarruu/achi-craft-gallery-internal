import { describe, it, expect } from 'vitest'
import { cn } from '../lib/utils'

describe('cn - Tailwind Class Merger Utility', () => {
  it('should merge single class', () => {
    expect(cn('text-red-500')).toBe('text-red-500')
  })

  it('should merge multiple classes', () => {
    const result = cn('p-4', 'mt-2', 'text-sm')
    expect(result).toContain('p-4')
    expect(result).toContain('mt-2')
    expect(result).toContain('text-sm')
  })

  it('should resolve conflicting tailwind classes (last wins)', () => {
    const result = cn('p-4', 'p-8')
    expect(result).toBe('p-8')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toContain('active-class')
  })

  it('should filter out falsy values', () => {
    const result = cn('base', false, null, undefined, '', 'valid')
    expect(result).toContain('base')
    expect(result).toContain('valid')
    expect(result).not.toContain('false')
    expect(result).not.toContain('null')
    expect(result).not.toContain('undefined')
  })

  it('should handle empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle arrays of classes', () => {
    const result = cn(['p-4', 'text-sm'])
    expect(result).toContain('p-4')
    expect(result).toContain('text-sm')
  })

  it('should handle object syntax', () => {
    const result = cn({ 'text-red-500': true, 'text-blue-500': false })
    expect(result).toContain('text-red-500')
    expect(result).not.toContain('text-blue-500')
  })
})
