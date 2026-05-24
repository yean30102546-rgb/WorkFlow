# Title: Database-Level Role Authorization & LINE Push Multicast
[วันที่อัปเดต: 2026-05-24]

## 1. Summary & Current Implementation
ระบบถูกยกระดับความปลอดภัยด้วยการจัดการสิทธิ์ระดับฐานข้อมูล (Database-Level Authorization) โดยสร้างตาราง `users` เพื่อเก็บโปรไฟล์และ Role (`OPERATOR`, `DRIVER`, `ADMIN`) ของทุกคนที่ล็อกอินผ่าน LINE LIFF (ค่าเริ่มต้นเป็น `OPERATOR`) และมีการตรวจสอบใน Server Action ทุกครั้งที่คนขับรับงาน (`acceptJob`) ป้องกันการสวมรอย นอกจากนี้ยังเพิ่มหน้า **User Management** ใน Dashboard เพื่อให้ผู้ดูแลปรับเปลี่ยนสิทธิ์พนักงานได้สะดวกบนเว็บ.

อีกส่วนคือระบบ **LINE Push Notification แบบ Multicast** เมื่อมีการเรียกงานใหม่ (createJob) ระบบหลังบ้านจะดึง ID ของพนักงานที่เป็น `DRIVER` ทั้งหมด และยิง Flex Message แจ้งเตือนไปยังแชท LINE ส่วนตัวของคนขับทุกคนโดยอัตโนมัติ ผ่าน Messaging API

## 2. Technical Code Snippet (Best Practice)
```typescript
// การดึง ID และส่ง Push Multicast แบบอัตโนมัติเมื่อมีการเรียกฟอร์คลิฟต์
const driverUsers = await db.select({ id: users.id }).from(users).where(eq(users.role, 'DRIVER'));
const driverIds = driverUsers.map(d => d.id);
if (driverIds.length > 0) {
  // src/lib/lineApi.ts - fetch POST api.line.me/v2/bot/message/multicast
  await sendMulticastToDrivers(driverIds, insertedJob);
}

// การล็อกสิทธิ์รับงานระดับ Backend (Database-Level) ใน acceptJob
const driverUser = await db.select({ role: users.role }).from(users).where(eq(users.id, driverId)).limit(1);
if (driverUser.length === 0 || driverUser[0].role !== 'DRIVER') {
  return { success: false, error: 'Unauthorized: Only registered drivers can accept jobs' };
}
```

## 3. Knowledge Relationships
* **Depends On (ต้องพึ่งพา):** [[architecture/db-schema.md]] (ต้องใช้ตาราง users และ roleEnum ที่เพิ่งเพิ่มเข้าไป), [[components/line-integration.md]] (ต้องใช้ `LINE_CHANNEL_ACCESS_TOKEN` สำหรับ Messaging API)
* **Impacted By (ได้รับผลกระทบจาก):** [[components/auth-flow.md]] (Flow ของ LIFF ต้องถูก Hook ให้เรียก `syncUser()` เพื่อ Upsert โปรไฟล์ลงตารางผู้ใช้งานทุกครั้งที่ Login)
* **Contradicts (ข้อขัดแย้งที่เคยพบ):** ในอดีตการแจ้งเตือนงานไปหาคนขับ ต้องพึ่งพาการให้ Operator กดปุ่ม "แชร์การ์ดเรียกงาน" ด้วยตนเองผ่าน `shareTargetPicker` ปัจจุบันถูกแทนที่ด้วย Backend Multicast อัตโนมัติทั้งหมด ทำให้ Operator ลดขั้นตอนการทำงานลงได้ 1 สเต็ป
