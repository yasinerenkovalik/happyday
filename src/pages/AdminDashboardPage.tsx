import { Link } from 'react-router'
import { useAdminDashboard } from '../api/admin'
import { Icon } from '../components/Icon'
import { formatNumber } from '../lib/format'
import { buttonClass } from '../panel/styles'
import { Notice, PageHeader, Section } from '../panel/ui'

export function AdminDashboardPage() {
  const dashboard = useAdminDashboard()

  if (dashboard.isPending) return <p className="py-12 text-center text-on-surface-variant">Yükleniyor…</p>
  if (dashboard.error) return <Notice tone="error">{dashboard.error.message}</Notice>
  const d = dashboard.data

  return (
    <div className="space-y-6">
      <PageHeader title="Özet" description="Platformun genel durumu." />

      {d.pendingCompanies > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-secondary-fixed/60 px-4 py-3 text-body-md text-on-secondary-fixed">
          <Icon name="hourglass_top" className="text-xl" />
          <span className="flex-1"><strong>{formatNumber(d.pendingCompanies)} firma</strong> onay bekliyor. Onaylanana kadar mekanları sitede görünmez.</span>
          <Link to="/admin/firmalar?durum=bekleyen" className={buttonClass.primary}>İncele</Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon="business" label="Firma" value={d.totalCompanies}
          detail={`${formatNumber(d.approvedCompanies)} onaylı · ${formatNumber(d.pendingCompanies)} bekliyor`} />
        <StatTile icon="storefront" label="Mekan" value={d.totalOrganizations} detail="Aktif firmaların mekanları" />
        <StatTile icon="group" label="Kullanıcı" value={d.totalUsers} detail="Yöneticiler dahil" />
        <StatTile icon="mail" label="Mesaj" value={d.totalMessages}
          detail={`Son 7 gün ${formatNumber(d.messagesLast7Days)} · bugün ${formatNumber(d.messagesToday)}`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Son 7 gün" description="Günlere göre gelen teklif mesajları">
          <ul className="divide-y divide-surface-variant">
            {d.dailyMessages.map((day) => (
              <li key={day.date} className="flex justify-between py-2 text-body-md">
                <span className="text-on-surface-variant">{day.date}</span>
                <span className="font-semibold text-primary">{formatNumber(day.count)}</span>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="En çok mesaj alan firmalar">
          {d.topCompanies.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">Henüz mesaj yok.</p>
          ) : (
            <ol className="divide-y divide-surface-variant">
              {d.topCompanies.map((c, i) => (
                <li key={c.companyId} className="flex items-center gap-3 py-2 text-body-md">
                  <span className="w-5 text-label-md text-on-surface-variant">{i + 1}.</span>
                  <span className="min-w-0 flex-1 truncate text-on-surface">{c.companyName}</span>
                  <span className="font-semibold text-primary">{formatNumber(c.count)}</span>
                </li>
              ))}
            </ol>
          )}
        </Section>
      </div>
    </div>
  )
}

function StatTile({ icon, label, value, detail }: { icon: string; label: string; value: number; detail: string }) {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
      <p className="flex items-center gap-2 text-label-md text-on-surface-variant">
        <Icon name={icon} className="text-lg text-secondary" /> {label}
      </p>
      <p className="mt-2 font-display text-headline-lg text-primary">{formatNumber(value)}</p>
      <p className="mt-1 text-body-sm text-on-surface-variant">{detail}</p>
    </div>
  )
}
