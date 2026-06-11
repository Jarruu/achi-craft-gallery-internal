import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { 
  getMaterials, 
  createMaterial, 
  updateStock, 
  deleteMaterial,
  updateMaterial
} from '../lib/materials.functions'
import {
  getDropdownOptions,
  addDropdownOption,
  deleteDropdownOption
} from '../lib/options.functions'
import { Search, Plus, Calendar, AlertTriangle } from 'lucide-react'
import { uploadToImgBB } from '../components/ImageUploadInput'

// Import decomposed sub-components
import { MaterialKpiWidgets } from '../components/materials/MaterialKpiWidgets'
import { MaterialGrid } from '../components/materials/MaterialGrid'
import { MaterialTable } from '../components/materials/MaterialTable'
import { MaterialDetailPanel } from '../components/materials/MaterialDetailPanel'
import { MaterialFormDialogs } from '../components/materials/MaterialFormDialogs'

// Schema for route query params
const searchSchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  page: z.number().catch(1).optional(),
  limit: z.number().catch(10).optional(),
})

export const Route = createFileRoute('/materials')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    search: search.search,
    type: search.type,
    category: search.category,
    page: search.page,
    limit: search.limit,
  }),
  loader: async ({ deps }) => {
    const [materialsResult, options] = await Promise.all([
      getMaterials({ 
        data: {
          search: deps.search,
          type: deps.type,
          category: deps.category,
          page: deps.page || 1,
          limit: deps.limit || 10,
        } 
      }),
      getDropdownOptions()
    ])
    return { 
      materials: materialsResult.items, 
      totalCount: materialsResult.totalCount,
      allMaterials: materialsResult.allMaterials,
      options 
    }
  },
  component: MaterialsPage,
})

function MaterialsPage() {
  const { materials, totalCount, options, allMaterials } = Route.useLoaderData()
  const searchParams = useSearch({ from: '/materials' })
  const navigate = useNavigate()

  const page = searchParams.page || 1
  const limit = searchParams.limit || 10
  const totalPages = Math.ceil(totalCount / limit)

  const handlePageChange = (newPage: number) => {
    navigate({
      to: '/materials',
      search: (prev) => ({
        ...prev,
        page: newPage,
      }),
    })
  }

  // State management
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const [isSavingNew, setIsSavingNew] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStock, setIsUpdatingStock] = useState(false)

  // Edit Material States & Handlers
  const [isEditing, setIsEditing] = useState(false)
  const [editMaterialData, setEditMaterialData] = useState({
    id: '',
    sku: '',
    name: '',
    type: '',
    category: '',
    quality: '',
    size: '',
    unit: '',
    colorPattern: '',
    imageUrl: '',
    expiredAt: '',
  })
  const [editMaterialFile, setEditMaterialFile] = useState<File | null>(null)

  const startEdit = (m: any) => {
    setEditMaterialFile(null)
    setEditMaterialData({
      id: m.id,
      sku: m.sku,
      name: m.name,
      type: m.type,
      category: m.category,
      quality: m.quality,
      size: m.size,
      unit: m.unit,
      colorPattern: m.colorPattern,
      imageUrl: m.imageUrl || '',
      expiredAt: m.expiredAt ? new Date(m.expiredAt).toISOString().split('T')[0] : '',
    })
    setIsEditing(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingEdit(true)
    let uploadedUrl = editMaterialData.imageUrl || null

    try {
      if (editMaterialFile) {
        toast.info('Sedang mengunggah gambar...', { id: 'upload-toast' })
        uploadedUrl = await uploadToImgBB(editMaterialFile)
        toast.success('Gambar berhasil diunggah', { id: 'upload-toast' })
      }

      const updated = await updateMaterial({
        data: {
          id: editMaterialData.id,
          sku: editMaterialData.sku.toUpperCase(),
          name: editMaterialData.name,
          type: editMaterialData.type,
          category: editMaterialData.category,
          quality: editMaterialData.quality,
          size: editMaterialData.size,
          unit: editMaterialData.unit,
          colorPattern: editMaterialData.colorPattern,
          imageUrl: uploadedUrl,
          expiredAt: editMaterialData.expiredAt || null,
        }
      })
      toast.success('Bahan Baku Diperbarui', {
        description: `Bahan baku ${editMaterialData.name} berhasil disimpan.`
      })
      setIsEditing(false)
      setEditMaterialFile(null)
      setSelectedMaterial(updated)
      navigate({ to: '/materials', search: searchParams })
    } catch (err: any) {
      toast.error('Gagal Memperbarui Bahan Baku', { description: err.message })
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Default values based on dynamic options
  const defaultType = options.types[0]?.name || 'LEATHER'
  const defaultCategory = options.categories[0]?.name || ''
  const defaultQuality = options.qualities[0]?.name || ''
  const defaultUnit = options.units[0]?.name || 'feet'

  const [newMaterial, setNewMaterial] = useState({
    sku: '',
    name: '',
    type: defaultType,
    category: defaultCategory,
    quality: defaultQuality,
    size: '',
    stock: 0,
    unit: defaultUnit,
    colorPattern: '',
    imageUrl: '',
    expiredAt: '',
  })
  const [newMaterialFile, setNewMaterialFile] = useState<File | null>(null)

  // Unified option creation handler
  const handleAddOption = async (type: 'type' | 'category' | 'quality' | 'unit', val: string) => {
    const cleanVal = val.trim()
    if (!cleanVal) return
    try {
      if (type === 'type') {
        await addDropdownOption({
          data: { 
            type: 'type', 
            name: cleanVal.toUpperCase(), 
            label: cleanVal 
          }
        })
        if (isEditing) {
          setEditMaterialData(prev => ({ ...prev, type: cleanVal.toUpperCase() }))
        } else {
          setNewMaterial(prev => ({ ...prev, type: cleanVal.toUpperCase() }))
        }
      } else {
        await addDropdownOption({
          data: { type, name: cleanVal }
        })
        if (type === 'category') {
          if (isEditing) {
            setEditMaterialData(prev => ({ ...prev, category: cleanVal }))
          } else {
            setNewMaterial(prev => ({ ...prev, category: cleanVal }))
          }
        } else if (type === 'quality') {
          if (isEditing) {
            setEditMaterialData(prev => ({ ...prev, quality: cleanVal }))
          } else {
            setNewMaterial(prev => ({ ...prev, quality: cleanVal }))
          }
        } else if (type === 'unit') {
          if (isEditing) {
            setEditMaterialData(prev => ({ ...prev, unit: cleanVal }))
          } else {
            setNewMaterial(prev => ({ ...prev, unit: cleanVal }))
          }
        }
      }
      toast.success(`Opsi "${cleanVal}" berhasil ditambahkan.`)
      navigate({ to: '/materials', search: searchParams })
    } catch (err: any) {
      toast.error('Gagal Menambahkan Opsi', { description: err.message })
      throw err
    }
  }

  const handleDeleteOption = async (type: 'type' | 'category' | 'quality' | 'unit', id: string, name: string) => {
    try {
      await deleteDropdownOption({
        data: { type, id }
      })
      toast.success(`Opsi "${name}" berhasil dihapus.`)
      
      // Update form state if the deleted option was selected
      if (type === 'type') {
        if (newMaterial.type === name) {
          const next = options.types.find(o => o.id !== id)
          setNewMaterial(prev => ({ ...prev, type: next ? next.name : '' }))
        }
        if (editMaterialData.type === name) {
          const next = options.types.find(o => o.id !== id)
          setEditMaterialData(prev => ({ ...prev, type: next ? next.name : '' }))
        }
      } else if (type === 'category') {
        if (newMaterial.category === name) {
          const next = options.categories.find(o => o.id !== id)
          setNewMaterial(prev => ({ ...prev, category: next ? next.name : '' }))
        }
        if (editMaterialData.category === name) {
          const next = options.categories.find(o => o.id !== id)
          setEditMaterialData(prev => ({ ...prev, category: next ? next.name : '' }))
        }
      } else if (type === 'quality') {
        if (newMaterial.quality === name) {
          const next = options.qualities.find(o => o.id !== id)
          setNewMaterial(prev => ({ ...prev, quality: next ? next.name : '' }))
        }
        if (editMaterialData.quality === name) {
          const next = options.qualities.find(o => o.id !== id)
          setEditMaterialData(prev => ({ ...prev, quality: next ? next.name : '' }))
        }
      } else if (type === 'unit') {
        if (newMaterial.unit === name) {
          const next = options.units.find(o => o.id !== id)
          setNewMaterial(prev => ({ ...prev, unit: next ? next.name : '' }))
        }
        if (editMaterialData.unit === name) {
          const next = options.units.find(o => o.id !== id)
          setEditMaterialData(prev => ({ ...prev, unit: next ? next.name : '' }))
        }
      }

      navigate({ to: '/materials', search: searchParams })
    } catch (err: any) {
      toast.error('Gagal Menghapus Opsi', { description: err.message })
      throw err
    }
  }

  const handleSelectMaterial = (m: any) => {
    setSelectedMaterial(m)
    setIsAdding(false)
    setStockDelta('')
    setAdjNotes('')
    
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        const detailPanel = document.getElementById('detail-panel')
        if (detailPanel) {
          detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }

  // Stock update state
  const [stockDelta, setStockDelta] = useState<number | ''>('')
  const [adjType, setAdjType] = useState<'INCOMING' | 'OUTGOING' | 'ADJUSTMENT'>('INCOMING')
  const [adjNotes, setAdjNotes] = useState('')

  // Search input state
  const [searchInput, setSearchInput] = useState(searchParams.search || '')

  // Alert and expiry thresholds
  const now = new Date()
  const lowStockThresholds: Record<string, number> = {
    LEATHER: 10,
    FABRIC: 10,
    ZIPPER: 10,
    GLUE: 10,
    ACCESSORY: 10,
  }

  // Filter low stock and expiring
  const materialsForWarnings = allMaterials || []
  const outOfStockMaterials = materialsForWarnings.filter(m => m.stock <= 0)
  const lowStockMaterials = materialsForWarnings.filter(m => m.stock > 0 && m.stock < (lowStockThresholds[m.type] || 10))
  const expiredMaterials = materialsForWarnings.filter(m => {
    if (!m.expiredAt) return false
    const expDate = new Date(m.expiredAt)
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays < 0
  })
  const almostExpiringMaterials = materialsForWarnings.filter(m => {
    if (!m.expiredAt) return false
    const expDate = new Date(m.expiredAt)
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 30 // Less than 30 days
  })

  const updateFilters = (key: string, value: string | undefined) => {
    navigate({
      to: '/materials',
      search: (prev) => {
        const next = { ...prev }
        if (value) {
          next[key as keyof typeof next] = value as any
        } else {
          delete next[key as keyof typeof next]
        }
        next.page = 1 // Reset page to 1 on filter/search change
        return next
      }
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters('search', searchInput || undefined)
  }

  // Handle Add Material
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingNew(true)
    let uploadedUrl = newMaterial.imageUrl || null

    try {
      if (newMaterialFile) {
        toast.info('Sedang mengunggah gambar...', { id: 'upload-toast' })
        uploadedUrl = await uploadToImgBB(newMaterialFile)
        toast.success('Gambar berhasil diunggah', { id: 'upload-toast' })
      }

      await createMaterial({
        data: {
          sku: newMaterial.sku.toUpperCase(),
          name: newMaterial.name,
          type: newMaterial.type,
          category: newMaterial.category,
          quality: newMaterial.quality,
          size: newMaterial.size,
          stock: Number(newMaterial.stock),
          unit: newMaterial.unit,
          colorPattern: newMaterial.colorPattern,
          imageUrl: uploadedUrl,
          expiredAt: newMaterial.expiredAt || null,
        }
      })
      
      toast.success('Bahan Baku Ditambahkan', {
        description: `Bahan baku ${newMaterial.name} berhasil didaftarkan ke sistem.`
      })

      // Reset & Reload
      setIsAdding(false)
      setNewMaterialFile(null)
      setNewMaterial({
        sku: '',
        name: '',
        type: defaultType,
        category: defaultCategory,
        quality: defaultQuality,
        size: '',
        stock: 0,
        unit: defaultUnit,
        colorPattern: '',
        imageUrl: '',
        expiredAt: '',
      })
      navigate({ to: '/materials', search: searchParams }) // Reload loader
    } catch (err: any) {
      toast.error('Gagal Menambahkan Bahan Baku', {
        description: err.message || 'Terjadi kesalahan saat menyimpan data.'
      })
    } finally {
      setIsSavingNew(false)
    }
  }

  // Handle Stock Update
  const handleStockUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMaterial || stockDelta === '') return
    setIsUpdatingStock(true)
    
    // Convert to positive delta or negative based on type
    let finalQty = Number(stockDelta)
    if (adjType === 'OUTGOING') {
      finalQty = -Math.abs(finalQty)
    } else if (adjType === 'INCOMING') {
      finalQty = Math.abs(finalQty)
    }

    try {
      const updated = await updateStock({
        data: {
          materialId: selectedMaterial.id,
          quantity: finalQty,
          type: adjType,
          notes: adjNotes || `${adjType} transaction.`,
        }
      })
      
      toast.success('Penyesuaian Stok Berhasil', {
        description: `Stok bahan baku ${selectedMaterial.name} berhasil diperbarui.`
      })

      // Refresh current selected view
      const { items: reloadedMaterials } = await getMaterials({ 
        data: {
          search: searchParams.search,
          type: searchParams.type,
          category: searchParams.category,
          page: searchParams.page || 1,
          limit: searchParams.limit || 10,
        }
      })
      const reloadedSelected = reloadedMaterials.find(m => m.id === selectedMaterial.id)
      setSelectedMaterial(reloadedSelected || updated)
      
      // Reset fields
      setStockDelta('')
      setAdjNotes('')
      navigate({ to: '/materials', search: searchParams }) // reload route loader data
    } catch (err: any) {
      toast.error('Gagal Memperbarui Stok', {
        description: err.message || 'Terjadi kesalahan saat menyesuaikan jumlah stok.'
      })
    } finally {
      setIsUpdatingStock(false)
    }
  }

  // Handle Delete Material
  const handleDeleteMaterial = async () => {
    if (!selectedMaterial) return
    setIsDeleting(true)
    try {
      await deleteMaterial({ data: { id: selectedMaterial.id } })
      toast.success('Bahan Baku Dihapus', {
        description: 'Bahan baku telah berhasil dihapus secara permanen dari sistem.'
      })
      setSelectedMaterial(null)
      setIsDeleteDialogOpen(false)
      navigate({ to: '/materials', search: searchParams })
    } catch (err: any) {
      toast.error('Gagal Menghapus Bahan Baku', {
        description: err.message || 'Terjadi kesalahan saat menghapus data.'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-8 rise-in" id="main-content">
      
      {/* FULL-WIDTH KPI WIDGETS */}
      <MaterialKpiWidgets
        totalCount={totalCount}
        outOfStockMaterials={outOfStockMaterials}
        lowStockMaterials={lowStockMaterials}
        expiredMaterials={expiredMaterials}
        almostExpiringMaterials={almostExpiringMaterials}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Catalog list (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Editorial Section Header */}
          <div className="border-b-[0.5px] border-gallery-line pb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-serif tracking-tight text-gallery-dark">
                DAFTAR BAHAN BAKU
              </h2>
              <p className="text-xs text-gallery-muted tracking-wide font-medium mt-1">
                PEMANTAUAN STOK & DAFTAR BAHAN BAKU
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 bg-gallery-dark text-gallery-base px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-200 cursor-pointer font-sans focus-ring"
              >
                <Plus size={14} />
                <span>Tambah Bahan Baku</span>
              </button>
            </div>
          </div>

          {/* Filters and Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gallery-muted" size={14} />
              <input 
                type="text" 
                placeholder="Cari berdasarkan SKU, warna, motif, atau nama..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-gallery-split/50 border-[0.5px] border-gallery-line pl-9 pr-4 py-2 text-xs text-gallery-dark focus-ring font-sans placeholder-gallery-muted/65"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={searchParams.type || 'ALL'}
                onChange={(e) => updateFilters('type', e.target.value === 'ALL' ? undefined : e.target.value)}
                className="bg-gallery-split border-[0.5px] border-gallery-line px-3 py-2 text-xs font-semibold text-gallery-dark focus-ring uppercase tracking-wider"
              >
                <option value="ALL">Semua Jenis Bahan</option>
                <option value="LEATHER">Kulit</option>
                <option value="FABRIC">Kain</option>
                <option value="GLUE">Lem</option>
                <option value="ZIPPER">Resleting</option>
                <option value="ACCESSORY">Aksesori</option>
              </select>
              <button 
                type="submit"
                className="bg-gallery-split border-[0.5px] border-gallery-line hover:bg-gallery-dark hover:text-gallery-base px-4 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer focus-ring"
              >
                Terapkan
              </button>
            </div>
          </form>

          {/* VIEW MODE TOGGLE AND HEADER */}
          <div className="flex justify-between items-center border-b-[0.5px] border-gallery-line pb-3">
            <span className="text-[10px] uppercase tracking-widest text-gallery-muted font-bold">
              Menampilkan {materials.length} dari {totalCount} Bahan Baku
            </span>
            <div className="flex gap-1 border-[0.5px] border-gallery-line bg-gallery-split p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer focus-ring ${
                  viewMode === 'grid' 
                    ? 'bg-gallery-dark text-gallery-base' 
                    : 'text-gallery-muted hover:text-gallery-dark'
                }`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer focus-ring ${
                  viewMode === 'table' 
                    ? 'bg-gallery-dark text-gallery-base' 
                    : 'text-gallery-muted hover:text-gallery-dark'
                }`}
              >
                Tabel
              </button>
            </div>
          </div>

          {/* Catalog rendering */}
          {materials.length === 0 ? (
            <div className="border-[0.5px] border-gallery-line border-dashed p-12 text-center text-xs tracking-wider text-gallery-muted uppercase font-semibold">
              Bahan baku tidak ditemukan. Coba cari dengan kata kunci lain.
            </div>
          ) : viewMode === 'table' ? (
            <MaterialTable
              materials={materials}
              selectedMaterial={selectedMaterial}
              handleSelectMaterial={handleSelectMaterial}
              lowStockThresholds={lowStockThresholds}
              now={now}
            />
          ) : (
            <MaterialGrid
              materials={materials}
              selectedMaterial={selectedMaterial}
              handleSelectMaterial={handleSelectMaterial}
              lowStockThresholds={lowStockThresholds}
              now={now}
            />
          )}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-[0.5px] border-gallery-line bg-gallery-split p-4 gap-3 text-xs font-semibold text-gallery-dark">
              <span className="text-[10px] uppercase tracking-widest text-gallery-muted font-bold">
                Halaman {page} dari {totalPages} (Total {totalCount} bahan)
              </span>
              
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="px-3 py-1.5 border-[0.5px] border-gallery-line bg-gallery-base hover:border-gallery-dark disabled:opacity-40 disabled:hover:border-gallery-line disabled:cursor-not-allowed transition-all uppercase tracking-widest text-[9px] font-bold cursor-pointer focus-ring"
                >
                  Sebelumnya
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1
                  const isCurrent = pageNum === page
                  const isNear = Math.abs(pageNum - page) <= 1
                  const isBoundary = pageNum === 1 || pageNum === totalPages

                  if (isBoundary || isNear) {
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center border-[0.5px] transition-all text-[10px] font-bold cursor-pointer focus-ring ${
                          isCurrent
                            ? 'bg-gallery-dark text-gallery-base border-gallery-dark'
                            : 'bg-gallery-base border-gallery-line hover:border-gallery-dark'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  }

                  // Show ellipses if needed
                  if (pageNum === 2 && page > 3) {
                    return <span key="ellipsis-start" className="text-gallery-muted px-1 select-none">...</span>
                  }
                  if (pageNum === totalPages - 1 && page < totalPages - 2) {
                    return <span key="ellipsis-end" className="text-gallery-muted px-1 select-none">...</span>
                  }

                  return null
                })}

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="px-3 py-1.5 border-[0.5px] border-gallery-line bg-gallery-base hover:border-gallery-dark disabled:opacity-40 disabled:hover:border-gallery-line disabled:cursor-not-allowed transition-all uppercase tracking-widest text-[9px] font-bold cursor-pointer focus-ring"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Action board / detail log / creation pane (4/12) */}
        <div id="detail-panel" className="lg:col-span-4 space-y-6 lg:sticky lg:top-10">
          
          {selectedMaterial ? (
            <MaterialDetailPanel
              selectedMaterial={selectedMaterial}
              now={now}
              lowStockThresholds={lowStockThresholds}
              startEdit={startEdit}
              setIsDeleteDialogOpen={setIsDeleteDialogOpen}
              setSelectedMaterial={setSelectedMaterial}
              adjType={adjType}
              setAdjType={setAdjType}
              stockDelta={stockDelta}
              setStockDelta={setStockDelta}
              adjNotes={adjNotes}
              setAdjNotes={setAdjNotes}
              isUpdatingStock={isUpdatingStock}
              handleStockUpdateSubmit={handleStockUpdateSubmit}
            />
          ) : (
            <div className="bg-gallery-split border-[0.5px] border-gallery-line p-6 space-y-6">
              <h3 className="font-serif text-xl tracking-tight text-gallery-dark uppercase border-b-[0.5px] border-gallery-line pb-3">
                PAPAN PERINGATAN STOK & KEDALUWARSA
              </h3>

              {/* Alert: Expired Materials */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-[0.18em] text-red-800 font-bold flex items-center gap-1.5">
                  <Calendar size={12} className="text-red-700" />
                  BAHAN BAKU KEDALUWARSA ({expiredMaterials.length})
                </h4>
                {expiredMaterials.length === 0 ? (
                  <p className="text-xs text-gallery-muted italic bg-gallery-base/40 p-3 border-[0.5px] border-gallery-line font-medium">
                    Tidak ada bahan baku yang kedaluwarsa.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {expiredMaterials.map(m => (
                      <div 
                        key={m.id}
                        tabIndex={0}
                        role="button"
                        onClick={() => handleSelectMaterial(m)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectMaterial(m); }}
                        className="bg-white border-l-2 border-red-650 border-[0.5px] border-gallery-line p-3 flex justify-between items-center cursor-pointer hover:border-gallery-dark duration-150 focus-ring font-sans"
                      >
                        <div>
                          <h5 className="text-xs font-bold text-gallery-dark">{m.name}</h5>
                          <p className="text-[10px] text-gallery-muted uppercase mt-0.5 font-bold">{m.sku} • {m.category}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-red-600 text-white">
                            Kedaluwarsa
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Alert: Expiring Materials */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] uppercase tracking-[0.18em] text-amber-800 font-bold flex items-center gap-1.5">
                  <Calendar size={12} className="text-amber-600" />
                  BAHAN BAKU HAMPIR KEDALUWARSA ({almostExpiringMaterials.length})
                </h4>
                {almostExpiringMaterials.length === 0 ? (
                  <p className="text-xs text-gallery-muted italic bg-gallery-base/40 p-3 border-[0.5px] border-gallery-line font-medium">
                    Tidak ada bahan baku yang mendekati kedaluwarsa.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {almostExpiringMaterials.map(m => {
                      const exp = new Date(m.expiredAt!)
                      const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                      return (
                        <div 
                          key={m.id}
                          tabIndex={0}
                          role="button"
                          onClick={() => handleSelectMaterial(m)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectMaterial(m); }}
                          className="bg-white border-l-2 border-amber-500 border-[0.5px] border-gallery-line p-3 flex justify-between items-center cursor-pointer hover:border-gallery-dark duration-150 focus-ring font-sans"
                        >
                          <div>
                            <h5 className="text-xs font-bold text-gallery-dark">{m.name}</h5>
                            <p className="text-[10px] text-gallery-muted uppercase mt-0.5 font-bold">{m.sku} • {m.category}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-250/50">
                              {daysLeft} hari lagi
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Alert: Out of Stock Materials */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] uppercase tracking-[0.18em] text-red-800 font-bold flex items-center gap-1.5">
                  <AlertTriangle size={12} className="text-red-700" />
                  PERINGATAN STOK HABIS ({outOfStockMaterials.length})
                </h4>
                {outOfStockMaterials.length === 0 ? (
                  <p className="text-xs text-gallery-muted italic bg-gallery-base/40 p-3 border-[0.5px] border-gallery-line font-medium">
                    Tidak ada bahan baku yang habis.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {outOfStockMaterials.map(m => (
                      <div 
                        key={m.id}
                        tabIndex={0}
                        role="button"
                        onClick={() => handleSelectMaterial(m)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectMaterial(m); }}
                        className="bg-white border-l-2 border-red-600 border-[0.5px] border-gallery-line p-3 flex justify-between items-center cursor-pointer hover:border-gallery-dark duration-150 focus-ring font-sans"
                      >
                        <div>
                          <h5 className="text-xs font-bold text-gallery-dark">{m.name}</h5>
                          <p className="text-[10px] text-gallery-muted uppercase mt-0.5 font-bold">{m.sku} • Batas: {lowStockThresholds[m.type]} {m.unit}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5">
                            Habis
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Alert: Low Stock Materials */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] uppercase tracking-[0.18em] text-amber-800 font-bold flex items-center gap-1.5">
                  <AlertTriangle size={12} className="text-amber-600" />
                  PERINGATAN STOK MENIPIS ({lowStockMaterials.length})
                </h4>
                {lowStockMaterials.length === 0 ? (
                  <p className="text-xs text-gallery-muted italic bg-gallery-base/40 p-3 border-[0.5px] border-gallery-line font-medium">
                    Stok semua bahan baku aman dan mencukupi.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {lowStockMaterials.map(m => (
                      <div 
                        key={m.id}
                        tabIndex={0}
                        role="button"
                        onClick={() => handleSelectMaterial(m)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectMaterial(m); }}
                        className="bg-white border-l-2 border-amber-500 border-[0.5px] border-gallery-line p-3 flex justify-between items-center cursor-pointer hover:border-gallery-dark duration-150 focus-ring font-sans"
                      >
                        <div>
                          <h5 className="text-xs font-bold text-gallery-dark">{m.name}</h5>
                          <p className="text-[10px] text-gallery-muted uppercase mt-0.5 font-bold">{m.sku} • Batas: {lowStockThresholds[m.type]} {m.unit}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 border border-amber-200/50">
                            {m.stock} {m.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* FORM DIALOGS */}
      <MaterialFormDialogs
        options={options}
        handleDeleteOption={handleDeleteOption}
        isAdding={isAdding}
        setIsAdding={setIsAdding}
        newMaterial={newMaterial}
        setNewMaterial={setNewMaterial}
        newMaterialFile={newMaterialFile}
        setNewMaterialFile={setNewMaterialFile}
        isSavingNew={isSavingNew}
        handleAddSubmit={handleAddSubmit}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        editMaterialData={editMaterialData}
        setEditMaterialData={setEditMaterialData}
        editMaterialFile={editMaterialFile}
        setEditMaterialFile={setEditMaterialFile}
        isSavingEdit={isSavingEdit}
        handleEditSubmit={handleEditSubmit}
        isDeletingOpen={isDeleteDialogOpen}
        setIsDeletingOpen={setIsDeleteDialogOpen}
        selectedMaterial={selectedMaterial}
        isDeleting={isDeleting}
        handleDeleteMaterial={handleDeleteMaterial}
        handleAddOption={handleAddOption}
      />

    </div>
  )
}
