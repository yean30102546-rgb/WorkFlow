ผมกำลังมีไอเดียการทำเว็บแอป ที่มี Flow การทำงานดังนี้
Operator : กรอกข้อมูลหรือกรอกฟอร์มเพื่อเก็บข้อมูล --> กดบันทึก --> แจ้งเตือนไปที่ผู้ขับ Forklift เพื่อมารับของไปที่จุดหมาย พร้อมทั้ง Preview ข้อมูลที่กรอก --> กดจบงาน --> End Flow
ระบบนี้เป็นการ Adapt จากหน้างานจริง ออกแบบตามปัญหาและโครงสร้างของโรงงาน 

ระบบนี้เราจะ Fix Startpoint และ Endpoint ของผู้ขับไว้ที่จุดเดิม คอนเซ็ปคือ Operator กดบันทึก ให้รถมายกออกจากจุดเริ่มไปที่จุดหมายทันทีไม่ให้ของกองอยู่ฝั่ง Operator คนแรกเยอะเกินไป


Tech stack 
Core : Next.js, React
Design/Style : Tailwind ,shadcn
Database / Data Layer : Supabase ,Drizzle ORM
End-to-End Type Safety: TypeScript + Zod
Authentication & Security: Line LIFF
Testing Pipeline (ระบบทดสอบโค้ด): Vitest + Playwright




Prompt 1: การวางโครงสร้างและ Schema (The Foundation)
เป้าหมาย: เพื่อให้ AI สร้างไฟล์ Schema (Drizzle), Types (TypeScript) และ Folder Structure ของ Next.js

Prompt:
"Act as a Senior Full Stack Developer. I want to initialize a Next.js 14+ (App Router) project for an internal factory logistics app called 'Forklift-JIT'.

Tech Stack:

Core: Next.js, TypeScript, Tailwind CSS, shadcn/ui

Database: Supabase (Postgres) with Drizzle ORM

Validation: Zod

Authentication: Line LIFF integration

Database Schema (Drizzle):
Create a 'jobs' table with the following fields:

id (uuid, primary key)

operator_id (text, from Line UID)

driver_id (text, optional)

status (enum: PENDING, PICKED_UP, COMPLETED, CANCELLED)

item_details (jsonb, to store form data validated by Zod)

start_point (text, default 'Station A')

end_point (text, default 'Warehouse B')

created_at, updated_at

Action: Generate the Drizzle schema file, the Zod validation schema for the operator form, and the basic folder structure for /app, /components, /lib, and /server-actions."

Prompt 2: ระบบจัดการสถานะและ Real-time (The Workflow Logic)
เป้าหมาย: สร้างระบบ Server Actions และการดึงข้อมูลแบบ Real-time ของ Supabase

Prompt:
"Based on the previous schema, let's build the Core Workflow Logic:

Server Action for Operator: Create an 'createJob' action that takes Zod-validated data, saves it to Supabase, and prepares a payload for a Line Notification.

Server Action for Driver: Create 'acceptJob' and 'completeJob' actions to update the job status.

Real-time Hook: Create a React hook (useJobs) that uses Supabase Realtime to subscribe to the 'jobs' table. It should filter jobs for the Driver to see 'PENDING' jobs in real-time without refreshing.

Line LIFF Auth: Setup a basic Auth provider or helper that extracts the Line Profile (UserID, DisplayName) and stores it in a secure cookie or session."

Prompt 3: ส่วนหน้าจอผู้ใช้งาน (The UI/UX Component)
เป้าหมาย: สร้าง UI ที่เหมาะสมกับโรงงานด้วย shadcn/ui

Prompt:
"Now, let's create the UI components using shadcn/ui and Tailwind CSS. Focus on a mobile-first design for factory workers:

OperatorForm: A clean form with large inputs and a prominent 'Call Forklift' button. Use 'react-hook-form' with Zod.

JobCard: For the Forklift Driver, show a card with a 'Preview' of the item details.

ActionButtons: Use conditional rendering for the Driver's UI:

If status is PENDING, show a large 'Accept Pickup' (Blue).

If status is PICKED_UP, show a large 'Finish Delivery' (Green).

Notification Preview: A simple visual indicator (Badge) showing the current status of the job for the Operator to track."

Prompt 4: ระบบทดสอบ (Testing & Reliability)
เป้าหมาย: ตั้งค่า Vitest และ Playwright เพื่อทดสอบ Flow สำคัญ

Prompt:
"Set up the testing environment:

Vitest: Write a unit test for the 'createJob' server action to ensure it only saves valid data (using Zod).

Playwright: Create an E2E test script for the 'Happy Path': Operator logs in -> Creates Job -> Driver accepts Job -> Driver completes Job.

Ensure all tests account for the asynchronous nature of Supabase calls."