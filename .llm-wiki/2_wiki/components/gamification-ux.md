# Title: Field-Tested UX & Gamification System
[วันที่อัปเดต: 2026-05-25]

## 1. Summary & Current Implementation
**Field-Tested UX:** การออกแบบ UI/UX สำหรับ "ผู้ใช้งานหน้างาน" (เช่น คนขับฟอร์คลิฟต์) ต้องต่างจากแอปทั่วไป:
1. **Touch Targets:** ปุ่มกด (Accept/Complete) ถูกขยายเป็น 56px (`h-14`) และฟอนต์ขนาด 16px (`text-base`) เพื่อให้กดง่ายแม้ใส่ถุงมือหรือรถกำลังสั่น
2. **Readability:** ยกเลิกการใช้ฟอนต์จิ๋ว (9-10px) สำหรับข้อมูลรอง และบังคับใช้ 12px (`text-xs`) เป็นขั้นต่ำ
3. **Informative Loading:** เมื่อระบบต้องทำหลายขั้นตอน (เช่น บีบอัดรูปภาพ -> อัปโหลด -> อัปเดตฐานข้อมูล) ต้องแสดง `loadingText` ในปุ่มให้ผู้ใช้รู้ว่ากำลังทำอะไรอยู่ เพื่อไม่ให้คิดว่าแอปค้าง
4. **Client-side Compression:** ใช้ `browser-image-compression` แปลงไฟล์ภาพให้เป็น `image/webp` อัตโนมัติ เพื่อบีบให้ไฟล์เล็กกว่า 500KB ช่วยลดแบนด์วิดท์มือถือและประหยัดพื้นที่จัดเก็บ

**Gamification:**
ระบบเก็บสถิติเพื่อสร้างแรงจูงใจให้คนขับ โดยดึงข้อมูลจาก `status = COMPLETED` และแสดงผลใน `DriverStatsCard.tsx` (Level, Daily Goal 10 jobs, Total Completed).

## 2. Technical Code Snippet (Best Practice)
```tsx
// การทำ Informative Loading ใน JobCard.tsx
<Button onClick={handleComplete} disabled={loading} className="w-full h-14 text-base">
  {loading ? (
    <>
      <Loader2 className="animate-spin size-5" />
      {loadingText} {/* แสดงข้อความ "กำลังบีบอัด...", "กำลังบันทึก..." */}
    </>
  ) : (
    <>
      <CheckCircle2 className="size-5" />
      ส่งสินค้าสำเร็จ (Arrived)
    </>
  )}
</Button>
```

## 3. Knowledge Relationships (การเชื่อมโยงข้อมูล)
*   Depends On: [[tech-stack/nextjs-drizzle.md]] (Server action สำหรับดึงสถิติ Driver)
*   Depends On: [[components/roles-flow.md]] (นำไปประดับบน Dashboard ฝั่ง Driver)
