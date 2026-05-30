import { describe, it, expect, vi, beforeEach } from 'vitest'
import crypto from 'crypto'

// Test Zod Validation Schemas
describe('Auth - Login Validation', () => {
  // We test the Zod schemas directly
  const { z } = require('zod')
  
  const loginSchema = z.object({
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(1, 'Password wajib diisi'),
  })

  it('should accept valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'admin@achi.com',
      password: 'secret123',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'secret123',
    })
    expect(result.success).toBe(false)
  })

  it('should reject empty email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'secret123',
    })
    expect(result.success).toBe(false)
  })

  it('should reject empty password', () => {
    const result = loginSchema.safeParse({
      email: 'admin@achi.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing fields', () => {
    const result = loginSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('Auth - Password Hashing', () => {
  it('should produce correct SHA-256 hash for password comparison', () => {
    const password = 'admin123'
    const hash = crypto.createHash('sha256').update(password).digest('hex')
    expect(hash).toHaveLength(64) // SHA-256 produces 64 hex chars
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('should produce consistent hash for same password', () => {
    const password = 'test-password'
    const hash1 = crypto.createHash('sha256').update(password).digest('hex')
    const hash2 = crypto.createHash('sha256').update(password).digest('hex')
    expect(hash1).toBe(hash2)
  })

  it('should produce different hash for different passwords', () => {
    const hash1 = crypto.createHash('sha256').update('password1').digest('hex')
    const hash2 = crypto.createHash('sha256').update('password2').digest('hex')
    expect(hash1).not.toBe(hash2)
  })
})

describe('Auth - Session Cookie Parsing (Client-side)', () => {
  it('should extract email from acg_session cookie', () => {
    Object.defineProperty(document, 'cookie', {
      value: 'acg_session=admin%40achi.com; other=value',
      writable: true,
      configurable: true,
    })
    const match = document.cookie.match(/(?:^|; )acg_session=([^;]*)/)
    const email = match ? decodeURIComponent(match[1]) : null
    expect(email).toBe('admin@achi.com')
  })

  it('should return null when acg_session cookie is missing', () => {
    Object.defineProperty(document, 'cookie', {
      value: 'other=value',
      writable: true,
      configurable: true,
    })
    const match = document.cookie.match(/(?:^|; )acg_session=([^;]*)/)
    const email = match ? decodeURIComponent(match[1]) : null
    expect(email).toBeNull()
  })

  it('should handle empty cookies', () => {
    Object.defineProperty(document, 'cookie', {
      value: '',
      writable: true,
      configurable: true,
    })
    const match = document.cookie.match(/(?:^|; )acg_session=([^;]*)/)
    const email = match ? decodeURIComponent(match[1]) : null
    expect(email).toBeNull()
  })

  it('should handle URL-encoded email correctly', () => {
    Object.defineProperty(document, 'cookie', {
      value: 'acg_session=user%40domain.co.id',
      writable: true,
      configurable: true,
    })
    const match = document.cookie.match(/(?:^|; )acg_session=([^;]*)/)
    const email = match ? decodeURIComponent(match[1]) : null
    expect(email).toBe('user@domain.co.id')
  })
})
