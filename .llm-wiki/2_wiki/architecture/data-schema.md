# Title: Data Schema (Google Sheets)
[วันที่อัปเดต: 2026-05-22]

## 1. Summary & Current Implementation
ระบบใช้ Google Sheets เป็นฐานข้อมูลหลักสำหรับบันทึกข้อมูล Job (Rework Cases) โดยใช้ 13 คอลัมน์หลัก เก็บสถานะตั้งแต่ Pending ถึง Delivered.

## 2. Technical Code Snippet (Best Practice)
```javascript
// GAS_IMPROVED.gs: โครงสร้าง 13 คอลัมน์ (Sheet MainData)
const headers = [
  'Item ID',           // 0
  'Case ID',           // 1
  'Date',              // 2
  'Source',            // 3 (PDB/PDF/etc)
  'Item Number',       // 4
  'Item Name',         // 5
  'Item Code',         // 6
  'Amount (Box)',      // 7
  'Reason',            // 8
  'Responsible',       // 9
  'Details',           // 10 (สามารถอัปเดตได้)
  'Status',            // 11 (Pending | Assigned | Picking | Delivered)
  'Image URLs'         // 12 (คั่นด้วย |)
];
```

## 3. Knowledge Relationships
Depends On: [[tech-stack/gas-backend.md]]
Impacted By: [[architecture/api-design.md]]
Contradicts: เดิมทีเอกสารระบุว่ามี 15 คอลัมน์ แต่โค้ดปัจจุบันใน `GAS_IMPROVED.gs` และ Payload มีเพียง 13 คอลัมน์
