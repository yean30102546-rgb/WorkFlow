# Title: Supabase Pooler IPv6 ENOTFOUND & Hostname Assignment
[วันที่อัปเดต: 2026-05-22]

## 1. Summary & Current Implementation
เมื่อพัฒนาแอปพลิเคชันจากเน็ตเวิร์กที่ไม่มีการรับรอง IPv6 (เช่น Local Dev Machine ของ ISP ทั่วไป) การพยายามใช้ Direct Connection string ของ Supabase (`db.[ref].supabase.co`) จะส่งผลให้เกิดข้อผิดพลาด `ENOTFOUND` ทันที เนื่องจากโฮสต์เหล่านี้มีเพียง `AAAA` record (IPv6 เท่านั้น)
การแก้ไขที่ถูกต้องคือการใช้ **Supabase Connection Pooler** ทว่าตัวโฮสต์ Pooler ไม่ได้จำกัดอยู่ที่ `aws-0-...` เสมอไป บางโปรเจกต์จะถูกจัดสรรให้อยู่บนโฮสต์กลุ่มอื่น เช่น `aws-1-[region].pooler.supabase.com`

## 2. Technical Code Snippet (Best Practice)
รูปแบบ Connection String ที่ถูกต้องสำหรับ Connection Pooler (Session Mode / Port 5432):
```env
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:5432/postgres
```
*หมายเหตุ:* 
- หากเกิดข้อผิดพลาด `Tenant or user not found` ในขณะที่ใช้ `aws-0-...` ให้ตรวจสอบใน Supabase Dashboard หรือทดสอบสแกนหาโฮสต์ `aws-1-...` เพื่อยืนยัน Node ที่จัดสรรจริง

## 3. Knowledge Relationships (การเชื่อมโยงข้อมูล)
- **Impacted By**: [[tech-stack/nextjs-drizzle.md]] (การตั้งค่า `DATABASE_URL` ใน `.env` สำหรับ Drizzle migrations และ Server Actions)
- **Contradicts**: การเชื่อมต่อตรงผ่านพอร์ต `5432` ไปยัง `db.pfndwmczcfpvdmwqfbwo.supabase.co` ไม่สามารถใช้งานได้บนเครือข่ายที่เป็น IPv4-only
