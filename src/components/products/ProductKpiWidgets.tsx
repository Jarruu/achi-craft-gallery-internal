import { Cpu, Check, AlertTriangle } from 'lucide-react'

interface ProductKpiWidgetsProps {
  totalProducts: number
  readyProducts: number
  warningProducts: number
}

export function ProductKpiWidgets({
  totalProducts,
  readyProducts,
  warningProducts
}: ProductKpiWidgetsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="region" aria-label="Ringkasan Status Produk">
      {/* Widget 1: Total Products */}
      <div className="bg-gallery-split border-[0.5px] border-gallery-line p-6 flex justify-between items-center relative group hover:border-gallery-dark duration-300">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-[0.25em] text-gallery-muted font-bold block">
            TOTAL RANCANGAN PRODUK
          </span>
          <div className="text-3xl font-serif text-gallery-dark font-bold mt-1.5">
            {totalProducts}
          </div>
          <span className="text-xs text-gallery-muted font-semibold block">
            Model produk terdaftar
          </span>
        </div>
        <div className="w-12 h-12 bg-gallery-base flex items-center justify-center border-[0.5px] border-gallery-line shrink-0" aria-hidden="true">
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
          <span className="text-[10px] uppercase tracking-[0.25em] text-gallery-muted font-bold block">
            SIAP PRODUKSI
          </span>
          <div className={`text-3xl font-serif font-bold mt-1.5 ${readyProducts > 0 ? 'text-green-700' : 'text-gallery-dark'}`}>
            {readyProducts}
          </div>
          <span className="text-xs text-gallery-muted font-semibold block">
            Bahan baku lengkap & mencukupi
          </span>
        </div>
        <div className={`w-12 h-12 flex items-center justify-center border-[0.5px] shrink-0 ${
          readyProducts > 0 ? 'bg-green-100/55 border-green-200' : 'bg-gallery-base border-gallery-line'
        }`} aria-hidden="true">
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
          <span className="text-[10px] uppercase tracking-[0.25em] text-gallery-muted font-bold block">
            KEKURANGAN BAHAN BAKU
          </span>
          <div className={`text-3xl font-serif font-bold mt-1.5 ${warningProducts > 0 ? 'text-red-700' : 'text-gallery-dark'}`}>
            {warningProducts}
          </div>
          <span className="text-xs text-gallery-muted font-semibold block">
            Model produk dengan stok kurang
          </span>
        </div>
        <div className={`w-12 h-12 flex items-center justify-center border-[0.5px] shrink-0 ${
          warningProducts > 0 ? 'bg-red-100/55 border-red-200' : 'bg-gallery-base border-gallery-line'
        }`} aria-hidden="true">
          <AlertTriangle size={18} className={warningProducts > 0 ? 'text-red-700' : 'text-gallery-dark'} />
        </div>
      </div>
    </div>
  )
}
