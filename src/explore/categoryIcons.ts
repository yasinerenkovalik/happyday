// Kategori adlarına göre Material Symbols ikonu. Kategoriler veritabanından geldiği için
// id yerine ada bakılır; tanınmayan kategori varsayılan ikonu alır.
const rules: [RegExp, string][] = [
  [/tekne|yat/i, 'sailing'],
  [/otel|balo/i, 'apartment'],
  [/nikah/i, 'favorite'],
  [/düğün|dugun/i, 'celebration'],
  [/kır bahçe|kir bahce/i, 'park'],
  [/bahçe|peyzaj/i, 'yard'],
  [/kır|ev\b/i, 'cottage'],
  [/galeri|sanat|loft/i, 'palette'],
  [/kongre|toplantı/i, 'co_present'],
  [/rooftop|teras/i, 'roofing'],
  [/restoran|restaurant|lounge/i, 'restaurant'],
  [/sosyal|kulüp|tesis/i, 'groups'],
]

export function categoryIcon(name: string): string {
  return rules.find(([re]) => re.test(name))?.[1] ?? 'celebration'
}
