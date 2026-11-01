import { useState, type KeyboardEvent } from 'react'
import { Icon } from '../components/Icon'
import { serviceIcon } from '../venue/serviceIcons'
import { inputClass } from './styles'

const SUGGESTIONS = [
  'Yemekli Menü', 'Kokteyl', 'Canlı Müzik İzni', 'DJ', 'Vale Hizmeti', 'Otopark', 'Gelin Hazırlık Odası',
  'Engelli Erişimi', 'Konaklama', 'Deniz Manzarası', 'Açık Büfe', 'Jeneratör', 'Ses Sistemi', 'Fotoğrafçı',
]

/** Hizmetleri etiket olarak girer: yaz + Enter (veya virgül), × ile sil, öneriye tıklayıp ekle */
export function ServicesInput({ value, onChange }: { value: string[]; onChange: (services: string[]) => void }) {
  const [draft, setDraft] = useState('')
  const has = (s: string) => value.some((v) => v.toLocaleLowerCase('tr') === s.toLocaleLowerCase('tr'))

  const add = (raw: string) => {
    const s = raw.trim()
    if (s && !has(s)) onChange([...value, s])
    setDraft('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(draft)
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {value.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-full bg-secondary-fixed/70 py-1 pr-1 pl-3 text-label-md text-on-secondary-fixed">
            <Icon name={serviceIcon(s)} className="text-base" />
            {s}
            <button type="button" aria-label={`${s} hizmetini kaldır`} onClick={() => onChange(value.filter((v) => v !== s))}
              className="rounded-full p-0.5 hover:bg-white/60">
              <Icon name="close" className="text-sm" />
            </button>
          </span>
        ))}
        {value.length === 0 && <span className="text-body-sm text-on-surface-variant">Henüz hizmet eklenmedi.</span>}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => draft && add(draft)}
        placeholder="Hizmet yazıp Enter'a basın"
        className={inputClass}
      />
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.filter((s) => !has(s)).map((s) => (
          <button key={s} type="button" onClick={() => add(s)}
            className="rounded-full bg-surface-container px-3 py-1 text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-primary">
            + {s}
          </button>
        ))}
      </div>
    </div>
  )
}
