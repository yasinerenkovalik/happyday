import { CONTACT } from '../lib/contact'
import { Icon } from './Icon'

/** Tıklanınca arayan / e-posta yazan telefon ve e-posta bağlantıları */
export function ContactLinks({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className}`}>
      <a href={`tel:${CONTACT.phoneIntl}`} className="inline-flex items-center gap-1.5 hover:text-primary hover:underline">
        <Icon name="call" className="text-base text-secondary" />
        {CONTACT.phone}
      </a>
      <a href={`mailto:${CONTACT.email}`} className="inline-flex min-w-0 items-center gap-1.5 break-all hover:text-primary hover:underline">
        <Icon name="mail" className="text-base text-secondary" />
        {CONTACT.email}
      </a>
    </div>
  )
}
