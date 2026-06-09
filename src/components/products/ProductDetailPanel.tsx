import * as React from 'react'
import { useState, useEffect } from 'react'
import { Pencil, Trash2, X, Layers, Cpu, Check, AlertTriangle, MinusCircle, PlusCircle, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog'

interface ProductDetailPanelProps {
  selectedProduct: any
  startEdit: (p: any) => void
  setIsDeleteDialogOpen: (open: boolean) => void
  setSelectedProduct: (p: any) => void
  productionQty: number
  setProductionQty: React.Dispatch<React.SetStateAction<number>>
  isProducing: boolean
  handleStartProduction: () => Promise<void>
}

export function ProductDetailPanel({
  selectedProduct,
  startEdit,
  setIsDeleteDialogOpen,
  setSelectedProduct,
  productionQty,
  setProductionQty,
  isProducing,
  handleStartProduction
}: ProductDetailPanelProps) {
  
  const [isConfirmingProduction, setIsConfirmingProduction] = useState(false)

  // Reset confirmation state when product changes
  useEffect(() => {
    setIsConfirmingProduction(false)
  }, [selectedProduct?.id])

  const canProduce = selectedProduct.materials.length > 0 && selectedProduct.materials.every(
    (pm: any) => pm.material.stock >= pm.quantityRequired * productionQty
  )

  const handleConfirmAndStart = async () => {
    setIsConfirmingProduction(false)
    await handleStartProduction()
  }

  return (
    <div className="bg-gallery-split border-[0.5px] border-gallery-dark p-6 space-y-6">
      
      {/* Header info */}
      <div className="border-b-[0.5px] border-gallery-line pb-4 flex justify-between items-start gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gallery-muted font-bold">
            RANCANGAN PRODUK
          </span>
          <h3 className="font-serif text-2xl tracking-tight text-gallery-dark mt-0.5">
            {selectedProduct.name}
          </h3>
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => startEdit(selectedProduct)}
            className="p-2 border-[0.5px] border-gallery-line hover:border-gallery-dark hover:text-gallery-dark transition-colors bg-gallery-base cursor-pointer focus-ring"
            title="Edit Rancangan Produk"
            aria-label="Edit Rancangan Produk"
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="p-2 border-[0.5px] border-gallery-line hover:border-red-650 hover:text-red-650 transition-colors bg-gallery-base cursor-pointer focus-ring"
            title="Hapus Rancangan Produk"
            aria-label="Hapus Rancangan Produk"
          >
            <Trash2 size={14} />
          </button>
          <button 
            onClick={() => setSelectedProduct(null)}
            className="p-2 border-[0.5px] border-gallery-line hover:border-gallery-dark transition-colors bg-gallery-base cursor-pointer focus-ring"
            title="Tutup Panel"
            aria-label="Tutup Panel"
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
            <span className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold mt-2.5">
              Belum Ada Foto Produk
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5 text-xs font-sans">
        <span className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold block">DESKRIPSI PRODUK</span>
        <p className="text-gallery-dark leading-relaxed font-semibold bg-gallery-base/40 p-3 border-[0.5px] border-gallery-line italic">
          "{selectedProduct.description || 'Belum ada deskripsi.'}"
        </p>
      </div>

      {/* BOM Checklist (Fitur 5 Stock Availability Checker) */}
      <div className="space-y-3 pt-2">
        <h4 className="text-[10px] uppercase tracking-[0.18em] text-gallery-dark font-bold flex items-center gap-1.5 border-b-[0.5px] border-gallery-line pb-2">
          <Layers size={14} aria-hidden="true" />
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
                className={`p-3 border-[0.5px] flex items-center justify-between gap-4 text-xs font-sans ${
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
                  <p className="text-[10px] text-gallery-muted font-bold">
                    Dibutuhkan: <span className="font-bold text-gallery-dark">{pm.quantityRequired} {m.unit}</span> 
                    {pm.notes && ` • Catatan: ${pm.notes}`}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[8px] uppercase tracking-widest text-gallery-muted font-bold">
                    KETERSEDIAAN
                  </div>
                  <div className="mt-1 flex items-center gap-1 justify-end font-bold text-[10px]">
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
          <Cpu size={14} className="text-gallery-dark" aria-hidden="true" />
          PRODUKSI PRODUK
        </h4>

        <div className="bg-gallery-base/40 p-4 border-[0.5px] border-gallery-line flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 font-sans">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <span className="text-[11px] font-bold text-gallery-dark uppercase tracking-wider">
              Jumlah:
            </span>
            <div className="flex items-center border-[0.5px] border-gallery-line bg-white">
              <button
                type="button"
                onClick={() => setProductionQty(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1 text-gallery-dark hover:bg-gallery-base transition-colors border-r-[0.5px] border-gallery-line cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-ring"
                disabled={productionQty <= 1 || isProducing}
                aria-label="Kurangi jumlah produksi"
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
                aria-label="Kuantitas produksi"
              />
              <button
                type="button"
                onClick={() => setProductionQty(prev => prev + 1)}
                disabled={isProducing}
                className="px-2.5 py-1 text-gallery-dark hover:bg-gallery-base transition-colors border-l-[0.5px] border-gallery-line cursor-pointer focus-ring"
                aria-label="Tambah jumlah produksi"
              >
                <PlusCircle size={13} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsConfirmingProduction(true)}
            disabled={!canProduce || isProducing}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 focus-ring ${
              canProduce
                ? 'bg-gallery-dark text-gallery-base hover:bg-gallery-dark/95 active:scale-[0.98]'
                : 'bg-gallery-line text-gallery-muted cursor-not-allowed border-[0.5px] border-gallery-line'
            }`}
          >
            {isProducing ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Mulai Produksi</span>
            )}
          </button>
        </div>

        {/* ESTIMATED BOM REQUIRED FOR SELECTED QTY */}
        <div className="border-[0.5px] border-gallery-line bg-gallery-base/20 p-3 space-y-2 font-sans">
          <span className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold block">
            Estimasi Kebutuhan Bahan Baku ({productionQty} unit)
          </span>
          <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {selectedProduct.materials.map((pm: any) => {
              const totalNeeded = pm.quantityRequired * productionQty
              const hasStock = pm.material.stock >= totalNeeded
              return (
                <div 
                  key={pm.id} 
                  className={`p-2 border-[0.5px] text-[11px] flex items-center justify-between gap-4 transition-all duration-300 ${
                    hasStock ? 'border-gallery-line bg-white text-gallery-dark' : 'border-red-200 bg-red-50/20 text-red-700 font-bold'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold">{pm.material.name}</span>
                    <span className="text-[9px] text-gallery-muted tracking-wider uppercase font-mono mt-0.5">
                      {pm.material.sku}
                    </span>
                  </div>
                  <div className="text-right flex flex-col font-mono text-[10px]">
                    <span className="font-bold">
                      {totalNeeded.toFixed(2)} {pm.material.unit}
                    </span>
                    <span className="text-[9px] text-gallery-muted uppercase mt-0.5">
                      Tersedia: {pm.material.stock.toFixed(2)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {!canProduce && (
          <div className="p-3 bg-red-50/30 border-[0.5px] border-red-200 text-[10px] text-red-750 font-bold flex items-start gap-1.5 leading-relaxed font-sans">
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
        )}
      </div>

      {/* PRODUCTION CONFIRMATION DIALOG */}
      <Dialog open={isConfirmingProduction} onOpenChange={setIsConfirmingProduction}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>KONFIRMASI MULAI PRODUKSI</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin memulai produksi untuk produk ini?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 font-sans text-xs">
            <div className="p-3 bg-gallery-base/40 border-[0.5px] border-gallery-line space-y-1">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">PRODUK</span>
                <p className="font-bold text-sm text-gallery-dark">{selectedProduct.name}</p>
              </div>
              <div className="pt-2">
                <span className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">JUMLAH PRODUKSI</span>
                <p className="font-bold text-sm text-gallery-dark font-serif">{productionQty} Unit</p>
              </div>
            </div>

            <p className="text-gallery-muted leading-relaxed font-semibold">
              Tindakan ini akan memotong stok bahan baku tercatat sesuai dengan Bill of Materials (BOM) di atas secara otomatis dan membuat entri produksi berjalan baru.
            </p>

            <DialogFooter className="flex sm:justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingProduction(false)}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border-[0.5px] border-gallery-line bg-gallery-split hover:bg-gallery-base text-gallery-muted hover:text-gallery-dark transition-all cursor-pointer focus-ring"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAndStart}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-gallery-dark text-gallery-base hover:opacity-90 transition-all cursor-pointer focus-ring"
              >
                Ya, Mulai Produksi
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
