import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const addOptionSchema = z.object({
  type: z.enum(['type', 'category', 'quality', 'unit']),
  name: z.string().min(1),
  label: z.string().optional(), // only for type
})

const deleteOptionSchema = z.object({
  type: z.enum(['type', 'category', 'quality', 'unit']),
  id: z.string(),
})

export const getDropdownOptions = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { prisma } = await import('#/db.server')
    
    const [types, categories, qualities, units] = await Promise.all([
      prisma.typeOption.findMany({ orderBy: { name: 'asc' } }),
      prisma.categoryOption.findMany({ orderBy: { name: 'asc' } }),
      prisma.qualityOption.findMany({ orderBy: { name: 'asc' } }),
      prisma.unitOption.findMany({ orderBy: { name: 'asc' } }),
    ])

    return {
      types,
      categories,
      qualities,
      units,
    }
  })

export const addDropdownOption = createServerFn({ method: 'POST' })
  .inputValidator(addOptionSchema)
  .handler(async ({ data }) => {
    const { prisma } = await import('#/db.server')
    const { type, name, label } = data

    const cleanName = name.trim()

    if (type === 'type') {
      return await prisma.typeOption.create({
        data: {
          name: cleanName.toUpperCase(),
          label: label?.trim() || cleanName,
        }
      })
    } else if (type === 'category') {
      return await prisma.categoryOption.create({
        data: { name: cleanName }
      })
    } else if (type === 'quality') {
      return await prisma.qualityOption.create({
        data: { name: cleanName }
      })
    } else if (type === 'unit') {
      return await prisma.unitOption.create({
        data: { name: cleanName.toLowerCase() }
      })
    }
    
    throw new Error('Tipe opsi tidak didukung')
  })

export const deleteDropdownOption = createServerFn({ method: 'POST' })
  .inputValidator(deleteOptionSchema)
  .handler(async ({ data }) => {
    const { prisma } = await import('#/db.server')
    const { type, id } = data

    // Check if the option is in use by any materials before deleting
    if (type === 'type') {
      const option = await prisma.typeOption.findUnique({ where: { id } })
      if (!option) throw new Error('Opsi tidak ditemukan')
      
      const inUse = await prisma.material.findFirst({ where: { type: option.name } })
      if (inUse) throw new Error(`Opsi "${option.label || option.name}" sedang digunakan oleh bahan baku lain dan tidak bisa dihapus.`)
      
      return await prisma.typeOption.delete({ where: { id } })
    } else if (type === 'category') {
      const option = await prisma.categoryOption.findUnique({ where: { id } })
      if (!option) throw new Error('Opsi tidak ditemukan')
      
      const inUse = await prisma.material.findFirst({ where: { category: option.name } })
      if (inUse) throw new Error(`Opsi "${option.name}" sedang digunakan oleh bahan baku lain dan tidak bisa dihapus.`)
      
      return await prisma.categoryOption.delete({ where: { id } })
    } else if (type === 'quality') {
      const option = await prisma.qualityOption.findUnique({ where: { id } })
      if (!option) throw new Error('Opsi tidak ditemukan')
      
      const inUse = await prisma.material.findFirst({ where: { quality: option.name } })
      if (inUse) throw new Error(`Opsi "${option.name}" sedang digunakan oleh bahan baku lain dan tidak bisa dihapus.`)
      
      return await prisma.qualityOption.delete({ where: { id } })
    } else if (type === 'unit') {
      const option = await prisma.unitOption.findUnique({ where: { id } })
      if (!option) throw new Error('Opsi tidak ditemukan')
      
      const inUse = await prisma.material.findFirst({ where: { unit: option.name } })
      if (inUse) throw new Error(`Opsi "${option.name}" sedang digunakan oleh bahan baku lain dan tidak bisa dihapus.`)
      
      return await prisma.unitOption.delete({ where: { id } })
    }

    throw new Error('Tipe opsi tidak didukung')
  })
