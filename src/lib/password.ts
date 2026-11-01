// Backend'deki PasswordRules ile aynı kural: en az 8 karakter, en az bir harf ve bir rakam
export const PASSWORD_HINT = 'En az 8 karakter; en az bir harf ve bir rakam.'

/** Şifre kurala uymuyorsa kullanıcıya gösterilecek mesaj, uyuyorsa null. */
export function passwordProblem(password: string, repeat: string): string | null {
  if (password.length < 8) return 'Şifre en az 8 karakter olmalı.'
  if (!/\p{L}/u.test(password)) return 'Şifre en az bir harf içermeli.'
  if (!/[0-9]/.test(password)) return 'Şifre en az bir rakam içermeli.'
  if (password !== repeat) return 'Şifreler aynı değil.'
  return null
}
