import { useState } from 'react'
import { Link } from 'react-router'
import { useCompany, useDeleteVenue } from '../api/panel'
import { useCategories, useCompanyVenues } from '../api/queries'
import { useCompanySession } from '../auth/useAuth'
import { Icon } from '../components/Icon'
import { QueryState } from '../components/QueryState'
import { uploadUrl } from '../lib/api'
import { formatNumber, formatPrice } from '../lib/format'
import type { CompanyVenue } from '../lib/types'
import { buttonClass } from '../panel/styles'
import { ConfirmDialog, Notice, PageHeader } from '../panel/ui'

export function VenuesPage() {
  const { companyId } = useCompanySession()
  const venues = useCompanyVenues(companyId)
  const company = useCompany(companyId)
  const categories = useCategories()
  const remove = useDeleteVenue(companyId)
  const [toDelete, setToDelete] = useState<CompanyVenue | null>(null)
  const [deletedTitle, setDeletedTitle] = useState<string | null>(null)

  const categoryName = (id: number) => categories.data?.find((c) => c.id === id)?.name

  const confirmDelete = () => {
    if (!toDelete) return
    remove.mutate(toDelete.id, {
      onSuccess: () => {
        setDeletedTitle(toDelete.title)
        setToDelete(null)
      },
    })
  }

  return (
    <section>
      <PageHeader
        title="Mekanlarım"
        description="Mekanlarınızı ekleyin, düzenleyin; görselleri ve paketleri buradan yönetin."
        action={
          <Link to="/panel/mekanlar/yeni" className={buttonClass.primary}>
            <Icon name="add" className="text-lg" /> Yeni mekan
          </Link>
        }
      />

      {deletedTitle && <div className="mb-4"><Notice tone="success">“{deletedTitle}” silindi.</Notice></div>}

      <QueryState
        isPending={venues.isPending}
        error={venues.error}
        isEmpty={venues.data?.length === 0}
        emptyText="Henüz mekanınız yok. “Yeni mekan” ile ilk mekanınızı ekleyin."
        onRetry={() => venues.refetch()}
      >
        <ul className="grid gap-4 sm:grid-cols-2">
          {venues.data?.map((venue) => (
            <li key={venue.id} className="flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
              <Link to={`/panel/mekanlar/${venue.id}`} className="group relative block aspect-[16/9] overflow-hidden bg-surface-container">
                {venue.coverPhotoPath ? (
                  <img src={uploadUrl(venue.coverPhotoPath)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center text-on-surface-variant">
                    <Icon name="add_photo_alternate" className="text-4xl" />
                  </div>
                )}
                {categoryName(venue.categoryId) && (
                  <span className="absolute top-3 left-3 rounded-full bg-surface-bright/95 px-2.5 py-1 text-label-sm text-primary shadow-sm">
                    {categoryName(venue.categoryId)}
                  </span>
                )}
              </Link>
              <div className="flex flex-1 flex-col justify-between gap-3 p-4">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-headline-sm text-primary">{venue.title}</h2>
                    <span className="shrink-0 text-title-md text-primary">{formatPrice(venue.price)}</span>
                  </div>
                  {venue.removedByAdminAt && (
                    <p className="rounded-lg bg-error-container px-3 py-2 text-body-sm text-on-error-container">
                      <strong>Yönetici tarafından yayından kaldırıldı.</strong> {venue.removalReason}
                    </p>
                  )}
                  {venue.location && (
                    <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
                      <Icon name="location_on" className="text-sm text-secondary" /> {venue.location}
                    </p>
                  )}
                  <p className="text-body-sm text-on-surface-variant">
                    {formatNumber(venue.maxGuestCount)} kişi · {venue.isOutdoor ? 'Açık alan' : 'Kapalı alan'} · {venue.services.length} hizmet
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/panel/mekanlar/${venue.id}`} className={buttonClass.primary}>
                    <Icon name="edit" className="text-base" /> Düzenle
                  </Link>
                  {company.data?.isApproved && (
                    <Link to={`/mekan/${venue.id}`} target="_blank" className={buttonClass.secondary}>
                      <Icon name="open_in_new" className="text-base" /> Sitede gör
                    </Link>
                  )}
                  <button type="button" onClick={() => setToDelete(venue)} className={`${buttonClass.danger} ml-auto`}>
                    <Icon name="delete" className="text-base" /> Sil
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </QueryState>

      {toDelete && (
        <ConfirmDialog
          title="Mekanı sil"
          message={
            <>
              <strong className="text-primary">{toDelete.title}</strong> silinecek ve sitede görünmeyecek. Paketleri ve görselleriyle birlikte panelden de kalkar.
              {remove.error && <span className="mt-2 block text-error">{remove.error.message}</span>}
            </>
          }
          confirmLabel="Evet, sil"
          pending={remove.isPending}
          onConfirm={confirmDelete}
          onCancel={() => { setToDelete(null); remove.reset() }}
        />
      )}
    </section>
  )
}
