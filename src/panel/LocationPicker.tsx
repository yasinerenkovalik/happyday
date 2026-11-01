import L from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'

const TURKEY: L.LatLngTuple = [39.0, 35.2]

const pin = L.divIcon({
  className: 'price-pin',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  html: '<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-xl ring-4 ring-surface-bright"><span class="material-symbols-outlined icon-filled text-xl">location_on</span></div>',
})

export type Point = { latitude: number; longitude: number }

/**
 * Haritaya tıklayarak veya pini sürükleyerek konum seçtirir.
 * Henüz nokta seçilmemişse `center` (ör. seçilen il) gösterilir, o da yoksa Türkiye.
 */
export function LocationPicker({ value, center, onChange }: { value: Point; center?: Point; onChange: (p: Point) => void }) {
  const hasValue = value.latitude !== 0 || value.longitude !== 0
  const position: L.LatLngTuple = hasValue ? [value.latitude, value.longitude] : center ? [center.latitude, center.longitude] : TURKEY
  const zoom = hasValue ? 14 : center ? 11 : 6

  return (
    <MapContainer center={position} zoom={zoom} scrollWheelZoom={false} className="map-muted h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıda bulunanlar'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToSet onChange={onChange} />
      <Recenter position={position} zoom={zoom} />
      {!hasValue && center && <FocusCenter center={center} />}
      {hasValue && (
        <Marker
          position={position}
          icon={pin}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = (e.target as L.Marker).getLatLng()
              onChange({ latitude: round(lat), longitude: round(lng) })
            },
          }}
        />
      )}
    </MapContainer>
  )
}

const round = (n: number) => Math.round(n * 1e6) / 1e6

function ClickToSet({ onChange }: { onChange: (p: Point) => void }) {
  useMapEvents({ click: (e) => onChange({ latitude: round(e.latlng.lat), longitude: round(e.latlng.lng) }) })
  return null
}

/** Nokta seçilmemişken il değişirse haritayı o ile odakla (Türkiye görünümünde il zaten sınırlar içinde kalır) */
function FocusCenter({ center }: { center: Point }) {
  const map = useMap()
  const { latitude, longitude } = center
  useEffect(() => {
    map.setView([latitude, longitude], 11)
  }, [latitude, longitude, map])
  return null
}

/** Konum dışarıdan değişince (ilk yükleme) haritayı oraya taşı; kullanıcının tıklamasında taşıma */
function Recenter({ position, zoom }: { position: L.LatLngTuple; zoom: number }) {
  const map = useMap()
  const [lat, lng] = position
  useEffect(() => {
    if (!map.getBounds().contains([lat, lng])) map.setView([lat, lng], Math.max(map.getZoom(), zoom))
  }, [lat, lng, zoom, map])
  return null
}
