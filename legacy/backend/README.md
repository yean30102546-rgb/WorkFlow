# Setup Guide: Logistics Workflow (3-User Flow)

ระบบนี้รองรับการทำงาน 3 ขั้นตอน: **ผู้แจ้งงาน -> ผู้กำหนดจุดลง -> ผู้ส่งสินค้า**

## 1. เตรียม Google Sheets
สร้าง Google Sheet ใหม่และตั้งชื่อ Sheet (แท็บด้านล่าง) ดังนี้:

### Sheet: `Jobs` (เก็บข้อมูลงานทั้งหมด)
พิมพ์หัวข้อ (Header) ในแถวที่ 1 ตามลำดับดังนี้:
`id`, `timestamp`, `batchNumber`, `itemNumber`, `itemName`, `storagePosition`, `dropoffPosition`, `startTime`, `endTime`, `photoUrl`, `status`

---

## 2. ขั้นตอนการทำงาน (Workflow)

### ขั้นตอนที่ 1: User 1 (ผู้แจ้งงาน)
- กรอกฟอร์ม: `Batch Number`, `Item Number`, `Item Name`, `ตำแหน่งเก็บสินค้า`
- ระบบจะบันทึกข้อมูลและตั้งสถานะเป็น **`Pending`**

### ขั้นตอนที่ 2: User 2 (ผู้รับเรื่อง/Line Coordinator)
- ได้รับแจ้งเตือน และเลือก **`ตำแหน่งลงสินค้า`**
- ระบบจะอัปเดตข้อมูลและตั้งสถานะเป็น **`Assigned`**

### ขั้นตอนที่ 3: User 3 (ผู้ส่งสินค้า/Driver)
- **รับงาน**: ระบบบันทึก **`เวลารับงาน`** และเปลี่ยนสถานะเป็น **`Picking`**
- **ส่งงาน**: ถ่ายรูปและอัปโหลด **`รูปภาพจบงาน`**, ระบบบันทึก **`เวลาจบงาน`** และเปลี่ยนสถานะเป็น **`Delivered`**

---

## 3. การเรียกใช้งาน API (สำหรับ Frontend)

### 1. ผู้แจ้งงานส่งข้อมูล (POST)
```json
{
  "action": "user1_submit",
  "data": {
    "batchNumber": "B-001",
    "itemNumber": "ITEM-99",
    "itemName": "กล่องบรรจุภัณฑ์",
    "storagePosition": "A-101"
  }
}
```

### 2. ผู้ประสานงานระบุตำแหน่งลง (POST)
```json
{
  "action": "user2_assign",
  "id": "JOB-171515...",
  "dropoffPosition": "B-202"
}
```

### 3. ผู้ส่งสินค้ากดรับงาน (POST)
```json
{
  "action": "user3_start",
  "id": "JOB-171515..."
}
```

### 4. ผู้ส่งสินค้าส่งงานสำเร็จ (POST)
```json
{
  "action": "user3_complete",
  "id": "JOB-171515...",
  "photoUrl": "https://..."
}
```
