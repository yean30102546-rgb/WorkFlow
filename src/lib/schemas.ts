import { z } from 'zod';

// Zod validation schema for creating a job
export const CreateJobSchema = z.object({
  batchNumber: z.string().min(1, 'Batch number is required'),
  itemNumber: z.string().min(1, 'Item number is required'),
  itemName: z.string().min(1, 'Item name is required'),
  storagePosition: z.string().min(1, 'Storage position is required'),
  startPoint: z.string().min(1, 'Start point is required'),
  endPoint: z.string().min(1, 'End point is required'),
  operatorId: z.string().min(1, 'Operator ID is required'),
});

export type CreateJobInput = z.infer<typeof CreateJobSchema>;
