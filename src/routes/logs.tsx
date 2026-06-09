import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { z } from 'zod'
import { getStockLogs } from '../lib/logs.functions'
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  Settings
} from 'lucide-react'

const logsSearchSchema = z.object({
  type: z.string().optional(),
  page: z.number().catch(1).optional(),
  limit: z.number().catch(15).optional(),
})

export const Route = createFileRoute('/logs')({
  validateSearch: logsSearchSchema,
  loaderDeps: ({ search }) => ({
    type: search.type,
    page: search.page,
    limit: search.limit,
  }),
  loader: async ({ deps }) => {
    const page = deps.page || 1
    const limit = deps.limit || 15
    const result = await getStockLogs({ 
      data: { 
        type: deps.type,
        page,
        limit
      } 
    })
    return { 
      logs: result.items, 
      totalCount: result.totalCount,
      stats: result.stats,
      page,
      limit
    }
  },
  component: LogsPage,
})

function LogsPage() {
  const { logs, totalCount, stats, page, limit } = Route.useLoaderData()
  const searchParams = useSearch({ from: '/logs' })
  const navigate = useNavigate()

  const totalPages = Math.ceil(totalCount / limit)

  const handleTypeFilter = (type: string | undefined) => {
    navigate({
      to: '/logs',
      search: (prev) => {
        const next = { ...prev }
        if (type) {
          next.type = type
        } else {
          delete next.type
        }
        next.page = 1
        return next
      }
    })
  }

  const handlePageChange = (newPage: number) => {
    navigate({
      to: '/logs',
      search: (prev) => ({
        ...prev,
        page: newPage
      })
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start rise-in">
      
      {/* LEFT COLUMN: Logs Table / List (8/12) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Section Title */}
        <div className="border-b-[0.5px] border-gallery-line pb-4">
          <h2 className="text-3xl font-serif tracking-tight text-gallery-dark uppercase">
            RIWAYAT PERUBAHAN STOK
          </h2>
          <p className="text-xs text-gallery-muted tracking-wide font-semibold mt-1 uppercase">
            Catatan masuk dan keluar bahan baku secara real-time
          </p>
        </div>

        {/* Filter Toolbar */}
        <div role="tablist" aria-label="Filter Tipe Log" className="flex gap-2 border-b-[0.5px] border-gallery-line pb-4 overflow-x-auto">
          {[
            { label: 'SEMUA RIWAYAT', value: undefined },
            { label: 'BARANG MASUK', value: 'INCOMING' },
            { label: 'BARANG KELUAR', value: 'OUTGOING' },
            { label: 'PENYESUAIAN STOK', value: 'ADJUSTMENT' },
          ].map((btn) => {
            const isActive = searchParams.type === btn.value
            return (
              <button
                key={btn.label}
                role="tab"
                aria-selected={isActive}
                aria-controls="logs-table-container"
                onClick={() => handleTypeFilter(btn.value)}
                className={`px-3.5 py-2 text-[11px] font-bold tracking-wider uppercase border-[0.5px] transition-all whitespace-nowrap focus-ring cursor-pointer ${
                  isActive 
                    ? 'bg-gallery-dark text-gallery-base border-gallery-dark' 
                    : 'bg-gallery-split text-gallery-muted border-gallery-line hover:border-gallery-dark/60 hover:text-gallery-dark'
                }`}
              >
                {btn.label}
              </button>
            )
          })}
        </div>

        {/* Audit List */}
        {logs.length === 0 ? (
          <div className="border-[0.5px] border-gallery-line border-dashed p-12 text-center text-xs tracking-wider text-gallery-muted uppercase font-bold bg-gallery-split/20">
            Belum ada catatan perubahan stok untuk jenis ini.
          </div>
        ) : (
          <div id="logs-table-container" role="tabpanel" className="space-y-4">
            <div className="border-[0.5px] border-gallery-line bg-gallery-split overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b-[0.5px] border-gallery-line bg-gallery-base/40 text-[10px] font-bold uppercase tracking-widest text-gallery-muted">
                    <th className="py-3 px-4 font-bold">Waktu</th>
                    <th className="py-3 px-4 font-bold">Jenis</th>
                    <th className="py-3 px-4 font-bold">SKU</th>
                    <th className="py-3 px-4 font-bold">Nama Bahan</th>
                    <th className="py-3 px-4 font-bold text-right">Jumlah</th>
                    <th className="py-3 px-4 font-bold">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gallery-line text-xs font-semibold text-gallery-dark font-sans">
                  {logs.map((log) => {
                    const formattedDate = new Date(log.createdAt).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })

                    return (
                      <tr key={log.id} className="hover:bg-gallery-base/40 transition-colors">
                        <td className="py-3 px-4 text-gallery-muted font-normal whitespace-nowrap">{formattedDate}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                            log.type === 'INCOMING' ? 'bg-green-50 text-green-800 border-green-200/50' :
                            log.type === 'OUTGOING' ? 'bg-red-50 text-red-850 border-red-200/50' : 'bg-yellow-50 text-yellow-800 border-yellow-200/50'
                          }`}>
                            {log.type === 'INCOMING' ? 'MASUK' : log.type === 'OUTGOING' ? 'KELUAR' : 'PENYESUAIAN'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold tracking-wide uppercase">{log.material.sku}</td>
                        <td className="py-3 px-4 font-serif text-[13px] font-bold">{log.material.name}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-bold ${
                            log.quantity > 0 ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                            <span className="text-[10px] font-semibold text-gallery-muted ml-0.5 uppercase">
                              {log.material.unit}
                            </span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gallery-muted font-medium italic min-w-[200px] leading-relaxed">
                          {log.notes || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between border-[0.5px] border-gallery-line bg-gallery-split p-4 gap-3 text-xs font-semibold text-gallery-dark">
                <span className="text-[10px] uppercase tracking-widest text-gallery-muted font-bold">
                  Halaman {page} dari {totalPages} (Total {totalCount} log)
                </span>
                
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="px-3 py-1.5 border-[0.5px] border-gallery-line bg-gallery-base hover:border-gallery-dark disabled:opacity-40 disabled:hover:border-gallery-line disabled:cursor-not-allowed transition-all uppercase tracking-widest text-[10px] font-bold cursor-pointer focus-ring"
                  >
                    Sebelumnya
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1
                    const isCurrent = pageNum === page
                    const isNear = Math.abs(pageNum - page) <= 1
                    const isBoundary = pageNum === 1 || pageNum === totalPages

                    if (isBoundary || isNear) {
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center border-[0.5px] transition-all text-[10px] font-bold cursor-pointer focus-ring ${
                            isCurrent
                              ? 'bg-gallery-dark text-gallery-base border-gallery-dark'
                              : 'bg-gallery-base border-gallery-line hover:border-gallery-dark'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    }

                    if (pageNum === 2 && page > 3) {
                      return <span key="ellipsis-start" className="text-gallery-muted px-1 select-none">...</span>
                    }
                    if (pageNum === totalPages - 1 && page < totalPages - 2) {
                      return <span key="ellipsis-end" className="text-gallery-muted px-1 select-none">...</span>
                    }

                    return null
                  })}

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => handlePageChange(page + 1)}
                    className="px-3 py-1.5 border-[0.5px] border-gallery-line bg-gallery-base hover:border-gallery-dark disabled:opacity-40 disabled:hover:border-gallery-line disabled:cursor-not-allowed transition-all uppercase tracking-widest text-[10px] font-bold cursor-pointer focus-ring"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: Ledger stats and summaries (4/12) */}
      <div className="lg:col-span-4 space-y-6">
        
        <div className="bg-gallery-split border-[0.5px] border-gallery-line p-6 space-y-5">
          <h3 className="font-serif text-lg tracking-tight text-gallery-dark uppercase border-b-[0.5px] border-gallery-line pb-2.5">
            RINGKASAN AKTIVITAS STOK
          </h3>

          <div className="space-y-4">
            
            {/* Total ledger rows */}
            <div className="flex items-center justify-between border-b-[0.5px] border-gallery-line pb-3">
              <div className="flex items-center gap-2">
                <History size={16} className="text-gallery-muted" aria-hidden="true" />
                <span className="text-xs font-bold text-gallery-muted uppercase tracking-wider">TOTAL CATATAN</span>
              </div>
              <span className="text-lg font-serif font-bold text-gallery-dark">{stats.totalCount}</span>
            </div>

            {/* Intakes count */}
            <div className="flex items-center justify-between border-b-[0.5px] border-gallery-line pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-green-700" aria-hidden="true" />
                <span className="text-xs font-bold text-gallery-muted uppercase tracking-wider">TOTAL STOK MASUK</span>
              </div>
              <span className="text-lg font-serif font-bold text-green-700">{stats.incomingCount}</span>
            </div>

            {/* Usage count */}
            <div className="flex items-center justify-between border-b-[0.5px] border-gallery-line pb-3">
              <div className="flex items-center gap-2">
                <TrendingDown size={16} className="text-red-700" aria-hidden="true" />
                <span className="text-xs font-bold text-gallery-muted uppercase tracking-wider">TOTAL STOK KELUAR</span>
              </div>
              <span className="text-lg font-serif font-bold text-red-700">{stats.outgoingCount}</span>
            </div>

            {/* Audit adjustments count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-yellow-750 font-bold" aria-hidden="true" style={{ color: '#D97706' }} />
                <span className="text-xs font-bold text-gallery-muted uppercase tracking-wider">TOTAL PENYESUAIAN</span>
              </div>
              <span className="text-lg font-serif font-bold text-yellow-700">{stats.adjustmentCount}</span>
            </div>

          </div>

          <div className="text-[11px] text-gallery-muted uppercase tracking-wide leading-relaxed border-t-[0.5px] border-gallery-line pt-4 font-bold">
            Penyesuaian dicatat secara otomatis setiap kali stok didaftarkan atau diperbarui oleh admin internal.
          </div>
        </div>

      </div>
    </div>
  )
}
