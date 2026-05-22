# Title: Git Filename Too Long on Windows
[วันที่อัปเดต: 2026-05-22]
## 1. Summary & Current Implementation
เมื่อทำงานบน Windows OS และมีไฟล์ในโครงสร้างโฟลเดอร์ลึกๆ เช่น `.llm-wiki` หรือ `.next` จะเจอปัญหา Git แจ้งเตือน `Filename too long` และปฏิเสธการทำ `git add` วิธีแก้ไขคือเปิดใช้งาน `core.longpaths` ใน Git config

## 2. Technical Code Snippet (Best Practice)
```bash
git config core.longpaths true
```

## 3. Knowledge Relationships
Depends On: N/A
Impacted By: [[index.md]]
Contradicts: N/A
