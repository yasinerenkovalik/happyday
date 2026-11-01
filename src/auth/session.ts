// Oturum bilgisi. Token'lar backend'in yazdığı httpOnly cookie'lerde durur, JavaScript onlara erişemez;
// kim olduğumuzu GET api/auth/session ya da POST api/auth/refresh yanıtından öğreniriz.

export type Session = {
  userId: string
  role: 'Admin' | 'Company' | 'User'
  companyId: string | null
}

/** Backend'in döndürdüğü oturum bilgisi (AuthSessionInfo) */
export type SessionInfo = Session

/** Sır içermeyen işaret cookie'si: oturum yoksa açılışta boşuna istek atılmasın */
export function hasSessionHint(): boolean {
  return document.cookie.split('; ').includes('davetly.session=1')
}

/** Eski sürüm token'ı localStorage'da tutuyordu; kalan kopya silinir */
export function clearLegacyToken() {
  try {
    localStorage.removeItem('happyday.token')
  } catch {
    // Gizli sekme vb.
  }
}
