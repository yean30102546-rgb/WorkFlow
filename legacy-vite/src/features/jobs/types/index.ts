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
