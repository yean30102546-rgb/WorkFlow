# Auto-Cleanup Cronjob Architecture
[วันที่อัปเดต: 2026-05-24]

## 1. Summary & Current Implementation
ระบบนี้จะทำหน้าที่ล้างข้อมูลคิวงานที่ค้างอยู่ในระบบ (สถานะ `PENDING`) และไม่มีคนขับรับงานนานเกิน 12 ชั่วโมง โดยปรับสถานะให้เป็น `CANCELLED` อัตโนมัติ เพื่อไม่ให้คิวงานหน้าแผงควบคุมลกและป้องกันพนักงานสับสน

ระบบถูกตั้งเวลาทำงานทุกๆ 1 ชั่วโมงผ่าน `vercel.json` โดยจะส่ง GET Request ไปที่ API Route `/api/cron/cleanup` ตัว API Route นี้ถูกครอบด้วยการเช็ค `CRON_SECRET` เพื่อป้องกันไม่ให้ผู้ไม่หวังดีมารันคำสั่งนี้ซี้ซั้ว

## 2. Technical Code Snippet (Best Practice)
```typescript
// src/app/api/cron/cleanup/route.ts
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  
  // 12 hours timeout calculation
  const twelveHoursAgo = new Date();
  twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

  const canceledJobs = await db.update(jobs)
    .set({ status: 'CANCELLED', updatedAt: new Date() })
    .where(and(eq(jobs.status, 'PENDING'), lt(jobs.createdAt, twelveHoursAgo)))
    .returning({ id: jobs.id });

  return NextResponse.json({ success: true, count: canceledJobs.length });
}
```

## 3. Knowledge Relationships (การเชื่อมโยงข้อมูล)
*   **Depends On:** [[architecture/db-schema.md]] (อ้างอิงสถานะ PENDING และ CANCELLED)
*   **Impacted By:** Vercel Cron Integration (ต้องการไฟล์ `vercel.json` สำหรับสั่งงาน)
