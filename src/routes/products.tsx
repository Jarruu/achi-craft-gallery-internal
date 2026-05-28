import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { getProducts, createProduct } from '../lib/products.functions'
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
  X
} from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'

export const Route = createFileRoute('/products')({
  loader: async () => {
    const products = await getProducts()
    const { items: materials } = await getMaterials({ data: {} })
    return { products, materials }
  },
  component: ProductsPage,
})

function ProductsPage() {
  const { products, materials } = Route.useLoaderData()
  const navigate = useNavigate()

  // State management
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    imageUrl: '',
  })
  
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

    try {
      const created = await createProduct({
        data: {
          name: newProduct.name,
          description: newProduct.description || null,
          imageUrl: newProduct.imageUrl || null,
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
      setNewProduct({ name: '', description: '', imageUrl: '' })
      setSelectedBOMItems([{ materialId: '', quantityRequired: 1, notes: '' }])
      setSelectedProduct(created)
      
      // Reload route data
      navigate({ to: '/products' })
    } catch (err: any) {
      toast.error('Gagal Menyimpan Produk', {
        description: err.message || 'Terjadi kesalahan saat menyimpan cetak biru produk.'
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

          {/* Product Innovations Grid List */}
          {products.length === 0 ? (
            <div className="border-[0.5px] border-gallery-line border-dashed p-12 text-center text-xs tracking-wider text-gallery-muted uppercase font-semibold">
              Belum ada produk yang terdaftar. Klik "Tambah Produk Baru" untuk memulai.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.map((p) => {
                // Calculate how many ingredients are short of stock
                const shortItems = p.materials.filter(pm => pm.material.stock < pm.quantityRequired)
                const hasWarnings = shortItems.length > 0

                return (
                  <div 
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p)
                      setIsAdding(false)
                    }}
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
        </div>

      {/* RIGHT COLUMN: Detail Viewer / Creator Panel (5/12) */}
      <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-10">
        
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
              <button 
                onClick={() => setSelectedProduct(null)}
                className="p-2 border-[0.5px] border-gallery-line hover:border-gallery-dark transition-colors bg-gallery-base"
              >
                <X size={14} />
              </button>
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
                Link Foto / Gambar Produk
              </label>
              <input 
                type="text" 
                placeholder="e.g. https://... (Optional)"
                value={newProduct.imageUrl || ''}
                onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">
                Deskripsi & Penjelasan Produk
              </label>
              <textarea 
                rows={2}
                placeholder="Tuliskan detail produk, gaya, atau catatan pembuatan di sini..."
                value={newProduct.description || ''}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus:outline-none focus:border-gallery-dark font-sans resize-none"
              />
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

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
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

  </div>
  )
}
