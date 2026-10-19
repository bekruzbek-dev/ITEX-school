-- ITEX 🚀 — 004: boshlang'ich yo'nalishlar (faqat jadval bo'sh bo'lsa qo'shiladi). Admin paneldan tahrirlash mumkin.
insert into public.courses (title, description, level, topics, practice, icon, sort_order)
select * from (values
  ('Web dasturlash', 'Saytlar yaratishni noldan o''rganing: HTML, CSS, JavaScript va React.', '6–11-sinflar',
   array['HTML va CSS asoslari','JavaScript','React','Git va GitHub'], array['Shaxsiy portfolio sayti','Kichik veb-ilova'], '🌐', 1),
  ('Sun''iy intellekt', 'AI vositalari bilan ishlash va ulardan mas''uliyatli, to''g''ri foydalanish.', '7–11-sinflar',
   array['AI nima va qanday ishlaydi','Samarali so''rov (prompt) yozish','AI bilan o''qish va ijod','Axborot xavfsizligi'], array['AI yordamida mini-loyiha'], '🤖', 2),
  ('Kompyuter savodxonligi', 'Kompyuter, internet, fayllar bilan ishlash va ofis dasturlari.', '1–6-sinflar',
   array['Kompyuter qurilmalari','Internetdan xavfsiz foydalanish','Fayl va papkalar','Matn va jadval dasturlari'], array['Taqdimot tayyorlash'], '💻', 3),
  ('Grafik dizayn', 'Vizual dizayn, posterlar va raqamli ijod asoslari.', '5–11-sinflar',
   array['Rang va kompozitsiya','Shriftlar bilan ishlash','Logotip va poster','Raqamli rasm'], array['Maktab tadbiri uchun poster'], '🎨', 4),
  ('Algoritmlar va mantiq', 'Muammolarni tahlil qilish va dasturlash asoslari.', '5–11-sinflar',
   array['Algoritm tushunchasi','Shart va sikllar','Mantiqiy masalalar','Python asoslari'], array['Mantiqiy o''yin yaratish'], '🧩', 5)
) as v(title, description, level, topics, practice, icon, sort_order)
where not exists (select 1 from public.courses);
