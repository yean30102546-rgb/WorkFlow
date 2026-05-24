"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Truck, PlusCircle, Camera, ImageIcon } from 'lucide-react';
import { createJob } from '@/app/actions/jobs';
import { uploadImage } from '@/lib/upload';
import { CreateJobSchema, CreateJobInput } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OperatorFormProps {
  operatorId: string;
  operatorName: string;
  onJobCreated?: (job: any) => void;
}

export const OperatorForm: React.FC<OperatorFormProps> = ({
  operatorId,
  operatorName,
  onJobCreated,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(CreateJobSchema),
    defaultValues: {
      batchNumber: '',
      itemNumber: '',
      itemName: '',
      storagePosition: '',
      startPoint: 'Station A',
      endPoint: 'Warehouse B',
      operatorId: operatorId,
    },
  });

  const onSubmit = async (data: CreateJobInput) => {
    setSubmitting(true);
    setSubmitError(null);
    setSuccessMsg(null);
    
    // Ensure current operatorId is bound
    data.operatorId = operatorId;

    try {
      // Handle Image Upload First
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile, 'requests');
        if (imageUrl) {
          data.requestImageUrl = imageUrl;
        }
      }

      const response = await createJob(data);
      if (response.success) {
        setSuccessMsg(`สร้างคำขอเรียกรถฟอร์คลิฟต์สำเร็จ! ได้ส่งการแจ้งเตือนไปยังคนขับแล้ว`);
        reset({
          batchNumber: '',
          itemNumber: '',
          itemName: '',
          storagePosition: '',
          startPoint: 'Station A',
          endPoint: 'Warehouse B',
          operatorId: operatorId,
        });
        setImageFile(null);
        setImagePreview(null);
        if (onJobCreated && response.job) onJobCreated(response.job);
      } else {
        setSubmitError(response.errorMessage || 'ไม่สามารถส่งคำขอเรียกรถฟอร์คลิฟต์ได้');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <CardHeader className="border-b border-border p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Truck className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold tracking-tight text-foreground">เรียกรับสินค้า (Call Forklift)</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                ผู้แจ้งงาน: <span className="font-semibold text-foreground">{operatorName}</span>
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground border-border bg-muted/30">
            ID: {operatorId}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {submitError && (
            <div className="p-3.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs font-bold">
              {submitError}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-green-500/10 text-green-600 border border-green-500/20 rounded-xl text-xs font-bold">
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="batchNumber" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                หมายเลขแบทช์ (Batch Number)
              </Label>
              <Input
                id="batchNumber"
                {...register('batchNumber')}
                placeholder="เช่น B-1092"
                className="h-11 px-4 rounded-xl font-medium bg-muted/10 border-border text-sm focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-background"
              />
              {errors.batchNumber && (
                <p className="text-xs font-bold text-destructive mt-1">{errors.batchNumber.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="itemNumber" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                หมายเลขสินค้า (Item Number)
              </Label>
              <Input
                id="itemNumber"
                {...register('itemNumber')}
                placeholder="เช่น ITM-889"
                className="h-11 px-4 rounded-xl font-medium bg-muted/10 border-border text-sm focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-background"
              />
              {errors.itemNumber && (
                <p className="text-xs font-bold text-destructive mt-1">{errors.itemNumber.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="itemName" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              ชื่อสินค้า / รายละเอียด (Item Name)
            </Label>
            <Input
              id="itemName"
              {...register('itemName')}
              placeholder="เช่น Steel Coil 5T"
              className="h-11 px-4 rounded-xl font-medium bg-muted/10 border-border text-sm focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-background"
            />
            {errors.itemName && (
              <p className="text-xs font-bold text-destructive mt-1">{errors.itemName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="storagePosition" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              จุดรับสินค้าต้นทาง (Storage Position)
            </Label>
            <Input
              id="storagePosition"
              {...register('storagePosition')}
              placeholder="เช่น Row C, Staging A"
              className="h-11 px-4 rounded-xl font-medium bg-muted/10 border-border text-sm focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-background"
            />
            {errors.storagePosition && (
              <p className="text-xs font-bold text-destructive mt-1">{errors.storagePosition.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              รูปถ่ายประกอบ (Optional)
            </Label>
            <div className="flex items-center gap-3">
              <Label
                htmlFor="image-upload"
                className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl font-medium bg-muted/20 border border-dashed border-border text-sm hover:bg-muted/50 transition-colors cursor-pointer text-muted-foreground"
              >
                <Camera className="size-4" />
                <span>ถ่ายรูป / อัปโหลด</span>
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
              />
              {imagePreview && (
                <div className="relative size-11 rounded-lg overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/10 p-4 rounded-2xl border border-border/50">
            <div className="space-y-1">
              <Label htmlFor="startPoint" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                จุดเริ่มต้น (ถาวร)
              </Label>
              <Input
                id="startPoint"
                {...register('startPoint')}
                disabled
                className="h-10 px-3.5 rounded-lg font-medium bg-muted border-none opacity-80 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="endPoint" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                จุดส่งมอบปลายทาง (ถาวร)
              </Label>
              <Input
                id="endPoint"
                {...register('endPoint')}
                disabled
                className="h-10 px-3.5 rounded-lg font-medium bg-muted border-none opacity-80 text-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin size-4" />
                กำลังลงทะเบียน...
              </>
            ) : (
              <>
                <PlusCircle className="size-4" />
                เรียกรถฟอร์คลิฟต์
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
