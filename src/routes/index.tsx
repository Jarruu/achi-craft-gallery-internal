import { createFileRoute, Link } from '@tanstack/react-router'
import { getDashboardStats } from '../lib/dashboard.functions'
import { Layers, Cpu, AlertTriangle, History, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/')({
  loader: async () => {
    const stats = await getDashboardStats()
    return { stats }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { stats } = Route.useLoaderData()

  return (
    <div className="space-y-10 rise-in">
      {/* HEADER SECTION (Magazine Header Style) */}
      <div className="border-b-[0.5px] border-gallery-line pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-gallery-muted font-bold">
            DASHBOARD
          </div>
          <h2 className="text-4xl font-serif tracking-tight text-gallery-dark uppercase mt-1">
            RINGKASAN AKTIVITAS & INVENTARIS
          </h2>
        </div>
        <div className="text-right text-xs font-semibold text-gallery-muted tracking-wider uppercase border-[0.5px] border-gallery-line bg-gallery-split px-4 py-2 select-none">
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}
        </div>
      </div>

      {/* KPI METRIC CARDS (Geometric Division Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-[0.5px] border-gallery-line bg-gallery-split divide-y md:divide-y-0 md:divide-x divide-gallery-line" role="region" aria-label="Informasi Utama">
        {/* Metric 1 */}
        <div className="p-8 flex flex-col justify-between min-h-[160px]">
          <div>
            <div className="flex items-center justify-between text-gallery-muted mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider">TOTAL BAHAN BAKU</span>
              <Layers size={16} aria-hidden="true" />
            </div>
            <div className="text-4xl font-serif text-gallery-dark">
              {stats.totalMaterials} <span className="text-xs font-sans font-semibold text-gallery-muted uppercase">Item</span>
            </div>
          </div>
          <p className="text-[10px] text-gallery-muted tracking-wide mt-6 font-semibold uppercase">
            Terbagi dalam {Object.keys(stats.typeStats).length} tipe kategori bahan
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-8 flex flex-col justify-between min-h-[160px]">
          <div>
            <div className="flex items-center justify-between text-gallery-muted mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider">DESAIN PRODUK (BOM)</span>
              <Cpu size={16} aria-hidden="true" />
            </div>
            <div className="text-4xl font-serif text-gallery-dark">
              {stats.totalProducts} <span className="text-xs font-sans font-semibold text-gallery-muted uppercase">Formula</span>
            </div>
          </div>
          <p className="text-[10px] text-gallery-muted tracking-wide mt-6 font-semibold uppercase">
            Kombinasi formula Bill of Materials aktif
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-8 flex flex-col justify-between min-h-[160px] relative">
          <div>
            <div className="flex items-center justify-between text-gallery-muted mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider">PERINGATAN INVENTARIS</span>
              <AlertTriangle className={(stats.outOfStockCount + stats.expiredCount) > 0 ? "text-red-700 animate-pulse" : (stats.lowStockCount + stats.almostExpiredCount) > 0 ? "text-amber-600" : "text-gallery-muted"} size={16} aria-hidden="true" />
            </div>
            <div className="text-4xl font-serif text-gallery-dark">
              {stats.outOfStockCount + stats.lowStockCount + stats.expiredCount + stats.almostExpiredCount}{" "}
              <span className="text-xs font-sans font-semibold text-gallery-muted uppercase">Bahan</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-gallery-muted font-bold tracking-wide mt-4 uppercase">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${stats.outOfStockCount > 0 ? 'bg-red-600' : 'bg-gallery-muted/30'}`} aria-hidden="true" />
              <span>Habis: <span className={stats.outOfStockCount > 0 ? "text-red-700 font-bold" : ""}>{stats.outOfStockCount}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${stats.lowStockCount > 0 ? 'bg-amber-500' : 'bg-gallery-muted/30'}`} aria-hidden="true" />
              <span>Menipis: <span className={stats.lowStockCount > 0 ? "text-amber-600 font-bold" : ""}>{stats.lowStockCount}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${stats.expiredCount > 0 ? 'bg-red-600' : 'bg-gallery-muted/30'}`} aria-hidden="true" />
              <span>Expired: <span className={stats.expiredCount > 0 ? "text-red-700 font-bold" : ""}>{stats.expiredCount}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${stats.almostExpiredCount > 0 ? 'bg-amber-500' : 'bg-gallery-muted/30'}`} aria-hidden="true" />
              <span>Hampir Exp: <span className={stats.almostExpiredCount > 0 ? "text-amber-600 font-bold" : ""}>{stats.almostExpiredCount}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Capacities & Distribution (7/12) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section: Crafting Capacity based on BOM */}
          <div className="border-[0.5px] border-gallery-line bg-gallery-split p-6">
            <div className="border-b-[0.5px] border-gallery-line pb-3 mb-4 flex justify-between items-center">
              <h3 className="text-xs font-serif tracking-widest text-gallery-dark uppercase font-semibold">
                ESTIMASI KAPASITAS PRODUKSI MAKSIMAL (BOM)
              </h3>
              <Link to="/products" className="text-[10px] font-bold uppercase tracking-widest text-gallery-muted hover:text-gallery-dark flex items-center gap-1 transition-colors focus-ring">
                KELOLA <ArrowRight size={10} aria-hidden="true" />
              </Link>
            </div>
            
            <p className="text-[11px] text-gallery-muted uppercase tracking-wider font-bold mb-4 leading-relaxed">
              Batas atas kuantitas produk yang dapat diproduksi secara real-time berdasarkan sisa bahan baku saat ini.
            </p>

            {stats.productCapacities.length === 0 ? (
              <div className="p-8 text-center text-xs tracking-wider text-gallery-muted uppercase border-[0.5px] border-dashed border-gallery-line font-semibold">
                Belum ada produk terdaftar.
              </div>
            ) : (
              <div className="divide-y divide-gallery-line font-sans">
                {stats.productCapacities.map((product) => {
                  const hasDeficits = product.materialDeficits.length > 0
                  return (
                    <div key={product.id} className="py-4.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={`Foto ${product.name}`} 
                            className="w-12 h-12 object-cover border-[0.5px] border-gallery-line shrink-0" 
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gallery-base flex items-center justify-center border-[0.5px] border-gallery-line text-gallery-muted font-bold font-serif shrink-0 uppercase select-none">
                            {product.name.substring(0, 2)}
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-serif font-bold uppercase text-gallery-dark tracking-wide">
                            {product.name}
                          </h4>
                          <p className="text-[10px] text-gallery-muted font-bold uppercase mt-0.5">
                            {product.materialsCount} BAHAN BAKU DIKONSUMSI
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end shrink-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                          product.maxUnitsCanProduce > 0 
                            ? 'bg-gallery-dark text-gallery-base' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.maxUnitsCanProduce > 0 
                            ? `${product.maxUnitsCanProduce} UNIT SIAP CRAFT` 
                            : 'STOK BAHAN TIDAK CUKUP'}
                        </span>

                        {hasDeficits && (
                          <span className="text-[10px] text-red-700 mt-1 uppercase font-bold tracking-wide leading-tight max-w-[200px] sm:text-right">
                            Kekurangan: {product.materialDeficits.map(d => `${d.sku} (${d.required - d.available} ${d.unit})`).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Section: Material Categories Distribution */}
          <div className="border-[0.5px] border-gallery-line bg-gallery-split p-6">
            <div className="border-b-[0.5px] border-gallery-line pb-3 mb-4">
              <h3 className="text-xs font-serif tracking-widest text-gallery-dark uppercase font-semibold">
                SEBARAN KATEGORI INVENTARIS
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-sans">
              {Object.entries(stats.typeStats).map(([type, data]) => {
                return (
                  <div key={type} className="bg-gallery-base p-4 border-[0.5px] border-gallery-line flex flex-col justify-between min-h-[90px]">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-gallery-muted">
                        Kategori
                      </div>
                      <div className="text-[11px] font-serif font-bold tracking-wider text-gallery-dark uppercase mt-0.5">
                        {type}
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between border-t border-gallery-line/50 pt-2">
                      <span className="text-[10px] text-gallery-muted font-bold uppercase">
                        {data.count} SKU
                      </span>
                      <span className="text-xs font-bold text-gallery-dark">
                        {data.stock.toLocaleString('id-ID')} <span className="text-[9px] text-gallery-muted font-semibold uppercase">Unit</span>
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Low Stock Alerts, Quick Actions & Recent Activity (5/12) */}
        <div className="lg:col-span-5 space-y-8">
          
            {/* Section: Critical Materials (Restock/Expired Warnings) */}
            <div className="border-[0.5px] border-gallery-line bg-gallery-split p-6">
              <div className="border-b-[0.5px] border-gallery-line pb-3 mb-4 flex justify-between items-center">
                <h3 className="text-xs font-serif tracking-widest text-gallery-dark uppercase font-semibold">
                  PERINGATAN BAHAN (PERLU PERHATIAN)
                </h3>
                <Link to="/materials" className="text-[10px] font-bold uppercase tracking-widest text-gallery-muted hover:text-gallery-dark flex items-center gap-1 transition-colors focus-ring">
                  LIHAT <ArrowRight size={10} aria-hidden="true" />
                </Link>
              </div>
  
              {stats.warningMaterials.length === 0 ? (
                <div className="p-4 text-center text-xs tracking-wider text-green-800 uppercase bg-green-100/50 border-[0.5px] border-green-200 font-semibold font-sans">
                  ✓ Seluruh bahan baku berada dalam kondisi aman.
                </div>
              ) : (
                <div className="space-y-3 font-sans">
                  {stats.warningMaterials.map((material: any) => {
                    const isRed = material.warningType === 'EXPIRED' || material.warningType === 'OUT_OF_STOCK'
                    return (
                      <Link
                        key={material.id}
                        to="/materials"
                        search={{ search: material.sku }}
                        className="block bg-gallery-base hover:bg-gallery-base/80 border-[0.5px] border-gallery-line p-3 transition-all no-underline group focus-ring"
                        aria-label={`Bahan ${material.name}, SKU ${material.sku}. Status: ${
                          material.warningType === 'EXPIRED' ? 'Kedaluwarsa' :
                          material.warningType === 'OUT_OF_STOCK' ? 'Stok Habis' :
                          material.warningType === 'ALMOST_EXPIRED' ? 'Hampir Kedaluwarsa' : 'Stok Menipis'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold tracking-wider uppercase bg-gallery-dark text-gallery-base px-1.5 py-0.5">
                                {material.sku}
                              </span>
                              <span className="text-[10px] font-bold tracking-wider uppercase text-gallery-muted bg-gallery-split border-[0.5px] border-gallery-line px-1 py-0.5">
                                {material.type}
                              </span>
                            </div>
                            <div className="text-xs font-serif font-bold uppercase mt-1.5 text-gallery-dark group-hover:text-gallery-dark/70">
                              {material.name}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className={`text-xs font-bold ${isRed ? 'text-red-700' : 'text-amber-700'}`}>
                              {material.warningType === 'LOW_STOCK' ? `${material.stock} ${material.unit}` : material.message}
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 tracking-widest uppercase mt-1 inline-block border ${
                              isRed 
                                ? 'bg-red-100 text-red-800 border-red-200/50' 
                                : 'bg-amber-100 text-amber-800 border-amber-200/50'
                            }`}>
                              {material.warningType === 'EXPIRED' ? 'Expired' :
                               material.warningType === 'OUT_OF_STOCK' ? 'Habis' :
                               material.warningType === 'ALMOST_EXPIRED' ? 'Hampir Exp' : 'Menipis'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

          {/* Section: Recent Stock History */}
          <div className="border-[0.5px] border-gallery-line bg-gallery-split p-6">
            <div className="border-b-[0.5px] border-gallery-line pb-3 mb-4 flex justify-between items-center">
              <h3 className="text-xs font-serif tracking-widest text-gallery-dark uppercase font-semibold">
                LOG AKTIVITAS (7 HARI: {stats.logsLast7Days} LOG)
              </h3>
              <Link to="/logs" className="text-[10px] font-bold uppercase tracking-widest text-gallery-muted hover:text-gallery-dark flex items-center gap-1 transition-colors focus-ring">
                RIWAYAT <ArrowRight size={10} aria-hidden="true" />
              </Link>
            </div>

            {stats.recentLogs.length === 0 ? (
              <div className="p-6 text-center text-xs tracking-wider text-gallery-muted uppercase border-[0.5px] border-dashed border-gallery-line font-semibold">
                Belum ada catatan aktivitas perubahan stok.
              </div>
            ) : (
              <div className="space-y-4 font-sans">
                {stats.recentLogs.map((log) => {
                  const formattedDate = new Date(log.createdAt).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  const isPositive = log.quantity > 0
                  return (
                    <div key={log.id} className="text-xs border-b border-gallery-line/50 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between text-gallery-muted font-bold text-[10px] uppercase tracking-wide">
                        <span>{formattedDate}</span>
                        <span className={`px-1.5 py-0.5 font-bold ${
                          log.type === 'INCOMING' ? 'bg-green-50 text-green-800' :
                          log.type === 'OUTGOING' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'
                        }`}>
                          {log.type === 'INCOMING' ? 'MASUK' : log.type === 'OUTGOING' ? 'KELUAR' : 'PENYESUAIAN'}
                        </span>
                      </div>
                      <div className="mt-1.5 flex justify-between items-baseline gap-2">
                        <span className="font-serif text-gallery-dark uppercase font-bold text-xs truncate">
                          {log.material.name}
                        </span>
                        <span className={`font-bold shrink-0 ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
                          {isPositive ? `+${log.quantity}` : log.quantity}{' '}
                          <span className="text-[10px] text-gallery-muted font-semibold uppercase">{log.material.unit}</span>
                        </span>
                      </div>
                      {log.notes && (
                        <div className="mt-1 text-[11px] text-gallery-muted italic leading-relaxed">
                          "{log.notes}"
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
