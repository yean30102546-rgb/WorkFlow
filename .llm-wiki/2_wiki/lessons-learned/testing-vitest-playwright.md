# Testing Pipeline Configuration & Debugging (Vitest & Playwright)
อัปเดตล่าสุด: 2026-05-24

## 1. Summary & Current Implementation
บันทึกการตั้งค่าและการแก้ไขปัญหาสำหรับระบบทดสอบอัตโนมัติ (Automated Testing) ทั้งส่วน E2E (Playwright) และ Unit/Integration Test (Vitest) เพื่อรองรับระบบความปลอดภัย RBAC และการตอบกลับของฐานข้อมูลแบบเรียลไทม์

## 2. Technical Code Snippets & Best Practices

### Chainable Mocking for Drizzle ORM (Vitest)
ตัวอย่างการทำ Mock Drizzle DB ที่มีความเป็น Chainable และใช้งานร่วมกับ `vi.mocked` ใน Vitest:
```typescript
// src/app/actions/jobs.test.ts
vi.mock('@/db', () => {
  const mockDb = {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
  };
  return { db: mockDb };
});

// Mock chain: db.insert().values().returning()
const mockReturning = vi.fn().mockResolvedValue([mockInsertedJob]);
const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);
```

### Specific Card Target Selection (Playwright)
การเข้าถึงการ์ดใบงานอย่างเฉพาะเจาะจงเพื่อหลีกเลี่ยงการติด Strict Mode Violation (เมื่อ locator ตัวครอบคลุมกว้างเกินไปจนจับซ้ำหลายปุ่ม):
```typescript
// ค้นหาเฉพาะภายในการ์ดที่มีรหัสแบทช์ระบุอยู่
const jobCard = page.locator('.bg-card').filter({ hasText: batchNumber }).first();
const acceptButton = jobCard.locator('button:has-text("รับงาน")');
await acceptButton.click();
```

## 3. Lessons Learned & Troubleshooting

### 1) Drizzle `and` ReferenceError
- **ปัญหาที่พบ:** ฟังก์ชัน `getDriverStats` เรียกใช้ `and(eq(...), eq(...))` แต่ขาดการ import `and` จาก `drizzle-orm` ทำให้เทสรันเฟลด้วย `ReferenceError: and is not defined`.
- **สาเหตุ:** ในโหมด Development ระบบใช้ Mock DB ชั่วคราวจึงไม่เจอบั๊กนี้ แต่พอรัน Vitest ใน `NODE_ENV = 'test'` ระบบจะสลับไปรัน Codebase ฝั่งใช้ฐานข้อมูล Postgres เสมอทำให้ตรวจพบบั๊กได้ทันที
- **การแก้ไข:** ทำการอัปเดต import ด้านบนของไฟล์แอ็กชัน:
  ```typescript
  import { eq, and } from 'drizzle-orm';
  ```

### 2) E2E Role-Based Access Control Bypass
- **ปัญหาที่พบ:** Playwright สร้างไอดีแบบสุ่ม (`drv-test-...`) ในการทดสอบสิทธิ์คนขับรถ และระบบปฏิเสธคำขอกดรับงานเนื่องจากผู้ใช้ใหม่มีฐานะเป็น `OPERATOR` ตามกฎ RBAC ในฐานข้อมูล
- **การแก้ไข:** ค้นหาผู้ใช้จริงที่มีบทบาทเป็น `DRIVER` ในระบบอยู่แล้ว เช่น `op-101` (Operator Somchai) เพื่อนำมารับสิทธิ์และข้ามระบบตรวจจับความปลอดภัยในการจำลองคนขับของ Playwright

### 3) UX Skeleton Infinite Loading state
- **ปัญหาที่พบ:** ตัวแสดงผล `DriverStatsCard` ค้างหน้าจอโหลด `กำลังโหลดสถิติ...` หากเกิดข้อผิดพลาดจากฐานข้อมูล ทำให้ Playwright สเปกรันไทม์เอาท์
- **การแก้ไข:** เพิ่มเงื่อนไข fallback คืนค่าเริ่มต้น `{ totalCompleted: 0, completedToday: 0 }` และปิดสเตตโหลด `setLoading(false)` เสมอในบล็อก `finally`

## 4. Knowledge Relationships
- **Depends On (ต้องพึ่งพา):** [[architecture/rbac-multicast.md]] (การตรวจเช็กสิทธิ์ RBAC)
- **Impacted By (ได้รับผลกระทบจาก):** [[components/gamification-ux.md]] (หน้าตาของ DriverStatsCard)
