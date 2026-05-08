export interface Job {
  id: string;
  timestamp: string;
  uid: string;
  batchNumber: string;
  itemNumber: string;
  itemName: string;
  storagePosition: string;
  dropoffPosition: string;
  startTime: string;
  endTime: string;
  photoUrl: string;
  status: 'Pending' | 'Assigned' | 'Picking' | 'Delivered';
}

const BASE_URL = import.meta.env.VITE_GAS_URL;

export const api = {
  getJobs: async (): Promise<Job[]> => {
    const response = await fetch(`${BASE_URL}?action=getJobs`);
    return response.json();
  },
  submitJob: async (data: Partial<Job>): Promise<{ success: boolean; id: string }> => {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'user1_submit', data })
    });
    return response.json();
  },
  assignPosition: async (id: string, dropoffPosition: string): Promise<{ success: boolean }> => {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'user2_assign', id, dropoffPosition })
    });
    return response.json();
  },
  startJob: async (id: string): Promise<{ success: boolean }> => {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'user3_start', id })
    });
    return response.json();
  },
  completeJob: async (id: string, photoUrl: string): Promise<{ success: boolean }> => {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'user3_complete', id, photoUrl })
    });
    return response.json();
  }
};
