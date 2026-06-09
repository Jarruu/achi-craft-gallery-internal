import { Pencil, Trash2, X, TrendingUp, History, AlertTriangle, Calendar, Loader2 } from 'lucide-react'
import { MaterialVisual } from './MaterialVisual'
import * as React from 'react'

interface MaterialDetailPanelProps {
  selectedMaterial: any
  now: Date
  lowStockThresholds: Record<string, number>
  startEdit: (m: any) => void
  setIsDeleteDialogOpen: (open: boolean) => void
  setSelectedMaterial: (m: any) => void
  adjType: 'INCOMING' | 'OUTGOING' | 'ADJUSTMENT'
  setAdjType: (type: 'INCOMING' | 'OUTGOING' | 'ADJUSTMENT') => void
  stockDelta: number | ''
  setStockDelta: (qty: number) => void
  adjNotes: string
  setAdjNotes: (notes: string) => void
  isUpdatingStock: boolean
  handleStockUpdateSubmit: (e: React.FormEvent) => void
}

export function MaterialDetailPanel({
  selectedMaterial,
  now,
  lowStockThresholds,
  startEdit,
  setIsDeleteDialogOpen,
  setSelectedMaterial,
  adjType,
  setAdjType,
  stockDelta,
  setStockDelta,
  adjNotes,
  setAdjNotes,
  isUpdatingStock,
  handleStockUpdateSubmit
}: MaterialDetailPanelProps) {
  
  const isOutOfStock = selectedMaterial.stock <= 0
  const isLowStock = selectedMaterial.stock > 0 && selectedMaterial.stock < (lowStockThresholds[selectedMaterial.type] || 10)
  const expDate = selectedMaterial.expiredAt ? new Date(selectedMaterial.expiredAt) : null
  const isExpired = expDate ? expDate.getTime() < now.getTime() : false
  const isAlmostExpired = expDate ? (expDate.getTime() >= now.getTime() && (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 30) : false

  // Client-side stock validation to prevent outgoing stock exceeding current stock
  const [validationError, setValidationError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setValidationError(null)
  }, [adjType, stockDelta, selectedMaterial.id])

  const onLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (adjType === 'OUTGOING' && stockDelta && stockDelta > selectedMaterial.stock) {
      setValidationError(`Stok tidak cukup. Maksimal pengeluaran adalah ${selectedMaterial.stock} ${selectedMaterial.unit}.`)
      return
    }
    handleStockUpdateSubmit(e)
  }

  return (
    <div className="bg-gallery-split border-[0.5px] border-gallery-dark p-6 space-y-6">
      
      {/* Header info */}
      <div className="border-b-[0.5px] border-gallery-line pb-4 flex justify-between items-start gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gallery-muted font-bold">
            SKU: {selectedMaterial.sku}
          </span>
          <h3 className="font-serif text-2xl tracking-tight text-gallery-dark mt-0.5">
            {selectedMaterial.name}
          </h3>
          <p className="text-xs text-gallery-muted tracking-wider uppercase font-bold mt-1">
            {selectedMaterial.type} • {selectedMaterial.category} • {selectedMaterial.quality}
          </p>
          
          {/* Status Badges */}
          {(isOutOfStock || isLowStock || isExpired || isAlmostExpired) && (
            <div className="flex gap-1.5 flex-wrap mt-2">
              {isOutOfStock && (
                <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] tracking-wider font-bold uppercase">
                  Stok Habis
                </span>
              )}
              {isLowStock && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] tracking-wider font-bold uppercase border border-amber-200/50">
                  Stok Menipis
                </span>
              )}
              {isExpired && (
                <span className="px-2 py-0.5 bg-red-650 text-white text-[10px] tracking-wider font-bold uppercase" style={{ backgroundColor: '#A33B3B' }}>
                  Kedaluwarsa
                </span>
              )}
              {isAlmostExpired && (
                <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] tracking-wider font-bold uppercase">
                  Hampir Kedaluwarsa
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => startEdit(selectedMaterial)}
            className="p-2 border-[0.5px] border-gallery-line hover:border-gallery-dark hover:text-gallery-dark transition-colors bg-gallery-base cursor-pointer focus-ring"
            title="Edit Informasi Bahan Baku"
            aria-label="Edit Informasi Bahan Baku"
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="p-2 border-[0.5px] border-gallery-line hover:border-red-600 hover:text-red-600 transition-colors bg-gallery-base cursor-pointer focus-ring"
            title="Hapus Bahan Baku"
            aria-label="Hapus Bahan Baku"
          >
            <Trash2 size={14} />
          </button>
          <button 
            onClick={() => setSelectedMaterial(null)}
            className="p-2 border-[0.5px] border-gallery-line hover:border-gallery-dark transition-colors bg-gallery-base cursor-pointer focus-ring"
            title="Tutup Panel Detail"
            aria-label="Tutup Panel Detail"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Visual Swatch */}
      <div className="border-[0.5px] border-gallery-line overflow-hidden bg-gallery-base">
        <MaterialVisual 
          type={selectedMaterial.type}
          colorPattern={selectedMaterial.colorPattern}
          imageUrl={selectedMaterial.imageUrl}
        />
      </div>

      {/* Spec details grid */}
      <div className="grid grid-cols-2 gap-4 border-[0.5px] border-gallery-line p-4 bg-gallery-base/40">
        <div>
          <div className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">DETAIL UKURAN</div>
          <div className="text-xs text-gallery-dark font-bold mt-0.5 uppercase">{selectedMaterial.size}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">WARNA / MOTIF</div>
          <div className="text-xs text-gallery-dark font-bold mt-0.5 uppercase">{selectedMaterial.colorPattern}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">TANGGAL KEDALUWARSA</div>
          <div className="text-xs text-gallery-dark font-bold mt-0.5 uppercase">
            {selectedMaterial.expiredAt ? (
              (() => {
                const expTime = new Date(selectedMaterial.expiredAt).getTime()
                const diffDays = Math.ceil((expTime - now.getTime()) / (1000 * 60 * 60 * 24))
                let colorClass = ''
                if (diffDays < 0) {
                  colorClass = 'text-red-800 font-bold'
                } else if (diffDays <= 30) {
                  colorClass = 'text-amber-700 font-bold'
                }
                return (
                  <span className={colorClass}>
                    {new Date(selectedMaterial.expiredAt).toLocaleDateString('id-ID')}
                  </span>
                )
              })()
            ) : (
              'TIDAK ADA'
            )}
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-widest text-gallery-muted font-bold">JUMLAH STOK</div>
          <div className="text-sm text-gallery-dark font-bold mt-0.5 uppercase">
            {selectedMaterial.stock} {selectedMaterial.unit}
          </div>
        </div>
      </div>

      {/* Form: Stock transaction update */}
      <form onSubmit={onLocalSubmit} className="space-y-4 border-t-[0.5px] border-gallery-line pt-5">
        <h4 className="text-[11px] uppercase tracking-[0.18em] text-gallery-dark font-bold flex items-center gap-1.5">
          <TrendingUp size={12} aria-hidden="true" />
          CATAT RIWAYAT STOK (MASUK / KELUAR)
        </h4>

        {validationError && (
          <div className="text-[11px] font-bold text-red-700 bg-red-50/50 p-2.5 border-[0.5px] border-red-200 animate-in fade-in" role="alert">
            {validationError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="adj-type" className="text-[10px] uppercase tracking-widest text-gallery-muted font-bold block">
              Jenis Transaksi
            </label>
            <select 
              id="adj-type"
              disabled={isUpdatingStock}
              value={adjType}
              onChange={(e) => setAdjType(e.target.value as any)}
              className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring font-semibold tracking-wide uppercase disabled:opacity-50"
            >
              <option value="INCOMING">Barang Masuk (Restock / Beli)</option>
              <option value="OUTGOING">Barang Keluar (Produksi / Rusak)</option>
              <option value="ADJUSTMENT">Penyesuai Stok (Audit Fisik)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="stock-delta" className="text-[10px] uppercase tracking-widest text-gallery-muted font-bold block">
              Jumlah ({selectedMaterial.unit})*
            </label>
            <input 
              id="stock-delta"
              type="number" 
              step="any"
              required
              disabled={isUpdatingStock}
              // Allow positive delta for adjustment reducing stock by disabling fixed min="0.01" when ADJUSTMENT is selected
              min={adjType === 'ADJUSTMENT' ? undefined : "0.01"}
              placeholder={adjType === 'ADJUSTMENT' ? "e.g. -5 atau 10" : "e.g. 5.5"}
              value={stockDelta || ''}
              onChange={(e) => setStockDelta(Number(e.target.value))}
              className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring font-bold disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="adj-notes" className="text-[10px] uppercase tracking-widest text-gallery-muted font-bold block">
            Catatan / Keterangan
          </label>
          <input 
            id="adj-notes"
            type="text" 
            disabled={isUpdatingStock}
            placeholder="cth. Beli dari pemasok, dipakai untuk contoh produk..."
            value={adjNotes}
            onChange={(e) => setAdjNotes(e.target.value)}
            className="w-full bg-gallery-base border-[0.5px] border-gallery-line px-3 py-1.5 text-xs text-gallery-dark focus-ring disabled:opacity-50"
          />
        </div>

        <button 
          type="submit" 
          disabled={isUpdatingStock}
          className="w-full bg-gallery-dark text-gallery-base py-2 text-xs font-semibold uppercase tracking-wider hover:opacity-90 active:scale-95 duration-200 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 focus-ring"
        >
          {isUpdatingStock ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              <span>Menyimpan Catatan...</span>
            </>
          ) : (
            <span>Simpan Catatan Stok</span>
          )}
        </button>
      </form>

      {/* Sub-list: Recent transaction history for this item */}
      <div className="border-t-[0.5px] border-gallery-line pt-5 space-y-3">
        <h4 className="text-[11px] uppercase tracking-[0.18em] text-gallery-dark font-bold flex items-center gap-1.5">
          <History size={12} aria-hidden="true" />
          RIWAYAT PERUBAHAN STOK BAHAN
        </h4>
        
        {selectedMaterial.stockLogs && selectedMaterial.stockLogs.length > 0 ? (
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {selectedMaterial.stockLogs.map((log: any) => {
              const logDate = new Date(log.createdAt).toLocaleString('id-ID', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
              return (
                <div key={log.id} className="border-b-[0.5px] border-gallery-line pb-2 flex justify-between items-start gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 border ${
                        log.type === 'INCOMING' ? 'bg-green-50 text-green-800 border-green-200/50' :
                        log.type === 'OUTGOING' ? 'bg-red-50 text-red-850 border-red-200/50' : 'bg-yellow-50 text-yellow-850 border-yellow-200/50'
                      }`}>
                        {log.type === 'INCOMING' ? 'Masuk' : log.type === 'OUTGOING' ? 'Keluar' : 'Penyesuaian'}
                      </span>
                      <span className="text-[11px] font-bold text-gallery-dark">
                        {log.quantity > 0 ? `+${log.quantity}` : log.quantity} {selectedMaterial.unit}
                      </span>
                    </div>
                    <p className="text-gallery-muted text-[11px] mt-1 leading-relaxed">{log.notes || 'Tanpa keterangan'}</p>
                  </div>
                  <span className="text-[10px] text-gallery-muted font-bold whitespace-nowrap">{logDate}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-gallery-muted italic">Belum ada catatan transaksi stok untuk bahan baku ini.</p>
        )}
      </div>

    </div>
  )
}
