import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ApiError, api, apiData, setAuthHandlers } from '../lib/api'
import { clearLegacyToken, hasSessionHint, type Session, type SessionInfo } from './session'
import { AuthContext, type AuthStatus } from './useAuth'

const toSession = (info: SessionInfo): Session => ({ userId: info.userId, role: info.role, companyId: info.companyId ?? null })

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  // Oturum işareti varsa açılışta sunucuya sorulana kadar "loading": korumalı sayfalar girişe atmasın
  const [state, setState] = useState<{ status: AuthStatus; session: Session | null }>(() => ({
    status: hasSessionHint() ? 'loading' : 'ready',
    session: null,
  }))
  const setSession = useCallback((session: Session | null) => setState({ status: 'ready', session }), [])

  useEffect(() => {
    clearLegacyToken()
    setAuthHandlers({
      onUnauthorized: () => {
        queryClient.clear()
        setSession(null)
      },
      onRefreshed: (info) => setSession(toSession(info)),
    })
    if (!hasSessionHint()) return
    // Access cookie'nin süresi dolmuşsa api() önce refresh dener
    apiData<SessionInfo>('/api/auth/session')
      .then((info) => setSession(toSession(info)))
      .catch(() => setSession(null))
  }, [queryClient, setSession])

  const logout = useCallback(async () => {
    // Sunucuda oturum kapanır, cookie'ler silinir; ağ hatasında da yerelde çıkış yapılır
    await api('/api/auth/logout', { method: 'POST' }).catch(() => undefined)
    queryClient.clear() // başka firmayla girilirse eski firmanın verisi görünmesin
    setSession(null)
  }, [queryClient, setSession])

  /** Giriş ucu cookie'leri yazar; hesabın rolü oturum ucundan okunur */
  const startSession = useCallback(async (expectedRole: Session['role'], wrongRoleMessage: string) => {
    const info = await apiData<SessionInfo>('/api/auth/session')
    if (info.role !== expectedRole || (expectedRole === 'Company' && !info.companyId)) {
      await api('/api/auth/logout', { method: 'POST' }).catch(() => undefined)
      setSession(null)
      throw new ApiError(wrongRoleMessage, 403)
    }
    setSession(toSession(info))
  }, [setSession])

  const login = useCallback(async (email: string, password: string) => {
    await apiData('/api/companies/login', { method: 'POST', body: { email, password } })
    await startSession('Company', 'Bu hesap bir firma hesabı değil.')
  }, [startSession])

  const loginAdmin = useCallback(async (email: string, password: string) => {
    const form = new FormData()
    form.set('Email', email)
    form.set('Password', password)
    await apiData('/api/auth/login', { method: 'POST', body: form })
    queryClient.clear() // önceki oturumun (ör. bir firmanın) verisi kalmasın
    await startSession('Admin', 'Bu hesap bir yönetici hesabı değil.')
  }, [queryClient, startSession])

  const value = useMemo(
    () => ({ session: state.session, status: state.status, login, loginAdmin, logout }),
    [state, login, loginAdmin, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
