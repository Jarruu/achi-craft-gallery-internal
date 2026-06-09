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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'

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
  loader: async () => {
    const user = await getSessionUser()
    return { user }
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
        title: 'ACHI CRAFT GALERY — ADMIN INTERNAL',
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
  const { location, resolvedLocation } = useRouterState()
  const isLoginPage = (resolvedLocation?.pathname || location?.pathname || '') === '/login'
  const loaderData = Route.useLoaderData()
  const user = loaderData?.user

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  const handleLogout = () => {
    setIsLogoutDialogOpen(true)
  }

  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body className={`bg-gallery-base text-gallery-dark font-sans selection:bg-gallery-dark selection:text-gallery-base antialiased min-h-screen ${isLoginPage ? '' : 'flex flex-col md:flex-row'}`}>
        {isLoginPage ? (
          children
        ) : (
          <>
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-gallery-split border-r-[0.5px] border-gallery-line shrink-0 z-30">
              {/* Logo & Branding */}
              <div className="p-8 pb-6 flex items-center gap-3.5 group/logo cursor-default">
                <img 
                  src={achiLogo} 
                  alt="Achi Craft Galery Logo" 
                  className="w-12 h-12 object-contain shrink-0 transition-transform duration-500 group-hover/logo:scale-105" 
                />
                <div>
                  <h1 className="text-sm font-serif tracking-tight text-gallery-dark mt-0.5 uppercase leading-tight transition-colors duration-300 group-hover/logo:text-black">
                    ACHI CRAFT GALERY
                  </h1>
                </div>
              </div>
              
              {/* Geometric border division */}
              <div className="border-b-[0.5px] border-gallery-line w-full" />
              
              {/* Navigation Links */}
              <nav className="flex-1 py-8 flex flex-col gap-1">
                <Link 
                  to="/" 
                  className="group no-underline flex items-center gap-3.5 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gallery-muted hover:text-gallery-dark transition-all duration-300 hover:bg-gallery-base/30 border-l-[3px] border-transparent hover:translate-x-1"
                  activeProps={{ className: 'text-gallery-dark border-gallery-dark bg-gallery-base/50 translate-x-1' }}
                  activeOptions={{ exact: true }}
                >
                  <LayoutDashboard size={16} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2" />
                  <span className="transition-colors duration-300">Dashboard</span>
                </Link>
                <Link 
                  to="/materials" 
                  className="group no-underline flex items-center gap-3.5 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gallery-muted hover:text-gallery-dark transition-all duration-300 hover:bg-gallery-base/30 border-l-[3px] border-transparent hover:translate-x-1"
                  activeProps={{ className: 'text-gallery-dark border-gallery-dark bg-gallery-base/50 translate-x-1' }}
                >
                  <Layers size={16} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2" />
                  <span className="transition-colors duration-300">Bahan Baku</span>
                </Link>
                <Link 
                  to="/products" 
                  className="group no-underline flex items-center gap-3.5 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gallery-muted hover:text-gallery-dark transition-all duration-300 hover:bg-gallery-base/30 border-l-[3px] border-transparent hover:translate-x-1"
                  activeProps={{ className: 'text-gallery-dark border-gallery-dark bg-gallery-base/50 translate-x-1' }}
                >
                  <Cpu size={16} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2" />
                  <span className="transition-colors duration-300">Daftar Produk</span>
                </Link>
                <Link 
                  to="/logs" 
                  className="group no-underline flex items-center gap-3.5 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gallery-muted hover:text-gallery-dark transition-all duration-300 hover:bg-gallery-base/30 border-l-[3px] border-transparent hover:translate-x-1"
                  activeProps={{ className: 'text-gallery-dark border-gallery-dark bg-gallery-base/50 translate-x-1' }}
                >
                  <History size={16} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2" />
                  <span className="transition-colors duration-300">Riwayat Stok</span>
                </Link>
              </nav>
              
              {/* Sidebar Footer Profile */}
              <div className="p-6 border-t-[0.5px] border-gallery-line flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 group/profile cursor-pointer">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full border-[0.5px] border-gallery-line bg-gallery-dark flex items-center justify-center text-[#F3F1F1] shrink-0 font-serif text-xs font-semibold select-none transition-all duration-300 group-hover/profile:scale-105 group-hover/profile:rotate-6">
                      {user ? user.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] uppercase tracking-[0.1em] text-gallery-muted font-bold">Logged in as</span>
                      <span className="text-xs font-semibold text-gallery-dark truncate max-w-[130px] font-sans transition-colors duration-300 group-hover/profile:text-black" title={user || 'Administrator'}>
                        {user || 'Administrator'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="p-2 border-[0.5px] border-gallery-line hover:border-red-700 hover:text-red-700 hover:scale-105 active:scale-95 transition-all duration-300 text-gallery-muted cursor-pointer flex items-center justify-center shrink-0"
                    title="Keluar"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
                
                {/* Copyright info */}
                <div className="text-[8px] tracking-[0.2em] text-gallery-muted uppercase font-bold opacity-60">
                  © {new Date().getFullYear()} ACG • PADANG
                </div>
              </div>
            </aside>

            {/* MOBILE STICKY HEADER */}
            <header className="md:hidden flex items-center justify-between px-6 py-4 bg-gallery-base/90 backdrop-blur-md border-b-[0.5px] border-gallery-line sticky top-0 z-40 shrink-0">
              <div className="flex items-center gap-2.5 group/logo cursor-default">
                <img 
                  src={achiLogo} 
                  alt="Achi Logo" 
                  className="w-8 h-8 object-contain shrink-0 transition-transform duration-500 group-hover/logo:scale-105" 
                />
                <div>
                  <h1 className="text-xs font-serif tracking-tight text-gallery-dark uppercase mt-0.5 leading-tight transition-colors duration-300 group-hover/logo:text-black">
                    ACHI CRAFT GALERY
                  </h1>
                </div>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 border-[0.5px] border-gallery-line bg-gallery-split hover:border-gallery-dark hover:scale-105 active:scale-95 transition-all text-gallery-dark cursor-pointer flex items-center justify-center"
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
                    <div className="flex items-center gap-3 group/logo cursor-default">
                      <img 
                        src={achiLogo} 
                        alt="Achi Logo" 
                        className="w-10 h-10 object-contain shrink-0 transition-transform duration-500 group-hover/logo:scale-105" 
                      />
                      <div>
                        <div className="text-[8px] uppercase tracking-[0.18em] text-gallery-muted font-bold leading-tight">
                          SISTEM INVENTARIS
                        </div>
                        <h1 className="text-sm font-serif tracking-tight text-gallery-dark uppercase mt-0.5 leading-tight transition-colors duration-300 group-hover/logo:text-black">
                          ACHI CRAFT GALERY
                        </h1>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 border-[0.5px] border-gallery-line hover:border-gallery-dark hover:scale-105 active:scale-95 transition-all text-gallery-dark cursor-pointer flex items-center justify-center"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="border-b-[0.5px] border-gallery-line w-full" />
                  
                  <nav className="flex-1 py-6 flex flex-col gap-1">
                    <Link 
                      to="/" 
                      className="group no-underline flex items-center gap-3 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gallery-muted hover:text-gallery-dark transition-all duration-300 hover:bg-gallery-base/30 border-l-[3px] border-transparent hover:translate-x-1"
                      activeProps={{ className: 'text-gallery-dark border-gallery-dark bg-gallery-base/50 translate-x-1' }}
                      activeOptions={{ exact: true }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LayoutDashboard size={14} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2" />
                      <span className="transition-colors duration-300">Dashboard</span>
                    </Link>
                    <Link 
                      to="/materials" 
                      className="group no-underline flex items-center gap-3 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gallery-muted hover:text-gallery-dark transition-all duration-300 hover:bg-gallery-base/30 border-l-[3px] border-transparent hover:translate-x-1"
                      activeProps={{ className: 'text-gallery-dark border-gallery-dark bg-gallery-base/50 translate-x-1' }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Layers size={14} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2" />
                      <span className="transition-colors duration-300">Bahan Baku</span>
                    </Link>
                    <Link 
                      to="/products" 
                      className="group no-underline flex items-center gap-3 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gallery-muted hover:text-gallery-dark transition-all duration-300 hover:bg-gallery-base/30 border-l-[3px] border-transparent hover:translate-x-1"
                      activeProps={{ className: 'text-gallery-dark border-gallery-dark bg-gallery-base/50 translate-x-1' }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Cpu size={14} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2" />
                      <span className="transition-colors duration-300">Daftar Produk</span>
                    </Link>
                    <Link 
                      to="/logs" 
                      className="group no-underline flex items-center gap-3 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gallery-muted hover:text-gallery-dark transition-all duration-300 hover:bg-gallery-base/30 border-l-[3px] border-transparent hover:translate-x-1"
                      activeProps={{ className: 'text-gallery-dark border-gallery-dark bg-gallery-base/50 translate-x-1' }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <History size={14} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2" />
                      <span className="transition-colors duration-300">Riwayat Stok</span>
                    </Link>
                  </nav>
                  
                  {/* Mobile Drawer Footer Profile */}
                  <div className="p-6 border-t-[0.5px] border-gallery-line flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 group/profile cursor-pointer">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full border-[0.5px] border-gallery-line bg-gallery-dark flex items-center justify-center text-[#F3F1F1] shrink-0 font-serif text-xs font-semibold select-none transition-all duration-300 group-hover/profile:scale-105 group-hover/profile:rotate-6">
                          {user ? user.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] uppercase tracking-[0.1em] text-gallery-muted font-bold">Logged in as</span>
                          <span className="text-xs font-semibold text-gallery-dark truncate max-w-[130px] font-sans transition-colors duration-300 group-hover/profile:text-black" title={user || 'Administrator'}>
                            {user || 'Administrator'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          handleLogout()
                        }}
                        className="p-2 border-[0.5px] border-gallery-line hover:border-red-700 hover:text-red-700 hover:scale-105 active:scale-95 transition-all duration-300 text-gallery-muted cursor-pointer flex items-center justify-center shrink-0"
                        title="Keluar"
                      >
                        <LogOut size={14} />
                      </button>
                    </div>
                    
                    {/* Copyright info */}
                    <div className="text-[8px] tracking-[0.2em] text-gallery-muted uppercase font-bold opacity-60">
                      © {new Date().getFullYear()} ACG • PADANG
                    </div>
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
          </>
        )}

        <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
          <DialogContent className="max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Konfirmasi Keluar</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin keluar dari sistem inventaris Achi Craft Galery? Kredensial masuk Anda akan dihapus dari peramban ini.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex sm:justify-end gap-2">
              <button
                onClick={() => setIsLogoutDialogOpen(false)}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border-[0.5px] border-gallery-line bg-gallery-split hover:bg-gallery-base text-gallery-muted hover:text-gallery-dark transition-all cursor-pointer font-sans"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setIsLogoutDialogOpen(false)
                  document.cookie = 'acg_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
                  window.location.href = '/login'
                }}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-destructive text-destructive-foreground hover:opacity-90 transition-all cursor-pointer font-sans"
              >
                Ya, Keluar
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster position="top-right" />
        <Scripts />
      </body>
    </html>
  )
}
