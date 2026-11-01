import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import type { Session } from './session'
import { useAuth } from './useAuth'

/** Firma paneli Company, yönetim paneli Admin oturumu ister; diğer roldeki oturum kendi paneline gider. */
export function RequireAuth({ role, children }: { role: Extract<Session['role'], 'Company' | 'Admin'>; children: ReactNode }) {
  const { session, status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <p className="py-24 text-center text-on-surface-variant">Yükleniyor…</p>
  if (session?.role === role) return children
  if (session?.role === 'Admin') return <Navigate to="/admin" replace />
  if (session?.role === 'Company') return <Navigate to="/panel" replace />
  return <Navigate to={role === 'Admin' ? '/admin/giris' : '/giris'} replace state={{ from: location.pathname }} />
}
