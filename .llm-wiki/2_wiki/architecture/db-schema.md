# Title: Database Schema (Drizzle ORM & Postgres)
[วันที่อัปเดต: 2026-05-24]

## 1. Summary & Current Implementation
ระบบใช้ Drizzle ORM เพื่อจัดการตารางใน PostgreSQL (Supabase) โครงสร้างข้อมูลตาราง `jobs` ถูกออกแบบมาเพื่อรองรับฟอร์คลิฟต์ระบบ JIT อย่างเต็มรูปแบบ รวมถึงการจับเวลา (Time Tracking) และรูปภาพยืนยันการทำงานของทั้ง Operator และ Driver.

## 2. Technical Code Snippet (Best Practice)
```typescript
// src/db/schema.ts
export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Operator (ผู้แจ้ง)
  operatorId: text('operator_id').notNull(),
  requestImageUrl: text('request_image_url'), // รูปประกอบตอนแจ้งงาน (ถ้ามี)
  
  // Driver (ผู้ขับ)
  driverId: text('driver_id'),
  successImageUrl: text('success_image_url'), // รูปยืนยันตอนจบงาน
  
  // Job Details
  status: statusEnum('status').default('PENDING').notNull(),
  itemDetails: jsonb('item_details').notNull(), // เก็บชื่อ, จุดรับ/ส่ง, batch
  startPoint: text('start_point').default('Station A').notNull(),
  endPoint: text('end_point').default('Warehouse B').notNull(),
  
  // Timestamps (สำหรับการคำนวณ Waiting Time และ Working Time)
  createdAt: timestamp('created_at').defaultNow().notNull(), // แจ้งงาน
  pickedUpAt: timestamp('picked_up_at'),                     // รับงาน
  completedAt: timestamp('completed_at'),                    // จบงาน
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

## 3. Knowledge Relationships
- **Depends On**: [[tech-stack/nextjs-drizzle.md]] (ต้องใช้การตั้งค่า DB และ Drizzle migrations)
- **Impacted By**: [[components/roles-flow.md]] (ฟีลด์ต่างๆ ถูกใช้งานโดย Operator Form และ Driver Dashboard)
- **Contradicts**: โครงสร้างเก่าใน [[architecture/data-schema.md]] ซึ่งใช้งาน Google Sheets และ `GAS_IMPROVED.gs` (Deprecated แล้ว)
