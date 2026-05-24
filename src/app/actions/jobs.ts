"use server";

import { z } from 'zod';
import { db } from '@/db';
import { jobs, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { sendMulticastToDrivers } from '@/lib/lineApi';
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
  requestImageUrl?: string | null;
  driverId: string | null;
  successImageUrl?: string | null;
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
  pickedUpAt?: Date | null;
  completedAt?: Date | null;
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
      requestImageUrl: validated.requestImageUrl || null,
      driverId: null,
      successImageUrl: null,
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
      requestImageUrl: validated.requestImageUrl || null,
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

    // LINE Push Notification (Multicast to Drivers)
    try {
      const driverUsers = await db.select({ id: users.id }).from(users).where(eq(users.role, 'DRIVER'));
      const driverIds = driverUsers.map(d => d.id);
      if (driverIds.length > 0) {
        await sendMulticastToDrivers(driverIds, inserted);
      }
    } catch (pushErr) {
      console.error('Failed to send push notification:', pushErr);
    }

    revalidatePath('/');
    return { success: true, job: inserted };
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
    job.pickedUpAt = new Date();
    job.updatedAt = new Date();
    return { success: true, job };
  }

  try {
    // 1. Database-Level Role Authorization Check
    const driverUser = await db.select({ role: users.role }).from(users).where(eq(users.id, driverId)).limit(1);
    
    if (driverUser.length === 0) {
      return { success: false, error: 'User not found in system' };
    }
    
    if (driverUser[0].role !== 'DRIVER') {
      console.warn(`Unauthorized acceptJob attempt by ${driverId} (Role: ${driverUser[0].role})`);
      return { success: false, error: 'Unauthorized: Only registered drivers can accept jobs' };
    }

    // 2. Proceed with updating the job status
    const updated = await db.update(jobs)
      .set({
        driverId,
        status: 'PICKED_UP',
        pickedUpAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId))
      .returning();

    if (!updated[0]) {
      return { success: false, errorMessage: 'Job not found or already processed' };
    }

    revalidatePath('/');
    return { success: true, job: updated[0] };
  } catch (error) {
    console.error('Failed to accept job:', error);
    return { success: false, errorMessage: 'Database operation failed' };
  }
}

/**
 * Server Action: Complete a job.
 */
export async function completeJob(jobId: string, successImageUrl?: string) {
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
    job.successImageUrl = successImageUrl || null;
    job.completedAt = new Date();
    job.updatedAt = new Date();
    return { success: true, job };
  }

  try {
    const [updated] = await db.update(jobs)
      .set({
        status: 'COMPLETED',
        successImageUrl: successImageUrl || null,
        completedAt: new Date(),
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
    revalidatePath('/');
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

    revalidatePath('/');
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

/**
 * Server Action: Fetch statistics for a specific driver (Gamification).
 */
export async function getDriverStats(driverId: string) {
  if (!driverId) return { success: false, stats: null };

  const useMock = await shouldUseMockDb();
  let driverJobs = [];

  if (useMock) {
    driverJobs = globalForMock._mockJobs.filter(j => j.driverId === driverId && j.status === 'COMPLETED');
  } else {
    try {
      driverJobs = await db.select().from(jobs).where(
        and(
          eq(jobs.driverId, driverId),
          eq(jobs.status, 'COMPLETED')
        )
      );
    } catch (err) {
      console.error('Failed to get driver stats:', err);
      return { success: false, stats: null };
    }
  }

  // Calculate stats for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedToday = driverJobs.filter(j => j.completedAt && new Date(j.completedAt) >= today);

  return {
    success: true,
    stats: {
      totalCompleted: driverJobs.length,
      completedToday: completedToday.length,
    }
  };
}
