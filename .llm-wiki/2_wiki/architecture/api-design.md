# Title: API Design & Data Flow
[วันที่อัปเดต: 2026-05-22]

## 1. Summary & Current Implementation
ระบบใช้ JSON over HTTP (POST) ส่งคำขอไปยัง GAS Backend โดยใช้ Action-based routing ได้แก่ `insert`, `readAll`, `update`, และ `dashboardStats`. การส่งรูปภาพจะถูกแปลงเป็น Base64 จาก Frontend.

## 2. Technical Code Snippet (Best Practice)
```typescript
// โครงสร้าง Request Payload ทั่วไป
{
  "action": "insert", // หรือ readAll, update
  "source": "SFC",
  "items": [{
    "itemNumber": "12345",
    "itemName": "Product A",
    "images": ["base64_string..."]
  }]
}
```

## 3. Knowledge Relationships
Depends On: [[tech-stack/gas-backend.md]] (GAS ประมวลผลและกระจาย Action)
Impacted By: [[components/image-upload.md]]
Contradicts: การสื่อสารใช้ `text/plain` เพื่อหลีกเลี่ยง CORS preflight options issues แบบเข้มงวด โดยใน GAS จะทำหน้าที่ parse JSON เอง
