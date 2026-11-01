import { DashboardShell, type ShellNavItem } from '../components/DashboardShell'

const navItems: ShellNavItem[] = [
  { to: '/admin', label: 'Özet', icon: 'dashboard', end: true },
  { to: '/admin/firmalar', label: 'Firmalar', icon: 'business', end: true },
  { to: '/admin/mekanlar', label: 'Mekanlar', icon: 'storefront', end: true },
  { to: '/admin/kullanicilar', label: 'Kullanıcılar', icon: 'group', end: true },
  { to: '/admin/mesajlar', label: 'Mesajlar', icon: 'mail', end: true },
]

export function AdminLayout() {
  return <DashboardShell subtitle="Yönetim Paneli" navItems={navItems} accountName="Yönetici" />
}
