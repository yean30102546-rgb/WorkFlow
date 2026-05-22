# Title: GAS Backend Architecture
[อัปเดต: 2026-05-22]

## 1. Summary & Current Implementation
Backend ใช้ Google Apps Script (GAS) ทำงานแบบ Serverless โดยมีระบบ Centralized CORS และ Error Handling เพื่อป้องกันปัญหา browser บล็อก response เมื่อเกิด Server Error

## 2. Technical Code Snippet (Best Practice)
```javascript
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "text/plain;charset=utf-8"
};

function createCorsResponse(responseObj) {
  return ContentService.createTextOutput(JSON.stringify(responseObj))
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(CORS_HEADERS);
}
```

## 3. Knowledge Relationships
Depends On: [[architecture/data-schema.md]] (ต้องแมปคอลัมน์ให้ตรงกัน)
Impacted By: [[lessons-learned/cors-csp-fixes.md]] (เป็นต้นกำเนิดของการแก้ปัญหา CORS)
Contradicts: เปลี่ยนจากการใช้ `JSON.stringify` ในทุกที่ มาเป็นการใช้ `createCorsResponse` ตัวเดียวเพื่อความปลอดภัย
