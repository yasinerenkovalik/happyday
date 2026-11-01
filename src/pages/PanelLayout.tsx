import { useCompany } from '../api/panel'
import { useCompanySession } from '../auth/useAuth'
import { DashboardShell, type ShellNavItem } from '../components/DashboardShell'
import { Icon } from '../components/Icon'
import { ResendVerification } from '../components/ResendVerification'

const navItems: ShellNavItem[] = [
  // end: true — yalnızca /panel; mekan ekleme/düzenleme sayfaları match ile aktif sayılır
  { to: '/panel', label: 'Mekanlarım', icon: 'storefront', end: true, match: /^\/panel\/mekanlar(\/.*)?$/ },
  { to: '/panel/mesajlar', label: 'Mesajlar', icon: 'mail', end: true },
  { to: '/panel/firma', label: 'Firma Bilgileri', icon: 'business', end: true },
]

export function PanelLayout() {
  const { companyId } = useCompanySession()
  const company = useCompany(companyId)

  return (
    <DashboardShell
      subtitle="Firma Paneli"
      navItems={navItems}
      accountName={company.data?.name}
      banners={
        <>
          {company.data && !company.data.isEmailConfirmed && <EmailNotConfirmed email={company.data.email} />}
          {company.data && !company.data.isApproved && (
            <p className="flex items-start gap-2 rounded-xl bg-secondary-fixed/60 px-4 py-3 text-body-sm text-on-secondary-fixed">
              <Icon name="hourglass_top" className="text-lg" />
              Firmanız henüz onaylanmadı. Mekanlarınızı şimdiden ekleyip düzenleyebilirsiniz; onaydan sonra sitede listelenir.
            </p>
          )}
        </>
      }
    />
  )
}

/** Giriş e-posta doğrulaması istediği için normalde görünmez; doğrulama zorunlu olmadan önce açılmış oturumlar için */
function EmailNotConfirmed({ email }: { email: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-container-high px-4 py-3 text-body-sm text-on-surface">
      <Icon name="mark_email_unread" className="text-lg text-secondary" />
      <span className="min-w-0 flex-1">
        E-posta adresiniz doğrulanmadı. <strong className="break-all">{email}</strong> adresine gönderdiğimiz bağlantıya tıklayın.
      </span>
      <ResendVerification email={email} />
    </div>
  )
}
