import { useCallback, useState } from 'react'
import { useAdminUsers, useSetUserActive } from '../api/admin'
import { Badge, Pager, SearchBox } from '../admin/ui'
import { useAuth } from '../auth/useAuth'
import { QueryState } from '../components/QueryState'
import { formatDateTime } from '../lib/format'
import type { AdminUser } from '../lib/types'
import { buttonClass } from '../panel/styles'
import { ConfirmDialog, Notice, PageHeader } from '../panel/ui'

export function AdminUsersPage() {
  const { session } = useAuth()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const users = useAdminUsers({ search, page })
  const setActive = useSetUserActive()
  const [toDeactivate, setToDeactivate] = useState<AdminUser | null>(null)

  const onSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  return (
    <section className="space-y-4">
      <PageHeader title="Kullanıcılar" description="Platform kullanıcıları ve yöneticiler. Pasif kullanıcı giriş yapamaz." />
      <SearchBox placeholder="Ad, soyad veya e-posta" onSearch={onSearch} />
      {setActive.error && <Notice tone="error">{setActive.error.message}</Notice>}

      <QueryState
        isPending={users.isPending}
        error={users.error}
        isEmpty={users.data?.length === 0}
        emptyText={search ? 'Aramaya uyan kullanıcı yok.' : 'Kullanıcı yok.'}
        onRetry={() => users.refetch()}
      >
        <ul className="space-y-3">
          {users.data?.map((u) => {
            const self = u.id === session?.userId
            const pending = setActive.isPending && setActive.variables?.userId === u.id
            return (
              <li key={u.id} className="flex flex-wrap items-center gap-4 rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-title-md text-primary">{u.fullName}</p>
                    {u.isActivated ? <Badge tone="ok" icon="check_circle">Aktif</Badge> : <Badge tone="off" icon="block">Pasif</Badge>}
                    {self && <Badge tone="wait" icon="person">Siz</Badge>}
                  </div>
                  <p className="text-body-sm break-all text-on-surface-variant">{u.email} · {u.phoneNumber}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {u.companyName ? `${u.companyName} · ` : ''}Kayıt: {formatDateTime(u.createDate)}
                  </p>
                </div>
                {!self && (
                  u.isActivated ? (
                    <button type="button" disabled={pending} onClick={() => setToDeactivate(u)} className={buttonClass.danger}>
                      Pasifleştir
                    </button>
                  ) : (
                    <button type="button" disabled={pending} onClick={() => setActive.mutate({ userId: u.id, isActivated: true })} className={buttonClass.secondary}>
                      {pending ? 'Kaydediliyor…' : 'Aktifleştir'}
                    </button>
                  )
                )}
              </li>
            )
          })}
        </ul>
        <Pager page={page} count={users.data?.length ?? 0} onPage={setPage} />
      </QueryState>

      {toDeactivate && (
        <ConfirmDialog
          title="Kullanıcıyı pasifleştir"
          message={<><strong className="text-primary">{toDeactivate.fullName}</strong> bir daha giriş yapamayacak. Sonradan yeniden aktifleştirebilirsiniz.</>}
          confirmLabel="Pasifleştir"
          pending={setActive.isPending}
          onConfirm={() => setActive.mutate({ userId: toDeactivate.id, isActivated: false }, { onSettled: () => setToDeactivate(null) })}
          onCancel={() => setToDeactivate(null)}
        />
      )}
    </section>
  )
}
