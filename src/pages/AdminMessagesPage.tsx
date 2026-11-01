import { useCallback, useState } from 'react'
import { useAdminMessages } from '../api/admin'
import { Pager, SearchBox } from '../admin/ui'
import { QueryState } from '../components/QueryState'
import { MessageCard } from '../panel/MessageCard'
import { PageHeader } from '../panel/ui'

export function AdminMessagesPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const messages = useAdminMessages({ search, page })

  const onSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  return (
    <section className="space-y-4">
      <PageHeader title="Mesajlar" description="Tüm firmalara teklif formundan gelen talepler." />
      <SearchBox placeholder="Ad, e-posta veya mesaj" onSearch={onSearch} />
      <QueryState
        isPending={messages.isPending}
        error={messages.error}
        isEmpty={messages.data?.length === 0}
        emptyText={search ? 'Aramaya uyan mesaj yok.' : 'Henüz mesaj yok.'}
        onRetry={() => messages.refetch()}
      >
        <ul className="space-y-3">
          {messages.data?.map((m) => <MessageCard key={m.id} message={m} companyName={m.companyName} />)}
        </ul>
        <Pager page={page} count={messages.data?.length ?? 0} onPage={setPage} />
      </QueryState>
    </section>
  )
}
