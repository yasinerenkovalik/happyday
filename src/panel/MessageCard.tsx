import { Icon } from '../components/Icon'
import { formatDateTime } from '../lib/format'
import type { ContactMessage } from '../lib/types'

type MessageFields = Pick<ContactMessage, 'fullName' | 'phone' | 'email' | 'message' | 'createDate' | 'organizationTitle' | 'cityName' | 'districtName'>

/** Teklif formundan gelen mesaj; firma panelinde ve (firma adıyla) yönetim panelinde */
export function MessageCard({ message: m, companyName }: { message: MessageFields; companyName?: string }) {
  return (
    <li className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-title-md text-primary">{m.fullName}</p>
        <time dateTime={m.createDate} className="text-body-sm text-on-surface-variant">{formatDateTime(m.createDate)}</time>
      </div>
      <p className="flex flex-wrap items-center gap-1 text-body-sm text-on-surface-variant">
        <Icon name="storefront" className="text-sm text-secondary" />
        {companyName && <span className="font-semibold text-on-surface">{companyName} ·</span>}
        {m.organizationTitle} · {[m.districtName, m.cityName].filter(Boolean).join(', ')}
      </p>
      <p className="mt-3 rounded-xl bg-surface-container-low p-3 text-body-md whitespace-pre-line text-on-surface">{m.message}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1 rounded-full bg-surface-container px-3 py-1.5 text-label-md text-primary hover:bg-surface-container-high">
          <Icon name="call" className="text-base" /> {m.phone}
        </a>
        <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 rounded-full bg-surface-container px-3 py-1.5 text-label-md text-primary hover:bg-surface-container-high">
          <Icon name="mail" className="text-base" /> {m.email}
        </a>
      </div>
    </li>
  )
}
