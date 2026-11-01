import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/**
 * Üretim derlemesine Content-Security-Policy meta etiketi ekler. Geliştirmede eklenmez:
 * Vite'ın HMR ve React Refresh için koyduğu satır içi script'ler CSP'ye takılır.
 * frame-ancestors meta etiketinde çalışmaz; onu sunucu başlığı olarak verin (bkz. README).
 */
function contentSecurityPolicy(apiUrl: string): Plugin {
  const api = apiUrl ? new URL(apiUrl).origin : ''
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    // lh3.googleusercontent.com: seed-demo.sql'deki örnek mekan görselleri
    `img-src 'self' data: blob: https://tile.openstreetmap.org https://lh3.googleusercontent.com ${api}`,
    `connect-src 'self' ${api}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ]

  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy.map((p) => p.trim()).join('; ')}" />`

  return {
    name: 'davetly-csp',
    apply: 'build',
    // charset'ten hemen sonra: CSP yalnızca kendisinden sonra yüklenen kaynakları kapsar
    transformIndexHtml: (html) => html.replace(/<meta charset="UTF-8" \/>/, (m) => `${m}\n    ${meta}`),
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Geliştirmede API ve yüklenen görseller backend'den (HappyDay.Api, launchSettings: 5050) gelir.
  // Aynı origin üzerinden geçtiği için CORS ayarı gerekmez.
  const backend = env.VITE_BACKEND_URL || 'http://localhost:5050'
  const proxy = { '/api': backend, '/uploads': backend }

  return {
    plugins: [react(), tailwindcss(), contentSecurityPolicy(env.VITE_API_URL ?? '')],
    server: { port: 5173, proxy },
    // `npm run preview` ile derlenmiş sürüm de aynı backend'e bağlanır
    preview: { port: 4173, proxy },
  }
})
