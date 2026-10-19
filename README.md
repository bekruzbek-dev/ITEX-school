# ITEX 🚀 — IT to‘garagi veb-sayti

**Shior:** “Raqamli bilim — kelajak kaliti!”
**Tashkilot:** 7-sonli umumiy o‘rta ta’lim maktabi IT to‘garagi (Andijon viloyati, Baliqchi tumani, Barkamol MFY)

Texnologiyalar: React 18 + TypeScript + Vite, React Router, Supabase (Postgres, Auth, Storage), Netlify (hosting + Functions).

## Asosiy imkoniyatlar

- Ochiq sahifalar: `/`, `/about`, `/courses`, `/register`, `/news`, `/news/:id`, `/projects`, `/achievements`, `/contact`
- Ariza formasi: tekshiruv, telefon formati, honeypot, 1 daqiqalik cheklov, bazada 24 soatda 3 tadan ortiq va takroriy arizaga qarshi himoya
- Admin panel `/admin` (ochiq saytda tugma yo‘q): Dashboard, Arizalar (holat o‘zgartirish), Yo‘nalishlar, Yangiliklar, Loyihalar, Yutuqlar, Sayt sozlamalari, Hisob (parol almashtirish)
- Qidiruv/filtr, tasdiqlash oynalari, bildirishnomalar, loading/empty/error holatlari, rasm yuklash (brauzerda kichraytiriladi)
- Telegram bildirishnomasi (Netlify Functions) — ixtiyoriy
- Statistika faqat bazadagi haqiqiy sonlardan hisoblanadi; telefon/email/Telegram admin sozlamalaridan olinadi (soxta ma’lumot yo‘q)

## 1. Windows’da lokal ishga tushirish

1. [Node.js 20 LTS](https://nodejs.org) o‘rnating.
2. Loyiha papkasida terminal (PowerShell) oching:
   ```powershell
   npm install
   copy .env.example .env
   ```
3. `.env` faylini oching va Supabase qiymatlarini kiriting (2-bo‘limga qarang).
4. Ishga tushirish:
   ```powershell
   npm run dev
   ```
   Sayt: http://localhost:5173
5. Tekshirish va build:
   ```powershell
   npm run typecheck
   npm run build
   ```

> Aloqa formasi va Telegram funksiyalarini lokal sinash uchun `npx netlify dev` ishlating (Netlify CLI).

## 2. Supabase sozlash

1. https://supabase.com da yangi loyiha yarating.
2. **Project Settings → API** dan `Project URL` va `anon public` kalitini `.env` ga yozing:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
   ⚠️ `service_role` kalitini hech qachon frontendga, `.env` ga yoki Git’ga qo‘ymang.
3. **SQL Editor** da `supabase/migrations/` ichidagi fayllarni tartib bilan ishga tushiring:
   `001_schema.sql` → `002_rls.sql` → `003_storage.sql` → `004_seed_courses.sql`
   (Qayta ishga tushirish xavfsiz: jadvallar o‘chirilmaydi.)
4. **Authentication → Providers → Email** bo‘limida **“Allow new users to sign up”** ni **o‘chiring** (ochiq ro‘yxatdan o‘tish bo‘lmasligi uchun).
5. Storage: `003_storage.sql` `itex-media` bucket’ini (ochiq o‘qish, faqat admin yozadi, 5 MB, faqat rasm) yaratadi. Agar SQL xato bersa, **Storage → New bucket** orqali `itex-media` nomli **public** bucket yarating va SQL’ni qayta ishga tushiring.

## 3. Birinchi administratorni yaratish

1. Supabase: **Authentication → Users → Add user → Create new user**. Email va kuchli parol (kamida 10 belgi) kiriting, **Auto Confirm User** ni yoqing.
2. **SQL Editor** da (emailni o‘zingiznikiga almashtiring):
   ```sql
   insert into public.admin_users (user_id, email)
   select id,ail from auth.users where email = 'ADMIN_EMAIL@example.com'
   on conflict (user_id) do nothing; 
   ```
   (Xuddi shu so‘rov `supabase/migrations/999_create_first_admin.sql.example` da.)
3. Saytda `/admin` ga o‘ting va kiring.

Administrator huquqi faqat `admin_users` jadvaliga asoslanadi; foydalanuvchi o‘zi buni o‘zgartira olmaydi (RLS).
Keyingi administratorlarni ham shu usulda qo‘shing.

## 4. Telegram bildirishnomalari (ixtiyoriy)

1. Telegram’da `@BotFather` orqali bot yarating, tokenni oling. Botga yozing va chat ID ni aniqlang (masalan `@userinfobot` yoki `getUpdates`).
2. Netlify → **Site configuration → Environment variables** ga qo‘shing:
   `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `WEBHOOK_SECRET` (uzun tasodifiy qator).
3. Yangi arizalar uchun Supabase: **Database → Webhooks → Create a new hook**
   - Table: `applications`, Events: **Insert**
   - Type: HTTP Request, Method: POST
   - URL: `https://SIZNING-SAYT.netlify.app/.netlify/functions/notify-application`
   - HTTP Header: `x-webhook-secret` = `WEBHOOK_SECRET` qiymati
4. Aloqa formasi (`/contact`) xabarlari ham shu bot orqali yuboriladi.

Telegram sozlanmagan yoki ishlamasa ham arizalar bazaga saqlanadi va sayt ishlashda davom etadi.

## 5. Netlify’ga joylash

1. Loyihani GitHub’ga yuklang (`.env` Git’ga kirmaydi).
2. Netlify → **Add new site → Import from Git**. Build: `npm run build`, Publish: `dist` (`netlify.toml` allaqachon sozlangan, SPA redirect ham).
3. **Environment variables** ga `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (va ixtiyoriy Telegram o‘zgaruvchilari) qo‘shing.
4. Deploy qiling. Supabase → **Authentication → URL Configuration** da Site URL sifatida Netlify manzilini kiriting.
5. `/admin` orqali kirib, **Sayt sozlamalari** da telefon, email, Telegram va xaritani to‘ldiring.

## Xavfsizlik xulosasi

- Barcha jadvallarda RLS yoqilgan. Ommaviy foydalanuvchi faqat e’lon qilingan kontentni o‘qiydi.
- `applications`: ommaviy foydalanuvchi faqat yarata oladi (status doim `new`, rozilik majburiy), o‘qiy olmaydi.
- Yozish/o‘chirish faqat `is_admin()` (admin_users jadvali) orqali.
- Telegram tokeni faqat Netlify serverida; frontendga chiqmaydi.

## Papkalar

```
src/components  src/pages  src/pages/admin  src/layouts  src/lib  src/hooks  src/types  src/styles
supabase/migrations  netlify/functions  netlify/lib  public
```
