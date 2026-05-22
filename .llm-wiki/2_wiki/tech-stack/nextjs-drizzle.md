# Title: Next.js & Drizzle ORM (Forklift-JIT)
[วันที่อัปเดต: 2026-05-22]

## 1. Summary & Current Implementation
ระบบ Backend และ API ถูกย้ายจาก Google Apps Script (GAS) มาเป็น Next.js Server Actions ร่วมกับ Drizzle ORM เชื่อมต่อ Supabase Postgres ในกรณีที่ไม่สามารถเชื่อมต่อ Database ได้ (เช่น การพัฒนาใน Local เครื่องผู้พัฒนาที่ไม่มี Postgres หรือ DB Offline) ระบบจะทำการ fallback ไปใช้งาน Mock Database ในหน่วยความจำ (in-memory array) แบบอัตโนมัติ

## 2. Technical Code Snippet (Best Practice)
การตรวจสอบช่องทางการเชื่อมต่อ DB Port 5432 ก่อนตกเป็น Mock DB:
```typescript
import net from 'net';

async function shouldUseMockDb(): Promise<boolean> {
  if (process.env.NODE_ENV === 'test') return false;
  
  return new Promise((resolve) => {
    const client = new net.Socket();
    client.setTimeout(500);
    client.connect(5432, 'localhost', () => {
      client.destroy();
      resolve(false);
    });
    client.on('error', () => resolve(true));
    client.on('timeout', () => {
      client.destroy();
      resolve(true);
    });
  });
}
```

## 3. Knowledge Relationships (การเชื่อมโยงข้อมูล)
- **Depends On**: [[architecture/data-schema.md]] (Drizzle schema definition ใน `src/db/schema.ts`)
- **Impacted By**: [[components/auth-flow.md]] (การดึงข้อมูล `operatorId` และ `driverId` ผ่าน LINE LIFF)
