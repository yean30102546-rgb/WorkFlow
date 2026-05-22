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
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const data = await getJobs();
      const formatted = (data || []).map(j => ({
        ...j,
        createdAt: typeof j.createdAt === 'string' ? j.createdAt : (j.createdAt as Date).toISOString(),
        updatedAt: typeof j.updatedAt === 'string' ? j.updatedAt : (j.updatedAt as Date).toISOString(),
      })) as Job[];
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
            const formatted = {
              ...newRecord,
              createdAt: typeof newRecord.created_at === 'string' ? newRecord.created_at : new Date(newRecord.created_at).toISOString(),
              updatedAt: typeof newRecord.updated_at === 'string' ? newRecord.updated_at : new Date(newRecord.updated_at).toISOString(),
            } as Job;
            setJobs((prev) => {
              if (prev.some(j => j.id === formatted.id)) return prev;
              return [...prev, formatted];
            });
          } else if (eventType === 'UPDATE') {
            const formatted = {
              ...newRecord,
              createdAt: typeof newRecord.created_at === 'string' ? newRecord.created_at : new Date(newRecord.created_at).toISOString(),
              updatedAt: typeof newRecord.updated_at === 'string' ? newRecord.updated_at : new Date(newRecord.updated_at).toISOString(),
            } as Job;
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
