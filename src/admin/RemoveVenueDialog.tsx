import { useEffect, useRef, useState } from 'react'
import { useRemoveVenue } from '../api/admin'
import { inputClass } from '../panel/styles'
import { ConfirmDialog } from '../panel/ui'

const MIN_REASON = 10

/** Yönetici uygunsuz mekanı sebep yazarak yayından kaldırır; sebep firmaya e-postayla ve panelde gösterilir */
export function RemoveVenueDialog({
  venue,
  onDone,
  onCancel,
}: {
  venue: { id: string; title: string }
  onDone: (message: string) => void
  onCancel: () => void
}) {
  const remove = useRemoveVenue()
  const [reason, setReason] = useState('')
  const reasonRef = useRef<HTMLTextAreaElement>(null)
  // Pencerenin "Vazgeç" düğmesi autoFocus alıyor; yazmaya hemen başlanabilsin
  useEffect(() => reasonRef.current?.focus(), [])
  const tooShort = reason.trim().length < MIN_REASON

  return (
    <ConfirmDialog
      title="Mekanı yayından kaldır"
      confirmLabel="Yayından kaldır"
      pendingLabel="Kaldırılıyor…"
      pending={remove.isPending}
      confirmDisabled={tooShort}
      onCancel={onCancel}
      onConfirm={() => remove.mutate({ venueId: venue.id, reason: reason.trim() }, { onSuccess: onDone })}
      message={
        <div className="space-y-3">
          <p>
            <strong className="text-primary">{venue.title}</strong> sitede görünmeyecek ve teklif alamayacak. Mekan silinmez; firma
            sebebi e-postayla ve panelinde görür, düzelttikten sonra yeniden yayına alabilirsiniz.
          </p>
          <label className="block">
            <span className="mb-1 block text-label-md text-on-surface">Sebep (firmaya gönderilir)</span>
            <textarea
              ref={reasonRef}
              rows={4}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ör. Galerideki 3. fotoğraf başka bir mekana ait; lütfen kendi fotoğraflarınızı kullanın."
              className={`${inputClass} resize-y`}
            />
            <span className="mt-1 block text-body-sm text-on-surface-variant">
              {tooShort ? `En az ${MIN_REASON} karakter` : `${reason.trim().length}/500`}
            </span>
          </label>
          {remove.error && <p className="text-body-sm text-error">{remove.error.message}</p>}
        </div>
      }
    />
  )
}
