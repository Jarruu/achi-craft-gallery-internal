import { getColorHex } from './MaterialVisual'

interface MaterialTableProps {
  materials: any[]
  selectedMaterial: any
  handleSelectMaterial: (m: any) => void
  lowStockThresholds: Record<string, number>
  now: Date
}

export function MaterialTable({
  materials,
  selectedMaterial,
  handleSelectMaterial,
  lowStockThresholds,
  now
}: MaterialTableProps) {
  return (
    <div className="border-[0.5px] border-gallery-line bg-gallery-split overflow-x-auto">
      <table className="w-full text-left border-collapse table-auto">
        <thead>
          <tr className="border-b-[0.5px] border-gallery-line bg-gallery-base/40 text-[10px] font-bold uppercase tracking-widest text-gallery-muted">
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
        <tbody className="divide-y divide-gallery-line text-xs font-semibold text-gallery-dark font-sans">
          {materials.map((m) => {
            const isOutOfStock = m.stock <= 0
            const isLowStock = m.stock > 0 && m.stock < (lowStockThresholds[m.type] || 10)
            const expDate = m.expiredAt ? new Date(m.expiredAt) : null
            const isExpired = expDate ? expDate.getTime() < now.getTime() : false
            const isAlmostExpired = expDate ? (expDate.getTime() >= now.getTime() && (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 30) : false
            const swatchColor = getColorHex(m.colorPattern)
            const isSelected = selectedMaterial?.id === m.id

            const handleKeyDown = (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleSelectMaterial(m)
              }
            }

            return (
              <tr 
                key={m.id}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`Bahan baku ${m.name}, SKU ${m.sku}. Kuantitas stok ${m.stock} ${m.unit}`}
                onClick={() => handleSelectMaterial(m)}
                onKeyDown={handleKeyDown}
                className={`cursor-pointer hover:bg-gallery-base/50 transition-colors focus:outline-none focus:bg-gallery-base/80 ${
                  isSelected ? 'bg-gallery-base/80' : ''
                } ${isOutOfStock ? 'bg-red-50/10' : isLowStock ? 'bg-amber-50/5' : ''}`}
              >
                <td className="py-3 px-2 sm:px-4 text-center">
                  <div className="w-6 h-6 border-[0.5px] border-gallery-line shrink-0 flex items-center justify-center relative overflow-hidden mx-auto" style={{ backgroundColor: swatchColor }}>
                    {m.imageUrl && m.imageUrl.trim().startsWith('http') && (
                      <img src={m.imageUrl} alt="" className="w-full h-full object-cover" />
                    )}
                    {m.type === 'ZIPPER' && <div className="w-0.5 h-full bg-gallery-dark/25" />}
                    {m.type === 'FABRIC' && <div className="absolute inset-0 border border-dashed border-gallery-dark/10" />}
                  </div>
                </td>
                <td className="py-3 px-2 sm:px-4 font-bold tracking-wide uppercase text-gallery-dark">{m.sku}</td>
                <td className="py-3 px-2 sm:px-4">
                  <div className="font-serif text-[13px] font-bold break-words max-w-[100px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-[140px] xl:max-w-[220px]">
                    {m.name}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {isOutOfStock && (
                      <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] tracking-wide font-bold uppercase">
                        Habis
                      </span>
                    )}
                    {isLowStock && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] tracking-wide font-bold uppercase border border-amber-200/50">
                        Menipis
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
                </td>
                <td className="hidden sm:table-cell py-3 px-2 sm:px-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-gallery-base/90 border-[0.5px] border-gallery-line">
                    {m.type}
                  </span>
                </td>
                <td className="hidden md:table-cell lg:hidden xl:table-cell py-3 px-2 sm:px-4 text-gallery-muted font-bold uppercase">{m.category}</td>
                <td className="hidden xl:table-cell py-3 px-2 sm:px-4 text-gallery-muted font-bold uppercase">{m.quality}</td>
                <td className="hidden sm:table-cell py-3 px-2 sm:px-4 text-gallery-muted font-bold uppercase">{m.size}</td>
                <td className="py-3 px-2 sm:px-4 text-right">
                  <span className={`font-bold whitespace-nowrap px-1.5 py-0.5 ${
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
  )
}
