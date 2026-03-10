# 🚀 LinkedIn Title Generator

Saçma ama çalışan LinkedIn title'lar üret. Gemini Flash API ile powered, Next.js + Vercel üzerinde çalışır.

---

## Kurulum (5 dakika)

### 1. API Key Al
[Google AI Studio](https://aistudio.google.com/app/apikey) → **Create API Key** → kopyala

### 2. Projeyi Kur
```bash
npm install
```

### 3. .env.local Oluştur
```bash
cp .env.local.example .env.local
```
Sonra `.env.local` dosyasını aç ve `GEMINI_API_KEY=` satırına key'ini yapıştır.

### 4. Lokal'de Çalıştır
```bash
npm run dev
```
→ http://localhost:3000

---

## Vercel'e Deploy (3 tıklama)

1. GitHub'a push et (`node_modules` ve `.env.local` gitmez, .gitignore halleder)
2. [vercel.com](https://vercel.com) → **New Project** → GitHub repo'nu seç → **Import**
3. Vercel dashboard'da: **Settings → Environment Variables**
   - Name: `GEMINI_API_KEY`
   - Value: key'ini yapıştır
4. **Redeploy** → Bitti! 🎉

---

## Rate Limiting

Şu an memory-based, IP başına saatte **15 istek**. Vercel serverless'ta cold start olunca sayaç sıfırlanır.

Production'a geçince Upstash Redis ile güçlendir:
- [upstash.com](https://upstash.com) → ücretsiz Redis oluştur
- `@upstash/ratelimit` + `@upstash/redis` paketlerini ekle
- `route.js`'deki rate limiter kısmını değiştir

---

## Maliyet

Gemini 1.5 Flash ücretsiz tier: **günde 1500 istek** — hobbyist proje için yeterli.
Viral olursa: [pricing](https://ai.google.dev/pricing)

---

## Proje Yapısı

```
app/
  page.jsx              → Tüm UI (React)
  layout.jsx            → Root layout
  api/
    generate/
      route.js          → Gemini API çağrısı + Rate limiting (SERVER SIDE)
.env.local              → GEMINI_API_KEY (asla commit'leme!)
.env.local.example      → Örnek env dosyası
.gitignore              → node_modules, .env.local vs. hariç tutar
```

**API key neden güvende?** `route.js` sadece sunucuda çalışır. `process.env.GEMINI_API_KEY` hiçbir zaman browser'a gitmez. Next.js bunu garanti eder.
