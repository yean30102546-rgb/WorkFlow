# Forklift-JIT 🚀

ระบบเว็บแอปพลิเคชันจัดการโลจิสติกส์และคิวรถฟอร์คลิฟต์ในโรงงานอุตสาหกรรม (Just-In-Time) ออกแบบมาเพื่อลดเวลาจอดรอรถของสายการผลิต และเชื่อมต่อข้อมูลระหว่างหน้างานกับคนขับแบบเรียลไทม์ผ่าน **LINE LIFF**

## 🌟 ฟีเจอร์หลัก (Key Features)
- **Role-Based Access Control (RBAC):** แยกระบบการทำงานระหว่าง Operator (ผู้เรียกงาน), Driver (คนขับรถ), และ Dashboard (แอดมิน)
- **Real-time Sync:** อัปเดตสถานะงานแบบสดๆ (Live Tracking) ด้วย Supabase Realtime
- **LINE Push Notifications:** แจ้งเตือนคนขับทุกคนผ่าน LINE Messaging API แบบ Multicast ทันทีที่มีงานใหม่
- **JIT Dispatching:** ระบบคำนวณและแสดงเวลาการรอของ (Waiting Time) และเวลาจัดส่ง (Delivery Time) เพื่อวัดผล KPI
- **Driver Gamification:** ระบบเก็บสถิติเป้าหมายรายวันและเลเวลคนขับเพื่อสร้างแรงจูงใจในการทำงาน
- **Smart Image Compression:** แปลงและบีบอัดภาพถ่ายหน้างานเป็น WebP อัตโนมัติด้วย Client-Side Compression ช่วยประหยัดแบนด์วิดท์สูงสุด
- **Auto-Cleanup Cronjob:** ระบบล้างคิวงานที่ค้างเกิน 12 ชั่วโมงให้เป็นสถานะยกเลิกอัตโนมัติ เพื่อไม่ให้หน้าแผงควมคุมรก
- **Mock Environment:** มีโหมดจำลองบัญชีผู้ใช้สำหรับนักพัฒนาเพื่อทดสอบระบบได้โดยไม่ต้องล็อกอิน LINE จริง

## 💻 Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL (Supabase)
- **ORM:** Drizzle ORM
- **Authentication:** LINE LIFF
- **Styling:** Tailwind CSS v4 + Shadcn UI + Lucide React
- **Validation:** Zod + React Hook Form

## ⚙️ การติดตั้งและรันโปรเจกต์ (Getting Started)

1. **โคลนโปรเจกต์และติดตั้ง Dependencies:**
   ```bash
   npm install
   ```

2. **ตั้งค่า Environment Variables (`.env`):**
   สร้างไฟล์ `.env` และใส่ค่าดังนี้
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_database_connection_string

   # LINE LIFF & Messaging API
   NEXT_PUBLIC_LIFF_ID=your_liff_id
   LINE_CHANNEL_ACCESS_TOKEN=your_messaging_api_token
   ```

3. **รันคำสั่ง Drizzle เพื่ออัปเดต Database:**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **เปิดเซิร์ฟเวอร์:**
   ```bash
   npm run dev
   ```
   จากนั้นเปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

## 📚 เอกสารประกอบ (Documentation)
ความรู้เชิงลึก สถาปัตยกรรม และประวัติการแก้บั๊กของระบบนี้ถูกจัดเก็บไว้ในโฟลเดอร์ `.llm-wiki/` สามารถอ่านเพิ่มเติมได้ที่:
👉 `/.llm-wiki/2_wiki/index.md`
