import L from 'leaflet'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'

const pin = L.divIcon({
  className: 'price-pin',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  html: '<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-xl ring-4 ring-surface-bright"><span class="material-symbols-outlined icon-filled text-xl">location_on</span></div>',
})

export function LocationMap({ latitude, longitude, title }: { latitude: number; longitude: number; title: string }) {
  return (
    <MapContainer center={[latitude, longitude]} zoom={14} scrollWheelZoom={false} className="map-muted h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıda bulunanlar'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={pin} title={title} />
    </MapContainer>
  )
}
