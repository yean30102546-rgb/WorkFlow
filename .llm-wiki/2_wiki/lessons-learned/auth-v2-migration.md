# Title: Auth V2 Migration Lessons Learned
[อัปเดต: 2026-05-22]

## 1. Summary & Current Implementation
การเปลี่ยนผ่านจาก Hardcoded Auth สู่ Google OAuth/Firebase ช่วยเพิ่มความปลอดภัยและรองรับการใช้งานในองค์กรจริง (Production Ready)

## 2. Technical Code Snippet (Best Practice)
```env
# .env requirements
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_GOOGLE_CLIENT_ID=...
```

## 3. Knowledge Relationships
Depends On: [[components/auth-flow.md]] (พื้นฐานสถาปัตยกรรมใหม่)
Impacted By: Security Audit Requirements
Contradicts: แก้ไขปัญหา Session timeout ที่เดิมจัดการผ่าน `sessionStorage` แบบ manual มาเป็น Firebase Auth State
