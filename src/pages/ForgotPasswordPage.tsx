import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useRequestPasswordReset } from '../api/account'
import { AuthLayout } from '../components/AuthLayout'
import { buttonClass, inputClass } from '../panel/styles'
import { Field, Notice } from '../panel/ui'

/** /sifremi-unuttum — hesap olsun olmasın aynı yanıt döner (e-posta kayıtlı mı bilgisi sızmaz) */
export function ForgotPasswordPage() {
  const request = useRequestPasswordReset()
  const [email, setEmail] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    request.mutate(email.trim())
  }

  return (
    <AuthLayout title="Şifremi unuttum" description="Firma hesabınızın e-posta adresini girin; şifrenizi sıfırlamanız için bir bağlantı gönderelim.">
      {request.isSuccess ? (
        <div className="space-y-4">
          <Notice tone="success">{request.data || 'E-posta kayıtlıysa şifre sıfırlama bağlantısı gönderildi.'}</Notice>
          <p className="text-body-sm text-on-surface-variant">Bağlantı 30 dakika geçerlidir. E-posta gelmediyse gereksiz (spam) klasörüne bakın.</p>
          <Link to="/giris" className={`${buttonClass.secondary} w-full`}>Girişe dön</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="E-posta">
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </Field>
          {request.error && <Notice tone="error">{request.error.message}</Notice>}
          <button type="submit" disabled={request.isPending} className={`${buttonClass.primary} w-full py-3`}>
            {request.isPending ? 'Gönderiliyor…' : 'Sıfırlama bağlantısı gönder'}
          </button>
          <p className="text-center">
            <Link to="/giris" className="text-label-md text-secondary hover:underline">Girişe dön</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  )
}
