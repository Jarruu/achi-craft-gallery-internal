import { MaterialVisual } from './MaterialVisual'

interface MaterialGridProps {
  materials: any[]
  selectedMaterial: any
  handleSelectMaterial: (m: any) => void
  lowStockThresholds: Record<string, number>
  now: Date
}

export function MaterialGrid({
  materials,
  selectedMaterial,
  handleSelectMaterial,
  lowStockThresholds,
  now
}: MaterialGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {materials.map((m) => {
        const isOutOfStock = m.stock <= 0
        const isLowStock = m.stock > 0 && m.stock < (lowStockThresholds[m.type] || 10)
        const expDate = m.expiredAt ? new Date(m.expiredAt) : null
        const isExpired = expDate ? expDate.getTime() < now.getTime() : false
        const isAlmostExpired = expDate ? (expDate.getTime() >= now.getTime() && (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 30) : false
        const isSelected = selectedMaterial?.id === m.id

        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleSelectMaterial(m)
          }
        }

        return (
          <div 
            key={m.id}
            tabIndex={0}
            role="button"
            aria-pressed={isSelected}
            aria-label={`Bahan ${m.name}, SKU ${m.sku}. Stok ${m.stock} ${m.unit}`}
            onClick={() => handleSelectMaterial(m)}
            onKeyDown={handleKeyDown}
            className={`bg-gallery-split border-[0.5px] cursor-pointer relative flex flex-col group transition-all duration-300 focus-ring ${
              isSelected 
                ? 'border-gallery-dark ring-1 ring-gallery-dark/15' 
                : 'border-gallery-line hover:border-gallery-dark/60'
            }`}
          >
            {/* Swatch visual support */}
            <MaterialVisual type={m.type} colorPattern={m.colorPattern} imageUrl={m.imageUrl} />
            
            {/* Content details */}
            <div className="p-4 flex-1 flex flex-col justify-between gap-4 font-sans">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-gallery-muted font-bold">
                    {m.sku}
                  </span>
                  <div className="flex gap-1.5 flex-wrap justify-end max-w-[60%]">
                    {isOutOfStock && (
                      <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] tracking-wide font-bold uppercase">
                        Stok Habis
                      </span>
                    )}
                    {isLowStock && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] tracking-wide font-bold uppercase border border-amber-200/50">
                        Stok Menipis
                      </span>
                    )}
                    {isExpired && (
                      <span className="px-1.5 py-0.5 bg-red-650 text-white text-[10px] tracking-wide font-bold uppercase" style={{ backgroundColor: '#A33B3B' }}>
                        Kedaluwarsa
                      </span>
                    )}
                    {isAlmostExpired && (
                      <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] tracking-wide font-bold uppercase">
                        Hampir Kedal.
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="font-serif text-lg tracking-tight text-gallery-dark mt-1.5 group-hover:underline font-bold">
                  {m.name}
                </h3>
                <p className="text-xs text-gallery-muted mt-0.5 font-bold uppercase">
                  Kategori: {m.category} • Kualitas: {m.quality}
                </p>
              </div>

              <div className="border-t-[0.5px] border-gallery-line pt-3 flex items-end justify-between">
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">
                    SPESIFIKASI / UKURAN
                  </div>
                  <div className="text-xs font-semibold text-gallery-dark mt-0.5 uppercase">
                    {m.size}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">
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
  )
}
