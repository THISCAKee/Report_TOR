# Gmail Username Login Design

## Goal

ให้ผู้ใช้กรอกเพียงชื่อผู้ใช้ เช่น `earthcake` เพื่อเข้าสู่บัญชี Supabase ที่มีอีเมล `earthcake@gmail.com` โดยไม่ต้องพิมพ์ `@gmail.com`

## Design

- `usernameToAuthEmail()` ตัดช่องว่างและแปลงเป็นตัวพิมพ์เล็ก
- หากค่าที่กรอกไม่มี `@` ให้เติม `@gmail.com`
- หากกรอกอีเมลเต็ม ให้คงอีเมลนั้นไว้เพื่อรองรับบัญชีเดิม
- หน้า Login และ Supabase Auth flow เดิมไม่เปลี่ยน
- คู่มือสร้างผู้ใช้ใน Supabase ใช้รูปแบบ `ชื่อผู้ใช้@gmail.com`

## Verification

- Unit test ยืนยัน `EarthCake` แปลงเป็น `earthcake@gmail.com`
- Unit test ยืนยันอีเมลเต็มไม่ถูกแก้ไข
- TypeScript, test suite และ Next.js production build ต้องผ่าน
