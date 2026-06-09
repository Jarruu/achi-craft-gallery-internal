import { createFileRoute, useNavigate, useSearch, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { getProducts, createProduct, updateProduct, deleteProduct, startProduction, completeProduction, getOngoingProductions } from '../lib/products.functions'
import { getMaterials } from '../lib/materials.functions'
import { 
  Plus, 
  Layers, 
  Check, 
  AlertTriangle, 
  Trash2, 
  Cpu, 
  PlusCircle, 
  MinusCircle, 
  FileText,
  X,
  Pencil,
  Search
} from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { ImageUploadInput, uploadToImgBB } from '../components/ImageUploadInput'

// Schema for route query params
const searchSchema = z.object({
  search: z.string().optional(),
  page: z.number().catch(1).optional(),
  limit: z.number().catch(10).optional(),
})

export const Route = createFileRoute('/products')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    search: search.search,
    page: search.page,
    limit: search.limit,
  }),
  loader: async ({ deps }) => {
    const [productsResult, materialsResult, ongoingProductionsResult] = await Promise.all([
      getProducts({ 
        data: {
          search: deps.search,
          page: deps.page || 1,
          limit: deps.limit || 10,
        } 
      }),
      getMaterials({ data: {} }),
      getOngoingProductions()
    ])
    return { 
      products: productsResult.items, 
      totalCount: productsResult.totalCount,
      materials: materialsResult.items,
      ongoingProductions: ongoingProductionsResult
    }
  },
  component: ProductsPage,
})

function ProductsPage() {
  const { products, totalCount, materials, ongoingProductions } = Route.useLoaderData()
  const navigate = useNavigate()
  const searchParams = useSearch({ from: '/products' })

  const page = searchParams.page || 1
  const limit = searchParams.limit || 10
  const totalPages = Math.ceil(totalCount / limit)

  const handlePageChange = (newPage: number) => {
    navigate({
      to: '/products',
      search: (prev) => ({
        ...prev,
        page: newPage,
      }),
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate({
      to: '/products',
      search: (prev) => {
        const next = { ...prev }
        if (searchInput.trim()) {
          next.search = searchInput.trim()
        } else {
          delete next.search
        }
        next.page = 1
        return next
      }
    })
  }

  // State management
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const handleSelectProduct = (p: any) => {
    setSelectedProduct(p)
    setIsAdding(false)
    
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        const detailPanel = document.getElementById('detail-panel')
        if (detailPanel) {
          detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }

  // State for production feature
  const router = useRouter()
  const [productionQty, setProductionQty] = useState<number>(1)
  const [isProducing, setIsProducing] = useState(false)
  const [completingId, setCompletingId] = useState<string | null>(null)

  // Reset production quantity when selected product changes
  useEffect(() => {
    setProductionQty(1)
  }, [selectedProduct?.id])

  const handleStartProduction = async () => {
    if (!selectedProduct) return
    setIsProducing(true)
    try {
      const updated = await startProduction({
        data: {
          productId: selectedProduct.id,
          quantity: productionQty
        }
      })
      
      toast.success('Produksi Dimulai', {
        description: `Berhasil memulai produksi ${productionQty} unit untuk '${selectedProduct.name}'. Bahan baku telah dikurangi.`
      })
      
      setSelectedProduct(updated)
      setProductionQty(1)
      await router.invalidate()
    } catch (err: any) {
      toast.error('Gagal Memulai Produksi', {
        description: err.message || 'Terjadi kesalahan.'
      })
    } finally {
      setIsProducing(false)
    }
  }

  const handleCompleteProduction = async (productionId: string) => {
    setCompletingId(productionId)
    try {
      const updated = await completeProduction({
        data: {
          productionId
        }
      })

      toast.success('Produksi Selesai', {
        description: `Proses produksi telah selesai.`
      })

      setSelectedProduct(updated)
      await router.invalidate()
    } catch (err: any) {
      toast.error('Gagal Menyelesaikan Produksi', {
        description: err.message || 'Terjadi kesalahan.'
      })
    } finally {
      setCompletingId(null)
    }
  }
  const [isAdding, setIsAdding] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchInput, setSearchInput] = useState(searchParams.search || '')
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    imageUrl: '',
  })
  const [newProductFile, setNewProductFile] = useState<File | null>(null)
  
  // State for dynamic BOM inputs in creation form
  const [selectedBOMItems, setSelectedBOMItems] = useState<Array<{
    materialId: string
    quantityRequired: number
    notes: string
  }>>([
    { materialId: '', quantityRequired: 1, notes: '' }
  ])

  const handleAddBOMRow = () => {
    setSelectedBOMItems([...selectedBOMItems, { materialId: '', quantityRequired: 1, notes: '' }])
  }

  const handleRemoveBOMRow = (index: number) => {
    if (selectedBOMItems.length === 1) return
    const next = [...selectedBOMItems]
    next.splice(index, 1)
    setSelectedBOMItems(next)
  }

  const handleBOMChange = (index: number, key: string, value: any) => {
    const next = [...selectedBOMItems]
    next[index] = {
      ...next[index],
      [key]: value
    }
    setSelectedBOMItems(next)
  }

  // Edit & Delete Product states & handlers
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editProductData, setEditProductData] = useState({
    id: '',
    name: '',
    description: '',
    imageUrl: '',
  })
  const [editProductFile, setEditProductFile] = useState<File | null>(null)
  const [editBOMItems, setEditBOMItems] = useState<Array<{
    materialId: string
    quantityRequired: number
    notes: string
  }>>([])

  const handleAddEditBOMRow = () => {
    setEditBOMItems([...editBOMItems, { materialId: '', quantityRequired: 1, notes: '' }])
  }

  const handleRemoveEditBOMRow = (index: number) => {
    if (editBOMItems.length === 1) return
    const next = [...editBOMItems]
    next.splice(index, 1)
    setEditBOMItems(next)
  }

  const handleEditBOMChange = (index: number, key: string, value: any) => {
    const next = [...editBOMItems]
    next[index] = {
      ...next[index],
      [key]: value
    }
    setEditBOMItems(next)
  }

  const startEdit = (p: any) => {
    setEditProductFile(null)
    setEditProductData({
      id: p.id,
      name: p.name,
      description: p.description || '',
      imageUrl: p.imageUrl || '',
    })
    setEditBOMItems(p.materials.map((pm: any) => ({
      materialId: pm.materialId,
      quantityRequired: pm.quantityRequired,
      notes: pm.notes || '',
    })))
    setIsEditing(true)
  }

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const filteredBOM = editBOMItems.filter(item => item.materialId !== '')
    if (filteredBOM.length === 0) {
      toast.error('Gagal Menyimpan', {
        description: 'Harap tambahkan minimal satu bahan baku untuk produk ini.'
      })
      return
    }

    let uploadedUrl = editProductData.imageUrl || null

    try {
      if (editProductFile) {
        toast.info('Sedang mengunggah gambar...', { id: 'upload-toast' })
        uploadedUrl = await uploadToImgBB(editProductFile)
        toast.success('Gambar berhasil diunggah', { id: 'upload-toast' })
      }

      const updated = await updateProduct({
        data: {
          id: editProductData.id,
          name: editProductData.name,
          description: editProductData.description || null,
          imageUrl: uploadedUrl,
          materials: filteredBOM.map(item => ({
            materialId: item.materialId,
            quantityRequired: Number(item.quantityRequired),
            notes: item.notes || null
          }))
        }
      })

      toast.success('Rancangan Produk Diperbarui', {
        description: `Produk ${editProductData.name} berhasil diperbarui.`
      })

      setIsEditing(false)
      setEditProductFile(null)
      setSelectedProduct(updated)
      navigate({ to: '/products', search: searchParams })
    } catch (err: any) {
      toast.error('Gagal Memperbarui Produk', { description: err.message })
    }
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return
    try {
      await deleteProduct({ data: { id: selectedProduct.id } })
      toast.success('Rancangan Produk Dihapus', {
        description: `Rancangan produk ${selectedProduct.name} telah berhasil dihapus secara permanen.`
      })
      setSelectedProduct(null)
      setIsDeleteDialogOpen(false)
      navigate({ to: '/products', search: searchParams })
    } catch (err: any) {
      toast.error('Gagal Menghapus Produk', {
        description: err.message || 'Terjadi kesalahan.'
      })
    }
  }

  // Handle Form Submission
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate material selections
    const filteredBOM = selectedBOMItems.filter(item => item.materialId !== '')
    if (filteredBOM.length === 0) {
      toast.error('Gagal Menyimpan', {
        description: 'Harap tambahkan minimal satu bahan baku untuk produk ini.'
      })
      return
    }

    let uploadedUrl = newProduct.imageUrl || null

    try {
      if (newProductFile) {
        toast.info('Sedang mengunggah gambar...', { id: 'upload-toast' })
        uploadedUrl = await uploadToImgBB(newProductFile)
        toast.success('Gambar berhasil diunggah', { id: 'upload-toast' })
      }

      const created = await createProduct({
        data: {
          name: newProduct.name,
          description: newProduct.description || null,
          imageUrl: uploadedUrl,
          materials: filteredBOM.map(item => ({
            materialId: item.materialId,
            quantityRequired: Number(item.quantityRequired),
            notes: item.notes || null
          }))
        }
      })

      toast.success('Produk Ditambahkan', {
        description: `Produk ${newProduct.name} berhasil didaftarkan ke dalam katalog.`
      })

      // Reset
      setIsAdding(false)
      setNewProductFile(null)
      setNewProduct({ name: '', description: '', imageUrl: '' })
      setSelectedBOMItems([{ materialId: '', quantityRequired: 1, notes: '' }])
      setSelectedProduct(created)
      
      // Reload route data
      navigate({ to: '/products', search: searchParams })
    } catch (err: any) {
      toast.error('Gagal Menambahkan Produk', {
        description: err.message || 'Terjadi kesalahan saat menyimpan data.'
      })
    }
  }

  const totalProducts = products.length
  const readyProducts = products.filter(p => p.materials.every(pm => pm.material.stock >= pm.quantityRequired)).length
  const warningProducts = products.filter(p => p.materials.some(pm => pm.material.stock < pm.quantityRequired)).length

  return (
    <div className="space-y-8 rise-in">
      
      {/* FULL-WIDTH KPI WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget 1: Total Products */}
        <div className="bg-gallery-split border-[0.5px] border-gallery-line p-6 flex justify-between items-center relative group hover:border-gallery-dark duration-300">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.25em] text-gallery-muted font-bold block">
              TOTAL RANCANGAN PRODUK
            </span>
            <div className="text-3xl font-serif text-gallery-dark font-bold mt-1.5">
              {totalProducts}
            </div>
            <span className="text-[10px] text-gallery-muted font-semibold block">
              Model produk terdaftar
            </span>
          </div>
          <div className="w-12 h-12 bg-gallery-base flex items-center justify-center border-[0.5px] border-gallery-line">
            <Cpu size={18} className="text-gallery-dark" />
          </div>
        </div>

        {/* Widget 2: Ready for Production */}
        <div className={`border-[0.5px] p-6 flex justify-between items-center relative duration-300 ${
          readyProducts > 0 
            ? 'bg-green-50/20 border-green-200 hover:border-green-400' 
            : 'bg-gallery-split border-gallery-line hover:border-gallery-dark'
        }`}>
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.25em] text-gallery-muted font-bold block">
              SIAP PRODUKSI
            </span>
            <div className={`text-3xl font-serif font-bold mt-1.5 ${readyProducts > 0 ? 'text-green-700' : 'text-gallery-dark'}`}>
              {readyProducts}
            </div>
            <span className="text-[10px] text-gallery-muted font-semibold block">
              Bahan baku lengkap & mencukupi
            </span>
          </div>
          <div className={`w-12 h-12 flex items-center justify-center border-[0.5px] ${
            readyProducts > 0 ? 'bg-green-100/55 border-green-200' : 'bg-gallery-base border-gallery-line'
          }`}>
            <Check size={18} className={readyProducts > 0 ? 'text-green-700' : 'text-gallery-dark'} />
          </div>
        </div>

        {/* Widget 3: Shortage Warning */}
        <div className={`border-[0.5px] p-6 flex justify-between items-center relative duration-300 ${
          warningProducts > 0 
            ? 'bg-red-50/20 border-red-200 hover:border-red-400' 
            : 'bg-gallery-split border-gallery-line hover:border-gallery-dark'
        }`}>
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.25em] text-gallery-muted font-bold block">
              KEKURANGAN BAHAN BAKU
            </span>
            <div className={`text-3xl font-serif font-bold mt-1.5 ${warningProducts > 0 ? 'text-red-700' : 'text-gallery-dark'}`}>
              {warningProducts}
            </div>
            <span className="text-[10px] text-gallery-muted font-semibold block">
              Model produk dengan stok kurang
            </span>
          </div>
          <div className={`w-12 h-12 flex items-center justify-center border-[0.5px] ${
            warningProducts > 0 ? 'bg-red-100/55 border-red-200' : 'bg-gallery-base border-gallery-line'
          }`}>
            <AlertTriangle size={18} className={warningProducts > 0 ? 'text-red-700' : 'text-gallery-dark'} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Innovation Grid (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Page Title */}
          <div className="border-b-[0.5px] border-gallery-line pb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-serif tracking-tight text-gallery-dark">
                DAFTAR PRODUK
              </h2>
              <p className="text-xs text-gallery-muted tracking-wide font-medium mt-1">
                RANCANGAN PRODUK & KEBUTUHAN BAHAN BAKU (BOM)
              </p>
            </div>
            <button 
              onClick={() => {
                setIsAdding(true)
              }}
              className="flex items-center gap-2 bg-gallery-dark text-gallery-base px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-200"
            >
              <Plus size={14} />
              <span>Tambah Produk Baru</span>
            </button>
          </div>

          {/* SEARCH FORM */}
          <form onSubmit={handleSearchSubmit} className="flex gap-3 items-stretch">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gallery-muted" />
              <input
                type="text"
                placeholder="Cari nama produk, deskripsi..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-gallery-split border-[0.5px] border-gallery-line pl-10 pr-4 py-2 text-xs font-semibold text-gallery-dark placeholder-gallery-muted focus:outline-none focus:border-gallery-dark"
              />
            </div>
            <button
              type="submit"
              className="bg-gallery-dark text-gallery-base px-6 py-2 text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 duration-150 cursor-pointer font-sans"
            >
              Cari
            </button>
          </form>

          {/* VIEW MODE TOGGLE AND HEADER */}
          <div className="flex justify-between items-center border-b-[0.5px] border-gallery-line pb-3">
            <span className="text-[10px] uppercase tracking-widest text-gallery-muted font-bold">
              Menampilkan {products.length} dari {totalCount} Produk
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
          {products.length === 0 ? (
            <div className="border-[0.5px] border-gallery-line border-dashed p-12 text-center text-xs tracking-wider text-gallery-muted uppercase font-semibold">
              Produk tidak ditemukan. Coba cari dengan kata kunci lain.
            </div>
          ) : viewMode === 'table' ? (
            /* COMPACT TABLE LAYOUT */
            <div className="border-[0.5px] border-gallery-line bg-gallery-split overflow-x-auto">
              <table className="w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="border-b-[0.5px] border-gallery-line bg-gallery-base/40 text-[9px] font-bold uppercase tracking-widest text-gallery-muted">
                    <th className="py-3 px-2 sm:px-4 font-bold w-12 text-center">Visual</th>
                    <th className="py-3 px-2 sm:px-4 font-bold">Nama Produk</th>
                    <th className="hidden sm:table-cell py-3 px-2 sm:px-4 font-bold">Deskripsi</th>
                    <th className="py-3 px-2 sm:px-4 font-bold text-center">Bahan Baku</th>
                    <th className="py-3 px-2 sm:px-4 font-bold text-right">Status Ketersediaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gallery-line text-xs font-semibold text-gallery-dark">
                  {products.map((p) => {
                    const shortItems = p.materials.filter((pm: any) => pm.material.stock < pm.quantityRequired)
                    const hasWarnings = shortItems.length > 0
                    const totalBOMItems = p.materials.length

                    return (
                      <tr 
                        key={p.id}
                        onClick={() => handleSelectProduct(p)}
                        className={`cursor-pointer hover:bg-gallery-base/50 transition-colors ${
                          selectedProduct?.id === p.id ? 'bg-gallery-base/80' : ''
                        } ${hasWarnings ? 'bg-red-50/5' : ''}`}
                      >
                        <td className="py-3 px-2 sm:px-4 text-center">
                          <div className="w-6 h-6 border-[0.5px] border-gallery-line shrink-0 flex items-center justify-center relative overflow-hidden bg-white mx-auto">
                            {p.imageUrl && p.imageUrl.trim().startsWith('http') ? (
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Cpu size={12} className="text-gallery-muted" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4 font-serif text-[13px] font-bold text-gallery-dark">{p.name}</td>
                        <td className="hidden sm:table-cell py-3 px-2 sm:px-4 text-gallery-muted font-normal italic truncate max-w-[200px]">
                          {p.description || '-'}
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-center">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gallery-base border-[0.5px] border-gallery-line font-mono">
                            {totalBOMItems} jenis
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-right">
                          <span className={`px-2 py-0.5 text-[8px] font-bold tracking-wider uppercase ${
                            !hasWarnings 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {!hasWarnings ? 'Bahan Siap' : 'Bahan Kurang'}
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
              {products.map((p) => {
                const shortItems = p.materials.filter(pm => pm.material.stock < pm.quantityRequired)
                const hasWarnings = shortItems.length > 0

                return (
                  <div 
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    className={`bg-gallery-split border-[0.5px] cursor-pointer flex flex-col relative group transition-all duration-300 ${
                      selectedProduct?.id === p.id 
                        ? 'border-gallery-dark ring-1 ring-gallery-dark/15' 
                        : 'border-gallery-line hover:border-gallery-dark/60'
                    }`}
                  >
                    {/* Photo / Template */}
                    {p.imageUrl && p.imageUrl.startsWith('http') ? (
                      <div className="w-full h-44 bg-gallery-base overflow-hidden border-b border-gallery-line relative">
                        <img 
                          src={p.imageUrl} 
                          alt={p.name} 
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-44 bg-gallery-base border-b border-gallery-line flex items-center justify-center p-6 relative">
                        <div className="w-16 h-16 border-[0.5px] border-gallery-line flex items-center justify-center relative">
                          <Cpu size={24} className="text-gallery-muted" />
                          <div className="absolute inset-0 border border-dashed border-gallery-muted/20 animate-spin" style={{ animationDuration: '30s' }} />
                        </div>
                        <div className="absolute top-2 right-2 text-[8px] uppercase tracking-widest text-gallery-muted font-bold">
                          RANCANGAN BAHAN BAKU
                        </div>
                      </div>
                    )}
    
                    {/* Content details */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">
                            {p.materials.length} BAHAN BAKU TERKAIT
                          </span>
                          {hasWarnings && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[8px] tracking-wide font-bold uppercase">
                              Bahan Kurang
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif text-lg tracking-tight text-gallery-dark mt-1 group-hover:underline">
                          {p.name}
                        </h3>
                        <p className="text-xs text-gallery-muted mt-1 leading-relaxed line-clamp-2">
                          {p.description || 'Belum ada penjelasan atau deskripsi untuk produk ini.'}
                        </p>
                      </div>
    
                      <div className="border-t-[0.5px] border-gallery-line pt-3 flex items-center justify-between text-xs font-semibold text-gallery-dark">
                        <span className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">
                          STATUS BAHAN
                        </span>
                        {hasWarnings ? (
                          <span className="text-red-700 flex items-center gap-1 text-[11px] font-bold">
                            <AlertTriangle size={12} />
                            {shortItems.length} Bahan Kurang
                          </span>
                        ) : (
                          <span className="text-green-700 flex items-center gap-1 text-[11px] font-bold">
                            <Check size={12} />
                            Bahan Siap Produksi
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-[0.5px] border-gallery-line bg-gallery-split p-4 gap-3 text-xs font-semibold text-gallery-dark mt-6">
              <span className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">
                Halaman {page} dari {totalPages} (Total {totalCount} produk)
              </span>
              
              <div className="flex items-center gap-1.5 flex-wrap justify-center font-sans">
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
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return <span key={pageNum} className="text-gallery-muted px-1">...</span>
                  }
                  return null
                })}
                
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="px-3 py-1.5 border-[0.5px] border-gallery-line bg-gallery-base hover:border-gallery-dark disabled:opacity-40 disabled:hover:border-gallery-line disabled:cursor-not-allowed transition-all uppercase tracking-widest text-[9px] font-bold cursor-pointer"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>

      {/* RIGHT COLUMN: Detail Viewer / Creator Panel (5/12) */}
      <div id="detail-panel" className="lg:col-span-5 space-y-6 lg:sticky lg:top-10">
        
        {/* CASE A: Create Innovation Panel - Moved to Dialog Modal */}

        {/* CASE B: Product Details & BOM Checker Panel */}
        {selectedProduct && (
          <div className="bg-gallery-split border-[0.5px] border-gallery-dark p-6 space-y-6">
            
            {/* Header info */}
            <div className="border-b-[0.5px] border-gallery-line pb-4 flex justify-between items-start gap-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">
                  RANCANGAN PRODUK
                </span>
                <h3 className="font-serif text-2xl tracking-tight text-gallery-dark mt-0.5">
                  {selectedProduct.name}
                </h3>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => startEdit(selectedProduct)}
                  className="p-2 border-[0.5px] border-gallery-line hover:border-gallery-dark hover:text-gallery-dark transition-colors bg-gallery-base cursor-pointer"
                  title="Edit Rancangan Produk"
                >
                  <Pencil size={14} />
                </button>
                <button 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="p-2 border-[0.5px] border-gallery-line hover:border-red-600 hover:text-red-600 transition-colors bg-gallery-base cursor-pointer"
                  title="Hapus Rancangan Produk"
                >
                  <Trash2 size={14} />
                </button>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 border-[0.5px] border-gallery-line hover:border-gallery-dark transition-colors bg-gallery-base cursor-pointer"
                  title="Tutup Panel"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Product Image */}
            <div className="border-[0.5px] border-gallery-line overflow-hidden bg-gallery-base">
              {selectedProduct.imageUrl && selectedProduct.imageUrl.startsWith('http') ? (
                <div className="w-full h-44 relative overflow-hidden group">
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-gallery-dark text-[8px] tracking-widest text-gallery-base uppercase font-semibold">
                    Cetak Biru (BOM)
                  </div>
                </div>
              ) : (
                <div className="w-full h-44 flex flex-col items-center justify-center relative p-6 bg-gallery-base/40">
                  <div className="w-12 h-12 border-[0.5px] border-gallery-line flex items-center justify-center relative bg-white">
                    <Cpu size={18} className="text-gallery-muted" />
                    <div className="absolute inset-0 border border-dashed border-gallery-muted/20 animate-spin" style={{ animationDuration: '30s' }} />
                  </div>
                  <span className="text-[7px] uppercase tracking-widest text-gallery-muted font-bold mt-2.5">
                    Belum Ada Foto Produk
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1 text-xs">
              <span className="text-[8px] uppercase tracking-widest text-gallery-muted font-bold block">DESKRIPSI PRODUK</span>
              <p className="text-gallery-dark leading-relaxed font-medium bg-gallery-base/40 p-3 border-[0.5px] border-gallery-line italic">
                "{selectedProduct.description || 'Belum ada deskripsi.'}"
              </p>
            </div>

            {/* BOM Checklist (Fitur 5 Stock Availability Checker) */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] uppercase tracking-[0.18em] text-gallery-dark font-bold flex items-center gap-1.5 border-b-[0.5px] border-gallery-line pb-2">
                <Layers size={14} />
                KETERSEDIAAN BAHAN BAKU
              </h4>
              
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {selectedProduct.materials.map((pm: any) => {
                  const m = pm.material
                  const hasStock = m.stock >= pm.quantityRequired
                  const missingQty = pm.quantityRequired - m.stock

                  return (
                    <div 
                      key={pm.id} 
                      className={`p-3 border-[0.5px] flex items-center justify-between gap-4 text-xs ${
                        hasStock ? 'border-gallery-line bg-gallery-base/20' : 'border-red-200 bg-red-50/20'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-gallery-dark tracking-wide uppercase">
                            {m.sku}
                          </span>
                          <span className="text-[10px] text-gallery-muted">•</span>
                          <span className="font-semibold text-gallery-dark">
                            {m.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-gallery-muted font-medium">
                          Dibutuhkan: <span className="font-bold text-gallery-dark">{pm.quantityRequired} {m.unit}</span> 
                          {pm.notes && ` • Catatan: ${pm.notes}`}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[8px] uppercase tracking-widest text-gallery-muted font-bold">
                          KETERSEDIAAN
                        </div>
                        <div className="mt-1 flex items-center gap-1 justify-end font-bold text-[11px]">
                          {hasStock ? (
                            <span className="text-green-700 bg-green-50 px-2 py-0.5 flex items-center gap-0.5">
                              <Check size={10} />
                              Cukup (Ada {m.stock} {m.unit})
                            </span>
                          ) : (
                            <span className="text-red-700 bg-red-50 px-2 py-0.5 flex items-center gap-0.5">
                              <AlertTriangle size={10} />
                              Kurang {missingQty.toFixed(2)} {m.unit} (Ada {m.stock})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* PRODUKSI PRODUK SECTION */}
            <div className="space-y-3 pt-4 border-t-[0.5px] border-gallery-line">
              <h4 className="text-[10px] uppercase tracking-[0.18em] text-gallery-dark font-bold flex items-center gap-1.5 pb-1">
                <Cpu size={14} className="text-gallery-dark" />
                PRODUKSI PRODUK
              </h4>

              <div className="bg-gallery-base/40 p-4 border-[0.5px] border-gallery-line flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-[11px] font-semibold text-gallery-dark uppercase tracking-wider font-sans">
                    Jumlah:
                  </span>
                  <div className="flex items-center border-[0.5px] border-gallery-line bg-white">
                    <button
                      type="button"
                      onClick={() => setProductionQty(prev => Math.max(1, prev - 1))}
                      className="px-2.5 py-1 text-gallery-dark hover:bg-gallery-base transition-colors border-r-[0.5px] border-gallery-line cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={productionQty <= 1 || isProducing}
                    >
                      <MinusCircle size={13} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={productionQty}
                      onChange={(e) => setProductionQty(Math.max(1, parseInt(e.target.value) || 1))}
                      disabled={isProducing}
                      className="w-12 text-center text-xs font-bold font-mono text-gallery-dark focus:outline-none py-0.5 bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setProductionQty(prev => prev + 1)}
                      disabled={isProducing}
                      className="px-2.5 py-1 text-gallery-dark hover:bg-gallery-base transition-colors border-l-[0.5px] border-gallery-line cursor-pointer"
                    >
                      <PlusCircle size={13} />
                    </button>
                  </div>
                </div>

                {(() => {
                  const canProduce = selectedProduct.materials.length > 0 && selectedProduct.materials.every((pm: any) => pm.material.stock >= pm.quantityRequired * productionQty)
                  return (
                    <button
                      type="button"
                      onClick={handleStartProduction}
                      disabled={!canProduce || isProducing}
                      className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                        canProduce
                          ? 'bg-gallery-dark text-gallery-base hover:bg-gallery-dark/95 hover:tracking-[0.16em] active:scale-[0.98]'
                          : 'bg-gallery-line text-gallery-muted cursor-not-allowed border-[0.5px] border-gallery-line'
                      }`}
                    >
                      {isProducing ? 'Memproses...' : 'Mulai Produksi'}
                    </button>
                  )
                })()}
              </div>

              {/* KEBUTUHAN BAHAN BAKU UNTUK JUMLAH TERPILIH */}
              <div className="border-[0.5px] border-gallery-line bg-gallery-base/20 p-3 space-y-2">
                <span className="text-[8px] uppercase tracking-widest text-gallery-muted font-bold block">
                  Estimasi Kebutuhan Bahan Baku ({productionQty} unit)
                </span>
                <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedProduct.materials.map((pm: any) => {
                    const totalNeeded = pm.quantityRequired * productionQty
                    const hasStock = pm.material.stock >= totalNeeded
                    return (
                      <div 
                        key={pm.id} 
                        className={`p-2 border-[0.5px] text-[11px] font-sans flex items-center justify-between gap-4 transition-all duration-300 ${
                          hasStock ? 'border-gallery-line bg-white text-gallery-dark' : 'border-red-200 bg-red-50/20 text-red-700 font-bold'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold">{pm.material.name}</span>
                          <span className="text-[8px] text-gallery-muted tracking-wider uppercase font-mono mt-0.5">
                            {pm.material.sku}
                          </span>
                        </div>
                        <div className="text-right flex flex-col font-mono">
                          <span className="font-bold">
                            {totalNeeded.toFixed(2)} {pm.material.unit}
                          </span>
                          <span className="text-[8px] text-gallery-muted uppercase mt-0.5">
                            Tersedia: {pm.material.stock.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {(() => {
                const canProduce = selectedProduct.materials.length > 0 && selectedProduct.materials.every((pm: any) => pm.material.stock >= pm.quantityRequired * productionQty)
                return !canProduce && (
                  <div className="p-3 bg-red-50/30 border-[0.5px] border-red-200 text-[10px] text-red-700 font-semibold flex items-start gap-1.5 leading-relaxed animate-fade-in">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-700" />
                    <div>
                      <span>Stok bahan baku tidak mencukupi untuk memproduksi {productionQty} unit.</span>
                      <div className="mt-1 font-mono text-[9px] text-red-600/90 space-y-0.5">
                        {selectedProduct.materials.map((pm: any) => {
                          const needed = pm.quantityRequired * productionQty
                          const hasStock = pm.material.stock >= needed
                          if (!hasStock) {
                            return (
                              <div key={pm.id}>
                                • {pm.material.name}: butuh {needed.toFixed(2)} {pm.material.unit} (ada {pm.material.stock.toFixed(2)})
                              </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

          </div>
        )}

        {/* DEFAULT STATE: Studio Concept Card */}
        {!selectedProduct && (
          <div className="bg-gallery-split border-[0.5px] border-gallery-line p-6 space-y-4">
            <h3 className="font-serif text-lg tracking-tight text-gallery-dark uppercase border-b-[0.5px] border-gallery-line pb-2.5">
              INFORMASI DETAIL PRODUK
            </h3>

            <div className="flex justify-center p-6 border-[0.5px] border-dashed border-gallery-line relative">
              <FileText size={48} className="text-gallery-muted/40" />
            </div>

            <p className="text-xs text-gallery-muted leading-relaxed font-semibold uppercase tracking-wider text-center py-2">
              Pilih produk dari daftar di sebelah kiri untuk melihat rincian bahan baku dan status ketersediaannya secara langsung.
            </p>
            <button 
              onClick={() => {
                setIsAdding(true)
                setSelectedProduct(null)
              }}
              className="w-full bg-gallery-dark text-gallery-base py-2 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity active:scale-95 duration-200"
            >
              Tambah Produk Baru
            </button>
          </div>
        )}

        {/* PRODUKSI BERJALAN (ONGOING PRODUCTIONS) GLOBAL CARD */}
        <div className="bg-gallery-split border-[0.5px] border-gallery-dark p-6 space-y-4">
          <h3 className="font-serif text-base tracking-tight text-gallery-dark uppercase border-b-[0.5px] border-gallery-line pb-2.5 flex items-center gap-2">
            <FileText size={16} />
            PRODUKSI BERJALAN ({ongoingProductions.length})
          </h3>

          {ongoingProductions.length === 0 ? (
            <div className="border-[0.5px] border-dashed border-gallery-line bg-gallery-base/10 p-6 text-center text-[10px] uppercase tracking-wider text-gallery-muted font-semibold">
              Tidak ada produksi aktif saat ini.
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {ongoingProductions.map((prod: any) => (
                <div
                  key={prod.id}
                  className="p-3.5 border-[0.5px] border-gallery-line bg-white flex items-center justify-between gap-4 text-xs hover:border-gallery-dark/40 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    {/* Tiny Product visual */}
                    <div className="w-8 h-8 border-[0.5px] border-gallery-line shrink-0 flex items-center justify-center relative overflow-hidden bg-gallery-base">
                      {prod.product?.imageUrl && prod.product.imageUrl.trim().startsWith('http') ? (
                        <img src={prod.product.imageUrl} alt={prod.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Cpu size={12} className="text-gallery-muted" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-bold text-gallery-dark font-sans tracking-wide uppercase">
                        {prod.product?.name}
                      </div>
                      <div className="text-[10px] text-gallery-dark/80 font-sans">
                        Jumlah: <span className="font-serif font-bold text-xs">{prod.quantity} unit</span>
                      </div>
                      <p className="text-[9px] text-gallery-muted font-medium font-sans">
                        Mulai: {new Date(prod.createdAt).toLocaleString('id-ID', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCompleteProduction(prod.id)}
                    disabled={completingId === prod.id}
                    className="px-3 py-1.5 border-[0.5px] border-gallery-dark bg-white hover:bg-gallery-dark hover:text-gallery-base transition-all duration-300 uppercase tracking-widest text-[9px] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {completingId === prod.id ? 'Memproses...' : 'Selesai'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>

    {/* MODAL POPUP DIALOG FORM FOR ADDING PRODUCT (SHADCN / RADIX PRIMITIVE) */}
    <Dialog open={isAdding} onOpenChange={setIsAdding}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>FORM PRODUK BARU</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmitProduct} className="space-y-4 flex flex-col overflow-hidden">
          {/* Scrollable inputs section to fit 1 page */}
          <div className="overflow-y-auto pr-2 space-y-4 max-h-[55vh] md:max-h-[60vh] custom-scrollbar flex-1">
            <ImageUploadInput
              label="Foto / Gambar Produk"
              existingUrl={newProduct.imageUrl}
              file={newProductFile}
              onFileChange={setNewProductFile}
              onClearExisting={() => setNewProduct({ ...newProduct, imageUrl: '' })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">
                  Nama Produk*
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="cth. Dompet Kulit Minimalis"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">
                  Deskripsi & Penjelasan Produk
                </label>
                <textarea 
                  rows={3}
                  placeholder="e.g. Dompet minimalis gaya Nordic yang terbuat dari bahan premium..."
                  value={newProduct.description || ''}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-sans resize-y min-h-[60px]"
                />
              </div>
            </div>

            {/* Dynamic BOM ingredient selectors */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center border-b-[0.5px] border-gallery-line pb-1.5">
                <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-dark font-bold">
                  DAFTAR KEBUTUHAN BAHAN BAKU (BOM)
                </label>
                <button 
                  type="button"
                  onClick={handleAddBOMRow}
                  className="text-[9px] font-bold text-gallery-dark uppercase tracking-widest flex items-center gap-1 hover:opacity-80 cursor-pointer"
                >
                  <PlusCircle size={12} /> Tambah Bahan Baku
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {selectedBOMItems.map((item, index) => (
                  <div key={index} className="bg-gallery-base p-3 border-[0.5px] border-gallery-line space-y-2 relative">
                    {selectedBOMItems.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveBOMRow(index)}
                        className="absolute top-2 right-2 text-gallery-muted hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase tracking-widest text-gallery-muted font-bold">
                          Pilih Bahan Baku
                        </label>
                        <select 
                          required
                          value={item.materialId}
                          onChange={(e) => handleBOMChange(index, 'materialId', e.target.value)}
                          className="w-full bg-gallery-split border-[0.5px] border-gallery-line px-2 py-1 text-[11px] text-gallery-dark focus:outline-none focus:border-gallery-dark font-semibold uppercase tracking-wider"
                        >
                          <option value="">-- Pilih --</option>
                          {materials.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.sku} - {m.name} ({m.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase tracking-widest text-gallery-muted font-bold">
                          Jumlah yang Dibutuhkan
                        </label>
                        <input 
                          type="number" 
                          step="any"
                          min="0.001"
                          required
                          placeholder="e.g. 2.5"
                          value={item.quantityRequired || ''}
                          onChange={(e) => handleBOMChange(index, 'quantityRequired', Number(e.target.value))}
                          className="w-full bg-gallery-split border-[0.5px] border-gallery-line px-2 py-1 text-[11px] text-gallery-dark focus:outline-none focus:border-gallery-dark font-bold font-sans"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] uppercase tracking-widest text-gallery-muted font-bold">
                        Keterangan Bagian Produk (cth: untuk bagian luar)
                      </label>
                      <input 
                        type="text" 
                        placeholder="cth. Untuk bagian luar, lapisan dalam..."
                        value={item.notes || ''}
                        onChange={(e) => handleBOMChange(index, 'notes', e.target.value)}
                        className="w-full bg-gallery-split border-[0.5px] border-gallery-line px-2 py-1 text-[11px] text-gallery-dark focus:outline-none focus:border-gallery-dark font-sans"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gallery-dark text-gallery-base py-2.5 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity active:scale-95 duration-200 mt-2 cursor-pointer shrink-0"
          >
            Simpan Rancangan Produk
          </button>
        </form>
      </DialogContent>
    </Dialog>

    {/* MODAL POPUP DIALOG FORM FOR EDITING PRODUCT */}
    <Dialog open={isEditing} onOpenChange={setIsEditing}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>EDIT RANCANGAN PRODUK</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleEditProductSubmit} className="space-y-4 flex flex-col overflow-hidden">
          {/* Scrollable inputs section to fit 1 page */}
          <div className="overflow-y-auto pr-2 space-y-4 max-h-[55vh] md:max-h-[60vh] custom-scrollbar flex-1">
            <ImageUploadInput
              label="Foto / Gambar Produk"
              existingUrl={editProductData.imageUrl}
              file={editProductFile}
              onFileChange={setEditProductFile}
              onClearExisting={() => setEditProductData({ ...editProductData, imageUrl: '' })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">
                  Nama Produk*
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="cth. Dompet Kulit Minimalis"
                  value={editProductData.name}
                  onChange={(e) => setEditProductData({...editProductData, name: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">
                  Deskripsi & Penjelasan Produk
                </label>
                <textarea 
                  rows={3}
                  placeholder="e.g. Dompet minimalis gaya Nordic yang terbuat dari bahan premium..."
                  value={editProductData.description || ''}
                  onChange={(e) => setEditProductData({...editProductData, description: e.target.value})}
                  className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-sans resize-y min-h-[60px]"
                />
              </div>
            </div>

            {/* Dynamic BOM ingredient selectors */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center border-b-[0.5px] border-gallery-line pb-1.5">
                <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-dark font-bold">
                  DAFTAR KEBUTUHAN BAHAN BAKU (BOM)
                </label>
                <button 
                  type="button"
                  onClick={handleAddEditBOMRow}
                  className="text-[9px] font-bold text-gallery-dark uppercase tracking-widest flex items-center gap-1 hover:opacity-80 cursor-pointer"
                >
                  <PlusCircle size={12} /> Tambah Bahan Baku
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {editBOMItems.map((item, index) => (
                  <div key={index} className="bg-gallery-base p-3 border-[0.5px] border-gallery-line space-y-2 relative">
                    {editBOMItems.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveEditBOMRow(index)}
                        className="absolute top-2 right-2 text-gallery-muted hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase tracking-widest text-gallery-muted font-bold">
                          Pilih Bahan Baku
                        </label>
                        <select 
                          required
                          value={item.materialId}
                          onChange={(e) => handleEditBOMChange(index, 'materialId', e.target.value)}
                          className="w-full bg-gallery-split border-[0.5px] border-gallery-line px-2 py-1 text-[11px] text-gallery-dark focus:outline-none focus:border-gallery-dark font-semibold uppercase tracking-wider"
                        >
                          <option value="">-- Pilih --</option>
                          {materials.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.sku} - {m.name} ({m.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase tracking-widest text-gallery-muted font-bold">
                          Jumlah yang Dibutuhkan
                        </label>
                        <input 
                          type="number" 
                          step="any"
                          min="0.001"
                          required
                          placeholder="e.g. 2.5"
                          value={item.quantityRequired || ''}
                          onChange={(e) => handleEditBOMChange(index, 'quantityRequired', Number(e.target.value))}
                          className="w-full bg-gallery-split border-[0.5px] border-gallery-line px-2 py-1 text-[11px] text-gallery-dark focus:outline-none focus:border-gallery-dark font-bold font-sans"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] uppercase tracking-widest text-gallery-muted font-bold">
                        Keterangan Bagian Produk (cth: untuk bagian luar)
                      </label>
                      <input 
                        type="text" 
                        placeholder="cth. Untuk bagian luar, lapisan dalam..."
                        value={item.notes || ''}
                        onChange={(e) => handleEditBOMChange(index, 'notes', e.target.value)}
                        className="w-full bg-gallery-split border-[0.5px] border-gallery-line px-2 py-1 text-[11px] text-gallery-dark focus:outline-none focus:border-gallery-dark font-sans"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gallery-dark text-gallery-base py-2.5 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity active:scale-95 duration-200 mt-2 cursor-pointer shrink-0"
          >
            Simpan Perubahan
          </button>
        </form>
      </DialogContent>
    </Dialog>

    {/* MODAL CONFIRMATION DIALOG FOR DELETING PRODUCT */}
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-700 font-serif">HAPUS RANCANGAN PRODUK</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-xs text-gallery-dark leading-relaxed">
            Apakah Anda yakin ingin menghapus rancangan produk <strong className="font-bold">{selectedProduct?.name}</strong> secara permanen? Tindakan ini tidak dapat dibatalkan dan semua data cetak biru kebutuhan bahan baku (BOM) terkait akan ikut terhapus.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="px-4 py-2 border-[0.5px] border-gallery-line text-xs font-semibold uppercase tracking-wider text-gallery-muted hover:border-gallery-dark hover:text-gallery-dark duration-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDeleteProduct}
              className="px-4 py-2 bg-red-700 text-gallery-base text-xs font-semibold uppercase tracking-wider hover:bg-red-800 duration-200 cursor-pointer"
            >
              Hapus Permanen
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

  </div>
  )
}
