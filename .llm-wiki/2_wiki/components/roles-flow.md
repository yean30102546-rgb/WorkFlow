# Title: Roles & Features Flow
[วันที่อัปเดต: 2026-05-22]

## 1. Summary & Current Implementation
ระบบแบ่งการทำงานออกเป็น 4 ฟีเจอร์หลัก (ตาม Role) เพื่อให้ผู้ใช้ทำหน้าที่เฉพาะใน Supply Chain / Warehouse
- **PDB (Add Batch)**: บันทึกข้อมูลของเข้ามาใหม่ (`pdb-entry`)
- **PDF (Assign Position)**: กำหนดจุดจัดเก็บ (Storage/Dropoff) ให้กับรายการ (`pdf-dispatch`)
- **FORKLIFT (Delivery)**: รับหน้าที่เคลื่อนย้ายสินค้าไปยังจุดเป้าหมาย อัปเดตสถานะเป็น Delivered (`forklift-ops`)
- **ADMIN (Dashboard)**: ดูภาพรวม History และจัดการทุกฟังก์ชัน

## 2. Technical Code Snippet (Best Practice)
```typescript
// App.tsx Menu Routing
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: History, roles: ['ADMIN'] },
  { id: 'pdb-entry', label: 'PDB: Add Batch', icon: ClipboardList, roles: ['ADMIN', 'PDB'] },
  { id: 'pdf-dispatch', label: 'PDF: Assign Position', icon: Send, roles: ['ADMIN', 'PDF'] },
  { id: 'forklift-ops', label: 'Forklift: Delivery', icon: Truck, roles: ['ADMIN', 'FORKLIFT'] },
];
```

## 3. Knowledge Relationships
Depends On: [[components/auth-flow.md]] (Identity ควบคุม Role ปัจจุบัน)
Impacted By: [[architecture/data-schema.md]] (แต่ละ Role จะอัปเดตสถานะและข้อมูลคอลัมน์ต่างกันไป)
