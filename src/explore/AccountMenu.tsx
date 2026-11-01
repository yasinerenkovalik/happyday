import { useState } from 'react'
import { Link } from 'react-router'
import { useCompany } from '../api/panel'
import { useAuth } from '../auth/useAuth'
import { Icon } from '../components/Icon'
import { Popover } from '../components/Popover'
import { uploadUrl } from '../lib/api'

const pillClass =
  'flex items-center gap-2 rounded-full bg-surface-container-lowest py-1.5 pr-1.5 shadow-soft transition-shadow hover:shadow-soft-lg'

const menuItems = [
  { to: '/panel', label: 'Mekanlarım', icon: 'storefront' },
  { to: '/panel/mekanlar/yeni', label: 'Yeni mekan ekle', icon: 'add_business' },
  { to: '/panel/mesajlar', label: 'Mesajlar', icon: 'mail' },
  { to: '/panel/firma', label: 'Firma bilgileri', icon: 'business' },
]

const adminItems = [
  { to: '/admin', label: 'Özet', icon: 'dashboard' },
  { to: '/admin/firmalar', label: 'Firmalar', icon: 'business' },
  { to: '/admin/mekanlar', label: 'Mekanlar', icon: 'storefront' },
  { to: '/admin/kullanicilar', label: 'Kullanıcılar', icon: 'group' },
  { to: '/admin/mesajlar', label: 'Mesajlar', icon: 'mail' },
]

/** Sağ üst köşe: giriş yapılmamışsa "Firma Girişi", giriş yapılmışsa firma ya da yönetici menüsü. */
export function AccountMenu() {
  const { session, status } = useAuth()

  // Oturum sorulurken "Firma Girişi" bir an görünüp kaybolmasın
  if (status === 'loading') return <span className="h-11 w-11 animate-pulse rounded-full bg-surface-container-lowest shadow-soft" />
  if (session?.role === 'Admin') return <AdminMenu />

  if (!session?.companyId) {
    return (
      <Link to="/giris" className={`${pillClass} pl-4`}>
        <span className="text-label-md text-primary">Firma Girişi</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container">
          <Icon name="person" className="text-lg text-on-surface-variant" />
        </span>
      </Link>
    )
  }

  return <CompanyMenu companyId={session.companyId} />
}

function CompanyMenu({ companyId }: { companyId: string }) {
  const { logout } = useAuth()
  const company = useCompany(companyId)
  const name = company.data?.name ?? 'Firmam'
  const photo = company.data?.coverPhotoPath

  return (
    <Popover
      align="right"
      panelClassName="w-72"
      trigger={({ open, toggle }) => (
        <button type="button" onClick={toggle} aria-expanded={open} aria-label="Hesap menüsü" className={`${pillClass} pl-1.5 sm:pl-4`}>
          <span className="hidden max-w-40 truncate text-label-md text-primary sm:block">{name}</span>
          <Avatar name={name} photo={photo} className="h-8 w-8 text-label-sm" />
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="mb-1 flex items-center gap-3 border-b border-surface-variant px-3 pt-2 pb-3">
            <Avatar name={name} photo={photo} className="h-11 w-11 text-label-md" />
            <div className="min-w-0">
              <p className="truncate text-title-md text-primary">{name}</p>
              <p className="truncate text-body-sm text-on-surface-variant">{company.data?.email}</p>
              {company.data && !company.data.isApproved && (
                <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-secondary-fixed/60 px-2 py-0.5 text-label-sm text-on-secondary-fixed">
                  <Icon name="hourglass_top" className="text-sm" /> Onay bekliyor
                </span>
              )}
            </div>
          </div>

          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={close}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-body-md text-on-surface hover:bg-surface-container"
            >
              <Icon name={item.icon} className="text-lg text-on-surface-variant" />
              {item.label}
            </Link>
          ))}

          <div className="my-1 border-t border-surface-variant" />
          <button
            type="button"
            onClick={() => {
              close()
              logout()
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-body-md text-on-surface hover:bg-surface-container"
          >
            <Icon name="logout" className="text-lg text-on-surface-variant" />
            Çıkış yap
          </button>
        </div>
      )}
    </Popover>
  )
}

function AdminMenu() {
  const { logout } = useAuth()

  return (
    <Popover
      align="right"
      panelClassName="w-64"
      trigger={({ open, toggle }) => (
        <button type="button" onClick={toggle} aria-expanded={open} aria-label="Hesap menüsü" className={`${pillClass} pl-1.5 sm:pl-4`}>
          <span className="hidden text-label-md text-primary sm:block">Yönetici</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary">
            <Icon name="shield_person" className="text-lg" />
          </span>
        </button>
      )}
    >
      {(close) => (
        <div>
          <p className="mb-1 border-b border-surface-variant px-3 pt-2 pb-3 text-title-md text-primary">Yönetim paneli</p>
          {adminItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={close}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-body-md text-on-surface hover:bg-surface-container">
              <Icon name={item.icon} className="text-lg text-on-surface-variant" />
              {item.label}
            </Link>
          ))}
          <div className="my-1 border-t border-surface-variant" />
          <button type="button" onClick={() => { close(); logout() }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-body-md text-on-surface hover:bg-surface-container">
            <Icon name="logout" className="text-lg text-on-surface-variant" />
            Çıkış yap
          </button>
        </div>
      )}
    </Popover>
  )
}

/** Firma kapak fotoğrafı; yoksa ya da yüklenemezse adın baş harfleri. */
function Avatar({ name, photo, className }: { name: string; photo: string | null | undefined; className: string }) {
  const [failed, setFailed] = useState(false)
  const src = uploadUrl(photo)

  if (src && !failed) {
    return <img src={src} alt="" onError={() => setFailed(true)} className={`${className} shrink-0 rounded-full object-cover`} />
  }

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toLocaleUpperCase('tr')

  return (
    <span aria-hidden="true" className={`${className} flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-on-primary`}>
      {initials}
    </span>
  )
}
