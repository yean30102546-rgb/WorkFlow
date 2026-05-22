# Title: Next.js Server Actions Zod Schema Export Constraint
[วันที่อัปเดต: 2026-05-22]

## 1. Summary & Current Implementation
ใน Next.js ไฟล์ Server Action (ที่มี `"use server"` อยู่ที่บรรทัดบนสุด) ห้ามทำ Export อ็อบเจกต์ปกติที่ไม่ใช่ Async Function (เช่น `export const CreateJobSchema = z.object(...)`) ออกไปยัง Client Component หากทำเช่นนั้น Next.js จะคอมไพล์และพาสผ่าน Proxy Object แทนที่จะเป็น Zod Schema จริงๆ ซึ่งทำให้เกิด Error ใน React Hook Form ว่า `Invalid input: not a Zod schema` 

**แนวทางแก้ไข**: ให้ย้าย Zod Schemas ทั้งหมดไปไว้ในไฟล์แยก เช่น `src/lib/schemas.ts` โดยในไฟล์นี้ต้องไม่มี `"use server"` แล้วจึงทำการ Import เข้ามาใช้ร่วมกันทั้งใน Server Action และ Client Component

## 2. Technical Code Snippet (Best Practice)
```typescript
// src/lib/schemas.ts
import { z } from 'zod';
export const CreateJobSchema = z.object({
  batchNumber: z.string().min(1),
  // ... fields
});

// src/app/actions/jobs.ts ("use server")
import { CreateJobSchema } from '@/lib/schemas';
export async function createJob(data: unknown) {
  const result = CreateJobSchema.safeParse(data);
  // ... logic
}

// src/components/OperatorForm.tsx ("use client")
import { CreateJobSchema } from '@/lib/schemas';
import { createJob } from '@/app/actions/jobs';
```

## 3. Knowledge Relationships (การเชื่อมโยงข้อมูล)
- **Depends On**: [[tech-stack/nextjs-drizzle.md]] (การใช้งานคู่กับ Server Actions)
- **Impacted By**: [[components/roles-flow.md]] (ความปลอดภัยในการรับส่งข้อมูลจาก OperatorForm)
