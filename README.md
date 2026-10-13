# DRIVEPULSE AUTOMOTIVE — Landing Page Dealer Mobil Baru

Website dealer mobil bertema premium/futuristik: hero 3D, tipografi bergerak mengikuti scroll, showcase mobil berbasis scroll (GSAP ScrollTrigger), katalog dengan filter, detail kendaraan, simulator kredit (bunga flat), booking test drive, dan integrasi WhatsApp.

> **Penting — semua data adalah DEMO.** Nama kendaraan, harga, spesifikasi, dan gambar siluet di repo ini hanyalah contoh dan diberi label "DEMO". Nomor WhatsApp, alamat, dan kontak sengaja dikosongkan. Ganti dengan data dealer yang sudah dikonfirmasi sebelum dipublikasikan.

## Stack

React 18 · Vite 5 · React Three Fiber 8 + drei + three.js · GSAP + ScrollTrigger · Framer Motion · Lucide React · CSS terorganisasi dengan variabel desain · font Space Grotesk & DM Sans (via `@fontsource-variable`, tanpa request ke Google Fonts).

## 1. Persyaratan

- Node.js **18.18+** (disarankan 20 LTS) dan npm.
- Git (untuk GitHub) dan akun GitHub + Vercel.

## 2. Menjalankan project

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build produksi ke dist/
npm run preview    # menjalankan hasil build
npm test           # tes kalkulator kredit, WhatsApp, validasi booking (tanpa dependensi)
```

## 3. Mengganti logo dan gambar mobil

- **Logo:** ganti `public/favicon.svg` atau ubah `logo.src` di `src/config/siteConfig.js` (mis. `/images/logo.svg`).
- **Gambar mobil:** letakkan file di `public/images/cars/`, lalu ubah field `image` dan `gallery` kendaraan di `src/data/cars.js`.
  Saat ini gambar berupa SVG siluet placeholder (dibuat oleh `scripts/generate-placeholders.py`) — **bukan foto asli**.
- Rekomendasi: gunakan PNG/WebP/AVIF **transparan** (mobil dipotong dari latar) berukuran lebar ±1600 px, kompres hingga <200 KB agar animasi scroll tetap ringan. Gambar yang bergerak di showcase tampil terbaik jika berlatar transparan.

## 4. Memasukkan model 3D

1. Siapkan model **.glb** (disarankan <5 MB, tekstur ≤2048 px, dikompres Draco/meshopt jika perlu). Pastikan Anda punya **lisensi** untuk model tersebut.
2. Simpan sebagai `public/models/car.glb` (atau ubah `model3D.url` di `siteConfig.js`).
3. Model dinormalisasi otomatis (diskalakan ke panjang ±4,3 unit, dipusatkan, ditaruh di lantai). Depan mobil sebaiknya menghadap sumbu +X; jika terbalik, ubah rotasi di `Rig` dalam `src/components/Car3DScene.jsx`.

Perilaku `Car3DScene`:

| Kondisi | Yang tampil |
| --- | --- |
| `car.glb` ada & WebGL tersedia | Model Anda (dimuat lazy, dengan indikator loading) |
| `car.glb` **tidak ada** & WebGL tersedia | Model **placeholder prosedural** sederhana (diberi label di hero) |
| WebGL tidak ada / error / konteks hilang / `features.show3D=false` | Gambar fallback (parallax saat scroll) |

Catatan jujur: gerakan 3D adalah rotasi halus, parallax pointer, serta posisi/skala mengikuti scroll. Tidak ada kontrol putar 360° oleh pengguna. Jika model memakai kompresi Draco, decoder dimuat drei dari CDN; untuk hosting mandiri, salin decoder ke `public/` dan atur `useGLTF.setDecoderPath`.

## 5. Mengganti nomor WhatsApp

Satu tempat saja:

- Isi `VITE_WHATSAPP_NUMBER` di `.env` (lokal) / Environment Variables Vercel, **atau**
- ubah `whatsapp.number` di `src/config/siteConfig.js`.

Format internasional **tanpa** `+`, spasi, atau `-` (contoh bentuk: `62` + nomor tanpa 0 di depan). Sistem tetap membersihkan karakter lain secara otomatis. Jika nomor kosong, tombol WhatsApp membuka `https://wa.me/?text=…` sehingga pengguna memilih kontak sendiri — tidak ada nomor yang dikarang. Nama sales di pesan diubah lewat `whatsapp.salesName`.

## 6. Mengubah data & harga kendaraan

Edit `src/data/cars.js` — sumber data tunggal untuk katalog, showcase, detail, simulator kredit, dan form booking. Tiap kendaraan:
`id` (unik), `brand`, `name`, `year`, `category` (`SUV` | `Sedan` | `Hatchback` | `Electric Vehicle` | `Hybrid`), `fuel`, `drivetrain`, `price` (Rupiah OTR; `null` = tampil "Hubungi sales"), `image`, `gallery`, `specs`, `features`, `colors`, `featured` (tampil di showcase), `isDemo`.

Setelah data nyata dikonfirmasi: set `isDemo: false` (badge DEMO hilang). Untuk menyembunyikan semua harga: `features.showPrices = false` di `siteConfig.js`. Suku bunga bawaan simulator (`credit.defaultRatePercent`) hanya contoh, bukan suku bunga resmi.

## 7. Environment variables

Salin `.env.example` → `.env`. Semua `VITE_*` terlihat di browser — **jangan** menaruh secret atau `service_role` key di sini.

| Variabel | Fungsi |
| --- | --- |
| `VITE_WHATSAPP_NUMBER` | Nomor WhatsApp sales |
| `VITE_SITE_URL` | URL situs (opsional) |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Simpan booking ke Supabase (opsional) |
| `VITE_BOOKING_API_URL` | Alternatif: POST JSON ke API Anda (opsional) |

### Penyimpanan booking permanen (opsional, Supabase)

Tanpa backend, form hanya menyiapkan pesan WhatsApp dan status ditampilkan jujur: *"belum terkirim, kirim via WhatsApp"*. Dengan Supabase, permintaan dicatat dan status "tersimpan" hanya muncul jika server benar-benar merespons sukses. Contoh tabel + RLS (hanya boleh INSERT oleh publik, tanpa SELECT):

```sql
create table public.test_drive_bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  whatsapp text not null,
  vehicle text,
  vehicle_label text,
  preferred_date date not null,
  preferred_time text not null,
  branch text not null,
  notes text,
  consent boolean not null,
  created_via text
);
alter table public.test_drive_bookings enable row level security;
create policy "anon can insert bookings" on public.test_drive_bookings
  for insert to anon with check (consent = true);
```

Gunakan **anon/publishable key** saja. Lihat data booking lewat dashboard Supabase atau backend Anda sendiri. Tambahkan rate-limit/CAPTCHA di sisi server bila diperlukan untuk mencegah spam.

## 8. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit: DRIVEPULSE AUTOMOTIVE"
git branch -M main
git remote add origin https://github.com/<username>/drivepulse-automotive.git
git push -u origin main
```

`.env` sudah ada di `.gitignore` — jangan di-commit.

## 9. Deploy ke Vercel

1. Login ke Vercel → **Add New… → Project** → impor repository GitHub.
2. Framework Preset: **Vite** (terdeteksi otomatis). Build Command `npm run build`, Output Directory `dist`.
3. Tambahkan Environment Variables (lihat tabel di atas) lalu **Deploy**.
4. Setiap `git push` ke `main` akan men-deploy ulang otomatis.

## 10. Custom domain

Vercel → Project → **Settings → Domains → Add**. Ikuti instruksi DNS (A record / CNAME) di penyedia domain. Setelah aktif, isi `VITE_SITE_URL`, serta tambahkan `og:url` dan `og:image` (PNG 1200×630) di `index.html` agar pratinjau tautan di media sosial tampil.

## 11. Pemeriksaan build & troubleshooting

- `npm run build` harus selesai tanpa error; chunk three.js memang besar tetapi dimuat lazy (dynamic import) hanya untuk hero.
- `npm test` memverifikasi rumus kredit (bunga flat), pembuatan URL WhatsApp, validasi booking, dan konsistensi data.
- **Layar kosong / error dependensi:** hapus `node_modules` dan `package-lock.json`, jalankan `npm install` lagi; pastikan Node ≥ 18.18.
- **Model 3D tidak muncul:** buka DevTools → Network, pastikan `/models/car.glb` merespons 200 dengan content-type bukan `text/html`. Jika tidak ada, placeholder prosedural dipakai (itu normal).
- **Mobil terbalik/terlalu kecil:** sesuaikan rotasi/skala di `Rig` pada `Car3DScene.jsx`.
- **Animasi scroll bergeser setelah ganti konten/gambar:** ScrollTrigger dihitung ulang saat `load`, font siap, dan `orientationchange`; beri `width`/`height` pada gambar baru agar tinggi layout stabil.
- **Animasi tidak muncul:** sistem operasi pengguna mungkin mengaktifkan *Reduce motion* — ini disengaja (animasi dimatikan, konten tetap terbaca).
- **Booking tidak tersimpan:** periksa kunci Supabase, nama tabel (`booking.supabaseTable`), dan kebijakan RLS; pesan error ditampilkan di form.

## Struktur

```
src/
  components/   Navbar, Hero, ScrollText, Car3DScene, CarShowcase, CarCatalog, CarCard,
                CarDetails, CreditSimulator, TestDriveForm, WhatsAppButton, WhyChooseUs,
                CTASection, Footer, Modal, SceneFallback, AnnouncementBar
  config/       siteConfig.js  (identitas, WhatsApp, kontak, fitur)
  data/         cars.js        (data kendaraan tunggal)
  hooks/        useScrollAnimation.js  (GSAP matchMedia + cleanup + reduced motion)
  utils/        creditCalculator.js, whatsapp.js, booking.js, format.js, scroll.js
  styles/       global.css, animations.css, responsive.css
scripts/        test-utils.mjs, generate-placeholders.py
```

## Rumus simulator kredit (bunga flat)

```
Pokok pembiayaan  = Harga − DP
Total bunga       = Pokok × bunga tahunan × tenor (tahun)
Cicilan / bulan   = (Pokok + Total bunga) / (tenor × 12)
```
Biaya tambahan (opsional) dianggap dibayar di muka dan tidak dibungakan. Hasil hanya estimasi — bukan penawaran/persetujuan kredit.
