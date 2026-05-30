import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { loginUser } from '../lib/auth.functions'
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import achiLogo from '../assets/achi-logo-1.jpg'
import artGallery60 from '../assets/art-gallery-60-1.png'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const search: any = useSearch({ from: '/login' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await loginUser({ data: { email, password } })
      if (res && res.success) {
        // Set cookies
        document.cookie = `acg_session=${encodeURIComponent(res.email)}; path=/; max-age=86400; SameSite=Lax`
        
        toast.success('Masuk Sukses', {
          description: `Selamat datang kembali, ${res.email}`,
        })

        // Redirect to intended url or home
        const redirectUrl = search.redirect || '/'
        navigate({ to: redirectUrl })
      }
    } catch (err: any) {
      setError(err.message || 'Email atau password salah. Coba lagi.')
      toast.error('Gagal Masuk', {
        description: err.message || 'Silakan periksa kembali email dan kata sandi Anda.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-gallery-base">
      
      {/* LEFT PANEL: Branding & Editorial Showcase (7/12) */}
      <div className="hidden lg:flex lg:col-span-7 bg-[#2E2D31] text-[#F3F1F1] p-16 flex-col justify-between relative overflow-hidden">
        {/* Background Image between bg and content (z-0, opacity 1) */}
        <img 
          src={artGallery60} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none select-none z-0"
        />

        {/* Subtle geometric grid background overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none z-0">
          <div className="w-full h-full border-r-[0.5px] border-b-[0.5px] border-[#F3F1F1] grid grid-cols-6 grid-rows-6" />
        </div>

        {/* Top brand label */}
        <div className="z-10 flex items-center gap-3">
          <img 
            src={achiLogo} 
            alt="Achi Logo" 
            className="w-10 h-10 object-contain" 
          />
          <div>
            <div className="text-xs font-serif tracking-widest text-[#F3F1F1] mt-0.5 uppercase">
              ACHI CRAFT GALERY
            </div>
          </div>
        </div>

        {/* Large Display Typography */}
        <div className="z-10 space-y-6 max-w-xl my-auto">
          <h2 className="text-5xl font-serif leading-tight tracking-tight text-white">
            Kemewahan dan Estetika Dimulai dari <span className="italic text-[#8E8E93] font-normal">Detail Terkecil</span>.
          </h2>
        </div>
      </div>

      {/* RIGHT PANEL: Login Form Container (5/12) */}
      <div className="flex flex-col justify-center items-center lg:col-span-5 p-8 sm:p-12 md:p-16 relative">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header Mobile / Brand info */}
          <div className="space-y-2 lg:space-y-0">
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <img 
                src={achiLogo} 
                alt="Achi Logo" 
                className="w-10 h-10 object-contain" 
              />
              <div>
                <div className="text-xs font-serif tracking-widest text-gallery-dark uppercase mt-0.5">
                  ACHI CRAFT GALERY
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-serif tracking-tight text-gallery-dark">
              MASUK AKUN
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50/50 border-[0.5px] border-red-200 p-4 text-xs font-semibold text-red-700 flex items-start gap-2.5 duration-200 rise-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                  Alamat Email*
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gallery-muted" size={14} />
                  <input
                    type="email"
                    required
                    placeholder="e.g. adminacg@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gallery-split/30 border-[0.5px] border-gallery-line focus:border-gallery-dark pl-9 pr-4 py-2.5 text-xs text-gallery-dark focus:outline-none font-sans placeholder-gallery-muted/50 transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] uppercase tracking-[0.15em] text-gallery-muted font-bold block">
                    Kata Sandi*
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gallery-muted" size={14} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gallery-split/30 border-[0.5px] border-gallery-line focus:border-gallery-dark pl-9 pr-10 py-2.5 text-xs text-gallery-dark focus:outline-none font-sans placeholder-gallery-muted/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gallery-muted hover:text-gallery-dark transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gallery-dark text-gallery-base py-3 px-4 text-xs font-semibold uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>{isLoading ? 'Sedang Memproses...' : 'MASUK KE DASHBOARD'}</span>
              {!isLoading && <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 duration-200" />}
            </button>
          </form>

          {/* Helper details */}
          <div className="border-t-[0.5px] border-gallery-line pt-6 text-[9px] text-gallery-muted uppercase font-semibold text-center leading-relaxed">
            Hanya administrator terdaftar yang memiliki akses sistem ini.<br />
            Silakan hubungi tim IT Achi Craft Galery untuk pendaftaran.
          </div>
        </div>
      </div>
    </div>
  )
}
