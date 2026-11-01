import { Link, useSearchParams } from 'react-router'
import { useConfirmEmail } from '../api/account'
import { useAuth } from '../auth/useAuth'
import { AuthLayout } from '../components/AuthLayout'
import { buttonClass } from '../panel/styles'
import { Notice } from '../panel/ui'

/** /auth/confirm-email?cid=&token= — adres backend'in gönderdiği doğrulama e-postasındaki bağlantıyla aynı */
export function ConfirmEmailPage() {
  const [params] = useSearchParams()
  const confirm = useConfirmEmail(params.get('cid'), params.get('token'))
  const { session } = useAuth()
  const next = session?.role === 'Company'
    ? <Link to="/panel" className={`${buttonClass.primary} w-full py-3`}>Panele git</Link>
    : <Link to="/giris" className={`${buttonClass.primary} w-full py-3`}>Giriş yap</Link>

  if (!params.get('cid') || !params.get('token')) {
    return (
      <AuthLayout title="Geçersiz bağlantı">
        <Notice tone="error">Bu doğrulama bağlantısı eksik ya da bozuk.</Notice>
        {next}
      </AuthLayout>
    )
  }

  if (confirm.isPending) {
    return (
      <AuthLayout title="E-posta doğrulanıyor">
        <p className="text-body-md text-on-surface-variant">Bir saniye…</p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title={confirm.isSuccess ? 'E-postanız doğrulandı' : 'Doğrulanamadı'}>
      {confirm.isSuccess ? (
        <Notice tone="success">{confirm.data || 'E-posta doğrulandı.'}</Notice>
      ) : (
        <Notice tone="error">
          {confirm.error?.message ?? 'Geçersiz veya süresi dolmuş bağlantı.'} Panelden yeni bir doğrulama e-postası isteyebilirsiniz.
        </Notice>
      )}
      {next}
    </AuthLayout>
  )
}
