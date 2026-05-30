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
import { 
  Search, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  History, 
  Calendar, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  X,
  Layers,
  Settings,
  Pencil
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog'
import { ImageUploadInput, uploadToImgBB } from '../components/ImageUploadInput'

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

// Extract dynamic colors from color name
function getColorHex(colorName: string): string {
  const name = colorName.toLowerCase()
  if (name.includes('black')) return '#1A1A1A'
  if (name.includes('white')) return '#FAFAFA'
  if (name.includes('tan') || name.includes('brown')) return '#A77B52'
  if (name.includes('nude') || name.includes('beige')) return '#E3DAC9'
  if (name.includes('gold')) return '#D4AF37'
  if (name.includes('silver') || name.includes('gray')) return '#C0C0C0'
  if (name.includes('red')) return '#A33B3B'
  if (name.includes('blue')) return '#3B59A3'
  if (name.includes('green')) return '#3BA36A'
  if (name.includes('brass')) return '#B5A642'
  if (name.includes('emerald')) return '#0F52BA'
  // Default to a warm gray
  return '#B6B3B3'
}

// Custom Visual Swatch component to fulfill Fitur 4 (Visual Support)
function MaterialVisual({ type, colorPattern, imageUrl }: { type: string, colorPattern: string, imageUrl?: string | null }) {
  if (imageUrl && imageUrl.trim().startsWith('http')) {
    return (
      <div className="w-full h-40 bg-gallery-split overflow-hidden border-b border-gallery-line relative group">
        <img 
          src={imageUrl} 
          alt={colorPattern} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
        />
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-gallery-dark text-[8px] tracking-widest text-gallery-base uppercase font-semibold">
          {type}
        </div>
      </div>
    )
  }

  const baseColor = getColorHex(colorPattern)

  // Fallback beautiful SVG Swatches for Materials
  return (
    <div className="w-full h-40 bg-gallery-split overflow-hidden border-b border-gallery-line relative flex items-center justify-center p-4">
      {type === 'LEATHER' && (
        <svg className="w-full h-full opacity-80" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`python-${colorPattern}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M0 10 L10 0 L20 10 L10 20 Z" fill="none" stroke={`${baseColor}33`} strokeWidth="1" />
              <circle cx="10" cy="10" r="3" fill={baseColor} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`${baseColor}15`} />
          <rect width="100%" height="100%" fill={`url(#python-${colorPattern})`} />
        </svg>
      )}

      {type === 'FABRIC' && (
        <svg className="w-full h-full opacity-80" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`weave-${colorPattern}`} width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 0,6 L 12,6 M 6,0 L 6,12" stroke={baseColor} strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`${baseColor}11`} />
          <rect width="100%" height="100%" fill={`url(#weave-${colorPattern})`} />
        </svg>
      )}

      {type === 'ZIPPER' && (
        <div className="w-full h-full flex flex-col justify-center items-center relative overflow-hidden" style={{ backgroundColor: `${baseColor}15` }}>
          <div className="w-4 h-full bg-gallery-dark/10 border-x border-gallery-line flex flex-col justify-between py-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-full h-1 bg-gallery-dark/30 my-0.5" style={{ backgroundColor: baseColor }} />
            ))}
          </div>
        </div>
      )}

      {type === 'GLUE' && (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${baseColor}10` }}>
          <div className="w-12 h-16 border-2 border-dashed flex items-end justify-center pb-2 relative" style={{ borderColor: baseColor }}>
            <div className="w-full h-1/2" style={{ backgroundColor: baseColor, opacity: 0.3 }} />
            <div className="absolute -top-3 w-4 h-3 border-2 border-b-0" style={{ borderColor: baseColor }} />
          </div>
        </div>
      )}

      {type === 'ACCESSORY' && (
        <svg className="w-full h-full flex items-center justify-center p-8 opacity-80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="30" fill="none" stroke={baseColor} strokeWidth="3" />
          <rect x="35" y="35" width="30" height="30" fill="none" stroke={baseColor} strokeWidth="1.5" transform="rotate(45 50 50)" />
        </svg>
      )}

      <div className="absolute top-2 right-2 px-2 py-0.5 bg-gallery-dark text-[8px] tracking-widest text-gallery-base uppercase font-semibold">
        {type}
      </div>
      <div className="absolute bottom-2 left-2 text-[9px] uppercase tracking-wider text-gallery-dark/60 font-semibold bg-gallery-base/80 px-2 py-0.5 backdrop-blur-sm">
        {colorPattern}
      </div>
    </div>
  )
}

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

  // Inline dynamic option creation states & handlers for quick UX
  const [isAddingTypeInline, setIsAddingTypeInline] = useState(false)
  const [inlineTypeValue, setInlineTypeValue] = useState('')
  const [isAddingCategoryInline, setIsAddingCategoryInline] = useState(false)
  const [inlineCategoryValue, setInlineCategoryValue] = useState('')
  const [isAddingQualityInline, setIsAddingQualityInline] = useState(false)
  const [inlineQualityValue, setInlineQualityValue] = useState('')
  const [isAddingUnitInline, setIsAddingUnitInline] = useState(false)
  const [inlineUnitValue, setInlineUnitValue] = useState('')

  const handleSaveTypeInline = async () => {
    const val = inlineTypeValue.trim()
    if (!val) return
    try {
      await addDropdownOption({
        data: { 
          type: 'type', 
          name: val.toUpperCase(), 
          label: val 
        }
      })
      toast.success(`Tipe "${val}" berhasil ditambahkan`)
      setInlineTypeValue('')
      setIsAddingTypeInline(false)
      if (isEditing) {
        setEditMaterialData(prev => ({ ...prev, type: val.toUpperCase() }))
      } else {
        setNewMaterial(prev => ({ ...prev, type: val.toUpperCase() }))
      }
      navigate({ to: '/materials', search: searchParams })
    } catch (err: any) {
      toast.error('Gagal Menambahkan Tipe', { description: err.message })
    }
  }

  const handleSaveCategoryInline = async () => {
    const val = inlineCategoryValue.trim()
    if (!val) return
    try {
      await addDropdownOption({
        data: { type: 'category', name: val }
      })
      toast.success(`Kategori "${val}" berhasil ditambahkan`)
      setInlineCategoryValue('')
      setIsAddingCategoryInline(false)
      if (isEditing) {
        setEditMaterialData(prev => ({ ...prev, category: val }))
      } else {
        setNewMaterial(prev => ({ ...prev, category: val }))
      }
      navigate({ to: '/materials', search: searchParams })
    } catch (err: any) {
      toast.error('Gagal Menambahkan Kategori', { description: err.message })
    }
  }

  const handleSaveQualityInline = async () => {
    const val = inlineQualityValue.trim()
    if (!val) return
    try {
      await addDropdownOption({
        data: { type: 'quality', name: val }
      })
      toast.success(`Kualitas "${val}" berhasil ditambahkan`)
      setInlineQualityValue('')
      setIsAddingQualityInline(false)
      if (isEditing) {
        setEditMaterialData(prev => ({ ...prev, quality: val }))
      } else {
        setNewMaterial(prev => ({ ...prev, quality: val }))
      }
      navigate({ to: '/materials', search: searchParams })
    } catch (err: any) {
      toast.error('Gagal Menambahkan Kualitas', { description: err.message })
    }
  }

  const handleSaveUnitInline = async () => {
    const val = inlineUnitValue.trim()
    if (!val) return
    try {
      await addDropdownOption({
        data: { type: 'unit', name: val }
      })
      toast.success(`Satuan "${val}" berhasil ditambahkan`)
      setInlineUnitValue('')
      setIsAddingUnitInline(false)
      if (isEditing) {
        setEditMaterialData(prev => ({ ...prev, unit: val }))
      } else {
        setNewMaterial(prev => ({ ...prev, unit: val }))
      }
      navigate({ to: '/materials', search: searchParams })
    } catch (err: any) {
      toast.error('Gagal Menambahkan Satuan', { description: err.message })
    }
  }


  // Stock update state
  const [stockDelta, setStockDelta] = useState<number>(0)
  const [adjType, setAdjType] = useState<'INCOMING' | 'OUTGOING' | 'ADJUSTMENT'>('INCOMING')
  const [adjNotes, setAdjNotes] = useState('')

  // Search input state
  const [searchInput, setSearchInput] = useState(searchParams.search || '')

  // Alert and expiry states
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
    }
  }

  // Handle Stock Update
  const handleStockUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMaterial) return
    
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
      setStockDelta(0)
      setAdjNotes('')
      navigate({ to: '/materials', search: searchParams }) // reload route loader data
    } catch (err: any) {
      toast.error('Gagal Memperbarui Stok', {
        description: err.message || 'Terjadi kesalahan saat menyesuaikan jumlah stok.'
      })
    }
  }

  // Handle Delete Material
  const handleDelete = async () => {
    if (!selectedMaterial) return
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
    }
  }

  return (
    <div className="space-y-8 rise-in">
      
      {/* FULL-WIDTH KPI WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Widget 1: Total Materials */}
        <div className="bg-gallery-split border-[0.5px] border-gallery-line p-6 flex justify-between items-center relative group hover:border-gallery-dark duration-300">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.25em] text-gallery-muted font-bold block">
              TOTAL BAHAN BAKU
            </span>
            <div className="text-3xl font-serif text-gallery-dark font-bold mt-1.5">
              {totalCount}
            </div>
            <span className="text-[10px] text-gallery-muted font-semibold block">
              Item terdaftar di inventaris
            </span>
          </div>
          <div className="w-12 h-12 bg-gallery-base flex items-center justify-center border-[0.5px] border-gallery-line">
            <Layers size={18} className="text-gallery-dark" />
          </div>
        </div>

        {/* Widget 2: Out of Stock Warning */}
        <div className={`border-[0.5px] p-6 flex justify-between items-center relative duration-300 ${
          outOfStockMaterials.length > 0 
            ? 'bg-red-50/20 border-red-200 hover:border-red-400' 
            : 'bg-gallery-split border-gallery-line hover:border-gallery-dark'
        }`}>
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.25em] text-gallery-muted font-bold block">
              STOK HABIS
            </span>
            <div className={`text-3xl font-serif font-bold mt-1.5 ${outOfStockMaterials.length > 0 ? 'text-red-700' : 'text-gallery-dark'}`}>
              {outOfStockMaterials.length}
            </div>
            <span className="text-[10px] text-gallery-muted font-semibold block">
              Bahan baku kosong
            </span>
          </div>
          <div className={`w-12 h-12 flex items-center justify-center border-[0.5px] ${
            outOfStockMaterials.length > 0 ? 'bg-red-100/55 border-red-200' : 'bg-gallery-base border-gallery-line'
          }`}>
            <AlertTriangle size={18} className={outOfStockMaterials.length > 0 ? 'text-red-700' : 'text-gallery-dark'} />
          </div>
        </div>

        {/* Widget 3: Low Stock Warning */}
        <div className={`border-[0.5px] p-6 flex justify-between items-center relative duration-300 ${
          lowStockMaterials.length > 0 
            ? 'bg-amber-50/20 border-amber-200 hover:border-amber-400' 
            : 'bg-gallery-split border-gallery-line hover:border-gallery-dark'
        }`}>
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.25em] text-gallery-muted font-bold block">
              STOK MENIPIS
            </span>
            <div className={`text-3xl font-serif font-bold mt-1.5 ${lowStockMaterials.length > 0 ? 'text-amber-700' : 'text-gallery-dark'}`}>
              {lowStockMaterials.length}
            </div>
            <span className="text-[10px] text-gallery-muted font-semibold block">
              Bahan di bawah batas minimum
            </span>
          </div>
          <div className={`w-12 h-12 flex items-center justify-center border-[0.5px] ${
            lowStockMaterials.length > 0 ? 'bg-amber-100/55 border-amber-200' : 'bg-gallery-base border-gallery-line'
          }`}>
            <AlertTriangle size={18} className={lowStockMaterials.length > 0 ? 'text-amber-700' : 'text-gallery-dark'} />
          </div>
        </div>

        {/* Widget 4: Expired Warning */}
        <div className={`border-[0.5px] p-6 flex justify-between items-center relative duration-300 ${
          expiredMaterials.length > 0 
            ? 'bg-red-50/20 border-red-200 hover:border-red-400' 
            : 'bg-gallery-split border-gallery-line hover:border-gallery-dark'
        }`}>
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.25em] text-gallery-muted font-bold block">
              BAHAN KEDALUWARSA
            </span>
            <div className={`text-3xl font-serif font-bold mt-1.5 ${expiredMaterials.length > 0 ? 'text-red-700' : 'text-gallery-dark'}`}>
              {expiredMaterials.length}
            </div>
            <span className="text-[10px] text-gallery-muted font-semibold block">
              Lewat tanggal kedaluwarsa
            </span>
          </div>
          <div className={`w-12 h-12 flex items-center justify-center border-[0.5px] ${
            expiredMaterials.length > 0 ? 'bg-red-100/55 border-red-200' : 'bg-gallery-base border-gallery-line'
          }`}>
            <Calendar size={18} className={expiredMaterials.length > 0 ? 'text-red-700' : 'text-gallery-dark'} />
          </div>
        </div>

        {/* Widget 5: Almost Expired Warning */}
        <div className={`border-[0.5px] p-6 flex justify-between items-center relative duration-300 ${
          almostExpiringMaterials.length > 0 
            ? 'bg-amber-50/20 border-amber-200 hover:border-amber-400' 
            : 'bg-gallery-split border-gallery-line hover:border-gallery-dark'
        }`}>
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.25em] text-gallery-muted font-bold block">
              HAMPIR KEDALUWARSA
            </span>
            <div className={`text-3xl font-serif font-bold mt-1.5 ${almostExpiringMaterials.length > 0 ? 'text-amber-700' : 'text-gallery-dark'}`}>
              {almostExpiringMaterials.length}
            </div>
            <span className="text-[10px] text-gallery-muted font-semibold block">
              Expired dalam waktu &lt;= 30 hari
            </span>
          </div>
          <div className={`w-12 h-12 flex items-center justify-center border-[0.5px] ${
            almostExpiringMaterials.length > 0 ? 'bg-amber-100/55 border-amber-200' : 'bg-gallery-base border-gallery-line'
          }`}>
            <Calendar size={18} className={almostExpiringMaterials.length > 0 ? 'text-amber-700' : 'text-gallery-dark'} />
          </div>
        </div>
      </div>

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
                className="flex items-center gap-2 bg-gallery-dark text-gallery-base px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-200 cursor-pointer font-sans"
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
                className="w-full bg-gallery-split/50 border-[0.5px] border-gallery-line pl-9 pr-4 py-2 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-sans placeholder-gallery-muted/65"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={searchParams.type || 'ALL'}
                onChange={(e) => updateFilters('type', e.target.value === 'ALL' ? undefined : e.target.value)}
                className="bg-gallery-split border-[0.5px] border-gallery-line px-3 py-2 text-xs font-semibold text-gallery-dark focus:outline-none focus:border-gallery-dark uppercase tracking-wider"
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
                className="bg-gallery-split border-[0.5px] border-gallery-line hover:bg-gallery-dark hover:text-gallery-base px-4 py-2 text-xs font-semibold uppercase tracking-wider"
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
                className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
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
                className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
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
            /* COMPACT TABLE LAYOUT */
            <div className="border-[0.5px] border-gallery-line bg-gallery-split overflow-hidden">
              <table className="w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="border-b-[0.5px] border-gallery-line bg-gallery-base/40 text-[9px] font-bold uppercase tracking-widest text-gallery-muted">
                    <th className="py-3 px-2 sm:px-4 font-bold w-12 text-center">Visual</th>
                    <th className="py-3 px-2 sm:px-4 font-bold">SKU</th>
                    <th className="py-3 px-2 sm:px-4 font-bold">Nama Bahan</th>
                    <th className="hidden sm:table-cell py-3 px-2 sm:px-4 font-bold">Tipe</th>
                    <th className="hidden md:table-cell lg:hidden xl:table-cell py-3 px-2 sm:px-4 font-bold">Kategori</th>
                    <th className="hidden xl:table-cell py-3 px-2 sm:px-4 font-bold">Kualitas</th>
                    <th className="hidden sm:table-cell py-3 px-2 sm:px-4 font-bold">Ukuran</th>
                    <th className="py-3 px-2 sm:px-4 font-bold text-right">Stok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gallery-line text-xs font-semibold text-gallery-dark">
                  {materials.map((m) => {
                    const isOutOfStock = m.stock <= 0
                    const isLowStock = m.stock > 0 && m.stock < (lowStockThresholds[m.type] || 10)
                    const expDate = m.expiredAt ? new Date(m.expiredAt) : null
                    const isExpired = expDate ? expDate.getTime() < now.getTime() : false
                    const isAlmostExpired = expDate ? (expDate.getTime() >= now.getTime() && (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 30) : false
                    const swatchColor = getColorHex(m.colorPattern)

                    return (
                      <tr 
                        key={m.id}
                        onClick={() => {
                          setSelectedMaterial(m)
                          setIsAdding(false)
                          setStockDelta(0)
                          setAdjNotes('')
                        }}
                        className={`cursor-pointer hover:bg-gallery-base/50 transition-colors ${
                          selectedMaterial?.id === m.id ? 'bg-gallery-base/80' : ''
                        } ${isOutOfStock ? 'bg-red-50/10' : isLowStock ? 'bg-amber-50/5' : ''}`}
                      >
                        <td className="py-3 px-2 sm:px-4 text-center">
                          <div className="w-6 h-6 border-[0.5px] border-gallery-line shrink-0 flex items-center justify-center relative overflow-hidden mx-auto" style={{ backgroundColor: swatchColor }}>
                            {m.imageUrl && m.imageUrl.trim().startsWith('http') && (
                              <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" />
                            )}
                            {m.type === 'ZIPPER' && <div className="w-0.5 h-full bg-gallery-dark/25" />}
                            {m.type === 'FABRIC' && <div className="absolute inset-0 border border-dashed border-gallery-dark/10" />}
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4 font-bold tracking-wide uppercase font-sans text-gallery-dark">{m.sku}</td>
                        <td className="py-3 px-2 sm:px-4">
                          <div className="font-serif text-[13px] break-words max-w-[100px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-[140px] xl:max-w-[220px]">
                            {m.name}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {isOutOfStock && (
                              <span className="px-1 py-0.2 bg-red-600 text-white text-[8px] tracking-wide font-bold uppercase">
                                Habis
                              </span>
                            )}
                            {isLowStock && (
                              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-700 text-[8px] tracking-wide font-bold uppercase border border-amber-200/50">
                                Menipis
                              </span>
                            )}
                            {isExpired && (
                              <span className="px-1.5 py-0.2 bg-red-650 text-white text-[8px] tracking-wide font-bold uppercase" style={{ backgroundColor: '#A33B3B' }}>
                                Kedaluwarsa
                              </span>
                            )}
                            {isAlmostExpired && (
                              <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[8px] tracking-wide font-bold uppercase">
                                Hampir Kedal.
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="hidden sm:table-cell py-3 px-2 sm:px-4">
                          <span className="text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-gallery-base/90 border-[0.5px] border-gallery-line">
                            {m.type}
                          </span>
                        </td>
                        <td className="hidden md:table-cell lg:hidden xl:table-cell py-3 px-2 sm:px-4 text-gallery-muted font-normal">{m.category}</td>
                        <td className="hidden xl:table-cell py-3 px-2 sm:px-4 text-gallery-muted font-normal">{m.quality}</td>
                        <td className="hidden sm:table-cell py-3 px-2 sm:px-4 text-gallery-muted font-normal uppercase">{m.size}</td>
                        <td className="py-3 px-2 sm:px-4 text-right">
                          <span className={`font-bold font-sans whitespace-nowrap px-1.5 py-0.5 ${
                            isOutOfStock 
                              ? 'text-red-700 bg-red-100/50' 
                              : isLowStock 
                                ? 'text-amber-700 bg-amber-100/50' 
                                : 'text-gallery-dark'
                          }`}>
                            {m.stock} <span className="text-[10px] text-gallery-muted font-semibold uppercase">{m.unit}</span>
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* RICH GRID LAYOUT */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {materials.map((m) => {
                const isOutOfStock = m.stock <= 0
                const isLowStock = m.stock > 0 && m.stock < (lowStockThresholds[m.type] || 10)
                const expDate = m.expiredAt ? new Date(m.expiredAt) : null
                const isExpired = expDate ? expDate.getTime() < now.getTime() : false
                const isAlmostExpired = expDate ? (expDate.getTime() >= now.getTime() && (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 30) : false

                return (
                  <div 
                    key={m.id}
                    onClick={() => {
                      setSelectedMaterial(m)
                      setIsAdding(false)
                      setStockDelta(0)
                      setAdjNotes('')
                    }}
                    className={`bg-gallery-split border-[0.5px] cursor-pointer relative flex flex-col group transition-all duration-300 ${
                      selectedMaterial?.id === m.id 
                        ? 'border-gallery-dark ring-1 ring-gallery-dark/15' 
                        : 'border-gallery-line hover:border-gallery-dark/60'
                    }`}
                  >
                    {/* Swatch visual support */}
                    <MaterialVisual type={m.type} colorPattern={m.colorPattern} imageUrl={m.imageUrl} />
                    
                    {/* Content details */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">
                            {m.sku}
                          </span>
                          <div className="flex gap-1.5 flex-wrap justify-end max-w-[60%]">
                            {isOutOfStock && (
                              <span className="px-1.5 py-0.5 bg-red-600 text-white text-[8px] tracking-wide font-bold uppercase">
                                Stok Habis
                              </span>
                            )}
                            {isLowStock && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[8px] tracking-wide font-bold uppercase border border-amber-200/50">
                                Stok Menipis
                              </span>
                            )}
                            {isExpired && (
                              <span className="px-1.5 py-0.5 bg-red-650 text-white text-[8px] tracking-wide font-bold uppercase" style={{ backgroundColor: '#A33B3B' }}>
                                Kedaluwarsa
                              </span>
                            )}
                            {isAlmostExpired && (
                              <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[8px] tracking-wide font-bold uppercase">
                                Hampir Kedal.
                              </span>
                            )}
                          </div>
                        </div>
                        <h3 className="font-serif text-lg tracking-tight text-gallery-dark mt-1 group-hover:underline">
                          {m.name}
                        </h3>
                        <p className="text-xs text-gallery-muted mt-0.5 font-medium">
                          Kategori: {m.category} • Kualitas: {m.quality}
                        </p>
                      </div>

                      <div className="border-t-[0.5px] border-gallery-line pt-3 flex items-end justify-between">
                        <div>
                          <div className="text-[8px] uppercase tracking-widest text-gallery-muted font-semibold">
                            SPESIFIKASI / UKURAN
                          </div>
                          <div className="text-xs font-semibold text-gallery-dark mt-0.5 uppercase">
                            {m.size}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[8px] uppercase tracking-widest text-gallery-muted font-semibold">
                            JUMLAH STOK
                          </div>
                          <div className={`text-base font-bold mt-0.5 ${
                            isOutOfStock 
                              ? 'text-red-700' 
                              : isLowStock 
                                ? 'text-amber-600' 
                                : 'text-gallery-dark'
                          }`}>
                            {m.stock} <span className="text-[10px] font-semibold text-gallery-muted uppercase tracking-wider ml-0.5">{m.unit}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-[0.5px] border-gallery-line bg-gallery-split p-4 gap-3 text-xs font-semibold text-gallery-dark">
              <span className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">
                Halaman {page} dari {totalPages} (Total {totalCount} bahan)
              </span>
              
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="px-3 py-1.5 border-[0.5px] border-gallery-line bg-gallery-base hover:border-gallery-dark disabled:opacity-40 disabled:hover:border-gallery-line disabled:cursor-not-allowed transition-all uppercase tracking-widest text-[9px] font-bold cursor-pointer"
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
                        className={`w-8 h-8 flex items-center justify-center border-[0.5px] transition-all text-[10px] font-bold cursor-pointer ${
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
                  className="px-3 py-1.5 border-[0.5px] border-gallery-line bg-gallery-base hover:border-gallery-dark disabled:opacity-40 disabled:hover:border-gallery-line disabled:cursor-not-allowed transition-all uppercase tracking-widest text-[9px] font-bold cursor-pointer"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </div>

      {/* RIGHT COLUMN: Action board / detail log / creation pane (4/12) */}
      <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-10">

        {/* CASE B: Material Details and Stock Adjustment Panel */}
        {selectedMaterial && (
          <div className="bg-gallery-split border-[0.5px] border-gallery-dark p-6 space-y-6">
            
            {/* Header info */}
            <div className="border-b-[0.5px] border-gallery-line pb-4 flex justify-between items-start gap-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">
                  SKU: {selectedMaterial.sku}
                </span>
                <h3 className="font-serif text-2xl tracking-tight text-gallery-dark mt-0.5">
                  {selectedMaterial.name}
                </h3>
                <p className="text-xs text-gallery-muted tracking-wider uppercase font-semibold mt-1">
                  {selectedMaterial.type} • {selectedMaterial.category} • {selectedMaterial.quality}
                </p>
                {/* Status Badges */}
                {(() => {
                  const m = selectedMaterial
                  const isOutOfStock = m.stock <= 0
                  const isLowStock = m.stock > 0 && m.stock < (lowStockThresholds[m.type] || 10)
                  const expDate = m.expiredAt ? new Date(m.expiredAt) : null
                  const isExpired = expDate ? expDate.getTime() < now.getTime() : false
                  const isAlmostExpired = expDate ? (expDate.getTime() >= now.getTime() && (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 30) : false
                  
                  if (!isOutOfStock && !isLowStock && !isExpired && !isAlmostExpired) return null
                  
                  return (
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {isOutOfStock && (
                        <span className="px-2 py-0.5 bg-red-600 text-white text-[8px] tracking-wider font-bold uppercase">
                          Stok Habis
                        </span>
                      )}
                      {isLowStock && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[8px] tracking-wider font-bold uppercase border border-amber-200/50">
                          Stok Menipis
                        </span>
                      )}
                      {isExpired && (
                        <span className="px-2 py-0.5 bg-red-650 text-white text-[8px] tracking-wider font-bold uppercase" style={{ backgroundColor: '#A33B3B' }}>
                          Kedaluwarsa
                        </span>
                      )}
                      {isAlmostExpired && (
                        <span className="px-2 py-0.5 bg-amber-500 text-white text-[8px] tracking-wider font-bold uppercase">
                          Hampir Kedaluwarsa
                        </span>
                      )}
                    </div>
                  )
                })()}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => startEdit(selectedMaterial)}
                  className="p-2 border-[0.5px] border-gallery-line hover:border-gallery-dark hover:text-gallery-dark transition-colors bg-gallery-base cursor-pointer"
                  title="Edit Informasi Bahan Baku"
                >
                  <Pencil size={14} />
                </button>
                <button 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="p-2 border-[0.5px] border-gallery-line hover:border-red-600 hover:text-red-600 transition-colors bg-gallery-base cursor-pointer"
                  title="Hapus Bahan Baku"
                >
                  <Trash2 size={14} />
                </button>
                <button 
                  onClick={() => setSelectedMaterial(null)}
                  className="p-2 border-[0.5px] border-gallery-line hover:border-gallery-dark transition-colors bg-gallery-base cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Visual Swatch */}
            <div className="border-[0.5px] border-gallery-line overflow-hidden bg-gallery-base">
              <MaterialVisual 
                type={selectedMaterial.type}
                colorPattern={selectedMaterial.colorPattern}
                imageUrl={selectedMaterial.imageUrl}
              />
            </div>

            {/* Spec details grid */}
            <div className="grid grid-cols-2 gap-4 border-[0.5px] border-gallery-line p-4 bg-gallery-base/40">
              <div>
                <div className="text-[8px] uppercase tracking-widest text-gallery-muted font-semibold">DETAIL UKURAN</div>
                <div className="text-xs text-gallery-dark font-bold mt-0.5 uppercase">{selectedMaterial.size}</div>
              </div>
              <div>
                <div className="text-[8px] uppercase tracking-widest text-gallery-muted font-semibold">WARNA / MOTIF</div>
                <div className="text-xs text-gallery-dark font-bold mt-0.5 uppercase">{selectedMaterial.colorPattern}</div>
              </div>
              <div>
                <div className="text-[8px] uppercase tracking-widest text-gallery-muted font-semibold">TANGGAL KEDALUWARSA</div>
                <div className="text-xs text-gallery-dark font-bold mt-0.5 uppercase">
                  {selectedMaterial.expiredAt ? (
                    (() => {
                      const expTime = new Date(selectedMaterial.expiredAt).getTime()
                      const diffDays = Math.ceil((expTime - now.getTime()) / (1000 * 60 * 60 * 24))
                      let colorClass = ''
                      if (diffDays < 0) {
                        colorClass = 'text-red-650 font-bold'
                      } else if (diffDays <= 30) {
                        colorClass = 'text-amber-600 font-bold'
                      }
                      return (
                        <span className={colorClass}>
                          {new Date(selectedMaterial.expiredAt).toLocaleDateString('id-ID')}
                        </span>
                      )
                    })()
                  ) : (
                    'TIDAK ADA'
                  )}
                </div>
              </div>
              <div>
                <div className="text-[8px] uppercase tracking-widest text-gallery-muted font-semibold">JUMLAH STOK</div>
                <div className="text-sm text-gallery-dark font-bold mt-0.5 uppercase">
                  {selectedMaterial.stock} {selectedMaterial.unit}
                </div>
              </div>
            </div>

            {/* Form: Stock transaction update */}
            <form onSubmit={handleStockUpdateSubmit} className="space-y-4 border-t-[0.5px] border-gallery-line pt-5">
              <h4 className="text-[10px] uppercase tracking-[0.18em] text-gallery-dark font-bold flex items-center gap-1.5">
                <TrendingUp size={12} />
                CATAT RIWAYAT STOK (MASUK / KELUAR)
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">
                    Jenis Transaksi
                  </label>
                  <select 
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value as any)}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-semibold tracking-wide uppercase"
                  >
                    <option value="INCOMING">Barang Masuk (Restock / Beli)</option>
                    <option value="OUTGOING">Barang Keluar (Produksi / Rusak)</option>
                    <option value="ADJUSTMENT">Penyesuai Stok (Audit Fisik)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">
                    Jumlah ({selectedMaterial.unit})*
                  </label>
                  <input 
                    type="number" 
                    step="any"
                    required
                    min="0.01"
                    placeholder="e.g. 5.5"
                    value={stockDelta || ''}
                    onChange={(e) => setStockDelta(Number(e.target.value))}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">
                  Catatan / Keterangan
                </label>
                <input 
                  type="text" 
                  placeholder="cth. Beli dari pemasok, dipakai untuk contoh produk..."
                  value={adjNotes}
                  onChange={(e) => setAdjNotes(e.target.value)}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-gallery-dark text-gallery-base py-2 text-xs font-semibold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-200"
              >
                Simpan Catatan Stok
              </button>
            </form>

            {/* Sub-list: Recent transaction history for this item */}
            <div className="border-t-[0.5px] border-gallery-line pt-5 space-y-3">
              <h4 className="text-[10px] uppercase tracking-[0.18em] text-gallery-dark font-bold flex items-center gap-1.5">
                <History size={12} />
                RIWAYAT PERUBAHAN STOK BAHAN
              </h4>
              
              {selectedMaterial.stockLogs && selectedMaterial.stockLogs.length > 0 ? (
                <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                  {selectedMaterial.stockLogs.map((log: any) => {
                    const logDate = new Date(log.createdAt).toLocaleString('id-ID', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                    return (
                      <div key={log.id} className="border-b-[0.5px] border-gallery-line pb-2 flex justify-between items-start gap-4 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold uppercase px-1.5 ${
                              log.type === 'INCOMING' ? 'bg-green-100 text-green-800' :
                              log.type === 'OUTGOING' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {log.type === 'INCOMING' ? 'Masuk' : log.type === 'OUTGOING' ? 'Keluar' : 'Penyesuaian'}
                            </span>
                            <span className="text-[10px] font-bold text-gallery-dark">
                              {log.quantity > 0 ? `+${log.quantity}` : log.quantity} {selectedMaterial.unit}
                            </span>
                          </div>
                          <p className="text-gallery-muted text-[11px] mt-0.5 leading-relaxed">{log.notes || 'Tanpa keterangan'}</p>
                        </div>
                        <span className="text-[10px] text-gallery-muted font-medium whitespace-nowrap">{logDate}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-gallery-muted italic">Belum ada catatan transaksi stok untuk bahan baku ini.</p>
              )}
            </div>

          </div>
        )}

        {/* DEFAULT STATE: Alert Board */}
        {!selectedMaterial && (
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
                <p className="text-xs text-gallery-muted italic bg-gallery-base/40 p-3 border-[0.5px] border-gallery-line">
                  Tidak ada bahan baku yang kedaluwarsa.
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {expiredMaterials.map(m => {
                    return (
                      <div 
                        key={m.id}
                        onClick={() => setSelectedMaterial(m)}
                        className="bg-white border-l-2 border-red-600 border-[0.5px] border-gallery-line p-3 flex justify-between items-center cursor-pointer hover:border-gallery-dark duration-150"
                      >
                        <div>
                          <h5 className="text-xs font-bold text-gallery-dark">{m.name}</h5>
                          <p className="text-[10px] text-gallery-muted uppercase mt-0.5">{m.sku} • {m.category}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-red-600 text-white">
                            Kedaluwarsa
                          </span>
                        </div>
                      </div>
                    )
                  })}
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
                <p className="text-xs text-gallery-muted italic bg-gallery-base/40 p-3 border-[0.5px] border-gallery-line">
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
                        onClick={() => setSelectedMaterial(m)}
                        className="bg-white border-l-2 border-amber-500 border-[0.5px] border-gallery-line p-3 flex justify-between items-center cursor-pointer hover:border-gallery-dark duration-150"
                      >
                        <div>
                          <h5 className="text-xs font-bold text-gallery-dark">{m.name}</h5>
                          <p className="text-[10px] text-gallery-muted uppercase mt-0.5">{m.sku} • {m.category}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-amber-100 text-amber-800">
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
                <p className="text-xs text-gallery-muted italic bg-gallery-base/40 p-3 border-[0.5px] border-gallery-line">
                  Tidak ada bahan baku yang habis.
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {outOfStockMaterials.map(m => (
                    <div 
                      key={m.id}
                      onClick={() => setSelectedMaterial(m)}
                      className="bg-white border-l-2 border-red-600 border-[0.5px] border-gallery-line p-3 flex justify-between items-center cursor-pointer hover:border-gallery-dark duration-150"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-gallery-dark">{m.name}</h5>
                        <p className="text-[10px] text-gallery-muted uppercase mt-0.5">{m.sku} • Batas Minimum: {lowStockThresholds[m.type]} {m.unit}</p>
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
                <p className="text-xs text-gallery-muted italic bg-gallery-base/40 p-3 border-[0.5px] border-gallery-line">
                  Stok semua bahan baku aman dan mencukupi.
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {lowStockMaterials.map(m => (
                    <div 
                      key={m.id}
                      onClick={() => setSelectedMaterial(m)}
                      className="bg-white border-l-2 border-amber-500 border-[0.5px] border-gallery-line p-3 flex justify-between items-center cursor-pointer hover:border-gallery-dark duration-150"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-gallery-dark">{m.name}</h5>
                        <p className="text-[10px] text-gallery-muted uppercase mt-0.5">{m.sku} • Batas Minimum: {lowStockThresholds[m.type]} {m.unit}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5">
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

    <Dialog open={isAdding} onOpenChange={setIsAdding}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>TAMBAH BAHAN BAKU BARU</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAddSubmit} className="space-y-3">
          <ImageUploadInput
            label="Foto Bahan Baku"
            existingUrl={newMaterial.imageUrl}
            file={newMaterialFile}
            onFileChange={setNewMaterialFile}
            onClearExisting={() => setNewMaterial({ ...newMaterial, imageUrl: '' })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold">
                Kode SKU*
              </label>
              <input 
                type="text" 
                required 
                placeholder="e.g. LTH-SYN-BK01"
                value={newMaterial.sku}
                onChange={(e) => setNewMaterial({...newMaterial, sku: e.target.value})}
                className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold">
                Nama Bahan Baku*
              </label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Synthetic Nappa Suede"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Jenis Bahan*
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingTypeInline(!isAddingTypeInline)
                    setInlineTypeValue('')
                  }}
                  className="text-[9px] text-gallery-dark font-bold hover:underline cursor-pointer font-sans"
                >
                  {isAddingTypeInline ? 'Batal' : '+ Tambah'}
                </button>
              </div>
              {isAddingTypeInline ? (
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    required
                    placeholder="Tipe"
                    value={inlineTypeValue}
                    onChange={(e) => setInlineTypeValue(e.target.value)}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-2 py-1 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-sans font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTypeInline}
                    className="w-full bg-gallery-dark text-gallery-base py-1 text-[9px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-150 cursor-pointer font-sans text-center"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <select 
                  value={newMaterial.type}
                  onChange={(e) => {
                    const t = e.target.value
                    let u = 'feet'
                    if (t === 'FABRIC') u = 'meter'
                    if (t === 'GLUE') u = 'ml'
                    if (t === 'ZIPPER') u = 'pcs'
                    if (t === 'ACCESSORY') u = 'pcs'
                    
                    const matchUnit = options.units.find(un => un.name === u)
                    const unitVal = matchUnit ? matchUnit.name : (options.units[0]?.name || u)

                    setNewMaterial({...newMaterial, type: t, unit: unitVal})
                  }}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-semibold tracking-wide uppercase"
                >
                  {options.types.map(t => (
                    <option key={t.id} value={t.name}>{t.label || t.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Kategori*
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategoryInline(!isAddingCategoryInline)
                    setInlineCategoryValue('')
                  }}
                  className="text-[9px] text-gallery-dark font-bold hover:underline cursor-pointer font-sans"
                >
                  {isAddingCategoryInline ? 'Batal' : '+ Tambah'}
                </button>
              </div>
              {isAddingCategoryInline ? (
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    required
                    placeholder="Kategori"
                    value={inlineCategoryValue}
                    onChange={(e) => setInlineCategoryValue(e.target.value)}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-2 py-1 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-sans font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleSaveCategoryInline}
                    className="w-full bg-gallery-dark text-gallery-base py-1 text-[9px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-150 cursor-pointer font-sans text-center"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <select 
                  required 
                  value={newMaterial.category}
                  onChange={(e) => setNewMaterial({...newMaterial, category: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-semibold tracking-wide"
                >
                  {options.categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Kualitas*
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingQualityInline(!isAddingQualityInline)
                    setInlineQualityValue('')
                  }}
                  className="text-[9px] text-gallery-dark font-bold hover:underline cursor-pointer font-sans"
                >
                  {isAddingQualityInline ? 'Batal' : '+ Tambah'}
                </button>
              </div>
              {isAddingQualityInline ? (
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    required
                    placeholder="Kualitas"
                    value={inlineQualityValue}
                    onChange={(e) => setInlineQualityValue(e.target.value)}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-2 py-1 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-sans font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleSaveQualityInline}
                    className="w-full bg-gallery-dark text-gallery-base py-1 text-[9px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-150 cursor-pointer font-sans text-center"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <select 
                  required 
                  value={newMaterial.quality}
                  onChange={(e) => setNewMaterial({...newMaterial, quality: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-semibold tracking-wide"
                >
                  {options.qualities.map(q => (
                    <option key={q.id} value={q.name}>{q.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold">
                Warna / Motif*
              </label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Python Gold, Matte Slate Black"
                value={newMaterial.colorPattern}
                onChange={(e) => setNewMaterial({...newMaterial, colorPattern: e.target.value})}
                className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold">
                Ukuran / Detail Fisik*
              </label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Gulungan, Botol, Lembar, Pcs"
                value={newMaterial.size}
                onChange={(e) => setNewMaterial({...newMaterial, size: e.target.value})}
                className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold">
                Stok Awal*
              </label>
              <input 
                type="number" 
                step="any"
                required 
                value={newMaterial.stock}
                onChange={(e) => setNewMaterial({...newMaterial, stock: Number(e.target.value)})}
                className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Satuan*
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingUnitInline(!isAddingUnitInline)
                    setInlineUnitValue('')
                  }}
                  className="text-[9px] text-gallery-dark font-bold hover:underline cursor-pointer font-sans"
                >
                  {isAddingUnitInline ? 'Batal' : '+ Tambah'}
                </button>
              </div>
              {isAddingUnitInline ? (
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    required
                    placeholder="Pcs"
                    value={inlineUnitValue}
                    onChange={(e) => setInlineUnitValue(e.target.value)}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-2 py-1 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-sans font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleSaveUnitInline}
                    className="w-full bg-gallery-dark text-gallery-base py-1 text-[9px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-150 cursor-pointer font-sans text-center"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <select 
                  required 
                  value={newMaterial.unit}
                  onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-semibold tracking-wide"
                >
                  {options.units.map(u => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold">
                Tgl Kedaluwarsa
              </label>
              <input 
                type="date" 
                placeholder="Optional"
                value={newMaterial.expiredAt}
                onChange={(e) => setNewMaterial({...newMaterial, expiredAt: e.target.value})}
                className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gallery-dark text-gallery-base py-2.5 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity active:scale-95 duration-200 mt-2 cursor-pointer"
          >
            Simpan Bahan Baku Baru
          </button>
        </form>
      </DialogContent>
    </Dialog>

    {/* EDIT BAHAN BAKU DIALOG */}
    <Dialog open={isEditing} onOpenChange={setIsEditing}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>EDIT INFORMASI BAHAN BAKU</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleEditSubmit} className="space-y-3">
          <ImageUploadInput
            label="Foto Bahan Baku"
            existingUrl={editMaterialData.imageUrl}
            file={editMaterialFile}
            onFileChange={setEditMaterialFile}
            onClearExisting={() => setEditMaterialData({ ...editMaterialData, imageUrl: '' })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold">
                Kode SKU*
              </label>
              <input 
                type="text" 
                required 
                placeholder="e.g. LTH-SYN-BK01"
                value={editMaterialData.sku}
                onChange={(e) => setEditMaterialData({...editMaterialData, sku: e.target.value})}
                className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold">
                Nama Bahan Baku*
              </label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Synthetic Nappa Suede"
                value={editMaterialData.name}
                onChange={(e) => setEditMaterialData({...editMaterialData, name: e.target.value})}
                className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Jenis Bahan*
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingTypeInline(!isAddingTypeInline)
                    setInlineTypeValue('')
                  }}
                  className="text-[9px] text-gallery-dark font-bold hover:underline cursor-pointer font-sans"
                >
                  {isAddingTypeInline ? 'Batal' : '+ Tambah'}
                </button>
              </div>
              {isAddingTypeInline ? (
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    required
                    placeholder="Tipe"
                    value={inlineTypeValue}
                    onChange={(e) => setInlineTypeValue(e.target.value)}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-2 py-1 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-sans font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTypeInline}
                    className="w-full bg-gallery-dark text-gallery-base py-1 text-[9px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-150 cursor-pointer font-sans text-center"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <select 
                  value={editMaterialData.type}
                  onChange={(e) => {
                    const t = e.target.value
                    let u = 'feet'
                    if (t === 'FABRIC') u = 'meter'
                    if (t === 'GLUE') u = 'ml'
                    if (t === 'ZIPPER') u = 'pcs'
                    if (t === 'ACCESSORY') u = 'pcs'
                    
                    const matchUnit = options.units.find(un => un.name === u)
                    const unitVal = matchUnit ? matchUnit.name : (options.units[0]?.name || u)

                    setEditMaterialData({...editMaterialData, type: t, unit: unitVal})
                  }}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-semibold tracking-wide uppercase"
                >
                  {options.types.map(t => (
                    <option key={t.id} value={t.name}>{t.label || t.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Kategori*
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategoryInline(!isAddingCategoryInline)
                    setInlineCategoryValue('')
                  }}
                  className="text-[9px] text-gallery-dark font-bold hover:underline cursor-pointer font-sans"
                >
                  {isAddingCategoryInline ? 'Batal' : '+ Tambah'}
                </button>
              </div>
              {isAddingCategoryInline ? (
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    required
                    placeholder="Kategori"
                    value={inlineCategoryValue}
                    onChange={(e) => setInlineCategoryValue(e.target.value)}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-2 py-1 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-sans font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleSaveCategoryInline}
                    className="w-full bg-gallery-dark text-gallery-base py-1 text-[9px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-150 cursor-pointer font-sans text-center"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <select 
                  required 
                  value={editMaterialData.category}
                  onChange={(e) => setEditMaterialData({...editMaterialData, category: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-semibold tracking-wide"
                >
                  {options.categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Kualitas*
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingQualityInline(!isAddingQualityInline)
                    setInlineQualityValue('')
                  }}
                  className="text-[9px] text-gallery-dark font-bold hover:underline cursor-pointer font-sans"
                >
                  {isAddingQualityInline ? 'Batal' : '+ Tambah'}
                </button>
              </div>
              {isAddingQualityInline ? (
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    required
                    placeholder="Kualitas"
                    value={inlineQualityValue}
                    onChange={(e) => setInlineQualityValue(e.target.value)}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-2 py-1 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-sans font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleSaveQualityInline}
                    className="w-full bg-gallery-dark text-gallery-base py-1 text-[9px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-150 cursor-pointer font-sans text-center"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <select 
                  required 
                  value={editMaterialData.quality}
                  onChange={(e) => setEditMaterialData({...editMaterialData, quality: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-semibold tracking-wide"
                >
                  {options.qualities.map(q => (
                    <option key={q.id} value={q.name}>{q.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold">
                Warna / Motif*
              </label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Python Gold, Matte Slate Black"
                value={editMaterialData.colorPattern}
                onChange={(e) => setEditMaterialData({...editMaterialData, colorPattern: e.target.value})}
                className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold">
                Ukuran / Detail Fisik*
              </label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Gulungan, Botol, Lembar, Pcs"
                value={editMaterialData.size}
                onChange={(e) => setEditMaterialData({...editMaterialData, size: e.target.value})}
                className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Satuan*
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingUnitInline(!isAddingUnitInline)
                    setInlineUnitValue('')
                  }}
                  className="text-[9px] text-gallery-dark font-bold hover:underline cursor-pointer font-sans"
                >
                  {isAddingUnitInline ? 'Batal' : '+ Tambah'}
                </button>
              </div>
              {isAddingUnitInline ? (
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    required
                    placeholder="Pcs"
                    value={inlineUnitValue}
                    onChange={(e) => setInlineUnitValue(e.target.value)}
                    className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-2 py-1 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-sans font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleSaveUnitInline}
                    className="w-full bg-gallery-dark text-gallery-base py-1 text-[9px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-150 cursor-pointer font-sans text-center"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <select 
                  required 
                  value={editMaterialData.unit}
                  onChange={(e) => setEditMaterialData({...editMaterialData, unit: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-semibold tracking-wide"
                >
                  {options.units.map(u => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold">
                Tgl Kedaluwarsa
              </label>
              <input 
                type="date" 
                placeholder="Optional"
                value={editMaterialData.expiredAt}
                onChange={(e) => setEditMaterialData({...editMaterialData, expiredAt: e.target.value})}
                className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gallery-dark text-gallery-base py-2.5 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity active:scale-95 duration-200 mt-2 cursor-pointer font-sans"
          >
            Simpan Perubahan Bahan Baku
          </button>
        </form>
      </DialogContent>
    </Dialog>

    {/* DESTRUCTIVE DELETE CONFIRMATION DIALOG */}
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Hapus Bahan Baku</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus bahan baku <span className="font-bold text-gallery-dark">{selectedMaterial?.sku} - {selectedMaterial?.name}</span> secara permanen? Semua riwayat catatan stok juga akan ikut dihapus. Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex sm:justify-end gap-2">
          <button
            onClick={() => setIsDeleteDialogOpen(false)}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border-[0.5px] border-gallery-line bg-gallery-split hover:bg-gallery-base text-gallery-muted hover:text-gallery-dark transition-all cursor-pointer font-sans"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-destructive text-destructive-foreground hover:opacity-90 transition-all cursor-pointer font-sans"
          >
            Ya, Hapus
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  </div>
  )
}
