# Title: Next.js Server Action Caching & Error Handling Bug
[วันที่อัปเดต: 2026-05-25]

## 1. Summary & Current Implementation
**ปัญหาที่ 1 (Caching):** เมื่อกดยกเลิกงาน (Cancel Job) ฝั่ง Backend อัปเดตข้อมูลสำเร็จ แต่หน้าจอ UI ไม่ยอมเปลี่ยนสถานะ สาเหตุเกิดจากลืมใส่ `revalidatePath('/')` เพื่อบอกให้ Next.js เคลียร์ Cache ของ Router 

**ปัญหาที่ 2 (Error Handling):** การเช็กสิทธิ์ RBAC ตอนคนขับกดรับงาน Backend ตีกลับมาด้วย `{ success: false, error: 'Unauthorized...' }` แต่ฝั่ง Frontend ใน `JobCard.tsx` ดันไปมองหา `res.errorMessage` ทำให้แสดงข้อความ Default ว่า "Failed to accept job." แทนที่จะแสดงข้อความแจ้งเตือนที่แท้จริง

**การแก้ไข:** 
- เพิ่ม `revalidatePath('/')` ในทุกๆ Server Action ที่มีการอัปเดตข้อมูล (รวมถึงในจังหวะที่ใช้ Mock DB ด้วย)
- ปรับ Frontend ให้รองรับรูปแบบ Error ทั้งสองแบบ: `setActionError(res.errorMessage || res.error || 'Failed')`

## 2. Technical Code Snippet (Best Practice)
```typescript
// การจบ Server Action ที่ถูกต้อง
if (!updated) {
  return { success: false, errorMessage: 'Job not found' };
}

revalidatePath('/'); // ขาดบรรทัดนี้ไม่ได้เด็ดขาด
return { success: true, job: updated };
```

## 3. Knowledge Relationships (การเชื่อมโยงข้อมูล)
*   Depends On: [[tech-stack/nextjs-drizzle.md]] (Next.js App Router Cache)
*   Impacted By: [[architecture/rbac-multicast.md]] (การคืนค่า Authorization Error จากระบบ RBAC)
