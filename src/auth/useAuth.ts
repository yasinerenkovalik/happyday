import { createContext, useContext } from 'react'
import type { Session } from './session'

/** loading: sayfa açılışında oturum sunucuya soruluyor */
export type AuthStatus = 'loading' | 'ready'

export type AuthContextValue = {
  session: Session | null
  status: AuthStatus
  /** Firma girişi (POST api/companies/login) */
  login: (email: string, password: string) => Promise<void>
  /** Yönetici girişi (POST api/auth/login); yalnızca Admin rolü kabul edilir */
  loginAdmin: (email: string, password: string) => Promise<void>
  /** Sunucudaki oturumu kapatır ve cookie'leri siler */
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth, AuthProvider içinde kullanılmalı')
  return ctx
}

/** Firma paneli sayfaları yalnızca giriş yapılmışken kullanılır; companyId burada her zaman doludur. */
export function useCompanySession() {
  const { session } = useAuth()
  if (!session?.companyId) throw new Error('Firma oturumu yok')
  return { ...session, companyId: session.companyId }
}
