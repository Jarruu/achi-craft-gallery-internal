import { createFileRoute, useNavigate, useSearch, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  startProduction, 
  completeProduction, 
  getOngoingProductions 
} from '../lib/products.functions'
import { getMaterials } from '../lib/materials.functions'
import { 
  Plus, 
  Cpu, 
  FileText,
  Search
} from 'lucide-react'
import { uploadToImgBB } from '../components/ImageUploadInput'

// Import decomposed components
import { ProductKpiWidgets } from '../components/products/ProductKpiWidgets'
import { ProductGrid } from '../components/products/ProductGrid'
import { ProductTable } from '../components/products/ProductTable'
import { ProductDetailPanel } from '../components/products/ProductDetailPanel'
import { ProductFormDialogs } from '../components/products/ProductFormDialogs'

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
  const router = useRouter()

  const page = searchParams.page || 1
  const limit = searchParams.limit || 10
  const totalPages = Math.ceil(totalCount / limit)

  // Search input state
  const [searchInput, setSearchInput] = useState(searchParams.search || '')

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

  // Selected Product details state
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

  // Production flow states
  const [productionQty, setProductionQty] = useState<number>(1)
  const [isProducing, setIsProducing] = useState(false)
  const [completingId, setCompletingId] = useState<string | null>(null)

  // Double submit / saving states
  const [isSavingNew, setIsSavingNew] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  // Views & modals states
  const [isAdding, setIsAdding] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  
  // Creation States
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    imageUrl: '',
  })
  const [newProductFile, setNewProductFile] = useState<File | null>(null)
  
  // Dynamic BOM inputs in creation form
  const [selectedBOMItems, setSelectedBOMItems] = useState<Array<{
    materialId: string
    quantityRequired: number
    notes: string
  }>>([
    { materialId: '', quantityRequired: 1, notes: '' }
  ])

  // Edit & Delete states
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
    setIsSavingEdit(true)

    const filteredBOM = editBOMItems.filter(item => item.materialId !== '')
    if (filteredBOM.length === 0) {
      toast.error('Gagal Menyimpan', {
        description: 'Harap tambahkan minimal satu bahan baku untuk produk ini.'
      })
      setIsSavingEdit(false)
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
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return
    setIsDeleting(true)
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
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingNew(true)

    // Validate material selections
    const filteredBOM = selectedBOMItems.filter(item => item.materialId !== '')
    if (filteredBOM.length === 0) {
      toast.error('Gagal Menyimpan', {
        description: 'Harap tambahkan minimal satu bahan baku untuk produk ini.'
      })
      setIsSavingNew(false)
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
    } finally {
      setIsSavingNew(false)
    }
  }

  const totalProducts = totalCount
  const readyProducts = products.filter(p => p.materials.every((pm: any) => pm.material.stock >= pm.quantityRequired)).length
  const warningProducts = products.filter(p => p.materials.some((pm: any) => pm.material.stock < pm.quantityRequired)).length

  return (
    <div className="space-y-8 rise-in" id="main-content">
      
      {/* FULL-WIDTH KPI WIDGETS */}
      <ProductKpiWidgets
        totalProducts={totalProducts}
        readyProducts={readyProducts}
        warningProducts={warningProducts}
      />

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
              className="flex items-center gap-2 bg-gallery-dark text-gallery-base px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-200 cursor-pointer focus-ring font-sans"
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
                className="w-full bg-gallery-split border-[0.5px] border-gallery-line pl-10 pr-4 py-2 text-xs font-semibold text-gallery-dark placeholder-gallery-muted/65 focus-ring font-sans"
              />
            </div>
            <button
              type="submit"
              className="bg-gallery-dark text-gallery-base px-6 py-2 text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 duration-150 cursor-pointer font-sans focus-ring"
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
          {products.length === 0 ? (
            <div className="border-[0.5px] border-gallery-line border-dashed p-12 text-center text-xs tracking-wider text-gallery-muted uppercase font-semibold">
              Produk tidak ditemukan. Coba cari dengan kata kunci lain.
            </div>
          ) : viewMode === 'table' ? (
            <ProductTable
              products={products}
              selectedProduct={selectedProduct}
              handleSelectProduct={handleSelectProduct}
            />
          ) : (
            <ProductGrid
              products={products}
              selectedProduct={selectedProduct}
              handleSelectProduct={handleSelectProduct}
            />
          )}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-[0.5px] border-gallery-line bg-gallery-split p-4 gap-3 text-xs font-semibold text-gallery-dark mt-6">
              <span className="text-[10px] uppercase tracking-widest text-gallery-muted font-bold">
                Halaman {page} dari {totalPages} (Total {totalCount} produk)
              </span>
              
              <div className="flex items-center gap-1.5 flex-wrap justify-center font-sans">
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
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Detail Viewer / Creator Panel (5/12) */}
        <div id="detail-panel" className="lg:col-span-5 space-y-6 lg:sticky lg:top-10">
          
          {selectedProduct ? (
            <ProductDetailPanel
              selectedProduct={selectedProduct}
              startEdit={startEdit}
              setIsDeleteDialogOpen={setIsDeleteDialogOpen}
              setSelectedProduct={setSelectedProduct}
              productionQty={productionQty}
              setProductionQty={setProductionQty}
              isProducing={isProducing}
              handleStartProduction={handleStartProduction}
            />
          ) : (
            <div className="bg-gallery-split border-[0.5px] border-gallery-line p-6 space-y-4 font-sans">
              <h3 className="font-serif text-lg tracking-tight text-gallery-dark uppercase border-b-[0.5px] border-gallery-line pb-2.5">
                INFORMASI DETAIL PRODUK
              </h3>

              <div className="flex justify-center p-6 border-[0.5px] border-dashed border-gallery-line relative bg-white">
                <FileText size={48} className="text-gallery-muted/45" />
              </div>

              <p className="text-xs text-gallery-muted leading-relaxed font-semibold uppercase tracking-wider text-center py-2">
                Pilih produk dari daftar di sebelah kiri untuk melihat rincian bahan baku dan status ketersediaannya secara langsung.
              </p>
              <button 
                onClick={() => {
                  setIsAdding(true)
                  setSelectedProduct(null)
                }}
                className="w-full bg-gallery-dark text-gallery-base py-2 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity active:scale-95 duration-200 cursor-pointer focus-ring"
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
              <div className="border-[0.5px] border-dashed border-gallery-line bg-gallery-base/10 p-6 text-center text-[10px] uppercase tracking-wider text-gallery-muted font-bold font-sans">
                Tidak ada produksi aktif saat ini.
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 font-sans">
                {ongoingProductions.map((prod: any) => (
                  <div
                    key={prod.id}
                    className="p-3.5 border-[0.5px] border-gallery-line bg-white flex items-center justify-between gap-4 text-xs hover:border-gallery-dark/40 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      {/* Tiny Product visual */}
                      <div className="w-8 h-8 border-[0.5px] border-gallery-line shrink-0 flex items-center justify-center relative overflow-hidden bg-gallery-base">
                        {prod.product?.imageUrl && prod.product.imageUrl.trim().startsWith('http') ? (
                          <img src={prod.product.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Cpu size={12} className="text-gallery-muted" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-gallery-dark tracking-wide uppercase">
                          {prod.product?.name}
                        </div>
                        <div className="text-[10px] text-gallery-dark/80">
                          Jumlah: <span className="font-serif font-bold text-xs">{prod.quantity} unit</span>
                        </div>
                        <p className="text-[9px] text-gallery-muted font-bold uppercase">
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
                      className="px-3 py-1.5 border-[0.5px] border-gallery-dark bg-white hover:bg-gallery-dark hover:text-gallery-base transition-all duration-300 uppercase tracking-widest text-[9px] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-ring"
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

      {/* FORM DIALOGS */}
      <ProductFormDialogs
        materials={materials}
        isAdding={isAdding}
        setIsAdding={setIsAdding}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        newProductFile={newProductFile}
        setNewProductFile={setNewProductFile}
        selectedBOMItems={selectedBOMItems}
        setSelectedBOMItems={setSelectedBOMItems}
        isSavingNew={isSavingNew}
        handleSubmitProduct={handleSubmitProduct}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        editProductData={editProductData}
        setEditProductData={setEditProductData}
        editProductFile={editProductFile}
        setEditProductFile={setEditProductFile}
        editBOMItems={editBOMItems}
        setEditBOMItems={setEditBOMItems}
        isSavingEdit={isSavingEdit}
        handleEditProductSubmit={handleEditProductSubmit}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        selectedProduct={selectedProduct}
        isDeleting={isDeleting}
        handleDeleteProduct={handleDeleteProduct}
      />

    </div>
  )
}
