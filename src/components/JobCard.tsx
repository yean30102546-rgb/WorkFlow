"use client";

import React, { useState } from 'react';
import { MapPin, ArrowRight, CheckCircle2, ChevronRight, Loader2, Play } from 'lucide-react';
import { acceptJob, completeJob } from '@/app/actions/jobs';
import { Job } from '@/hooks/useJobs';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface JobCardProps {
  job: Job;
  driverId: string;
  onActionComplete?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  driverId,
  onActionComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAccept = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const res = await acceptJob(job.id, driverId);
      if (res.success) {
        if (onActionComplete) onActionComplete();
      } else {
        setActionError(res.errorMessage || 'Failed to accept job.');
      }
    } catch (err) {
      console.error(err);
      setActionError('Error accepting job.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const res = await completeJob(job.id);
      if (res.success) {
        if (onActionComplete) onActionComplete();
      } else {
        setActionError(res.errorMessage || 'Failed to complete job.');
      }
    } catch (err) {
      console.error(err);
      setActionError('Error completing job.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Job['status']) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none font-bold py-1 px-3 rounded-full text-xs">Waiting Driver</Badge>;
      case 'PICKED_UP':
        return <Badge className="bg-sky-500 hover:bg-sky-600 text-white border-none font-bold py-1 px-3 rounded-full text-xs">In Progress</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-green-600 hover:bg-green-700 text-white border-none font-bold py-1 px-3 rounded-full text-xs">Delivered</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-destructive hover:bg-destructive/90 text-white border-none font-bold py-1 px-3 rounded-full text-xs">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="rounded-3xl border border-border shadow-md bg-card overflow-hidden hover:shadow-lg transition-all flex flex-col p-6 min-h-[300px]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">
            Batch: {job.itemDetails.batchNumber}
          </span>
          <h4 className="font-black text-xl text-foreground tracking-tight line-clamp-1">
            {job.itemDetails.itemName}
          </h4>
          <span className="text-xs text-muted-foreground font-semibold">
            Item ID: {job.itemDetails.itemNumber}
          </span>
        </div>
        <div>
          {getStatusBadge(job.status)}
        </div>
      </div>

      <div className="space-y-3 mb-6 flex-1">
        <div className="bg-muted/30 p-4 rounded-2xl border border-border/30">
          <p className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1.5 mb-1">
            <MapPin className="size-3 text-primary" /> Pickup Location (Current)
          </p>
          <p className="text-base font-black text-foreground">{job.itemDetails.storagePosition}</p>
        </div>

        <div className="flex justify-center text-muted-foreground py-0.5">
          <ChevronRight className="rotate-90 sm:rotate-0 size-6" />
        </div>

        <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
          <p className="text-[10px] font-black text-primary uppercase flex items-center gap-1.5 mb-1">
            <ArrowRight className="size-3" /> Destination Warehouse
          </p>
          <p className="text-base font-black text-primary">{job.endPoint}</p>
        </div>
      </div>

      {actionError && (
        <p className="text-xs font-bold text-destructive mb-3">{actionError}</p>
      )}

      <CardFooter className="p-0 mt-auto">
        {job.status === 'PENDING' && (
          <Button
            onClick={handleAccept}
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-base shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            {loading ? (
              <Loader2 className="animate-spin size-5" />
            ) : (
              <>
                <Play className="size-5 fill-current" />
                Accept Pickup (Claim Task)
              </>
            )}
          </Button>
        )}

        {job.status === 'PICKED_UP' && (
          <Button
            onClick={handleComplete}
            disabled={loading || (job.driverId !== null && job.driverId !== driverId)}
            className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-base shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <Loader2 className="animate-spin size-5" />
            ) : (
              <>
                <CheckCircle2 className="size-5" />
                Finish Delivery (Arrived)
              </>
            )}
          </Button>
        )}

        {job.status === 'COMPLETED' && (
          <div className="w-full text-center text-sm font-bold text-green-600 bg-green-500/10 py-3 rounded-2xl border border-green-500/20">
            ✓ Delivered by {job.driverId === driverId ? 'You' : `Driver (${job.driverId})`}
          </div>
        )}

        {job.status === 'CANCELLED' && (
          <div className="w-full text-center text-sm font-bold text-muted-foreground bg-muted py-3 rounded-2xl">
            This pickup was cancelled.
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
