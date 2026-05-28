import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import crypto from 'crypto'

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

export const loginUser = createServerFn({ method: 'POST' })
  .inputValidator(loginSchema)
  .handler(async ({ data }) => {
    const { email, password } = data
    const { prisma } = await import('#/db.server')

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new Error('Email atau password salah.')
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
    if (user.password !== hashedPassword) {
      throw new Error('Email atau password salah.')
    }

    return {
      success: true,
      email: user.email,
    }
  })

