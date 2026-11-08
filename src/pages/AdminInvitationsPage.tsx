import { useState, type FormEvent } from 'react'
import { useAdminInvitations, useSendInvitation } from '../api/admin'
import { Badge, Pager } from '../admin/ui'
import { Icon } from '../components/Icon'
import { QueryState } from '../components/QueryState'
import { CONTACT } from '../lib/contact'
import { formatDateTime } from '../lib/format'
import { SITE_NAME } from '../lib/seo'
import type { AdminInvitation } from '../lib/types'
import { buttonClass, inputClass } from '../panel/styles'
import { Field, Notice, PageHeader, Section } from '../panel/ui'

const DEFAULT_SUBJECT = `Mekanınızı ${SITE_NAME}'de listeleyin: ilk 6 ay ücretsiz`

const DEFAULT_MESSAGE = `Merhaba {firma},

Düğün, nişan, kına ve davet mekanlarını tek yerde buluşturan ${SITE_NAME}'ü yeni hayata geçirdik. Mekanınızı da aramızda görmek isteriz.

${SITE_NAME}'e katılırsanız:
• İlk 6 ay tamamen ücretsiz listelenirsiniz
• Teklif talepleri doğrudan panelinize ve e-postanıza gelir
• Fotoğraf, paket ve fiyatlarınızı kendiniz yönetirsiniz
• Şehrinizde mekan arayan çiftlere ulaşırsınız

Kayıt olmak yalnızca birkaç dakikanızı alır. Sorularınız için bu e-postayı yanıtlayabilir ya da ${CONTACT.phone} numarasından bize ulaşabilirsiniz.

Sevgiler,
${SITE_NAME} Ekibi`

function InvitationStatus({ invitation }: { invitation: AdminInvitation }) {
  if (invitation.optedOutAt) return <Badge tone="off" icon="block">Almak istemiyor</Badge>
  if (invitation.registeredAt) return <Badge tone="ok" icon="check_circle">Kayıt oldu</Badge>
  return <Badge tone="wait" icon="schedule">Gönderildi</Badge>
}

export function AdminInvitationsPage() {
  const [page, setPage] = useState(1)
  const invitations = useAdminInvitations(page)
  const send = useSendInvitation()

  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [subject, setSubject] = useState(DEFAULT_SUBJECT)
  const [message, setMessage] = useState(DEFAULT_MESSAGE)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    send.mutate(
      { email: email.trim(), companyName: companyName.trim() || null, subject, message },
      {
        onSuccess: () => {
          // Taslak kalır: sıradaki firma için yalnızca adresi yazmak yeter
          setEmail('')
          setCompanyName('')
          setPage(1)
        },
      },
    )
  }

  return (
    <section className="space-y-4">
      <PageHeader title="Firma Davet Et" description="E-posta adresini yazın; hazır mesaj firmaya bilgi@ adresinden gitsin." />

      <form onSubmit={handleSubmit}>
        <Section title="Yeni davet">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Firmanın e-postası" required>
              <input required type="email" value={email} onChange={(e) => { setEmail(e.target.value); send.reset() }}
                className={inputClass} placeholder="info@firma.com" />
            </Field>
            <Field label="Firma adı" hint="İsteğe bağlı. Yazarsanız mesajdaki {firma} yerine geçer.">
              <input value={companyName} maxLength={200} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
            </Field>
          </div>
          <Field label="Konu" required>
            <input required maxLength={150} value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Mesaj" required hint="Mesajın altına “Ücretsiz kayıt ol” düğmesi ve “davet almak istemiyorum” bağlantısı otomatik eklenir.">
            <textarea required rows={15} maxLength={4000} value={message} onChange={(e) => setMessage(e.target.value)} className={`${inputClass} resize-y`} />
          </Field>

          {send.error && <Notice tone="error">{send.error.message}</Notice>}
          {send.isSuccess && <Notice tone="success">{send.data}</Notice>}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button type="button" onClick={() => { setSubject(DEFAULT_SUBJECT); setMessage(DEFAULT_MESSAGE) }} className={buttonClass.secondary}>
              Taslağa dön
            </button>
            <button type="submit" disabled={send.isPending} className={buttonClass.primary}>
              <Icon name="send" className="text-base" /> {send.isPending ? 'Gönderiliyor…' : 'Daveti gönder'}
            </button>
          </div>
        </Section>
      </form>

      <h2 className="pt-2 text-headline-sm text-primary">Gönderilen davetler</h2>
      <QueryState
        isPending={invitations.isPending}
        error={invitations.error}
        isEmpty={invitations.data?.length === 0}
        emptyText="Henüz davet gönderilmedi."
        onRetry={() => invitations.refetch()}
      >
        <ul className="space-y-3">
          {invitations.data?.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
              <div className="min-w-0">
                <p className="text-title-md break-all text-primary">{i.companyName ?? i.email}</p>
                <p className="text-body-sm break-all text-on-surface-variant">
                  {i.companyName && <>{i.email} · </>}{formatDateTime(i.sentAt)}
                </p>
              </div>
              <InvitationStatus invitation={i} />
            </li>
          ))}
        </ul>
        <Pager page={page} count={invitations.data?.length ?? 0} onPage={setPage} />
      </QueryState>
    </section>
  )
}
