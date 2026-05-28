import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { getStockLogs } from '../lib/logs.functions'
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  Settings,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react'

const logsSearchSchema = z.object({
  type: z.string().optional(),
})

export const Route = createFileRoute('/logs')({
  validateSearch: logsSearchSchema,
  loaderDeps: ({ search }) => ({
    type: search.type,
  }),
  loader: async ({ deps }) => {
    const logs = await getStockLogs({ data: { type: deps.type } })
    return { logs }
  },
  component: LogsPage,
})

function LogsPage() {
  const { logs } = Route.useLoaderData()
  const searchParams = useSearch({ from: '/logs' })
  const navigate = useNavigate()

  // Calculate quick stats from loaded logs
  const totalLogs = logs.length
  const incomingCount = logs.filter(l => l.type === 'INCOMING').length
  const outgoingCount = logs.filter(l => l.type === 'OUTGOING').length
  const adjustmentCount = logs.filter(l => l.type === 'ADJUSTMENT').length

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
        return next
      }
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
          <p className="text-xs text-gallery-muted tracking-wide font-medium mt-1">
            CATATAN MASUK DAN KELUAR BAHAN BAKU SECARA REAL-TIME
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex gap-2 border-b-[0.5px] border-gallery-line pb-4 overflow-x-auto">
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
                onClick={() => handleTypeFilter(btn.value)}
                className={`px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase border-[0.5px] transition-all whitespace-nowrap ${
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
          <div className="border-[0.5px] border-gallery-line border-dashed p-12 text-center text-xs tracking-wider text-gallery-muted uppercase font-semibold">
            Belum ada catatan perubahan stok untuk jenis ini.
          </div>
        ) : (
          <div className="border-[0.5px] border-gallery-line bg-gallery-split overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b-[0.5px] border-gallery-line bg-gallery-base/40 text-[9px] font-bold uppercase tracking-widest text-gallery-muted">
                  <th className="py-3 px-4 font-bold">Waktu</th>
                  <th className="py-3 px-4 font-bold">Jenis</th>
                  <th className="py-3 px-4 font-bold">SKU</th>
                  <th className="py-3 px-4 font-bold">Nama Bahan</th>
                  <th className="py-3 px-4 font-bold text-right">Jumlah</th>
                  <th className="py-3 px-4 font-bold">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gallery-line text-xs font-semibold text-gallery-dark">
                {logs.map((log) => {
                  const formattedDate = new Date(log.createdAt).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })

                  return (
                    <tr key={log.id} className="hover:bg-gallery-base/40 transition-colors">
                      <td className="py-3 px-4 text-gallery-muted font-normal whitespace-nowrap">{formattedDate}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 ${
                          log.type === 'INCOMING' ? 'bg-green-100 text-green-800' :
                          log.type === 'OUTGOING' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {log.type === 'INCOMING' ? 'MASUK' : log.type === 'OUTGOING' ? 'KELUAR' : 'PENYESUAIAN'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold tracking-wide uppercase font-sans">{log.material.sku}</td>
                      <td className="py-3 px-4 font-serif text-[13px]">{log.material.name}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-bold font-sans ${
                          log.quantity > 0 ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                          <span className="text-[10px] font-semibold text-gallery-muted ml-0.5 uppercase">
                            {log.material.unit}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gallery-muted font-medium italic min-w-[200px] leading-relaxed">
                        {log.notes || 'Tidak ada catatan tambahan.'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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
                <History size={16} className="text-gallery-muted" />
                <span className="text-xs font-bold text-gallery-muted uppercase tracking-wider">TOTAL CATATAN</span>
              </div>
              <span className="text-lg font-serif font-bold text-gallery-dark">{totalLogs}</span>
            </div>

            {/* Intakes count */}
            <div className="flex items-center justify-between border-b-[0.5px] border-gallery-line pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-green-700" />
                <span className="text-xs font-bold text-gallery-muted uppercase tracking-wider">TOTAL STOK MASUK</span>
              </div>
              <span className="text-lg font-serif font-bold text-green-700">{incomingCount}</span>
            </div>

            {/* Usage count */}
            <div className="flex items-center justify-between border-b-[0.5px] border-gallery-line pb-3">
              <div className="flex items-center gap-2">
                <TrendingDown size={16} className="text-red-700" />
                <span className="text-xs font-bold text-gallery-muted uppercase tracking-wider">TOTAL STOK KELUAR</span>
              </div>
              <span className="text-lg font-serif font-bold text-red-700">{outgoingCount}</span>
            </div>

            {/* Audit adjustments count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-yellow-700" />
                <span className="text-xs font-bold text-gallery-muted uppercase tracking-wider">TOTAL PENYESUAIAN</span>
              </div>
              <span className="text-lg font-serif font-bold text-yellow-700">{adjustmentCount}</span>
            </div>

          </div>

          <div className="text-[10px] text-gallery-muted uppercase tracking-wide leading-relaxed border-t-[0.5px] border-gallery-line pt-4 font-semibold">
            Penyesuaian dicatat secara otomatis setiap kali stok didaftarkan atau diperbarui oleh admin internal.
          </div>
        </div>

      </div>
    </div>
  )
}
