# UI/UX Redesign - Minimalist Theme, Soft Fonts, Custom Animations & Thai Localization
[วันที่อัปเดต: 2026-05-23]

## 1. Summary & Current Implementation
ปรับปรุง UI ของระบบ Forklift-JIT ให้มีความคลีน มินิมอล อ่านง่าย และมีชีวิตชีวา (Alive & Premium Look) โดยปรับปรุงรายละเอียดสำคัญดังนี้:
1. **Landing Page**: เปลี่ยนจาก Dark Theme ที่ตัดขอบฉูดฉาด มาเป็น Light Theme คลีน สะอาดตา พร้อมสเกลบอร์ดของปุ่ม บล็อก และรูปภาพ SFC Excellence Logo
2. **Operator Form**: ปรับความสูงของ Input ลงเหลือ `h-11` และปรับรูปทรงปุ่มให้กะทัดรัด (Compact UX) ลดระยะห่างส่วนหัวที่ไม่จำเป็น
3. **Job Card Timeline**: เปลี่ยนรูปการแสดงต้นทาง-ปลายทาง ให้เป็นรูปแบบ **Vertical Dashed Timeline**
4. **Soft rounded Typography**: เลือกใช้ **Plus Jakarta Sans** (สำหรับภาษาอังกฤษและตัวเลข) คู่กับ **Prompt** (สำหรับภาษาไทย) เพื่อสร้างสุนทรียภาพที่นุ่มนวล อ่านง่าย ถนอมสายตาพนักงานหน้างาน
5. **Fluid Micro-Animations**: เพิ่มอนิเมชันระดับพรีเมียม (cubic-bezier) เช่น `animate-fade-in-up`, `animate-scale-in`, `animate-float`, และ `animate-pulse-soft` เพื่อนำทางสายตาและเพิ่มความดึงดูดใจในการใช้งาน
6. **Thai Localization (Friendly UX)**: แปลงคำศัพท์/ป้ายกำกับ (Labels) สำคัญในแดชบอร์ด ได้แก่ ชื่อช่องกรอกข้อมูลในฟอร์ม, ข้อความแจ้งเตือนความผิดพลาด (Zod Validation), ป้ายสถานะงาน (Status Badges), หัวข้อแสดงผล และประวัติการทำงาน ให้เป็นภาษาไทยทั้งหมดเพื่อลดอุปสรรคในการสื่อสารของพนักงานหน้างาน (Operators/Forklift Drivers)

## 2. Technical Code Snippet (Best Practice)
### Zod Schema Localization in `schemas.ts`:
```typescript
export const CreateJobSchema = z.object({
  batchNumber: z.string().min(1, 'กรุณากรอกหมายเลขแบทช์'),
  itemNumber: z.string().min(1, 'กรุณากรอกหมายเลขสินค้า'),
  itemName: z.string().min(1, 'กรุณากรอกชื่อสินค้า'),
  storagePosition: z.string().min(1, 'กรุณากรอกจุดรับสินค้าต้นทาง'),
});
```

### Typography & Animation configurations in `globals.css`:
```css
@theme {
  --animate-fade-in-up: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  --animate-scale-in: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  --animate-float: float 4s ease-in-out infinite;
  --animate-pulse-soft: pulse-soft 2s ease-in-out infinite;

  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
```

### Timeline drawing in `JobCard.tsx`:
```tsx
<div className="relative pl-6 border-l border-dashed border-border/80 ml-2.5 space-y-4 py-1">
  {/* Dot สำหรับต้นทาง (Pickup) */}
  <div className="absolute left-[-4.5px] top-[10px] size-2 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
  <div className="space-y-0.5">
    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">จุดรับของ</p>
    <p className="text-sm font-bold text-foreground">{job.itemDetails.storagePosition}</p>
  </div>

  {/* Dot สำหรับปลายทาง (Destination) */}
  <div className="absolute left-[-4.5px] bottom-[12px] size-2 rounded-full bg-primary ring-4 ring-primary/20" />
  <div className="space-y-0.5 pt-2">
    <p className="text-[9px] font-bold text-primary uppercase tracking-wider">จุดส่งของ</p>
    <p className="text-sm font-bold text-primary">{job.endPoint}</p>
  </div>
</div>
```

## 3. Knowledge Relationships
- **Depends On**: [[components/roles-flow.md]] (ต้องรองรับฟังก์ชันการกดเคลมและส่งสินค้าของ Driver และ Operator)
- **Impacted By**: [[tech-stack/nextjs-drizzle.md]] (โครงสร้าง UI หน้าตาและ Routing ต่างๆ ใน Next.js App Router)
- **Contradicts**: ในอดีตเคยใช้ UI สไตล์ Dark Theme ฉูดฉาดแนว Gaming/Consumer App และใช้ฟอนต์เหลี่ยมปกติ ซึ่งขัดกับลักษณะการอ่านบนแท็บเล็ตและอุปกรณ์พกพาของคนขับฟอร์คลิฟต์ในสนามจริงที่ต้องการสุนทรียภาพที่นุ่มนวลและเด่นชัด


