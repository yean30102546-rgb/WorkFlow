import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createJob, acceptJob, completeJob, cancelJob, getDriverStats } from './jobs';
import { db } from '@/db';
import { revalidatePath } from 'next/cache';

// Mock Next.js cache revalidation
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock LINE API
vi.mock('@/lib/lineApi', () => ({
  sendMulticastToDrivers: vi.fn(),
}));

// Mock db calls with chainable mocks
vi.mock('@/db', () => {
  const mockDb = {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
  };
  return { db: mockDb };
});

describe('Jobs Server Actions Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createJob', () => {
    it('should validate inputs and return error if invalid', async () => {
      const result = await createJob({
        operatorId: '', // Invalid empty operatorId
        batchNumber: 'B-1234',
        itemNumber: 'ITM-123',
        itemName: 'Steel Coil',
        storagePosition: 'Row A',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should insert and return success if valid inputs', async () => {
      const mockInsertedJob = {
        id: 'job-1',
        operatorId: 'op-123',
        status: 'PENDING',
        itemDetails: {
          batchNumber: 'B-1234',
          itemNumber: 'ITM-123',
          itemName: 'Steel Coil',
          storagePosition: 'Row A',
        },
        startPoint: 'Station A',
        endPoint: 'Warehouse B',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock chain: db.insert().values().returning()
      const mockReturning = vi.fn().mockResolvedValue([mockInsertedJob]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      // Mock users search for LINE notifications
      const mockFrom = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) });
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      const result = await createJob({
        operatorId: 'op-123',
        batchNumber: 'B-1234',
        itemNumber: 'ITM-123',
        itemName: 'Steel Coil',
        storagePosition: 'Row A',
        startPoint: 'Station A',
        endPoint: 'Warehouse B',
      });

      expect(result.success).toBe(true);
      expect(result.job).toEqual(mockInsertedJob);
      expect(db.insert).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/');
    });
  });

  describe('acceptJob', () => {
    it('should prevent acceptance if the user role is not DRIVER', async () => {
      // Mock db.select().from().where().limit() for user check
      const mockLimit = vi.fn().mockResolvedValue([{ role: 'OPERATOR' }]); // Role is not DRIVER
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      const result = await acceptJob('job-1', 'user-operator-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
      expect(db.update).not.toHaveBeenCalled();
    });

    it('should update job status if the user is a registered DRIVER', async () => {
      // 1. Mock DB check for driver role (returns DRIVER)
      const mockLimit = vi.fn().mockResolvedValue([{ role: 'DRIVER' }]);
      const mockWhereSelect = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFromSelect = vi.fn().mockReturnValue({ where: mockWhereSelect });
      
      // 2. Mock DB update job chain
      const mockJobUpdate = {
        id: 'job-1',
        driverId: 'drv-505',
        status: 'PICKED_UP',
      };
      const mockReturning = vi.fn().mockResolvedValue([mockJobUpdate]);
      const mockWhereUpdate = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhereUpdate });
      
      // Set dynamic behavior of select vs update mock on db object
      vi.mocked(db.select).mockReturnValue({ from: mockFromSelect } as any);
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      const result = await acceptJob('job-1', 'drv-505');

      expect(result.success).toBe(true);
      expect(result.job).toEqual(mockJobUpdate);
      expect(db.update).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/');
    });
  });

  describe('completeJob', () => {
    it('should change status to COMPLETED and set success image', async () => {
      const mockJobComplete = {
        id: 'job-1',
        status: 'COMPLETED',
        successImageUrl: 'http://example.com/success.webp',
      };
      
      const mockReturning = vi.fn().mockResolvedValue([mockJobComplete]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      const result = await completeJob('job-1', 'http://example.com/success.webp');

      expect(result.success).toBe(true);
      expect(result.job).toEqual(mockJobComplete);
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe('cancelJob', () => {
    it('should change status to CANCELLED', async () => {
      const mockJobCancel = {
        id: 'job-1',
        status: 'CANCELLED',
      };
      
      const mockReturning = vi.fn().mockResolvedValue([mockJobCancel]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      const result = await cancelJob('job-1');

      expect(result.success).toBe(true);
      expect(result.job).toEqual(mockJobCancel);
      expect(db.update).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/');
    });
  });

  describe('getDriverStats', () => {
    it('should calculate driver work statistics correctly', async () => {
      const mockCompletedJobs = [
        { id: 'job-1', status: 'COMPLETED', driverId: 'drv-505', completedAt: new Date() },
        { id: 'job-2', status: 'COMPLETED', driverId: 'drv-505', completedAt: new Date() },
      ];

      const mockWhere = vi.fn().mockResolvedValue(mockCompletedJobs);
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      const result = await getDriverStats('drv-505');

      expect(result.success).toBe(true);
      expect(result.stats).toEqual({
        totalCompleted: 2,
        completedToday: 2,
      });
      expect(db.select).toHaveBeenCalled();
    });
  });
});
