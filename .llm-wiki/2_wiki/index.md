# Project Knowledge Index

## Tech Stack & Architecture
- [Next.js & Drizzle ORM](tech-stack/nextjs-drizzle.md) - ระบบ Next.js 16+ App Router, Drizzle ORM และ Supabase Realtime พร้อม Mock DB Fallback.
- [GAS Backend [Deprecated]](tech-stack/gas-backend.md) - Google Apps Script backend architecture (13 columns Data Schema, CORS handling).
- [Frontend React [Deprecated]](tech-stack/frontend-react.md) - React 18, TypeScript, Tailwind CSS v4, Lucide React, Vite.
- [Data Schema](architecture/data-schema.md) - โครงสร้างตารางสำหรับ Jobs (รองรับการแปลงเป็น Drizzle ORM `jobs` table).
- [API Design [Deprecated]](architecture/api-design.md) - รูปแบบ Payload สำหรับการเรียกใช้ผ่าน GAS API JSON.

## Frontend & Components
- [Auth & Identity Flow](components/auth-flow.md) - ระบบ LINE LIFF authentication พร้อมรองรับ parameter-based developer mock login.
- [Roles & Features](components/roles-flow.md) - หน้าที่และ Flow การทำงานของ Operator Portal และ Forklift Driver Dashboard.

## Lessons Learned & Fixes
- [Supabase Pooler IPv6 ENOTFOUND & Hostname Assignment](lessons-learned/supabase-pooler-ipv6.md) - การแก้ปัญหาการเชื่อมต่อ Supabase ด้วย Pooler บน IPv4 และความต่างของ cluster hosts (aws-0 vs aws-1)
- [Server Action Zod Schema Export Constraint](lessons-learned/server-action-zod.md) - ข้อจำกัดห้าม export Zod Schema จากไฟล์ `"use server"`.
- [CORS & CSP Fixes [Deprecated]](lessons-learned/cors-csp-fixes.md) - การจัดการ CORS header อย่างปลอดภัยในยุค GAS.
- [GAS Deployment [Deprecated]](lessons-learned/gas-deployment.md) - การตั้งค่า Web App permissions ใน GAS.
- [Git Filename Too Long](lessons-learned/git-longpaths.md) - วิธีเปิดใช้งาน core.longpaths เพื่อแก้ปัญหานี้บน Windows OS

