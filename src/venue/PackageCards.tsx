import { Icon } from '../components/Icon'
import { formatNumber, formatPrice } from '../lib/format'
import type { Package } from '../lib/types'

/** Paket açıklamasının ilk satırı özet, kalan satırlar madde listesi olarak gösterilir. */
function splitDescription(description: string) {
  const lines = description.split('\n').map((l) => l.trim()).filter(Boolean)
  return lines.length > 1 ? { summary: lines[0], items: lines.slice(1) } : { summary: lines[0] ?? '', items: [] }
}

export function PackageCards({
  packages,
  selectedId,
  onSelect,
}: {
  packages: Package[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${packages.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
      {packages.map((p) => {
        const selected = p.id === selectedId
        const { summary, items } = splitDescription(p.description)
        return (
          <div
            key={p.id}
            className={`flex flex-col justify-between rounded-2xl p-4 transition-all duration-300 ${
              selected ? 'bg-primary text-on-primary shadow-xl lg:-translate-y-1' : 'bg-surface-container-lowest shadow-sm hover:shadow-md'
            }`}
          >
            <div className="space-y-2">
              <h3 className={`text-headline-sm ${selected ? 'text-on-primary' : 'text-primary'}`}>{p.name}</h3>
              <div>
                <span className={`font-display text-headline-md ${selected ? 'text-on-primary' : 'text-primary'}`}>{formatPrice(p.price)}</span>
                <span className={`ml-1 text-body-sm ${selected ? 'text-white/70' : 'text-on-surface-variant'}`}>/ taban fiyat</span>
              </div>
              {(p.pricePerPerson || p.maxGuests) && (
                <p className={`text-body-sm ${selected ? 'text-secondary-fixed' : 'text-secondary'}`}>
                  {[p.pricePerPerson && `Kişi başı ${formatPrice(p.pricePerPerson)}`, p.maxGuests && `${formatNumber(p.maxGuests)} kişiye kadar`]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
              {summary && <p className={`text-body-sm ${selected ? 'text-white/70' : 'text-on-surface-variant'}`}>{summary}</p>}
              {items.length > 0 && (
                <ul className="space-y-1 pt-1 text-body-sm">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Icon name="check_circle" className={`text-base ${selected ? 'text-secondary-container' : 'text-secondary'}`} />
                      <span className={selected ? 'text-on-primary' : 'text-on-surface-variant'}>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="button"
              onClick={() => onSelect(p.id)}
              aria-pressed={selected}
              className={`mt-4 w-full rounded-xl py-2 text-label-md transition-colors ${
                selected ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-primary hover:bg-surface-container-high'
              }`}
            >
              {selected ? 'Seçildi' : 'Paketi seç'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
