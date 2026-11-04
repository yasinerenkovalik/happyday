import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router'
import { useRegisterCompany, type RegisterForm } from '../api/account'
import { useAuth } from '../auth/useAuth'
import { AuthLayout } from '../components/AuthLayout'
import { ContactLinks } from '../components/ContactLinks'
import { ResendVerification } from '../components/ResendVerification'
import { PASSWORD_HINT, passwordProblem } from '../lib/password'
import { CoverInput } from '../panel/ImageInputs'
import { hasMapPoint } from '../panel/location'
import { LocationFields } from '../panel/LocationFields'
import { buttonClass, inputClass } from '../panel/styles'
import { Field, Notice, Section } from '../panel/ui'

const empty: RegisterForm = {
  name: '',
  email: '',
  password: '',
  phoneNumber: '',
  description: '',
  cityId: 0,
  districtId: 0,
  adress: '',
  latitude: 0,
  longitude: 0,
  coverPhoto: null,
}

/** /kayit — firma hesabı açar; giriş için önce e-postadaki doğrulama bağlantısına tıklanmalı */
export function RegisterPage() {
  const { session } = useAuth()
  const register = useRegisterCompany()
  const [form, setForm] = useState<RegisterForm>(empty)
  const [passwordRepeat, setPasswordRepeat] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)

  if (session?.role === 'Company') return <Navigate to="/panel" replace />

  if (registeredEmail) {
    return (
      <AuthLayout title="E-postanızı doğrulayın">
        <Notice tone="success">{register.data || 'Hesabınız oluşturuldu.'}</Notice>
        <p className="text-body-md text-on-surface">
          <strong className="break-all">{registeredEmail}</strong> adresine bir doğrulama bağlantısı gönderdik. Bağlantıya tıkladıktan sonra
          giriş yapabilirsiniz. Bağlantı 24 saat geçerlidir.
        </p>
        <p className="text-body-sm text-on-surface-variant">E-posta gelmediyse gereksiz (spam) klasörüne bakın.</p>
        <ResendVerification email={registeredEmail} />
        <Link to="/giris" className={`${buttonClass.primary} w-full py-3`}>Giriş sayfasına git</Link>
      </AuthLayout>
    )
  }

  const set = (patch: Partial<RegisterForm>) => setForm((f) => ({ ...f, ...patch }))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const problem = passwordProblem(form.password, passwordRepeat) ?? (hasMapPoint(form) ? null : 'Haritada firmanızın konumunu seçin.')
    setFormError(problem)
    if (problem) return

    const email = form.email.trim().toLowerCase()
    register.mutate(
      { ...form, email, name: form.name.trim(), adress: form.adress.trim(), description: form.description.trim(), phoneNumber: form.phoneNumber.trim() },
      { onSuccess: () => setRegisteredEmail(email) },
    )
  }

  const error = formError ?? register.error?.message

  return (
    <AuthLayout
      wide
      title="Firmanızı kaydedin"
      seoDescription="Düğün, nişan ve davet mekanınızı Mutlu Günüm'de ücretsiz listeleyin; teklif taleplerini doğrudan panelinizden alın."
      description={<>Mekanlarınızı Mutlu Günüm'de listeleyin. E-postanızı doğruladıktan sonra mekan ekleyebilirsiniz; mekanlarınız ekibimizin onayından sonra sitede görünür. Zaten hesabınız var mı? <Link to="/giris" className="text-secondary hover:underline">Giriş yapın</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl bg-surface-container-high px-4 py-3 text-body-sm text-on-surface">
          <p className="mb-1.5">Kayıt olurken yardım mı lazım, ya da önce bilgi mi almak istersiniz? Bize ulaşın:</p>
          <ContactLinks className="font-semibold" />
        </div>
        <Section title="Hesap">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Firma adı" required>
              <input required autoComplete="organization" value={form.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} />
            </Field>
            <Field label="E-posta" required hint="Giriş ve bildirimler için kullanılır">
              <input required type="email" autoComplete="email" value={form.email} onChange={(e) => set({ email: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Şifre" required hint={PASSWORD_HINT}>
              <input required type="password" autoComplete="new-password" minLength={8} value={form.password}
                onChange={(e) => set({ password: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Şifre (tekrar)" required>
              <input required type="password" autoComplete="new-password" value={passwordRepeat}
                onChange={(e) => setPasswordRepeat(e.target.value)} className={inputClass} />
            </Field>
          </div>
        </Section>

        <Section title="Firma bilgileri">
          <Field label="Telefon" required>
            <input required type="tel" autoComplete="tel" value={form.phoneNumber} onChange={(e) => set({ phoneNumber: e.target.value })}
              placeholder="0555 000 00 00" className={`${inputClass} md:max-w-xs`} />
          </Field>
          <Field label="Firma hakkında" required hint="Mekan sayfalarında “Ev sahibi” bölümünde görünür.">
            <textarea required rows={4} value={form.description} onChange={(e) => set({ description: e.target.value })} className={`${inputClass} resize-y`} />
          </Field>
        </Section>

        <Section title="Adres ve konum" description="Yeni mekan eklerken varsayılan konum olarak kullanılır; her mekanın konumunu ayrıca değiştirebilirsiniz.">
          <LocationFields value={form} onChange={set} />
        </Section>

        <Section title="Kapak fotoğrafı" description="İsteğe bağlı; sonradan panelden de ekleyebilirsiniz.">
          <div className="max-w-xl">
            <CoverInput currentPath={null} file={form.coverPhoto} onChange={(coverPhoto) => set({ coverPhoto })} />
          </div>
        </Section>

        {error && <Notice tone="error">{error}</Notice>}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link to="/giris" className={buttonClass.secondary}>Vazgeç</Link>
          <button type="submit" disabled={register.isPending} className={`${buttonClass.primary} px-6 py-3`}>
            {register.isPending ? 'Hesap oluşturuluyor…' : 'Hesap oluştur'}
          </button>
        </div>
      </form>
    </AuthLayout>
  )
}
