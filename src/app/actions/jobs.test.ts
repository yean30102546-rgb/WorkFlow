import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createJob } from './jobs';
import { db } from '@/db';

// Mock the database client
vi.mock('@/db', () => {
  return {
    db: {
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn(),
    },
  };
});

describe('createJob Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate inputs successfully and insert a new job', async () => {
    const validData = {
      batchNumber: 'B-9981',
      itemNumber: 'ITM-009',
      itemName: 'Steel Rod 12mm',
      storagePosition: 'Loading Dock A',
      startPoint: 'Station A',
      endPoint: 'Warehouse B',
      operatorId: 'operator-somchai',
    };

    const mockInsertedJob = {
      id: 'mock-uuid',
      status: 'PENDING',
      ...validData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Setup mock return value for .returning()
    vi.mocked(db.returning).mockResolvedValue([mockInsertedJob] as any);

    const result = await createJob(validData);

    expect(result.success).toBe(true);
    expect(result.job).toEqual(mockInsertedJob);
    expect(db.insert).toHaveBeenCalled();
    expect(db.values).toHaveBeenCalledWith({
      operatorId: 'operator-somchai',
      status: 'PENDING',
      itemDetails: {
        batchNumber: 'B-9981',
        itemNumber: 'ITM-009',
        itemName: 'Steel Rod 12mm',
        storagePosition: 'Loading Dock A',
      },
      startPoint: 'Station A',
      endPoint: 'Warehouse B',
    });
  });

  it('should return failure if input validation fails', async () => {
    const invalidData = {
      batchNumber: '', // invalid: empty
      itemNumber: 'ITM-009',
      itemName: 'Steel Rod 12mm',
      storagePosition: 'Loading Dock A',
      operatorId: 'operator-somchai',
    };

    const result = await createJob(invalidData);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(db.insert).not.toHaveBeenCalled();
  });
});
