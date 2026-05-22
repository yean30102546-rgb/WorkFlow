"use server";

import { z } from 'zod';
import { db } from '@/db';
import { jobs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import net from 'net';

// Define global mock store for development when DB is not reachable
const globalForMock = global as unknown as {
  _mockJobs: any[];
};

if (!globalForMock._mockJobs) {
  globalForMock._mockJobs = [];
}

let dbCheckPromise: Promise<boolean> | null = null;

async function shouldUseMockDb(): Promise<boolean> {
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
  
  if (dbCheckPromise !== null) {
    return dbCheckPromise;
  }

  dbCheckPromise = new Promise((resolve) => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || dbUrl.includes('localhost') || dbUrl.includes('your-project')) {
      const client = new net.Socket();
      client.setTimeout(500);
      
      let host = 'localhost';
      let port = 5432;
      try {
        const matches = dbUrl?.match(/@([^:/]+)(?::(\d+))?/);
        if (matches) {
          host = matches[1];
          if (matches[2]) port = parseInt(matches[2], 10);
        }
      } catch (e) {}

      client.connect(port, host, () => {
        client.destroy();
        resolve(false);
      });

      client.on('error', () => {
        console.warn(`⚠️ Database connection to ${host}:${port} failed. Falling back to in-memory mock database.`);
        resolve(true);
      });

      client.on('timeout', () => {
        client.destroy();
        console.warn(`⚠️ Database connection to ${host}:${port} timed out. Falling back to in-memory mock database.`);
        resolve(true);
      });
    } else {
      resolve(false);
    }
  });

  return dbCheckPromise;
}

import { CreateJobSchema, CreateJobInput } from '@/lib/schemas';

export interface ActionJob {
  id: string;
  operatorId: string;
  driverId: string | null;
  status: 'PENDING' | 'PICKED_UP' | 'COMPLETED' | 'CANCELLED';
  itemDetails: {
    batchNumber: string;
    itemNumber: string;
    itemName: string;
    storagePosition: string;
  };
  startPoint: string;
  endPoint: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Server Action: Create a new forklift pickup job.
 */
export async function createJob(data: unknown) {
  const result = CreateJobSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.format() };
  }
  
  const validated = result.data;
  
  const useMock = await shouldUseMockDb();
  if (useMock) {
    const mockJob: ActionJob = {
      id: `mock-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      operatorId: validated.operatorId,
      driverId: null,
      status: 'PENDING',
      itemDetails: {
        batchNumber: validated.batchNumber,
        itemNumber: validated.itemNumber,
        itemName: validated.itemName,
        storagePosition: validated.storagePosition,
      },
      startPoint: validated.startPoint,
      endPoint: validated.endPoint,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    globalForMock._mockJobs.push(mockJob);
    return { success: true, job: mockJob };
  }

  try {
    const [inserted] = await db.insert(jobs).values({
      operatorId: validated.operatorId,
      status: 'PENDING',
      itemDetails: {
        batchNumber: validated.batchNumber,
        itemNumber: validated.itemNumber,
        itemName: validated.itemName,
        storagePosition: validated.storagePosition,
      },
      startPoint: validated.startPoint,
      endPoint: validated.endPoint,
    }).returning();

    // Prepare LINE notification payload structure
    const notificationPayload = {
      message: `🚨 [Forklift-JIT] New Pickup Request!\nItem: ${validated.itemName} (Batch: ${validated.batchNumber})\nFrom: ${validated.storagePosition}\nTo: ${validated.endPoint}\nRequested by ID: ${validated.operatorId}`,
    };

    return { success: true, job: inserted, notificationPayload };
  } catch (error) {
    console.error('Failed to create job:', error);
    return { success: false, errorMessage: 'Database operation failed' };
  }
}

/**
 * Server Action: Accept a job by a driver.
 */
export async function acceptJob(jobId: string, driverId: string) {
  if (!jobId || !driverId) {
    return { success: false, errorMessage: 'Job ID and Driver ID are required' };
  }

  const useMock = await shouldUseMockDb();
  if (useMock) {
    const job = globalForMock._mockJobs.find(j => j.id === jobId);
    if (!job) {
      return { success: false, errorMessage: 'Job not found' };
    }
    job.driverId = driverId;
    job.status = 'PICKED_UP';
    job.updatedAt = new Date();
    return { success: true, job };
  }

  try {
    const [updated] = await db.update(jobs)
      .set({
        driverId,
        status: 'PICKED_UP',
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId))
      .returning();

    if (!updated) {
      return { success: false, errorMessage: 'Job not found or already processed' };
    }

    return { success: true, job: updated };
  } catch (error) {
    console.error('Failed to accept job:', error);
    return { success: false, errorMessage: 'Database operation failed' };
  }
}

/**
 * Server Action: Complete a job.
 */
export async function completeJob(jobId: string) {
  if (!jobId) {
    return { success: false, errorMessage: 'Job ID is required' };
  }

  const useMock = await shouldUseMockDb();
  if (useMock) {
    const job = globalForMock._mockJobs.find(j => j.id === jobId);
    if (!job) {
      return { success: false, errorMessage: 'Job not found' };
    }
    job.status = 'COMPLETED';
    job.updatedAt = new Date();
    return { success: true, job };
  }

  try {
    const [updated] = await db.update(jobs)
      .set({
        status: 'COMPLETED',
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId))
      .returning();

    if (!updated) {
      return { success: false, errorMessage: 'Job not found' };
    }

    return { success: true, job: updated };
  } catch (error) {
    console.error('Failed to complete job:', error);
    return { success: false, errorMessage: 'Database operation failed' };
  }
}

/**
 * Server Action: Cancel a job.
 */
export async function cancelJob(jobId: string) {
  if (!jobId) {
    return { success: false, errorMessage: 'Job ID is required' };
  }

  const useMock = await shouldUseMockDb();
  if (useMock) {
    const job = globalForMock._mockJobs.find(j => j.id === jobId);
    if (!job) {
      return { success: false, errorMessage: 'Job not found' };
    }
    job.status = 'CANCELLED';
    job.updatedAt = new Date();
    return { success: true, job };
  }

  try {
    const [updated] = await db.update(jobs)
      .set({
        status: 'CANCELLED',
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId))
      .returning();

    if (!updated) {
      return { success: false, errorMessage: 'Job not found' };
    }

    return { success: true, job: updated };
  } catch (error) {
    console.error('Failed to cancel job:', error);
    return { success: false, errorMessage: 'Database operation failed' };
  }
}

/**
 * Server Action: Fetch all active jobs.
 * Used for server-side loading or hydration.
 */
export async function getJobs() {
  const useMock = await shouldUseMockDb();
  if (useMock) {
    return [...globalForMock._mockJobs].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  try {
    return await db.select().from(jobs).orderBy(jobs.createdAt);
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    return [];
  }
}
