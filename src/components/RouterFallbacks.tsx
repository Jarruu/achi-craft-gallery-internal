import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export function DefaultPendingComponent() {
  return (
    <div className="space-y-8 animate-pulse p-2">
      {/* Skeleton Page Header */}
      <div className="border-b-[0.5px] border-gallery-line pb-4 space-y-2">
        <div className="h-8 w-64 skeleton-bone" />
        <div className="h-4 w-96 skeleton-bone" />
      </div>

      {/* Skeleton KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-[0.5px] border-gallery-line bg-gallery-split p-6 space-y-3" style={{ minHeight: '120px' }}>
            <div className="h-3 w-24 skeleton-bone" />
            <div className="h-10 w-16 skeleton-bone" />
            <div className="h-3 w-40 skeleton-bone" />
          </div>
        ))}
      </div>

      {/* Skeleton Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left main content skeleton */}
        <div className="lg:col-span-8 space-y-6">
          <div className="border-[0.5px] border-gallery-line bg-gallery-split p-6 space-y-4">
            <div className="h-4 w-32 skeleton-bone" />
            <div className="border-t-[0.5px] border-gallery-line pt-4 space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex justify-between items-center py-2 border-b-[0.5px] border-gallery-line">
                  <div className="space-y-1">
                    <div className="h-4 w-48 skeleton-bone" />
                    <div className="h-3 w-32 skeleton-bone" />
                  </div>
                  <div className="h-6 w-16 skeleton-bone" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar content skeleton */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border-[0.5px] border-gallery-line bg-gallery-split p-6 space-y-4">
            <div className="h-5 w-40 skeleton-bone" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((k) => (
                <div key={k} className="h-12 w-full skeleton-bone" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DefaultErrorComponent({ error, reset }: { error: any; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center rise-in">
      <div className="border-[0.5px] border-gallery-dark bg-gallery-split p-8 max-w-md space-y-6">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-700">
            <AlertTriangle size={24} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="font-serif text-2xl tracking-tight text-gallery-dark uppercase">
            Terjadi Kesalahan
          </h2>
          <p className="text-xs text-gallery-muted leading-relaxed font-semibold">
            Sistem gagal memuat data. Ini bisa disebabkan oleh gangguan koneksi basis data atau sesi Anda telah kedaluwarsa.
          </p>
        </div>

        {error?.message && (
          <div className="p-3 bg-gallery-base border-[0.5px] border-gallery-line text-left rounded-md">
            <p className="text-[10px] font-mono text-red-700 break-words leading-normal">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-gallery-dark text-gallery-base hover:opacity-90 active:scale-95 duration-150 cursor-pointer focus-ring"
          >
            <RefreshCw size={12} />
            Coba Lagi
          </button>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider border-[0.5px] border-gallery-line bg-gallery-base text-gallery-dark hover:border-gallery-dark active:scale-95 duration-150 cursor-pointer no-underline focus-ring"
          >
            <Home size={12} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}

export function DefaultNotFoundComponent() {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center p-6 text-center rise-in">
      <div className="border-[0.5px] border-gallery-dark bg-gallery-split p-10 max-w-md space-y-6">
        <h2 className="font-serif text-5xl text-gallery-dark">404</h2>
        <div className="space-y-2">
          <h3 className="font-serif text-lg tracking-wider text-gallery-dark uppercase">
            Halaman Tidak Ditemukan
          </h3>
          <p className="text-xs text-gallery-muted leading-relaxed font-semibold">
            Tautan yang Anda tuju salah atau halaman telah dihapus dari sistem inventaris internal.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider bg-gallery-dark text-gallery-base hover:opacity-90 active:scale-95 duration-150 cursor-pointer no-underline focus-ring"
          >
            <Home size={12} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
