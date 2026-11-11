# الدحّيِـــح_ Eldaheeh — منصة الاختبارات

مشروع أولي قابل للنشر على Netlify أو Vercel، مع Supabase لقاعدة البيانات والمصادقة.

## قبل النشر
1. أنشئ مشروعاً في Supabase.
2. افتح SQL Editor وشغّل `supabase/schema.sql`.
3. انشر Edge Function الموجودة في `supabase/functions/submit-exam/index.ts`:
   `supabase functions deploy submit-exam`
4. عيّن السر `SUPABASE_SERVICE_ROLE_KEY` في إعدادات أسرار Edge Functions. لا تضعه في ملفات الواجهة.
5. انسخ Project URL و anon/public key إلى `config.js`.
6. أنشئ مستخدم المشرف من Supabase Authentication (Email/Password)، ثم أضف UUID الخاص به إلى جدول `admin_users`.
7. انشر مجلد المشروع على Netlify/Vercel.

## تنبيه
هذه حزمة أساس للمشروع وليست منشورة تلقائياً. يلزم إعداد مشروع Supabase وربط مستودع GitHub/خدمة الاستضافة. لا تضع بيانات service_role في الواجهة الأمامية.
