import { Link } from 'react-router'
import { Icon } from '../components/Icon'
import { uploadUrl } from '../lib/api'
import { formatNumber, formatPrice } from '../lib/format'
import type { VenueListItem } from '../lib/types'

type Props = {
  venue: VenueListItem
  categoryName?: string
  active: boolean
  onHover: (id: string | null) => void
}

export function VenueCard({ venue, categoryName, active, onHover }: Props) {
  const location = [venue.districtName, venue.cityName].filter(Boolean).join(', ')
  const highlight = venue.services[0]

  return (
    <article
      id={`venue-${venue.id}`}
      onMouseEnter={() => onHover(venue.id)}
      onMouseLeave={() => onHover(null)}
      className={`group relative flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest transition-all duration-300 hover:shadow-xl ${
        active ? 'shadow-xl ring-2 ring-secondary/40' : 'shadow-sm'
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container">
        {venue.coverPhotoPath ? (
          <img
            src={uploadUrl(venue.coverPhotoPath)}
            alt={venue.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-on-surface-variant">
            <Icon name="image" className="text-4xl" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-60" />
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
          {categoryName && (
            <span className="rounded-full bg-surface-bright/95 px-2.5 py-1 text-label-sm text-primary shadow-sm backdrop-blur-md">
              {categoryName}
            </span>
          )}
          {highlight && (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-label-sm text-on-secondary shadow-sm">{highlight}</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 p-4">
        <div className="space-y-1">
          <p className="flex items-center gap-1 text-body-sm font-medium text-primary">
            <Icon name="location_on" className="text-sm text-secondary" />
            {location}
          </p>
          <h2 className="line-clamp-1 text-headline-sm text-primary transition-colors group-hover:text-secondary">{venue.title}</h2>
          <p className="flex items-center gap-3 text-body-sm text-on-surface-variant">
            <span className="flex items-center gap-1">
              <Icon name="group" className="text-sm" /> {formatNumber(venue.maxGuestCount)} kişi kapasite
            </span>
            <span aria-hidden="true">•</span>
            <span className="flex items-center gap-1">
              <Icon name={venue.isOutdoor ? 'deck' : 'meeting_room'} className="text-sm" />
              {venue.isOutdoor ? 'Açık alan' : 'Kapalı alan'}
            </span>
          </p>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-body-sm text-on-surface-variant">Paket başlangıcı:</span>
            <p className="text-title-md font-bold text-primary">{formatPrice(venue.price)}</p>
          </div>
          <span className="text-label-md text-secondary group-hover:underline">Detayları gör →</span>
        </div>
      </div>

      {/* Kartın tamamı detay sayfasına gider */}
      <Link to={`/mekan/${venue.id}`} aria-label={`${venue.title} detayları`} className="absolute inset-0 z-20" />
    </article>
  )
}

export function VenueCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
      <div className="aspect-[4/3] animate-pulse bg-surface-container" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-surface-container" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-surface-container" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface-container" />
        <div className="h-5 w-1/4 animate-pulse rounded bg-surface-container" />
      </div>
    </div>
  )
}
