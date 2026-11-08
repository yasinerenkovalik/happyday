import { useSearchParams } from 'react-router'
import { useInvitationOptOut } from '../api/account'
import { AuthLayout } from '../components/AuthLayout'
import { buttonClass } from '../panel/styles'
import { Notice } from '../panel/ui'

/**
 * /davet/iptal?t=... — davet e-postasındaki "almak istemiyorum" bağlantısı.
 * Düğmeyle onaylanır: e-posta güvenlik tarayıcıları bağlantıları kendiliğinden açtığı için sayfa açılınca işlem yapılmaz.
 */
export function InvitationOptOutPage() {
  const [params] = useSearchParams()
  const token = params.get('t')
  const optOut = useInvitationOptOut()

  if (!token) {
    return (
      <AuthLayout title="Geçersiz bağlantı">
        <Notice tone="error">Bu bağlantı eksik ya da hatalı.</Notice>
      </AuthLayout>
    )
  }

  if (optOut.isSuccess) {
    return (
      <AuthLayout title="İşleminiz tamam">
        <Notice tone="success">{optOut.data}</Notice>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Davet almak istemiyorum" description="Onaylarsanız bu e-posta adresine bir daha firma daveti göndermeyiz.">
      {optOut.error && <Notice tone="error">{optOut.error.message}</Notice>}
      <button type="button" disabled={optOut.isPending} onClick={() => optOut.mutate(token)} className={`${buttonClass.primary} w-full py-3`}>
        {optOut.isPending ? 'İşleniyor…' : 'Evet, bana davet göndermeyin'}
      </button>
    </AuthLayout>
  )
}
