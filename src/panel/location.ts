export type LocationValue = {
  cityId: number
  districtId: number
  adress: string
  latitude: number
  longitude: number
}

/** Haritada nokta seçilmiş mi (seçilmemiş konum 0,0 olarak tutulur) */
export const hasMapPoint = (v: Pick<LocationValue, 'latitude' | 'longitude'>) => v.latitude !== 0 || v.longitude !== 0
