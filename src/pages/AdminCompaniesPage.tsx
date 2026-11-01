import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useAdminCompanies, useSetCompanyApproval } from '../api/admin'
import { Badge, Pager, SearchBox } from '../admin/ui'
import { Icon } from '../components/Icon'
import { QueryState } from '../components/QueryState'
import { formatDateTime, formatNumber } from '../lib/format'
import { buttonClass } from '../panel/styles'
import { Notice, PageHeader } from '../panel/ui'

const TABS = [
  { key: '', label: 'Tümü', isApproved: undefined },
  { key: 'bekleyen', label: 'Onay bekleyen', isApproved: false },
  { key: 'onayli', label: 'Onaylı', isApproved: true },
] as const

export function AdminCompaniesPage() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.find((t) => t.key === (params.get('durum') ?? '')) ?? TABS[0]
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const companies = useAdminCompanies({ search, isApproved: tab.isApproved, page })
  const approval = useSetCompanyApproval()

  const onSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  return (
    <section className="space-y-4">
      <PageHeader title="Firmalar" description="Onaylanan firmaların mekanları sitede listelenir." />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full bg-surface-container-low p-1">
          {TABS.map((t) => (
            <button key={t.key} type="button" aria-pressed={t === tab}
              onClick={() => { setParams(t.key ? { durum: t.key } : {}); setPage(1) }}
              className={`rounded-full px-4 py-1.5 text-label-md ${t === tab ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <SearchBox placeholder="Firma adı veya e-posta" onSearch={onSearch} />
      </div>

      {approval.error && <Notice tone="error">{approval.error.message}</Notice>}

      <QueryState
        isPending={companies.isPending}
        error={companies.error}
        isEmpty={companies.data?.length === 0}
        emptyText={search ? 'Aramaya uyan firma yok.' : tab.isApproved === false ? 'Onay bekleyen firma yok.' : 'Firma yok.'}
        onRetry={() => companies.refetch()}
      >
        <ul className="space-y-3">
          {companies.data?.map((c) => {
            const pending = approval.isPending && approval.variables?.companyId === c.id
            return (
              <li key={c.id} className="flex flex-wrap items-start gap-4 rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-title-md text-primary">{c.name}</p>
                    {c.isApproved ? <Badge tone="ok" icon="verified">Onaylı</Badge> : <Badge tone="wait" icon="hourglass_top">Onay bekliyor</Badge>}
                    {!c.isEmailConfirmed && <Badge tone="wait" icon="mark_email_unread">E-posta doğrulanmadı</Badge>}
                    {!c.isActivated && <Badge tone="off" icon="block">Pasif</Badge>}
                  </div>
                  <p className="text-body-sm break-all text-on-surface-variant">{c.email} · {c.phoneNumber}</p>
                  <p className="text-body-sm text-on-surface-variant">{c.adress}</p>
                  <p className="flex flex-wrap gap-x-4 text-body-sm text-on-surface-variant">
                    <span className="inline-flex items-center gap-1"><Icon name="storefront" className="text-sm" /> {formatNumber(c.organizationCount)} mekan</span>
                    <span className="inline-flex items-center gap-1"><Icon name="mail" className="text-sm" /> {formatNumber(c.messageCount)} mesaj</span>
                    <span>Kayıt: {formatDateTime(c.createDate)}</span>
                  </p>
                </div>
                {c.isActivated && (
                  <button type="button" disabled={pending}
                    onClick={() => approval.mutate({ companyId: c.id, isApproved: !c.isApproved })}
                    className={c.isApproved ? buttonClass.secondary : buttonClass.primary}>
                    <Icon name={c.isApproved ? 'remove_done' : 'check'} className="text-base" />
                    {pending ? 'Kaydediliyor…' : c.isApproved ? 'Onayı kaldır' : 'Onayla'}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
        <Pager page={page} count={companies.data?.length ?? 0} onPage={setPage} />
      </QueryState>
    </section>
  )
}
