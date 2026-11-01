import { lazy, Suspense } from 'react'
import { useDistricts } from '../api/panel'
import { useCities } from '../api/queries'
import { hasMapPoint, type LocationValue } from './location'
import { inputClass } from './styles'
import { Field } from './ui'

const LocationPicker = lazy(() => import('./LocationPicker').then((m) => ({ default: m.LocationPicker })))

/** İl, ilçe, açık adres ve haritada nokta. Firma kaydı, firma bilgileri ve mekan formunda ortak. */
export function LocationFields({ value, onChange }: { value: LocationValue; onChange: (patch: Partial<LocationValue>) => void }) {
  const cities = useCities()
  const districts = useDistricts(value.cityId || undefined)
  const city = cities.data?.find((c) => c.id === value.cityId)

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="İl" required>
          <select
            required
            value={value.cityId || ''}
            className={inputClass}
            // Önceki ildeki nokta yeni ilde yanlış olur; harita yeni ile odaklanır, nokta yeniden seçilir
            onChange={(e) => onChange({ cityId: Number(e.target.value), districtId: 0, latitude: 0, longitude: 0 })}
          >
            <option value="">Seçin</option>
            {cities.data?.map((c) => <option key={c.id} value={c.id}>{c.cityName}</option>)}
          </select>
        </Field>
        <Field label="İlçe" required>
          <select required value={value.districtId || ''} disabled={!districts.data} className={inputClass}
            onChange={(e) => onChange({ districtId: Number(e.target.value) })}>
            <option value="">Seçin</option>
            {districts.data?.map((d) => <option key={d.id} value={d.id}>{d.districtName}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Açık adres" required>
        <input required value={value.adress} onChange={(e) => onChange({ adress: e.target.value })} className={inputClass}
          placeholder="Mahalle, cadde/sokak, no" />
      </Field>
      <div>
        <span className="mb-1 block text-label-md text-on-surface">
          Haritadaki konum<span className="text-secondary"> *</span>
        </span>
        <div className="h-80 overflow-hidden rounded-xl bg-surface-container">
          <Suspense fallback={<div className="h-full w-full animate-pulse bg-surface-container-high" />}>
            <LocationPicker
              value={{ latitude: value.latitude, longitude: value.longitude }}
              center={city ? { latitude: city.latitude, longitude: city.longitude } : undefined}
              onChange={(p) => onChange(p)}
            />
          </Suspense>
        </div>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          {hasMapPoint(value)
            ? `Haritaya tıklayın ya da pini sürükleyin. Şu an: ${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}`
            : 'Haritada tam yerine tıklayın; ziyaretçiler yol tarifini buradan alır.'}
        </p>
      </div>
    </>
  )
}
