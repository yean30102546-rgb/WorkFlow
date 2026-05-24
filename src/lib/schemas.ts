import { z } from 'zod';

// Zod validation schema for creating a job
export const CreateJobSchema = z.object({
  batchNumber: z.string().min(1, 'กรุณากรอกหมายเลขแบทช์'),
  itemNumber: z.string().min(1, 'กรุณากรอกหมายเลขสินค้า'),
  itemName: z.string().min(1, 'กรุณากรอกชื่อสินค้า'),
  storagePosition: z.string().min(1, 'กรุณากรอกจุดรับสินค้าต้นทาง'),
  startPoint: z.string().min(1, 'กรุณาระบุจุดเริ่มต้น'),
  endPoint: z.string().min(1, 'กรุณาระบุจุดส่งมอบปลายทาง'),
  operatorId: z.string().min(1, 'กรุณาระบุรหัสผู้แจ้งงาน'),
  requestImageUrl: z.string().optional(),
});

export type CreateJobInput = z.infer<typeof CreateJobSchema>;
