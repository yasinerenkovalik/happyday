import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useAdminVenues, useRestoreVenue, type AdminVenueStatus } from '../api/admin'
import { RemoveVenueDialog } from '../admin/RemoveVenueDialog'
import { Badge, Pager, SearchBox } from '../admin/ui'
import { Icon } from '../components/Icon'
import { QueryState } from '../components/QueryState'
import { uploadUrl } from '../lib/api'
import { formatDateTime, formatPrice } from '../lib/format'
import type { AdminVenue } from '../lib/types'
import { buttonClass } from '../panel/styles'
import { Notice, PageHeader } from '../panel/ui'

const TABS: { key: string; label: string; status?: AdminVenueStatus }[] = [
  { key: '', label: 'Tümü' },
  { key: 'yayinda', label: 'Yayında', status: 'Published' },
  { key: 'kaldirilan', label: 'Kaldırılan', status: 'Removed' },
  { key: 'onaysiz', label: 'Firması onaysız', status: 'Unapproved' },
]

export function AdminVenuesPage() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.find((t) => t.key === (params.get('durum') ?? '')) ?? TABS[0]
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const venues = useAdminVenues({ search, status: tab.status, page })
  const restore = useRestoreVenue()
  const [toRemove, setToRemove] = useState<AdminVenue | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const onSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  return (
    <section className="space-y-4">
      <PageHeader title="Mekanlar" description="Uygunsuz bulduğunuz mekanı sebep yazarak yayından kaldırabilirsiniz; mekan silinmez, firma sebebi görür." />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="no-scrollbar inline-flex max-w-full overflow-x-auto rounded-full bg-surface-container-low p-1">
          {TABS.map((t) => (
            <button key={t.key} type="button" aria-pressed={t === tab}
              onClick={() => { setParams(t.key ? { durum: t.key } : {}); setPage(1) }}
              className={`shrink-0 rounded-full px-4 py-1.5 text-label-md ${t === tab ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <SearchBox placeholder="Mekan ya da firma adı" onSearch={onSearch} />
      </div>

      {notice && <Notice tone="success">{notice}</Notice>}
      {restore.error && <Notice tone="error">{restore.error.message}</Notice>}

      <QueryState
        isPending={venues.isPending}
        error={venues.error}
        isEmpty={venues.data?.length === 0}
        emptyText={search ? 'Aramaya uyan mekan yok.' : tab.status === 'Removed' ? 'Yayından kaldırılmış mekan yok.' : 'Mekan yok.'}
        onRetry={() => venues.refetch()}
      >
        <ul className="space-y-3">
          {venues.data?.map((v) => {
            const removed = !!v.removedByAdminAt
            const published = !removed && v.companyApproved
            const restoring = restore.isPending && restore.variables === v.id
            return (
              <li key={v.id} className="flex flex-wrap gap-4 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                  {v.coverPhotoPath
                    ? <img src={uploadUrl(v.coverPhotoPath)} alt="" className="h-full w-full object-cover" />
                    : <Icon name="image" className="flex h-full w-full items-center justify-center text-3xl text-outline" />}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-title-md text-primary">{v.title}</p>
                    {removed && <Badge tone="off" icon="visibility_off">Yayından kaldırıldı</Badge>}
                    {published && <Badge tone="ok" icon="public">Yayında</Badge>}
                    {!removed && !v.companyApproved && <Badge tone="wait" icon="hourglass_top">Firma onaysız</Badge>}
                  </div>
                  <p className="text-body-sm text-on-surface-variant">
                    {v.companyName} · {v.districtName}, {v.cityName} · {formatPrice(v.price)} · {formatDateTime(v.createDate)}
                  </p>
                  {removed && (
                    <p className="rounded-lg bg-error-container/60 px-3 py-2 text-body-sm text-on-error-container">
                      <strong>Sebep:</strong> {v.removalReason} <span className="opacity-70">({formatDateTime(v.removedByAdminAt!)})</span>
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-start gap-2">
                  {published && (
                    <Link to={`/mekan/${v.id}`} target="_blank" className={buttonClass.secondary}>
                      <Icon name="open_in_new" className="text-base" /> Sitede gör
                    </Link>
                  )}
                  {removed ? (
                    <button type="button" disabled={restoring} className={buttonClass.secondary}
                      onClick={() => restore.mutate(v.id, { onSuccess: (message) => setNotice(message) })}>
                      <Icon name="undo" className="text-base" /> {restoring ? 'Alınıyor…' : 'Yayına geri al'}
                    </button>
                  ) : (
                    <button type="button" onClick={() => setToRemove(v)} className={buttonClass.danger}>
                      <Icon name="visibility_off" className="text-base" /> Yayından kaldır
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
        <Pager page={page} count={venues.data?.length ?? 0} onPage={setPage} />
      </QueryState>

      {toRemove && (
        <RemoveVenueDialog
          venue={toRemove}
          onCancel={() => setToRemove(null)}
          onDone={(message) => {
            setToRemove(null)
            setNotice(message)
          }}
        />
      )}
    </section>
  )
}
