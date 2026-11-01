import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { useCompany, useDeleteVenue, useManagedVenue, useCreateVenue, useUpdateVenue, type VenueForm } from '../api/panel'
import { useCategories } from '../api/queries'
import { useCompanySession } from '../auth/useAuth'
import { Icon } from '../components/Icon'
import type { Company, VenueDetail } from '../lib/types'
import { GalleryManager } from '../panel/GalleryManager'
import { CoverInput, NewImagesInput } from '../panel/ImageInputs'
import { hasMapPoint } from '../panel/location'
import { LocationFields } from '../panel/LocationFields'
import { PackagesEditor } from '../panel/PackagesEditor'
import { ServicesInput } from '../panel/ServicesInput'
import { buttonClass, inputClass } from '../panel/styles'
import { ConfirmDialog, Field, Notice, PageHeader, Section } from '../panel/ui'

/** /panel/mekanlar/yeni ve /panel/mekanlar/:id — aynı form ekleme ve düzenleme için */
export function VenueFormPage() {
  const { id } = useParams()
  const { companyId } = useCompanySession()
  const venue = useManagedVenue(id)
  // Yeni mekanın konumu firmanın adresiyle başlar
  const company = useCompany(companyId)

  if ((id && venue.isPending) || (!id && company.isPending)) return <p className="py-12 text-center text-on-surface-variant">Yükleniyor…</p>
  if (id && (venue.error || !venue.data)) {
    return (
      <div className="space-y-3 rounded-2xl bg-surface-container-lowest p-8 text-center shadow-sm">
        <p className="text-title-md text-primary">Mekan açılamadı</p>
        <p className="text-body-sm text-on-surface-variant">{venue.error?.message}</p>
        <Link to="/panel" className={buttonClass.secondary}>Mekanlarıma dön</Link>
      </div>
    )
  }
  // key: başka bir mekana geçince form durumu sıfırlansın
  return <VenueEditor key={id ?? 'yeni'} venue={venue.data} company={company.data} />
}

type Draft = Omit<VenueForm, 'price' | 'maxGuestCount' | 'categoryId'> & { price: string; maxGuestCount: string; categoryId: string }

function initialDraft(v?: VenueDetail, company?: Company): Draft {
  const place = v ?? company
  return {
    cityId: place?.cityId ?? 0,
    districtId: place?.districtId ?? 0,
    adress: (v ? v.adress : company?.adress) ?? '',
    latitude: Number(place?.latitude ?? 0),
    longitude: Number(place?.longitude ?? 0),
    title: v?.title ?? '',
    categoryId: v?.categoryId ? String(v.categoryId) : '',
    description: v?.description ?? '',
    price: v ? String(v.price) : '',
    maxGuestCount: v ? String(v.maxGuestCount) : '',
    duration: v?.duration ?? '',
    isOutdoor: v?.isOutdoor ?? false,
    services: v?.services ?? [],
    reservationNote: v?.reservationNote ?? '',
    cancelPolicy: v?.cancelPolicy ?? '',
    videoUrl: v?.videoUrl ?? '',
    coverPhoto: null,
  }
}

function VenueEditor({ venue, company }: { venue?: VenueDetail; company?: Company }) {
  const { companyId } = useCompanySession()
  const navigate = useNavigate()
  const location = useLocation()
  const categories = useCategories()
  const create = useCreateVenue(companyId)
  const update = useUpdateVenue(companyId, venue?.id ?? '')
  const remove = useDeleteVenue(companyId)

  const [draft, setDraft] = useState<Draft>(() => initialDraft(venue, company))
  const [formError, setFormError] = useState<string | null>(null)
  const [newImages, setNewImages] = useState<File[]>([])
  const [saved, setSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const justCreated = (location.state as { created?: boolean } | null)?.created

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setSaved(false)
  }
  const mutation = venue ? update : create

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const problem = hasMapPoint(draft) ? null : 'Haritada mekanın konumunu seçin.'
    setFormError(problem)
    if (problem) return
    const form: VenueForm = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      duration: draft.duration.trim(),
      adress: draft.adress.trim(),
      price: Number(draft.price),
      maxGuestCount: Number(draft.maxGuestCount),
      categoryId: Number(draft.categoryId),
    }
    if (venue) {
      update.mutate(form, {
        onSuccess: () => {
          setSaved(true)
          setDraft((d) => ({ ...d, coverPhoto: null }))
        },
      })
    } else {
      create.mutate(
        { venue: form, images: newImages },
        { onSuccess: (res) => navigate(`/panel/mekanlar/${res.id}`, { replace: true, state: { created: true } }) },
      )
    }
  }

  return (
    <div className="pb-24">
      <Link to="/panel" className="mb-3 inline-flex items-center gap-1 text-label-md text-on-surface-variant hover:text-primary">
        <Icon name="arrow_back" className="text-base" /> Mekanlarım
      </Link>
      <PageHeader
        title={venue ? venue.title : 'Yeni mekan'}
        description={venue ? 'Mekan bilgilerini, görselleri ve paketleri güncelleyin.' : 'Mekanı kaydettikten sonra galeri görselleri ve paketler ekleyebilirsiniz.'}
        action={
          venue && (
            <button type="button" onClick={() => setConfirmDelete(true)} className={buttonClass.danger}>
              <Icon name="delete" className="text-base" /> Mekanı sil
            </button>
          )
        }
      />

      {venue?.removedByAdminAt && (
        <div className="mb-4">
          <Notice tone="error">
            <strong>Bu mekan yönetici tarafından yayından kaldırıldı ve sitede görünmüyor.</strong> Sebep: {venue.removalReason}{' '}
            Sorunu düzelttikten sonra size gönderilen e-postayı yanıtlayarak haber verin; yönetici inceleyip yeniden yayına alır.
          </Notice>
        </div>
      )}
      {justCreated && <div className="mb-4"><Notice tone="success">Mekan oluşturuldu. Şimdi paketlerini ve galeri görsellerini ekleyebilirsiniz.</Notice></div>}

      <form id="venue-form" onSubmit={handleSubmit} className="space-y-6">
        <Section title="Temel bilgiler">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Mekan adı" required>
              <input required value={draft.title} onChange={(e) => set('title', e.target.value)} className={inputClass} placeholder="Yeniköy Yalı Balo Salonu" />
            </Field>
            <Field label="Mekan türü" required>
              <select required value={draft.categoryId} onChange={(e) => set('categoryId', e.target.value)} className={inputClass}>
                <option value="">Seçin</option>
                {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Açıklama" required hint="Paragrafları boş bir satırla ayırın. Sitede ilk paragraf görünür, kalanı “Devamını oku” ile açılır.">
            <textarea required rows={6} value={draft.description} onChange={(e) => set('description', e.target.value)} className={`${inputClass} resize-y`} />
          </Field>
        </Section>

        <Section title="Kapasite, fiyat ve alan">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Başlangıç fiyatı (₺)" required hint="Kartlarda “Paket başlangıcı” olarak görünür">
              <input required type="number" min={0} step={1} value={draft.price} onChange={(e) => set('price', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Kapasite (kişi)" required>
              <input required type="number" min={1} step={1} value={draft.maxGuestCount} onChange={(e) => set('maxGuestCount', e.target.value)} className={inputClass} />
            </Field>
            <Field label="Kullanım süresi" required>
              <input required value={draft.duration} onChange={(e) => set('duration', e.target.value)} placeholder="8 saat" className={inputClass} />
            </Field>
          </div>
          <div>
            <span className="mb-1 block text-label-md text-on-surface">Alan</span>
            <div className="inline-flex rounded-full bg-surface-container-low p-1">
              {[false, true].map((outdoor) => (
                <button key={String(outdoor)} type="button" aria-pressed={draft.isOutdoor === outdoor} onClick={() => set('isOutdoor', outdoor)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-label-md ${draft.isOutdoor === outdoor ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'}`}>
                  <Icon name={outdoor ? 'deck' : 'meeting_room'} className="text-base" />
                  {outdoor ? 'Açık alan' : 'Kapalı alan'}
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Konum" description="Yeni mekanda firmanızın adresi gelir; mekan başka bir yerdeyse değiştirin. Sitedeki harita ve yol tarifi bu konumu kullanır.">
          <LocationFields
            value={draft}
            onChange={(patch) => {
              setDraft((d) => ({ ...d, ...patch }))
              setSaved(false)
            }}
          />
        </Section>

        <Section title="Hizmetler" description="Sitede ikonlarıyla “Mekan Olanakları ve Hizmetleri” bölümünde listelenir.">
          <ServicesInput value={draft.services} onChange={(services) => set('services', services)} />
        </Section>

        <Section title="Kapak fotoğrafı" description="Listelerde ve galerinin ilk büyük karesinde görünür.">
          <div className="max-w-xl">
            <CoverInput currentPath={venue?.coverPhotoPath} file={draft.coverPhoto} onChange={(f) => set('coverPhoto', f)} />
          </div>
        </Section>

        {!venue && (
          <Section title="Galeri" description="Mekanla birlikte yüklenir; sonradan da ekleyip silebilirsiniz.">
            <NewImagesInput files={newImages} onChange={setNewImages} />
          </Section>
        )}

        <Section title="Rezervasyon ve iptal">
          <Field label="Rezervasyon notu" hint="İsteğe bağlı">
            <textarea rows={3} value={draft.reservationNote} onChange={(e) => set('reservationNote', e.target.value)} className={`${inputClass} resize-y`}
              placeholder="Hafta sonu tarihleri için en az 3 ay önceden rezervasyon önerilir." />
          </Field>
          <Field label="İptal koşulları" hint="İsteğe bağlı">
            <textarea rows={3} value={draft.cancelPolicy} onChange={(e) => set('cancelPolicy', e.target.value)} className={`${inputClass} resize-y`} />
          </Field>
          <Field label="Tanıtım videosu bağlantısı" hint="İsteğe bağlı, ör. YouTube adresi">
            <input type="url" value={draft.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} placeholder="https://" className={inputClass} />
          </Field>
        </Section>
      </form>

      {/* Kayıtlı mekanın galerisi ve paketleri kendi başına kaydedilir; ana formun dışında */}
      {venue && (
        <div className="mt-6 space-y-6">
          <Section title="Galeri" description="Yüklediğiniz görseller hemen kaydedilir.">
            <GalleryManager companyId={companyId} venueId={venue.id} images={venue.images} />
          </Section>
          <Section title="Paketler" description="Mekan sayfasında “Organizasyon Paketleri” olarak listelenir; ziyaretçi teklif formunda seçer.">
            <PackagesEditor companyId={companyId} venueId={venue.id} />
          </Section>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-surface-variant bg-surface-bright/95 backdrop-blur md:left-64">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-end gap-3 px-4 py-3 md:px-8">
          {(formError ?? mutation.error) && <span className="mr-auto text-body-sm text-error">{formError ?? mutation.error?.message}</span>}
          {saved && !mutation.error && (
            <span className="mr-auto flex items-center gap-1 text-body-sm text-secondary">
              <Icon name="check_circle" className="text-base" /> Değişiklikler kaydedildi
            </span>
          )}
          <Link to="/panel" className={buttonClass.secondary}>Vazgeç</Link>
          <button type="submit" form="venue-form" disabled={mutation.isPending} className={buttonClass.primary}>
            {mutation.isPending ? 'Kaydediliyor…' : venue ? 'Değişiklikleri kaydet' : 'Mekanı oluştur'}
          </button>
        </div>
      </div>

      {confirmDelete && venue && (
        <ConfirmDialog
          title="Mekanı sil"
          message={<><strong className="text-primary">{venue.title}</strong> silinecek ve sitede görünmeyecek.</>}
          confirmLabel="Evet, sil"
          pending={remove.isPending}
          onConfirm={() => remove.mutate(venue.id, { onSuccess: () => navigate('/panel', { replace: true }) })}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}
