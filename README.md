# HappyDay Frontend

Davetly ziyaretçi sitesi ve firma paneli. Vite, React 19, TypeScript, React Router, TanStack Query, Tailwind CSS 4 ve Leaflet ile yazıldı. Görsel tasarım Google Stitch'teki Davetly tasarımından alındı; renk, yazı tipi ve yazı ölçeği `src/index.css` içindeki `@theme` bloğunda.

## Çalıştırma

Önce backend'in (`HappyDayBackEnd`) `http://localhost:5050` adresinde çalışıyor olması gerekir. Kurulumu için backend README'sine bakın.

```bash
npm install
npm run dev
```

Panel `http://localhost:5173` adresinde açılır. Geliştirmede `/api` ve `/uploads` istekleri Vite proxy'si üzerinden backend'e gider, bu yüzden CORS ayarı gerekmez. Backend başka bir adresteyse `VITE_BACKEND_URL=http://... npm run dev` ile değiştirin.

## Kontroller

```bash
npm run lint    # oxlint
npm run build   # tsc -b ve vite build
```

`.github/workflows/ci.yml` her push ve pull request'te ikisini Node 24 ile çalıştırır. Node 22.22'den eski sürümler desteklenmez (react-router 8 bunu ister).

## Üretim

```bash
npm run build
```

Çıktı `dist/` klasörüne yazılır. API farklı bir alan adındaysa derlemeden önce `VITE_API_URL` verin (bkz. `.env.example`); o durumda backend'in `Cors:AllowedOrigins` ayarına frontend adresi eklenmelidir.

## Yapı

- `src/lib/api.ts`: backend ile tek iletişim noktası. `GeneralResponse` yanıtlarını açar, hataları `ApiError` olarak fırlatır; 401'de önce oturumu yenilemeyi dener, olmazsa oturumu kapatır.
- `src/auth/`: oturum, giriş/çıkış ve korumalı sayfalar. Token'lar backend'in yazdığı httpOnly cookie'lerde durur; JavaScript onları okuyamaz. Kim olduğumuz açılışta `GET api/auth/session` ile öğrenilir (yalnızca `davetly.session` işaret cookie'si varsa). Access token'ın süresi dolunca `src/lib/api.ts` 401'i yakalar, `POST api/auth/refresh` ile yeniler ve isteği tekrarlar. Her istekte gönderilen `X-Davetly-Client` başlığı backend'in CSRF kontrolü içindir.
- `src/api/queries.ts`: React Query hook'ları.
- `src/pages/ExplorePage.tsx` ve `src/explore/`: ana sayfa (`/`). Şehir, mekan türü, kişi sayısı, fiyat ve açık/kapalı alan filtreleri adres çubuğunda tutulur (`?sehir=34&kategori=6`), sağda mekanların fiyat pinleriyle harita.
- `src/pages/VenueDetailPage.tsx` ve `src/venue/`: mekan detayı (`/mekan/:id`). Galeri, paketler, hizmetler, konum ve teklif formu; form `POST api/contact-messages` ile firmaya mesaj olarak gider ve firma panelindeki Mesajlar sayfasında görünür.
- Firma hesabı (`src/pages/`, `src/api/account.ts`):
  - `/kayit`: firma kaydı; hesap açılınca "e-postanızı doğrulayın" ekranı gösterilir. Doğrulamadan giriş yapılamaz; giriş sayfası bu durumda "Doğrulama e-postasını tekrar gönder" düğmesi gösterir.
  - `/sifremi-unuttum`: şifre sıfırlama bağlantısı ister
  - `/auth/reset-password` ve `/auth/confirm-email`: backend'in gönderdiği e-postalardaki bağlantılar buraya gelir. Adresler backend'deki `Frontend:BaseUrl` ayarıyla birlikte çalışır; değiştirilirse backend'deki e-posta şablonları da değişmeli.
- Firma paneli (`src/pages/` ve `src/panel/`), ziyaretçi sitesinden ayrı parça olarak yüklenir:
  - `/giris`: firma girişi
  - `/panel`: Mekanlarım (listele, sil)
  - `/panel/mekanlar/yeni` ve `/panel/mekanlar/:id`: mekan ekleme/düzenleme; kapak, galeri, hizmetler ve paketler
  - `/panel/mesajlar`: teklif formundan gelen talepler
  - `/panel/firma`: firma bilgileri, il/ilçe ve haritada konum seçimi
  - Her mekanın kendi il, ilçe, adres ve harita konumu var; yeni mekan firmanın adresiyle başlar.
  - E-posta doğrulanmadıysa panelin üstünde "Tekrar gönder" düğmesi görünür.
- Yönetim paneli (`src/pages/Admin*`, `src/admin/`, `src/api/admin.ts`):
  - `/admin/giris`: yönetici girişi (`POST api/auth/login`, yalnızca Admin rolü)
  - `/admin`: özet; firma, mekan, kullanıcı ve mesaj sayıları
  - `/admin/firmalar`: firma onayı. Onaylanan firmanın mekanları sitede listelenir.
  - `/admin/kullanicilar`: kullanıcıları pasifleştirme ve yeniden aktifleştirme
  - `/admin/mesajlar`: tüm firmalara gelen teklif mesajları
  - Firma oturumu `/admin`'e, yönetici oturumu `/panel`'e girmeye çalışırsa kendi paneline yönlendirilir.

Geliştirmede örnek veri için backend'deki `seed-demo.sql` dosyasını yükleyin (bkz. backend README).

Harita karoları geliştirmede doğrudan OpenStreetMap'ten gelir. OSM'in [kullanım kuralları](https://operations.osmfoundation.org/policies/tiles/) yoğun üretim trafiğine izin vermez; yayına çıkmadan önce bir karo sağlayıcısına (MapTiler, Stadia vb.) geçilmeli. Adresler `src/explore/VenueMap.tsx` ve `src/venue/LocationMap.tsx` içinde.

## Yayın (Docker / Coolify)

`Dockerfile` uygulamayı Node 24 ile derler ve nginx ile sunar (`nginx/default.conf`): tek sayfa uygulama yönlendirmesi, `/assets` için uzun süreli önbellek, `index.html` için önbelleksiz, güvenlik başlıkları ve `/health`. API adresi derleme sırasında verilir:

```bash
docker build --build-arg VITE_API_URL=https://api.mutlugunum.com.tr -t mutlugunum-web .
```

Coolify'da bu değer **Build Variable** olarak girilir. Adım adım kurulum backend reposundaki `docs/yayin-coolify.md` dosyasında.

## Güvenlik

`npm run build` çıktısındaki `index.html`'e bir Content-Security-Policy meta etiketi eklenir (`vite.config.ts`, geliştirmede eklenmez). Script'ler yalnızca sitenin kendisinden yüklenir; dışarıdan izin verilenler Google Fonts, OpenStreetMap karoları, örnek verideki `lh3.googleusercontent.com` görselleri ve `VITE_API_URL` verilmişse API adresi. Harita karo sağlayıcısı ya da görsel adresi değişirse oradaki listeyi güncelleyin; aksi halde tarayıcı o kaynakları engeller.

Meta etiketiyle verilemeyen başlıkları siteyi sunan sunucu eklemeli: `Content-Security-Policy: frame-ancestors 'none'` (ya da `X-Frame-Options: DENY`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` ve HTTPS'te `Strict-Transport-Security`.

Teklif formunda ekranda görünmeyen bir `website` alanı var (bal küpü). Formu otomatik dolduran botlar bunu da doldurur; backend bu talepleri sessizce yok sayar.

Endpoint listesi için backend'deki `docs/api-endpoint-degisiklikleri.md` dosyasına bakın.
