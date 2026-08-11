# Gmail Username Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ให้ Login ด้วยชื่อผู้ใช้โดยระบบเติม `@gmail.com` อัตโนมัติ

**Architecture:** คง Supabase Email/Password Auth และแก้เฉพาะ pure function ที่แปลงชื่อผู้ใช้เป็นอีเมลก่อนเรียก Auth หน้า Login ใช้ interface เดิม

**Tech Stack:** Next.js, TypeScript, Supabase Auth, Vitest

## Global Constraints

- รองรับการกรอกอีเมลเต็มต่อไป
- ไม่เปลี่ยนฐานข้อมูลหรือ Storage
- ต้องผ่าน TypeScript, tests และ production build

---

### Task 1: เปลี่ยนโดเมนชื่อผู้ใช้เป็น Gmail

**Files:**
- Modify: `tests/auth.test.ts`
- Modify: `lib/supabase/auth.ts`
- Modify: `docs/SUPABASE_VERCEL_SETUP.md`

**Interfaces:**
- Consumes: `usernameToAuthEmail(value: string): string`
- Produces: อีเมล Gmail สำหรับค่าที่ไม่มี `@`

- [ ] **Step 1: Write the failing test**

```ts
expect(usernameToAuthEmail(" EarthCake ")).toBe("earthcake@gmail.com");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/auth.test.ts`
Expected: FAIL เพราะค่าปัจจุบันเป็น `earthcake@report-tor.local`

- [ ] **Step 3: Write minimal implementation**

```ts
export const AUTH_EMAIL_DOMAIN = "gmail.com";
```

- [ ] **Step 4: Update setup documentation**

เปลี่ยนตัวอย่างบัญชี Supabase เป็น `ชื่อผู้ใช้@gmail.com`

- [ ] **Step 5: Verify**

Run: `npm run lint`, `npm test`, และ `npm run build`
Expected: PASS

- [ ] **Step 6: Commit and push**

```bash
git add lib/supabase/auth.ts tests/auth.test.ts docs/SUPABASE_VERCEL_SETUP.md docs/superpowers/specs/2026-08-11-gmail-username-login-design.md docs/superpowers/plans/2026-08-11-gmail-username-login.md
git commit -m "Use Gmail domain for username login"
git push origin main
```
