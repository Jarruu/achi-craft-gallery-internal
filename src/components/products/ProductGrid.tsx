import { Cpu, Check, AlertTriangle } from 'lucide-react'
import * as React from 'react'

interface ProductGridProps {
  products: any[]
  selectedProduct: any
  handleSelectProduct: (p: any) => void
}

export function ProductGrid({
  products,
  selectedProduct,
  handleSelectProduct
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {products.map((p) => {
        const shortItems = p.materials.filter((pm: any) => pm.material.stock < pm.quantityRequired)
        const hasWarnings = shortItems.length > 0
        const isSelected = selectedProduct?.id === p.id

        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleSelectProduct(p)
          }
        }

        return (
          <div 
            key={p.id}
            tabIndex={0}
            role="button"
            aria-pressed={isSelected}
            aria-label={`Produk ${p.name}. ${p.materials.length} bahan baku. ${hasWarnings ? 'Bahan kurang' : 'Bahan siap'}`}
            onClick={() => handleSelectProduct(p)}
            onKeyDown={handleKeyDown}
            className={`bg-gallery-split border-[0.5px] cursor-pointer flex flex-col relative group transition-all duration-300 focus-ring ${
              isSelected 
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
                <div className="w-16 h-16 border-[0.5px] border-gallery-line flex items-center justify-center relative bg-white">
                  <Cpu size={24} className="text-gallery-muted" />
                  <div className="absolute inset-0 border border-dashed border-gallery-muted/20 animate-spin" style={{ animationDuration: '30s' }} />
                </div>
                <div className="absolute top-2 right-2 text-[8px] uppercase tracking-widest text-gallery-muted font-bold">
                  RANCANGAN BAHAN BAKU
                </div>
              </div>
            )}

            {/* Content details */}
            <div className="p-4 flex-1 flex flex-col justify-between gap-4 font-sans">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-gallery-muted font-bold">
                    {p.materials.length} BAHAN BAKU TERKAIT
                  </span>
                  {hasWarnings && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-[10px] tracking-wide font-bold uppercase border border-red-200/50">
                      Bahan Kurang
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-lg tracking-tight text-gallery-dark mt-1.5 group-hover:underline font-bold">
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
                  <span className="text-green-750 flex items-center gap-1 text-[11px] font-bold">
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
  )
}
