import { useContactMessages } from '../api/queries'
import { QueryState } from '../components/QueryState'
import { MessageCard } from '../panel/MessageCard'
import { PageHeader } from '../panel/ui'

export function MessagesPage() {
  const messages = useContactMessages()

  return (
    <section>
      <PageHeader title="Mesajlar" description="Mekan sayfalarındaki teklif formundan gelen talepler." />

      <QueryState
        isPending={messages.isPending}
        error={messages.error}
        isEmpty={messages.data?.length === 0}
        emptyText="Henüz mesaj gelmedi."
        onRetry={() => messages.refetch()}
      >
        <ul className="space-y-3">
          {messages.data?.map((m) => <MessageCard key={m.id} message={m} />)}
        </ul>
      </QueryState>
    </section>
  )
}
