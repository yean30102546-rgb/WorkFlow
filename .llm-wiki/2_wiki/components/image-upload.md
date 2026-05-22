# Title: Image Upload & Processing
[อัปเดต: 2026-05-22]

## 1. Summary & Current Implementation
ระบบรองรับการอัปโหลดภาพสูงสุด 5 ภาพต่อ Item โดยมีการแปลงเป็น Base64 ที่ Frontend ก่อนส่งไปยัง GAS เพื่อบันทึกลง Google Drive และเก็บ URL ลง Google Sheets

## 2. Technical Code Snippet (Best Practice)
```typescript
// Frontend: Image compression limit
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
```

## 3. Knowledge Relationships
Depends On: [[architecture/api-design.md]] (ส่งผ่าน Payload Action "insert")
Impacted By: [[tech-stack/gas-backend.md]] (GAS ทำหน้าที่เขียนไฟล์ลง Drive)
Contradicts: เดิมส่งไฟล์ดิบ (Blob) ปัจจุบันใช้ Base64 เพื่อให้เข้ากับข้อจำกัดของ GAS Web App ที่รับ `text/plain`
