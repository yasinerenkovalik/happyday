import { useState, type FormEvent } from 'react'
import { useCompany, useUpdateCompany, type CompanyForm } from '../api/panel'
import { useCompanySession } from '../auth/useAuth'
import { Icon } from '../components/Icon'
import type { Company } from '../lib/types'
import { ChangePasswordSection } from '../panel/ChangePasswordSection'
import { CoverInput } from '../panel/ImageInputs'
import { hasMapPoint } from '../panel/location'
import { LocationFields } from '../panel/LocationFields'
import { buttonClass, inputClass } from '../panel/styles'
import { Field, Notice, PageHeader, Section } from '../panel/ui'

export function CompanyProfilePage() {
  const { companyId } = useCompanySession()
  const company = useCompany(companyId)

  if (company.isPending) return <p className="py-12 text-center text-on-surface-variant">Yükleniyor…</p>
  if (company.error || !company.data) return <Notice tone="error">{company.error?.message ?? 'Firma bilgileri alınamadı.'}</Notice>
  return <CompanyEditor companyId={companyId} company={company.data} />
}

function CompanyEditor({ companyId, company }: { companyId: string; company: Company }) {
  const update = useUpdateCompany(companyId)
  const [form, setForm] = useState<CompanyForm>({
    name: company.name,
    phoneNumber: company.phoneNumber,
    adress: company.adress,
    description: company.description,
    cityId: company.cityId,
    districtId: company.districtId,
    latitude: Number(company.latitude),
    longitude: Number(company.longitude),
    coverPhoto: null,
  })
  const [saved, setSaved] = useState(false)

  const set = <K extends keyof CompanyForm>(key: K, value: CompanyForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    update.mutate(
      { ...form, name: form.name.trim(), adress: form.adress.trim(), description: form.description.trim(), phoneNumber: form.phoneNumber.trim() },
      {
        onSuccess: () => {
          setSaved(true)
          setForm((f) => ({ ...f, coverPhoto: null }))
        },
      },
    )
  }

  return (
    <div className="space-y-6 pb-24">
      <form onSubmit={handleSubmit} className="space-y-6">
        <PageHeader title="Firma Bilgileri" description="Bu bilgiler mekan sayfalarında “Ev sahibi” ve konum bölümlerinde görünür." />

        <div className="flex flex-wrap gap-2">
          <StatusPill ok={company.isApproved} okText="Firma onaylı" waitText="Onay bekliyor" />
          <StatusPill ok={company.isEmailConfirmed} okText="E-posta doğrulandı" waitText="E-posta doğrulanmadı" />
        </div>

        <Section title="Firma">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Firma adı" required>
              <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} />
            </Field>
            <Field label="E-posta" hint="Giriş e-postası buradan değiştirilemez">
              <input value={company.email} readOnly disabled className={`${inputClass} opacity-70`} />
            </Field>
            <Field label="Telefon" required>
              <input required type="tel" value={form.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)} className={inputClass} />
            </Field>
          </div>
          <Field label="Açıklama" required>
            <textarea required rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputClass} resize-y`} />
          </Field>
        </Section>

        <Section title="Adres ve konum" description="Firmanın adresi; yeni mekan eklerken varsayılan konum olarak kullanılır.">
          <LocationFields
            value={form}
            onChange={(patch) => {
              setForm((f) => ({ ...f, ...patch }))
              setSaved(false)
            }}
          />
        </Section>

        <Section title="Kapak fotoğrafı">
          <div className="max-w-xl">
            <CoverInput currentPath={company.coverPhotoPath} file={form.coverPhoto} onChange={(f) => set('coverPhoto', f)} />
          </div>
        </Section>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-surface-variant bg-surface-bright/95 backdrop-blur md:left-64">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-end gap-3 px-4 py-3 md:px-8">
            {update.error && <span className="mr-auto text-body-sm text-error">{update.error.message}</span>}
            {saved && !update.error && (
              <span className="mr-auto flex items-center gap-1 text-body-sm text-secondary">
                <Icon name="check_circle" className="text-base" /> Firma bilgileri kaydedildi
              </span>
            )}
            <button type="submit" disabled={update.isPending || !form.districtId || !hasMapPoint(form)} className={buttonClass.primary}>
              {update.isPending ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </div>
      </form>

      {/* Kendi formu var; iç içe form olmasın diye ana formun dışında */}
      <ChangePasswordSection />
    </div>
  )
}

function StatusPill({ ok, okText, waitText }: { ok: boolean; okText: string; waitText: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-label-sm ${ok ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container-high text-on-surface-variant'}`}>
      <Icon name={ok ? 'verified' : 'hourglass_top'} className="text-sm" />
      {ok ? okText : waitText}
    </span>
  )
}
