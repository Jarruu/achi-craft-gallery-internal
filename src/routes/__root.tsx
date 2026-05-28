import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
  redirect,
  useRouterState,
} from '@tanstack/react-router'
import { useState } from 'react'
import { Menu, X, Layers, Cpu, History, LayoutDashboard, LogOut } from 'lucide-react'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import achiLogo from '../assets/achi-logo-1.jpg'
import artGallery60 from '../assets/art-gallery-60-1.png'
import { getSessionUser } from '../lib/auth'
import { Toaster } from '../components/ui/sonner'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ location }) => {
    const user = await getSessionUser()

    if (location.pathname !== '/login') {
      if (!user) {
        throw redirect({
          to: '/login',
          search: {
            redirect: location.href,
          },
        })
      }
    } else {
      if (user) {
        throw redirect({
          to: '/',
        })
      }
    }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'ACHI CRAFT GALLERY — ADMIN INTERNAL',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { location } = useRouterState()
  const isLoginPage = location.pathname === '/login'

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      document.cookie = 'acg_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      window.location.href = '/login'
    }
  }

  if (isLoginPage) {
    return (
      <html lang="id">
        <head>
          <HeadContent />
        </head>
        <body className="bg-gallery-base text-gallery-dark font-sans selection:bg-gallery-dark selection:text-gallery-base antialiased min-h-screen">
          {children}
          <Toaster position="top-right" />
          <Scripts />
        </body>
      </html>
    )
  }

  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body className="bg-gallery-base text-gallery-dark font-sans selection:bg-gallery-dark selection:text-gallery-base antialiased min-h-screen flex flex-col md:flex-row">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-gallery-split border-r-[0.5px] border-gallery-line shrink-0 z-30">
          {/* Logo & Branding */}
          <div className="p-8 pb-6 flex items-center gap-3.5">
            <img 
              src={achiLogo} 
              alt="Achi Craft Gallery Logo" 
              className="w-12 h-12 object-cover border-[0.5px] border-gallery-line shrink-0" 
            />
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-gallery-muted font-bold leading-tight">
                INVENTARIS INTERNAL
              </div>
              <h1 className="text-sm font-serif tracking-tight text-gallery-dark mt-0.5 uppercase leading-tight">
                ACHI CRAFT GALLERY
              </h1>
            </div>
          </div>
          
          {/* Geometric border division */}
          <div className="border-b-[0.5px] border-gallery-line w-full" />
          
          {/* Navigation Links */}
          <nav className="flex-1 py-8 flex flex-col gap-1">
            <Link 
              to="/" 
              className="flex items-center gap-3.5 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gallery-muted hover:text-gallery-dark transition-all border-l-[3px] border-transparent"
              activeProps={{ className: 'text-gallery-dark border-gallery-dark bg-gallery-base/40' }}
              activeOptions={{ exact: true }}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/materials" 
              className="flex items-center gap-3.5 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gallery-muted hover:text-gallery-dark transition-all border-l-[3px] border-transparent"
              activeProps={{ className: 'text-gallery-dark border-gallery-dark bg-gallery-base/40' }}
            >
              <Layers size={16} />
              <span>Bahan Baku</span>
            </Link>
            <Link 
              to="/products" 
              className="flex items-center gap-3.5 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gallery-muted hover:text-gallery-dark transition-all border-l-[3px] border-transparent"
              activeProps={{ className: 'text-gallery-dark border-gallery-dark bg-gallery-base/40' }}
            >
              <Cpu size={16} />
              <span>Daftar Produk</span>
            </Link>
            <Link 
              to="/logs" 
              className="flex items-center gap-3.5 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gallery-muted hover:text-gallery-dark transition-all border-l-[3px] border-transparent"
              activeProps={{ className: 'text-gallery-dark border-gallery-dark bg-gallery-base/40' }}
            >
              <History size={16} />
              <span>Riwayat Stok</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3.5 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gallery-muted hover:text-red-700 transition-all border-l-[3px] border-transparent cursor-pointer w-full text-left"
            >
              <LogOut size={16} />
              <span>Keluar</span>
            </button>
          </nav>
          
          {/* Sidebar Footer */}
          <div className="p-8 border-t-[0.5px] border-gallery-line text-[9px] tracking-[0.25em] text-gallery-muted uppercase font-bold leading-relaxed">
            <div>© {new Date().getFullYear()} ACHI CRAFT GALLERY</div>
            <div className="mt-1 opacity-75 font-semibold text-[8px]">TOKYO & BANDUNG</div>
          </div>
        </aside>

        {/* MOBILE STICKY HEADER */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-gallery-base/90 backdrop-blur-md border-b-[0.5px] border-gallery-line sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-2.5">
            <img 
              src={achiLogo} 
              alt="Achi Logo" 
              className="w-8 h-8 object-cover border-[0.5px] border-gallery-line shrink-0" 
            />
            <div>
              <div className="text-[7.5px] uppercase tracking-[0.15em] text-gallery-muted font-bold leading-tight">
                INVENTARIS INTERNAL
              </div>
              <h1 className="text-xs font-serif tracking-tight text-gallery-dark uppercase mt-0.5 leading-tight">
                ACHI CRAFT GALLERY
              </h1>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 border-[0.5px] border-gallery-line bg-gallery-split hover:border-gallery-dark transition-colors text-gallery-dark cursor-pointer flex items-center justify-center"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </header>

        {/* MOBILE DRAWER SIDEBAR NAVIGATION OVERLAY */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-gallery-dark/25 backdrop-blur-xs transition-opacity duration-300" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Slide-out Panel */}
            <aside className="relative flex flex-col w-72 max-w-[80vw] h-full bg-gallery-split border-r-[0.5px] border-gallery-line rise-in shadow-xl">
              <div className="p-6 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={achiLogo} 
                    alt="Achi Logo" 
                    className="w-10 h-10 object-cover border-[0.5px] border-gallery-line shrink-0" 
                  />
                  <div>
                    <div className="text-[8px] uppercase tracking-[0.18em] text-gallery-muted font-bold leading-tight">
                      SISTEM INVENTARIS
                    </div>
                    <h1 className="text-sm font-serif tracking-tight text-gallery-dark uppercase mt-0.5 leading-tight">
                      ACHI CRAFT GALLERY
                    </h1>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 border-[0.5px] border-gallery-line hover:border-gallery-dark transition-colors text-gallery-dark cursor-pointer flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="border-b-[0.5px] border-gallery-line w-full" />
              
              <nav className="flex-1 py-6 flex flex-col gap-1">
                <Link 
                  to="/" 
                  className="flex items-center gap-3 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gallery-muted hover:text-gallery-dark transition-all border-l-[3px] border-transparent"
                  activeProps={{ className: 'text-gallery-dark border-gallery-dark bg-gallery-base/40' }}
                  activeOptions={{ exact: true }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LayoutDashboard size={14} />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/materials" 
                  className="flex items-center gap-3 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gallery-muted hover:text-gallery-dark transition-all border-l-[3px] border-transparent"
                  activeProps={{ className: 'text-gallery-dark border-gallery-dark bg-gallery-base/40' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Layers size={14} />
                  <span>Bahan Baku</span>
                </Link>
                <Link 
                  to="/products" 
                  className="flex items-center gap-3 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gallery-muted hover:text-gallery-dark transition-all border-l-[3px] border-transparent"
                  activeProps={{ className: 'text-gallery-dark border-gallery-dark bg-gallery-base/40' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Cpu size={14} />
                  <span>Daftar Produk</span>
                </Link>
                <Link 
                  to="/logs" 
                  className="flex items-center gap-3 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gallery-muted hover:text-gallery-dark transition-all border-l-[3px] border-transparent"
                  activeProps={{ className: 'text-gallery-dark border-gallery-dark bg-gallery-base/40' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <History size={14} />
                  <span>Riwayat Stok</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    handleLogout()
                  }}
                  className="flex items-center gap-3 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gallery-muted hover:text-red-700 transition-all border-l-[3px] border-transparent cursor-pointer w-full text-left"
                >
                  <LogOut size={14} />
                  <span>Keluar</span>
                </button>
              </nav>
              
              <div className="p-6 border-t-[0.5px] border-gallery-line text-[9px] tracking-[0.2em] text-gallery-muted uppercase font-bold leading-relaxed">
                <div>© {new Date().getFullYear()} ACHI CRAFT GALLERY</div>
                <div className="mt-1 opacity-75 font-semibold text-[8px]">TOKYO & BANDUNG</div>
              </div>
            </aside>
          </div>
        )}

        {/* MAIN CONTENT AREA WITH DECORATION */}
        <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
          {/* Clear geometric art-gallery background decoration - full screen, 50% opacity, fixed position */}
          <img 
            src={artGallery60} 
            alt="" 
            className="fixed inset-0 w-full h-full object-cover opacity-[0.5] pointer-events-none select-none z-0 mix-blend-multiply"
          />
          
          <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto relative z-10">
            {children}
          </main>
        </div>

        <Toaster position="top-right" />
        <Scripts />
      </body>
    </html>
  )
}
