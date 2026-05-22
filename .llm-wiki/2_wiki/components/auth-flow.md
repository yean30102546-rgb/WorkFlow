# Title: Authentication & Identity Flow
[วันที่อัปเดต: 2026-05-22]

## 1. Summary & Current Implementation
ระบบ Identity จัดการ Role-based access control (RBAC) และเส้นทางเข้าใช้งานผ่าน 2 หน้าหลัก:
1. **Landing Page Gateway**: แสดงข้อมูลแนะนำระบบ, คุณสมบัติ (Features), ขั้นตอนการทำงาน (Timeline Workflow) และสถิติสำหรับผู้ใช้ทั่วไปที่ยังไม่ได้ล็อคอิน
2. **Glassmorphic Login Modal**: กล่องข้อความที่ถูกเรียกเปิดเมื่อคลิก "เข้าสู่ระบบ" หรือ "เริ่มใช้งานระบบ" เพื่อให้เข้าใช้งานผ่าน LINE Login (LIFF) หรือ Mock Developer Account (`op-101` / `drv-505`)
3. **Dashboard (Authenticated)**: เมื่อทำการ Login สำเร็จจะแสดง Dashboard คัดแยกตามสถานะการทำงาน (Operator หรือ Driver)

## 2. Technical Code Snippet (Best Practice)
### การเริ่มใช้งาน LINE Login และจัดการ Redirect
การเรียกใช้งาน `liff.login()` แบบไม่ส่งพารามิเตอร์ใด ๆ จะปลอดภัยที่สุดในการพัฒนา เนื่องจาก LINE SDK จะใช้การกำหนดค่าเริ่มต้นจาก LINE Developers Console (Endpoint URL) โดยอัตโนมัติ ซึ่งป้องกันปัญหา 400 Bad Request จากการระบุ `redirectUri` ที่มีรูปแบบไม่สอดคล้องกับ Console:
```typescript
liffObject.login();
```

### การทำความสะอาด URL parameters หลังล็อกอินสำเร็จ
หลังจาก LINE Login เปลี่ยนเส้นทางกลับมา จะนำ query parameters `code` และ `state` ติดตัวมาด้วย เมื่อยืนยันตัวตนสำเร็จแล้ว ควรลบ parameters เหล่านี้ทิ้งเพื่อความสะอาดและเสถียรภาพของ Next.js Routing:
```typescript
if (loggedIn) {
  const userProfile = await liff.getProfile();
  setProfile({
    userId: userProfile.userId,
    displayName: userProfile.displayName,
    pictureUrl: userProfile.pictureUrl,
  });

  // ลบ ?code=...&state=... ออกจาก address bar
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    if (url.searchParams.has('code') || url.searchParams.has('state')) {
      url.searchParams.delete('code');
      url.searchParams.delete('state');
      window.history.replaceState({}, document.title, url.pathname + url.search);
    }
  }
}
```

## 3. Knowledge Relationships
Depends On: LINE Developer Console (ตั้งค่า LIFF ID ผ่าน env variables, การตั้งค่า Endpoint URL ในหน้า LIFF Console และการเพิ่ม Callback URL)

Impacted By: [[components/roles-flow.md]] (Role เป็นตัวกำหนด Default View เช่น PDB -> pdb-entry)

Contradicts: เอกสารเก่าระบุว่าให้ผู้ใช้เข้าหน้า Login Card ตรงๆ แต่โครงสร้างปัจจุบันเปลี่ยนเป็นนำเสนอคุณสมบัติและระบบจัดส่งแบบ Just-In-Time ก่อนแล้วค่อยเรียกเปิด Login Modal เพื่อความพรีเมียมและประสบการณ์ผู้ใช้ที่ดีขึ้น

