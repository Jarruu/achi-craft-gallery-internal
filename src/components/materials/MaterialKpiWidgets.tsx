import { Layers, AlertTriangle, Calendar } from 'lucide-react'

interface MaterialKpiWidgetsProps {
  totalCount: number
  outOfStockMaterials: any[]
  lowStockMaterials: any[]
  expiredMaterials: any[]
  almostExpiringMaterials: any[]
}

export function MaterialKpiWidgets({
  totalCount,
  outOfStockMaterials,
  lowStockMaterials,
  expiredMaterials,
  almostExpiringMaterials
}: MaterialKpiWidgetsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6" role="region" aria-label="Ringkasan Status Bahan Baku">
      {/* Widget 1: Total Materials */}
      <div className="bg-gallery-split border-[0.5px] border-gallery-line p-6 flex justify-between items-center relative group hover:border-gallery-dark duration-300">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-[0.25em] text-gallery-muted font-bold block">
            TOTAL BAHAN BAKU
          </span>
          <div className="text-3xl font-serif text-gallery-dark font-bold mt-1.5">
            {totalCount}
          </div>
          <span className="text-xs text-gallery-muted font-semibold block">
            Item terdaftar di inventaris
          </span>
        </div>
        <div className="w-12 h-12 bg-gallery-base flex items-center justify-center border-[0.5px] border-gallery-line shrink-0" aria-hidden="true">
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
          <span className="text-[10px] uppercase tracking-[0.25em] text-gallery-muted font-bold block">
            STOK HABIS
          </span>
          <div className={`text-3xl font-serif font-bold mt-1.5 ${outOfStockMaterials.length > 0 ? 'text-red-700' : 'text-gallery-dark'}`}>
            {outOfStockMaterials.length}
          </div>
          <span className="text-xs text-gallery-muted font-semibold block">
            Bahan baku kosong
          </span>
        </div>
        <div className={`w-12 h-12 flex items-center justify-center border-[0.5px] shrink-0 ${
          outOfStockMaterials.length > 0 ? 'bg-red-100/55 border-red-200' : 'bg-gallery-base border-gallery-line'
        }`} aria-hidden="true">
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
          <span className="text-[10px] uppercase tracking-[0.25em] text-gallery-muted font-bold block">
            STOK MENIPIS
          </span>
          <div className={`text-3xl font-serif font-bold mt-1.5 ${lowStockMaterials.length > 0 ? 'text-amber-700' : 'text-gallery-dark'}`}>
            {lowStockMaterials.length}
          </div>
          <span className="text-xs text-gallery-muted font-semibold block">
            Di bawah batas minimum
          </span>
        </div>
        <div className={`w-12 h-12 flex items-center justify-center border-[0.5px] shrink-0 ${
          lowStockMaterials.length > 0 ? 'bg-amber-100/55 border-amber-200' : 'bg-gallery-base border-gallery-line'
        }`} aria-hidden="true">
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
          <span className="text-[10px] uppercase tracking-[0.25em] text-gallery-muted font-bold block">
            BAHAN KEDALUWARSA
          </span>
          <div className={`text-3xl font-serif font-bold mt-1.5 ${expiredMaterials.length > 0 ? 'text-red-700' : 'text-gallery-dark'}`}>
            {expiredMaterials.length}
          </div>
          <span className="text-xs text-gallery-muted font-semibold block">
            Lewat tanggal kedaluwarsa
          </span>
        </div>
        <div className={`w-12 h-12 flex items-center justify-center border-[0.5px] shrink-0 ${
          expiredMaterials.length > 0 ? 'bg-red-100/55 border-red-200' : 'bg-gallery-base border-gallery-line'
        }`} aria-hidden="true">
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
          <span className="text-[10px] uppercase tracking-[0.25em] text-gallery-muted font-bold block">
            HAMPIR KEDALUWARSA
          </span>
          <div className={`text-3xl font-serif font-bold mt-1.5 ${almostExpiringMaterials.length > 0 ? 'text-amber-700' : 'text-gallery-dark'}`}>
            {almostExpiringMaterials.length}
          </div>
          <span className="text-xs text-gallery-muted font-semibold block">
            Expired dalam waktu &lt;= 30 hari
          </span>
        </div>
        <div className={`w-12 h-12 flex items-center justify-center border-[0.5px] shrink-0 ${
          almostExpiringMaterials.length > 0 ? 'bg-amber-100/55 border-amber-200' : 'bg-gallery-base border-gallery-line'
        }`} aria-hidden="true">
          <Calendar size={18} className={almostExpiringMaterials.length > 0 ? 'text-amber-700' : 'text-gallery-dark'} />
        </div>
      </div>
    </div>
  )
}
