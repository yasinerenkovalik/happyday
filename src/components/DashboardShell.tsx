import type { ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { SITE_NAME, useSeo } from '../lib/seo'
import { Icon } from './Icon'

export type ShellNavItem = {
  to: string
  label: string
  icon: string
  end?: boolean
  /** NavLink'in kendi eşleşmesine ek olarak aktif sayılacak adresler */
  match?: RegExp
}

/** Firma paneli ve yönetim panelinin ortak çerçevesi: masaüstünde yan menü, mobilde üst menü */
export function DashboardShell({
  subtitle,
  navItems,
  accountName,
  banners,
}: {
  subtitle: string
  navItems: ShellNavItem[]
  accountName?: string
  banners?: ReactNode
}) {
  const { logout } = useAuth()
  const { pathname } = useLocation()
  useSeo({ title: `${subtitle} | ${SITE_NAME}`, noindex: true })
  const isActive = (item: ShellNavItem, active: boolean) => active || (!!item.match && item.match.test(pathname))

  const linkClass = (on: boolean) =>
    `flex items-center gap-3 rounded-full px-4 py-2 text-label-md transition-colors ${
      on ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
    }`

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-surface-container-lowest p-4 shadow-[1px_0_12px_rgba(30,34,41,0.06)] md:flex">
        <Link to="/" className="mb-1 flex items-center gap-2 px-2">
          <Icon name="diamond" className="text-2xl text-secondary" />
          <span className="text-headline-sm tracking-tight text-primary">{SITE_NAME}</span>
        </Link>
        <p className="mb-6 px-2 text-label-sm tracking-widest text-on-surface-variant uppercase">{subtitle}</p>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive: active }) => linkClass(isActive(item, active))}>
              <Icon name={item.icon} className="text-lg" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-surface-variant pt-4">
          {accountName && <p className="truncate px-4 text-label-md text-primary">{accountName}</p>}
          <Link to="/" className={linkClass(false)}>
            <Icon name="open_in_new" className="text-lg" /> Siteyi gör
          </Link>
          <button type="button" onClick={logout} className={`${linkClass(false)} w-full`}>
            <Icon name="logout" className="text-lg" /> Çıkış yap
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 bg-surface-container-lowest/95 shadow-sm backdrop-blur md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/" className="flex items-center gap-1.5">
              <Icon name="diamond" className="text-xl text-secondary" />
              <span className="text-title-md text-primary">{SITE_NAME}</span>
            </Link>
            <button type="button" onClick={logout} className="text-label-md text-on-surface-variant">Çıkış</button>
          </div>
          <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={({ isActive: active }) => `${linkClass(isActive(item, active))} shrink-0 whitespace-nowrap`}>
                <Icon name={item.icon} className="text-base" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 p-4 md:p-8">
          {banners}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
