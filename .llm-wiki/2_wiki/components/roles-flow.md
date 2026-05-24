# Title: Roles & Features Flow
[วันที่อัปเดต: 2026-05-24]

## 1. Summary & Current Implementation
ระบบแบ่งการทำงานออกเป็น 3 Role/หน้าหลัก ที่ขับเคลื่อนด้วยการ Routing ผ่าน URL parameter:
- **Operator (ผู้แจ้งงาน)**: ส่งคำขอเคลื่อนย้ายสินค้า (Forklift JIT request) โดยกรอกชื่อแบทช์ รหัสสินค้า ชื่อสินค้า และจุดจัดเก็บ พร้อมอัปโหลดภาพก่อนจัดส่ง
- **Driver (คนขับฟอร์คลิฟต์)**: ดูงานที่ว่างอยู่ (Available Jobs) สิทธิ์การเคลมงาน (Claim Task) และยืนยันการจัดส่งสำเร็จ (Arrived) พร้อมอัปโหลดภาพหลักฐานความสำเร็จ มีส่วนแสดง **ประวัติงานของฉัน** ที่กรองเฉพาะงานที่เสร็จสิ้นของคนขับคนนั้นๆ
- **Dashboard (สรุปภาพรวม)**: แสดงสถานะการทำงานเชิงสถิติ (KPIs) เช่น เวลารอรับสินค้าเฉลี่ย (Avg Waiting Time), เวลาขนส่งเฉลี่ย (Avg Delivery Time), และมีตารางคิวงานแบบละเอียด (Detailed Job Table)

## 2. Technical Code Snippet (Best Practice)
```typescript
// การดึง Role อัตโนมัติจาก URL (Deep Link จาก LINE Rich Menu)
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const urlRole = params.get('role');
  if (urlRole === 'operator' || urlRole === 'driver' || urlRole === 'dashboard') {
    setRole(urlRole as 'operator' | 'driver' | 'dashboard');
  }
}, []);

// การคำนวณและกรองประวัติของ Driver เฉพาะบุคคล
const driverHistoryJobs = jobs.filter(j => j.status === 'COMPLETED' && j.driverId === profile.userId);
```

## 3. Knowledge Relationships
Depends On: [[components/auth-flow.md]] (ดึง LINE User ID/Profile มาเคลมและผูกประวัติงาน)
Impacted By: [[architecture/db-schema.md]] (ใช้ข้อมูลฟิลด์ `pickedUpAt`, `completedAt`, `requestImageUrl`, `successImageUrl` ในการคำนวณและจัดแสดงใน Dashboard)
