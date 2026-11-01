// Mekan hizmetleri serbest metin olarak girilir; anahtar kelimeye göre ikon seçilir.
const rules: [RegExp, string][] = [
  [/nikah|seremoni|tören/i, 'favorite'],
  [/yemek|menü|büfe|mutfak|şef|ikram|servis/i, 'restaurant'],
  [/kokteyl|bar|şarap|içecek/i, 'wine_bar'],
  [/müzik|dj|orkestra/i, 'music_note'],
  [/vale|otopark|park yeri/i, 'local_parking'],
  [/tekne|yat|iskele|boğaz turu/i, 'sailing'],
  [/deniz|koy|göl|marina/i, 'water'],
  [/manzara/i, 'landscape'],
  [/gelin|süit|hazırlık/i, 'bedroom_parent'],
  [/konaklama|otel/i, 'hotel'],
  [/engelli|erişim/i, 'accessible'],
  [/jeneratör|elektrik/i, 'bolt'],
  [/ses|ışık|projeksiyon|teknik/i, 'speaker'],
  [/fotoğraf|drone|video/i, 'photo_camera'],
  [/çocuk/i, 'child_care'],
  [/havuz/i, 'pool'],
  [/şömine/i, 'fireplace'],
  [/çadır|yağmur/i, 'umbrella'],
  [/çeviri/i, 'translate'],
  [/internet|wifi/i, 'wifi'],
  [/sahne|podyum/i, 'theater_comedy'],
  [/avize|kristal/i, 'light'],
  [/lounge|oturma/i, 'weekend'],
  [/teras|rooftop|çatı/i, 'roofing'],
  [/bahçe|ağaç|bağ|peyzaj|avlu/i, 'park'],
]

export function serviceIcon(service: string): string {
  return rules.find(([re]) => re.test(service))?.[1] ?? 'check_circle'
}
