import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './api';

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getJobs should fetch jobs from the backend', async () => {
    const mockJobs = [
      { id: 'JOB-1', itemName: 'Test Item', status: 'Pending' }
    ];

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockJobs,
    });

    const jobs = await api.getJobs();

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('action=getJobs'));
    expect(jobs).toEqual(mockJobs);
  });

  it('submitJob should post data to the backend', async () => {
    const jobData = { batchNumber: 'B1', itemName: 'Item 1' };
    const mockResponse = { success: true, id: 'JOB-1' };

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockResponse,
    });

    const result = await api.submitJob(jobData);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('user1_submit'),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('assignPosition should update job with dropoff position', async () => {
    const jobId = 'JOB-1';
    const dropoffPosition = 'A-01';
    const mockResponse = { success: true };

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockResponse,
    });

    const result = await api.assignPosition(jobId, dropoffPosition);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('user2_assign'),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('startJob should notify backend when picking starts', async () => {
    const jobId = 'JOB-1';
    const mockResponse = { success: true };

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockResponse,
    });

    const result = await api.startJob(jobId);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('user3_start'),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('completeJob should send photo evidence to backend', async () => {
    const jobId = 'JOB-1';
    const photoUrl = 'https://example.com/photo.jpg';
    const mockResponse = { success: true };

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockResponse,
    });

    const result = await api.completeJob(jobId, photoUrl);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('user3_complete'),
      })
    );
    expect(result).toEqual(mockResponse);
  });
});
