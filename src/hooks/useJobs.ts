"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getJobs } from '@/app/actions/jobs';

export interface Job {
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
  createdAt: string;
  updatedAt: string;
  pickedUpAt: string | null;
  completedAt: string | null;
  requestImageUrl: string | null;
  successImageUrl: string | null;
}

function mapDbJobToJob(dbJob: any): Job {
  let itemDetails = dbJob.itemDetails || dbJob.item_details;
  if (typeof itemDetails === 'string') {
    try {
      itemDetails = JSON.parse(itemDetails);
    } catch (e) {
      console.error('Failed to parse itemDetails JSON', e);
    }
  }

  const getIsoString = (val: any) => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    try {
      return new Date(val).toISOString();
    } catch {
      return null;
    }
  };

  return {
    id: dbJob.id,
    operatorId: dbJob.operatorId || dbJob.operator_id,
    driverId: dbJob.driverId !== undefined ? dbJob.driverId : (dbJob.driver_id || null),
    status: dbJob.status,
    itemDetails: itemDetails || { batchNumber: '', itemNumber: '', itemName: '', storagePosition: '' },
    startPoint: dbJob.startPoint || dbJob.start_point || '',
    endPoint: dbJob.endPoint || dbJob.end_point || '',
    createdAt: getIsoString(dbJob.createdAt || dbJob.created_at) || new Date().toISOString(),
    updatedAt: getIsoString(dbJob.updatedAt || dbJob.updated_at) || new Date().toISOString(),
    pickedUpAt: getIsoString(dbJob.pickedUpAt || dbJob.picked_up_at),
    completedAt: getIsoString(dbJob.completedAt || dbJob.completed_at),
    requestImageUrl: dbJob.requestImageUrl || dbJob.request_image_url || null,
    successImageUrl: dbJob.successImageUrl || dbJob.success_image_url || null,
  };
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const data = await getJobs();
      const formatted = (data || []).map(j => mapDbJobToJob(j));
      setJobs(formatted);
      setError(null);
    } catch (err) {
      console.error('Failed to load initial jobs:', err);
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Setup Supabase Realtime subscription
    // If Supabase credentials are mocks, this will gracefully warn rather than crashing
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('your-project')) {
      console.warn('Supabase URL not configured. Realtime subscriptions are disabled. Polling fallback enabled.');
      // Polling fallback every 3 seconds for local testing/E2E if Supabase URL is mock
      const interval = setInterval(fetchJobs, 3000);
      return () => clearInterval(interval);
    }

    const channel = supabase
      .channel('realtime-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === 'INSERT') {
            const formatted = mapDbJobToJob(newRecord);
            setJobs((prev) => {
              if (prev.some(j => j.id === formatted.id)) return prev;
              return [...prev, formatted];
            });
          } else if (eventType === 'UPDATE') {
            const formatted = mapDbJobToJob(newRecord);
            setJobs((prev) =>
              prev.map((j) => (j.id === formatted.id ? formatted : j))
            );
          } else if (eventType === 'DELETE') {
            setJobs((prev) => prev.filter((j) => j.id !== oldRecord.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { jobs, loading, error, refetch: fetchJobs };
}
