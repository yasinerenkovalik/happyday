const currency = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })
const dateTime = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })

const number = new Intl.NumberFormat('tr-TR')

export const formatPrice = (value: number) => currency.format(value)
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso))
export const formatNumber = (value: number) => number.format(value)

/** Harita pinleri için kısa fiyat: ₺85K, ₺1,2M */
export function formatPriceShort(value: number) {
  if (value >= 1_000_000) return `₺${(value / 1_000_000).toLocaleString('tr-TR', { maximumFractionDigits: 1 })}M`
  if (value >= 1_000) return `₺${Math.round(value / 1_000)}K`
  return `₺${value}`
}
