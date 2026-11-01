import { useState } from 'react'
import { useDeletePackage, useSavePackage } from '../api/panel'
import { useVenuePackages } from '../api/queries'
import { Icon } from '../components/Icon'
import { formatNumber, formatPrice } from '../lib/format'
import type { Package } from '../lib/types'
import { buttonClass, inputClass } from './styles'
import { ConfirmDialog, Field, Notice } from './ui'

/** Mekanın paketleri: listele, ekle, düzenle, sil. Her paket ayrı kaydedilir. */
export function PackagesEditor({ companyId, venueId }: { companyId: string; venueId: string }) {
  const packages = useVenuePackages(venueId)
  const remove = useDeletePackage(companyId)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [toDelete, setToDelete] = useState<Package | null>(null)

  return (
    <div className="space-y-3">
      {packages.data?.map((p) =>
        editingId === p.id ? (
          <PackageForm key={p.id} companyId={companyId} venueId={venueId} initial={p} onDone={() => setEditingId(null)} />
        ) : (
          <div key={p.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-surface-container-low p-4">
            <div className="min-w-0">
              <p className="text-title-md text-primary">{p.name} · {formatPrice(p.price)}</p>
              <p className="text-body-sm text-on-surface-variant">
                {[p.pricePerPerson && `Kişi başı ${formatPrice(p.pricePerPerson)}`, p.maxGuests && `${formatNumber(p.maxGuests)} kişiye kadar`, p.description.split('\n')[0]]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditingId(p.id)} className={buttonClass.secondary}>
                <Icon name="edit" className="text-base" /> Düzenle
              </button>
              <button type="button" onClick={() => setToDelete(p)} className={buttonClass.danger} aria-label={`${p.name} paketini sil`}>
                <Icon name="delete" className="text-base" />
              </button>
            </div>
          </div>
        ),
      )}

      {packages.data?.length === 0 && editingId !== 'new' && (
        <p className="text-body-sm text-on-surface-variant">Henüz paket yok. Paketler mekan sayfasında fiyatlarıyla listelenir.</p>
      )}

      {editingId === 'new' ? (
        <PackageForm companyId={companyId} venueId={venueId} onDone={() => setEditingId(null)} />
      ) : (
        <button type="button" onClick={() => setEditingId('new')} className={buttonClass.secondary}>
          <Icon name="add" className="text-base" /> Paket ekle
        </button>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Paketi sil"
          message={<><strong className="text-primary">{toDelete.name}</strong> paketi silinecek.</>}
          confirmLabel="Sil"
          pending={remove.isPending}
          onConfirm={() => remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}

const optionalNumber = (v: string) => (v.trim() === '' ? null : Number(v))

function PackageForm({ companyId, venueId, initial, onDone }: { companyId: string; venueId: string; initial?: Package; onDone: () => void }) {
  const save = useSavePackage(companyId, venueId)
  const [name, setName] = useState(initial?.name ?? '')
  const [price, setPrice] = useState(initial ? String(initial.price) : '')
  const [pricePerPerson, setPricePerPerson] = useState(initial?.pricePerPerson ? String(initial.pricePerPerson) : '')
  const [maxGuests, setMaxGuests] = useState(initial?.maxGuests ? String(initial.maxGuests) : '')
  const [description, setDescription] = useState(initial?.description ?? '')

  const submit = () =>
    save.mutate(
      {
        id: initial?.id,
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        pricePerPerson: optionalNumber(pricePerPerson),
        maxGuests: optionalNumber(maxGuests),
      },
      { onSuccess: onDone },
    )

  return (
    <div className="space-y-3 rounded-xl p-4 ring-2 ring-secondary/40">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Paket adı" required>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Altın Paket" className={inputClass} />
        </Field>
        <Field label="Taban fiyat (₺)" required>
          <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Kişi başı fiyat (₺)" hint="İsteğe bağlı">
          <input type="number" min={0} value={pricePerPerson} onChange={(e) => setPricePerPerson(e.target.value)} className={inputClass} />
        </Field>
        <Field label="En fazla kişi" hint="İsteğe bağlı">
          <input type="number" min={1} value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} className={inputClass} />
        </Field>
      </div>
      <Field label="İçerik" required hint="İlk satır kısa açıklama; sonraki her satır sitede madde olarak listelenir.">
        <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-y`}
          placeholder={'En kapsamlı düğün paketi\n4 aşamalı şef menüsü\nDJ ve ses sistemi'} />
      </Field>
      {save.error && <Notice tone="error">{save.error.message}</Notice>}
      <div className="flex gap-2">
        <button type="button" onClick={submit} disabled={save.isPending || !name.trim() || !price || !description.trim()} className={buttonClass.primary}>
          {save.isPending ? 'Kaydediliyor…' : initial ? 'Paketi kaydet' : 'Paketi ekle'}
        </button>
        <button type="button" onClick={onDone} className={buttonClass.secondary}>Vazgeç</button>
      </div>
    </div>
  )
}
