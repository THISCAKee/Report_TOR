# ตั้งค่าระบบหลังบ้านและ Deploy บน Vercel

## 1. สร้าง Supabase

1. สร้างโปรเจกต์ใหม่ที่ Supabase (แผน Free ใช้ได้กับระบบผู้ใช้คนเดียว)
2. ไปที่ **SQL Editor** แล้วรันไฟล์ [`supabase/migrations/0001_daily_workload.sql`](../supabase/migrations/0001_daily_workload.sql)
3. ไปที่ **Authentication > Users > Add user** สร้างผู้ใช้ โดยใช้อีเมลรูปแบบ `ชื่อผู้ใช้@gmail.com` เช่น `earthcake@gmail.com` และกำหนดรหัสผ่าน
4. ไปที่ **Project Settings > API** คัดลอก Project URL และ Publishable key (ถ้าโปรเจกต์ใช้ชื่อเดิม ให้ใช้ anon key)

## 2. ตั้งค่าบนเครื่อง

คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ค่าจริง:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-key
```

จากนั้นรัน `npm run dev` และเข้าสู่ระบบด้วยผู้ใช้ที่สร้างไว้ใน Supabase

## 3. Deploy บน Vercel

1. Push โปรเจกต์ขึ้น GitHub แล้วเลือก **Add New Project** ใน Vercel
2. ตั้งค่า Framework เป็น Next.js และปล่อย Build Command เป็น `npm run build`
3. เพิ่ม Environment Variables ชื่อเดียวกับ `.env.local` ใน Production, Preview และ Development
4. Deploy แล้วเปิด URL ของ Vercel เพื่อ Login

หน้า Login ให้กรอกเฉพาะชื่อผู้ใช้ เช่น `earthcake` ระบบจะเติม `@gmail.com` ให้อัตโนมัติ ไม่มีหน้า Sign up ในระบบ ผู้ดูแลสร้างหรือเปลี่ยนผู้ใช้จาก Supabase Dashboard เท่านั้น

## หมายเหตุเรื่องไฟล์แนบ

ไฟล์เก็บใน Storage bucket `work-evidence` แบบ private และข้อมูลถูกจำกัดด้วย RLS ให้บัญชีที่ Login เห็นเฉพาะข้อมูลของตัวเอง ไฟล์แนบในหน้ากรอกข้อมูลรวมได้ไม่เกิน 100 MB ต่อรายการ และ bucket ตั้งเพดานไว้ 100 MB ต่อไฟล์ตาม migration
