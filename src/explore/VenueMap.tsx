import L from 'leaflet'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import { Link } from 'react-router'
import { Icon } from '../components/Icon'
import { uploadUrl } from '../lib/api'
import { formatNumber, formatPrice, formatPriceShort } from '../lib/format'
import type { VenueListItem } from '../lib/types'

const TURKEY: L.LatLngTuple = [39.0, 35.2]

/** Konumu girilmemiş (0,0) firmalar haritada gösterilmez */
const hasLocation = (v: VenueListItem) => v.latitude !== 0 || v.longitude !== 0

function pinIcon(label: string, active: boolean) {
  const pill = active
    ? 'bg-primary text-on-primary ring-2 ring-surface-bright scale-110 shadow-xl'
    : 'bg-surface-container-lowest text-primary shadow-md'
  return L.divIcon({
    className: 'price-pin',
    iconSize: [88, 32],
    iconAnchor: [44, 16],
    html: `<div class="flex h-8 w-[88px] items-center justify-center"><span class="rounded-full px-3 py-1.5 text-label-md font-bold whitespace-nowrap transition-transform ${pill}">${label}</span></div>`,
  })
}

type Props = {
  venues: VenueListItem[]
  activeId: string | null
  onSelect: (id: string | null) => void
  categoryNames: Map<number, string>
}

export function VenueMap({ venues, activeId, onSelect, categoryNames }: Props) {
  const located = useMemo(() => venues.filter(hasLocation), [venues])
  const active = located.find((v) => v.id === activeId)

  return (
    <div className="relative h-full w-full">
      <MapContainer center={TURKEY} zoom={6} zoomControl={false} className="map-muted h-full w-full bg-[#e7ebed]">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıda bulunanlar'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />
        <FitToVenues venues={located} />
        <ResizeWatcher />
        {located.map((v) => (
          <Marker
            key={v.id}
            position={[v.latitude, v.longitude]}
            icon={pinIcon(formatPriceShort(v.price), v.id === activeId)}
            zIndexOffset={v.id === activeId ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(v.id) }}
            title={v.title}
          />
        ))}
      </MapContainer>

      {venues.length > located.length && (
        <p className="absolute top-4 left-4 z-[500] rounded-full bg-surface-bright/90 px-3 py-1 text-label-sm text-on-surface-variant shadow-sm backdrop-blur-sm">
          {venues.length - located.length} mekanın konumu girilmemiş
        </p>
      )}

      {active && (
        // bottom-8: alttaki OpenStreetMap atfı görünür kalmalı (lisans şartı)
        <div className="absolute right-4 bottom-8 left-4 z-[500] flex gap-3 rounded-xl bg-surface-container-lowest p-2 shadow-2xl">
          <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-surface-container">
            {active.coverPhotoPath && <img src={uploadUrl(active.coverPhotoPath)} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="min-w-0 flex-1 py-0.5">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate text-title-md text-primary">{active.title}</p>
              <button type="button" aria-label="Kapat" onClick={() => onSelect(null)} className="text-on-surface-variant hover:text-on-surface">
                <Icon name="close" className="text-lg" />
              </button>
            </div>
            <p className="truncate text-body-sm text-on-surface-variant">
              {[categoryNames.get(active.categoryId), active.districtName, `${formatNumber(active.maxGuestCount)} davetli`].filter(Boolean).join(' • ')}
            </p>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <p className="text-label-md text-primary">
                {formatPrice(active.price)} <span className="font-normal text-on-surface-variant">başlangıç</span>
              </p>
              <Link to={`/mekan/${active.id}`} className="text-label-md text-secondary hover:underline">İncele →</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Sonuçlar değişince haritayı mekanları kapsayacak şekilde ayarla */
function FitToVenues({ venues }: { venues: VenueListItem[] }) {
  const map = useMap()
  const key = venues.map((v) => v.id).join(',')

  useEffect(() => {
    if (venues.length === 0) map.setView(TURKEY, 6)
    else if (venues.length === 1) map.setView([venues[0].latitude, venues[0].longitude], 13)
    else map.fitBounds(L.latLngBounds(venues.map((v) => [v.latitude, v.longitude])), { padding: [48, 48], maxZoom: 14 })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnızca sonuç kümesi değişince
  }, [key, map])

  return null
}

/** Liste/harita görünümü değişince Leaflet'in boyutu yeniden hesaplaması gerekir */
function ResizeWatcher() {
  const map = useMap()
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])
  return null
}
