import { useState, type FormEvent, type ReactNode } from 'react'
import { useSendInquiry } from '../api/queries'
import { Icon } from '../components/Icon'
import { formatNumber, formatPrice } from '../lib/format'
import type { Package, VenueDetail } from '../lib/types'

const EVENT_TYPES = ['Düğün', 'Nişan & Söz', 'Kına Gecesi', 'Nikah Töreni', 'Kurumsal Davet', 'Doğum Günü & Parti']
const GUEST_STEP = 25

const dateFormat = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })
const today = () => new Date().toISOString().slice(0, 10)

type Props = {
  venue: VenueDetail
  packages: Package[]
  selectedPackageId: string | null
  onSelectPackage: (id: string | null) => void
}

/**
 * Teklif talebi. Backend'de rezervasyon/takvim olmadığı için talep, firmaya mesaj olarak
 * iletilir (POST api/contact-messages) ve firma panelindeki Mesajlar sayfasında görünür.
 */
export function InquiryForm({ venue, packages, selectedPackageId, onSelectPackage }: Props) {
  const send = useSendInquiry()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [eventType, setEventType] = useState(EVENT_TYPES[0])
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState(Math.min(200, venue.maxGuestCount))
  const [note, setNote] = useState('')
  const [website, setWebsite] = useState('')

  const selected = packages.find((p) => p.id === selectedPackageId) ?? null
  const minPackagePrice = packages.length ? Math.min(...packages.map((p) => p.price)) : venue.price
  const changeGuests = (delta: number) => setGuests((g) => Math.max(GUEST_STEP, Math.min(venue.maxGuestCount, g + delta)))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const message = [
      `Etkinlik türü: ${eventType}`,
      `Tarih: ${date ? dateFormat.format(new Date(`${date}T12:00:00`)) : 'Henüz belli değil'}`,
      `Tahmini davetli: ${formatNumber(guests)} kişi`,
      `Paket: ${selected ? `${selected.name} (${formatPrice(selected.price)})` : 'Henüz seçilmedi'}`,
      note.trim() && `Not: ${note.trim()}`,
    ]
      .filter(Boolean)
      .join('\n')

    send.mutate({ organizationId: venue.id, fullName: fullName.trim(), phone: phone.trim(), email: email.trim(), message, website })
  }

  if (send.isSuccess) {
    return (
      <div className="space-y-3 rounded-2xl bg-surface-container-lowest p-6 text-center shadow-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary-fixed text-secondary">
          <Icon name="check" className="text-2xl" />
        </div>
        <p className="text-headline-sm text-primary">Talebiniz iletildi</p>
        <p className="text-body-sm text-on-surface-variant">
          {venue.companyName} talebinizi aldı; verdiğiniz telefon veya e-posta üzerinden size dönüş yapacak.
        </p>
        <button type="button" onClick={() => send.reset()} className="text-label-md text-secondary hover:underline">
          Yeni talep gönder
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-surface-container-lowest p-6 shadow-xl">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span className="font-display text-headline-lg text-primary">{formatPrice(selected?.price ?? minPackagePrice)}</span>
          <span className="ml-1 text-body-sm text-on-surface-variant">{selected ? '/ seçilen paket' : "'den başlayan fiyatlarla"}</span>
        </div>
        {selected?.pricePerPerson && (
          <span className="rounded-md bg-secondary-fixed/60 px-2 py-1 text-label-sm text-secondary">
            Kişi başı {formatPrice(selected.pricePerPerson)}
          </span>
        )}
      </div>

      <div className="space-y-3 rounded-xl bg-surface-container-low p-3">
        <Field label="Etkinlik türü">
          <select value={eventType} onChange={(e) => setEventType(e.target.value)} className={inputClass}>
            {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Tarih">
          <input type="date" min={today()} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Tahmini davetli sayısı">
          <div className="flex items-center justify-between rounded-lg bg-surface-container-lowest px-3 py-1.5">
            <StepButton label="Davetli azalt" onClick={() => changeGuests(-GUEST_STEP)}>−</StepButton>
            <span className="text-title-md text-primary">{formatNumber(guests)} kişi</span>
            <StepButton label="Davetli artır" onClick={() => changeGuests(GUEST_STEP)}>+</StepButton>
          </div>
          <span className="mt-1 block text-body-sm text-on-surface-variant">Mekan kapasitesi {formatNumber(venue.maxGuestCount)} kişi</span>
        </Field>
        {packages.length > 0 && (
          <Field label="Paket">
            <select value={selectedPackageId ?? ''} onChange={(e) => onSelectPackage(e.target.value || null)} className={`${inputClass} font-semibold`}>
              <option value="">Henüz karar vermedim</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({formatPrice(p.price)})</option>
              ))}
            </select>
          </Field>
        )}
      </div>

      {selected && (
        <div className="space-y-1 text-body-sm">
          <Row label="Paket taban fiyatı" value={formatPrice(selected.price)} />
          {selected.pricePerPerson && (
            <Row label={`Kişi başı fiyatla ${formatNumber(guests)} kişi`} value={formatPrice(selected.pricePerPerson * guests)} />
          )}
          <p className="pt-1 text-on-surface-variant">Kesin fiyatı mekan, tarih ve davetli sayısına göre size iletir.</p>
        </div>
      )}

      <div className="space-y-3">
        <Field label="Ad soyad">
          <input required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Field label="Telefon">
            <input required type="tel" autoComplete="tel" pattern="[0-9 +\(\)\-]{10,}" title="En az 10 haneli telefon numarası"
              value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </Field>
          <Field label="E-posta">
            <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </Field>
        </div>
        {/* Bal küpü: ekranda ve ekran okuyucuda görünmez, form dolduran botlar doldurur */}
        <div aria-hidden="true" className="sr-only">
          <label>
            Web siteniz (boş bırakın)
            <input name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
        </div>
        <Field label="Notunuz (isteğe bağlı)">
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={`${inputClass} resize-none`}
            placeholder="Menü tercihi, saat, özel istekler…" />
        </Field>
      </div>

      {send.error && <p role="alert" className="rounded-lg bg-error-container px-3 py-2 text-body-sm text-on-error-container">{send.error.message}</p>}

      <button
        type="submit"
        disabled={send.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-headline-sm text-on-primary shadow-lg transition-all hover:bg-primary-container hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
      >
        {send.isPending ? 'Gönderiliyor…' : 'Teklif Al'}
        {!send.isPending && <Icon name="arrow_forward" className="text-lg" />}
      </button>
      <p className="text-center text-body-sm text-on-surface-variant">
        Talebiniz doğrudan {venue.companyName} ekibine iletilir. Teklif almak ücretsizdir ve bağlayıcı değildir.
      </p>
    </form>
  )
}

const inputClass =
  'w-full rounded-lg bg-surface-container-lowest px-3 py-2 text-body-md text-primary outline-none ring-1 ring-surface-variant focus:ring-2 focus:ring-secondary'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-label-sm text-on-surface-variant uppercase">{label}</span>
      {children}
    </label>
  )
}

function StepButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container font-bold text-primary hover:bg-surface-container-high">
      {children}
    </button>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-on-surface-variant">
      <span>{label}</span>
      <span className="font-medium text-primary">{value}</span>
    </div>
  )
}
