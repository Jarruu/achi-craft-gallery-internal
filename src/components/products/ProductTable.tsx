import { Cpu, Check, AlertTriangle } from 'lucide-react'
import * as React from 'react'

interface ProductTableProps {
  products: any[]
  selectedProduct: any
  handleSelectProduct: (p: any) => void
}

export function ProductTable({
  products,
  selectedProduct,
  handleSelectProduct
}: ProductTableProps) {
  return (
    <div className="border-[0.5px] border-gallery-line bg-gallery-split overflow-x-auto">
      <table className="w-full text-left border-collapse table-auto">
        <thead>
          <tr className="border-b-[0.5px] border-gallery-line bg-gallery-base/40 text-[10px] font-bold uppercase tracking-widest text-gallery-muted">
            <th className="py-3 px-2 sm:px-4 font-bold w-12 text-center">Visual</th>
            <th className="py-3 px-2 sm:px-4 font-bold">Nama Produk</th>
            <th className="hidden sm:table-cell py-3 px-2 sm:px-4 font-bold">Deskripsi</th>
            <th className="py-3 px-2 sm:px-4 font-bold text-center">Bahan Baku</th>
            <th className="py-3 px-2 sm:px-4 font-bold text-right">Status Ketersediaan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gallery-line text-xs font-semibold text-gallery-dark font-sans">
          {products.map((p) => {
            const shortItems = p.materials.filter((pm: any) => pm.material.stock < pm.quantityRequired)
            const hasWarnings = shortItems.length > 0
            const totalBOMItems = p.materials.length
            const isSelected = selectedProduct?.id === p.id

            const handleKeyDown = (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleSelectProduct(p)
              }
            }

            return (
              <tr 
                key={p.id}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`Produk ${p.name}. ${totalBOMItems} bahan baku. ${hasWarnings ? 'Bahan kurang' : 'Bahan siap'}`}
                onClick={() => handleSelectProduct(p)}
                onKeyDown={handleKeyDown}
                className={`cursor-pointer hover:bg-gallery-base/50 transition-colors focus:outline-none focus:bg-gallery-base/85 ${
                  isSelected ? 'bg-gallery-base/80' : ''
                } ${hasWarnings ? 'bg-red-50/5' : ''}`}
              >
                <td className="py-3 px-2 sm:px-4 text-center">
                  <div className="w-6 h-6 border-[0.5px] border-gallery-line shrink-0 flex items-center justify-center relative overflow-hidden bg-white mx-auto">
                    {p.imageUrl && p.imageUrl.trim().startsWith('http') ? (
                      <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Cpu size={12} className="text-gallery-muted" />
                    )}
                  </div>
                </td>
                <td className="py-3 px-2 sm:px-4 font-serif text-[13px] font-bold text-gallery-dark">{p.name}</td>
                <td className="hidden sm:table-cell py-3 px-2 sm:px-4 text-gallery-muted font-bold italic truncate max-w-[200px] uppercase">
                  {p.description || '-'}
                </td>
                <td className="py-3 px-2 sm:px-4 text-center">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gallery-base border-[0.5px] border-gallery-line font-mono">
                    {totalBOMItems} jenis
                  </span>
                </td>
                <td className="py-3 px-2 sm:px-4 text-right">
                  <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${
                    !hasWarnings 
                      ? 'bg-green-50 text-green-800 border-green-200/50' 
                      : 'bg-red-50 text-red-800 border-red-200/50'
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
  )
}
