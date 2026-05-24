"use client";

import React, { useState } from 'react';
import { MapPin, ArrowRight, CheckCircle2, ChevronRight, Loader2, Play, Camera } from 'lucide-react';
import { acceptJob, completeJob } from '@/app/actions/jobs';
import { Job } from '@/hooks/useJobs';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLiff } from '@/providers/LiffProvider';
import { shareToLine } from '@/lib/line';
import { uploadImage } from '@/lib/upload';

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
  const { liff } = useLiff();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [successImageFile, setSuccessImageFile] = useState<File | null>(null);
  const [successImagePreview, setSuccessImagePreview] = useState<string | null>(null);

  const handleAccept = async () => {
    setLoading(true);
    setLoadingText('กำลังรับงาน...');
    setActionError(null);
    try {
      const res = await acceptJob(job.id, driverId);
      if (res.success) {
        if (onActionComplete) onActionComplete();
      } else {
        setActionError(res.errorMessage || res.error || 'Failed to accept job.');
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
    setLoadingText('กำลังตรวจสอบ...');
    setActionError(null);
    try {
      let imageUrl = undefined;
      if (successImageFile) {
        setLoadingText('กำลังบีบอัดและอัปโหลด...');
        const uploadedUrl = await uploadImage(successImageFile, 'success');
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      setLoadingText('กำลังบันทึกงาน...');
      const res = await completeJob(job.id, imageUrl);
      if (res.success) {
        if (onActionComplete) onActionComplete();
      } else {
        setActionError(res.errorMessage || res.error || 'Failed to complete job.');
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
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none font-bold py-1 px-3 rounded-full text-xs">รอคนขับ</Badge>;
      case 'PICKED_UP':
        return <Badge className="bg-sky-500 hover:bg-sky-600 text-white border-none font-bold py-1 px-3 rounded-full text-xs">กำลังดำเนินการ</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-green-600 hover:bg-green-700 text-white border-none font-bold py-1 px-3 rounded-full text-xs">ส่งสำเร็จ</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-destructive hover:bg-destructive/90 text-white border-none font-bold py-1 px-3 rounded-full text-xs">ยกเลิกแล้ว</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-sm transition-all flex flex-col p-5 min-h-[260px]">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">
            หมายเลขแบทช์ (Batch): {job.itemDetails.batchNumber}
          </span>
          <h4 className="font-bold text-lg text-foreground tracking-tight line-clamp-1">
            {job.itemDetails.itemName}
          </h4>
          <span className="text-xs text-muted-foreground font-medium">
            รหัสสินค้า (Item ID): {job.itemDetails.itemNumber}
          </span>
        </div>
        <div>
          {getStatusBadge(job.status)}
        </div>
      </div>

      <div className="my-4 flex-1 space-y-4">
        <div className="relative pl-6 border-l border-dashed border-border/80 ml-2.5 space-y-4 py-1">
          {/* Dot for pickup */}
          <div className="absolute left-[-4.5px] top-[10px] size-2 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              จุดรับของ (Pickup Location)
            </p>
            <p className="text-sm font-bold text-foreground">{job.itemDetails.storagePosition}</p>
          </div>

          {/* Dot for destination */}
          <div className="absolute left-[-4.5px] bottom-[12px] size-2 rounded-full bg-primary ring-4 ring-primary/20" />
          <div className="space-y-0.5 pt-2">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">
              จุดส่งของ (Destination)
            </p>
            <p className="text-sm font-bold text-primary">{job.endPoint}</p>
          </div>
        </div>
      </div>

      {actionError && (
        <p className="text-xs font-semibold text-destructive mb-3">{actionError}</p>
      )}

      <CardFooter className="p-0 mt-3 border-none bg-transparent">
        {job.status === 'PENDING' && (
          <Button
            onClick={handleAccept}
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base shadow-sm cursor-pointer flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin size-5" />
                {loadingText}
              </>
            ) : (
              <>
                <Play className="size-5 fill-current" />
                รับงาน (Claim Task)
              </>
            )}
          </Button>
        )}

        {job.status === 'PICKED_UP' && (
          <div className="w-full space-y-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor={`success-image-${job.id}`}
                className="flex-1 flex items-center justify-center gap-2 h-10 px-3 rounded-xl font-medium bg-muted/30 border border-dashed border-border text-xs hover:bg-muted/50 transition-colors cursor-pointer text-muted-foreground"
              >
                <Camera className="size-4" />
                <span>ถ่ายรูปหลักฐานตอนจบงาน (ถ้ามี)</span>
              </label>
              <input
                id={`success-image-${job.id}`}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSuccessImageFile(file);
                    setSuccessImagePreview(URL.createObjectURL(file));
                  }
                }}
              />
              {successImagePreview && (
                <div className="relative size-10 rounded-lg overflow-hidden border border-border shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={successImagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            
            <Button
              onClick={handleComplete}
              disabled={loading || (job.driverId !== null && job.driverId !== driverId)}
              className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-base shadow-sm cursor-pointer flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin size-5" />
                  {loadingText}
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-5" />
                  ส่งสินค้าสำเร็จ (Arrived)
                </>
              )}
            </Button>
          </div>
        )}

        {job.status === 'COMPLETED' && (
          <div className="w-full space-y-2">
            <div className="w-full text-center text-xs font-semibold text-green-600 bg-green-500/10 py-2.5 rounded-xl border border-green-500/20">
              ✓ จัดส่งเรียบร้อยโดย {job.driverId === driverId ? 'คุณ' : `คนขับ (${job.driverId})`}
            </div>
            {job.driverId === driverId && (
              <Button
                onClick={() => shareToLine(liff, job, 'complete')}
                variant="outline"
                className="w-full h-10 rounded-xl hover:bg-[#06C755]/10 border-[#06C755]/20 text-[#06C755] hover:text-[#06C755] font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-none"
              >
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 10.3c0-5.7-5.4-10.3-12-10.3S0 4.6 0 10.3c0 5.1 4.3 9.3 10.1 10.1.4.1.9.3.8.8l-.2 1.5c-.1.5.1.7.5.5.4-.2 4-2.4 5.6-4.1 4.7-1.4 7.2-4.9 7.2-8.8z" />
                </svg>
                แชร์ยืนยันจบงานไปที่ LINE
              </Button>
            )}
          </div>
        )}

        {job.status === 'CANCELLED' && (
          <div className="w-full text-center text-xs font-semibold text-muted-foreground bg-muted py-2.5 rounded-xl">
            งานนี้ถูกยกเลิกแล้ว
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
