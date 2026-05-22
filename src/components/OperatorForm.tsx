"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Truck, PlusCircle } from 'lucide-react';
import { createJob } from '@/app/actions/jobs';
import { CreateJobSchema, CreateJobInput } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface OperatorFormProps {
  operatorId: string;
  operatorName: string;
  onJobCreated?: () => void;
}

export const OperatorForm: React.FC<OperatorFormProps> = ({
  operatorId,
  operatorName,
  onJobCreated,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
      const response = await createJob(data);
      if (response.success) {
        setSuccessMsg(`Job registered successfully! Notification sent.`);
        reset({
          batchNumber: '',
          itemNumber: '',
          itemName: '',
          storagePosition: '',
          startPoint: 'Station A',
          endPoint: 'Warehouse B',
          operatorId: operatorId,
        });
        if (onJobCreated) onJobCreated();
      } else {
        setSubmitError(response.errorMessage || 'Failed to create job.');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('An unexpected error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto rounded-3xl border border-border shadow-xl bg-card overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground p-8">
        <div className="flex items-center gap-3">
          <Truck className="size-8" />
          <div>
            <CardTitle className="text-2xl font-black tracking-tight">Call Forklift Pickup</CardTitle>
            <CardDescription className="text-primary-foreground/70 text-sm">
              Operator: <span className="font-bold">{operatorName}</span> ({operatorId})
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {submitError && (
            <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl text-sm font-bold">
              {submitError}
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-green-500/10 text-green-600 border border-green-500/20 rounded-2xl text-sm font-bold">
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="batchNumber" className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                Batch Number
              </Label>
              <Input
                id="batchNumber"
                {...register('batchNumber')}
                placeholder="e.g. B-1092"
                className="h-14 px-5 rounded-2xl font-bold bg-muted/30 focus-visible:bg-background border-border text-base focus-visible:ring-primary focus-visible:border-primary"
              />
              {errors.batchNumber && (
                <p className="text-xs font-bold text-destructive mt-1">{errors.batchNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemNumber" className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                Item Number
              </Label>
              <Input
                id="itemNumber"
                {...register('itemNumber')}
                placeholder="e.g. ITM-889"
                className="h-14 px-5 rounded-2xl font-bold bg-muted/30 focus-visible:bg-background border-border text-base focus-visible:ring-primary focus-visible:border-primary"
              />
              {errors.itemNumber && (
                <p className="text-xs font-bold text-destructive mt-1">{errors.itemNumber.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemName" className="text-xs font-black text-muted-foreground uppercase tracking-wider">
              Item Name / Description
            </Label>
            <Input
              id="itemName"
              {...register('itemName')}
              placeholder="e.g. Steel Coil 5T"
              className="h-14 px-5 rounded-2xl font-bold bg-muted/30 focus-visible:bg-background border-border text-base focus-visible:ring-primary focus-visible:border-primary"
            />
            {errors.itemName && (
              <p className="text-xs font-bold text-destructive mt-1">{errors.itemName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="storagePosition" className="text-xs font-black text-muted-foreground uppercase tracking-wider">
              Current Storage Position (Location)
            </Label>
            <Input
              id="storagePosition"
              {...register('storagePosition')}
              placeholder="e.g. Row C, Staging A"
              className="h-14 px-5 rounded-2xl font-bold bg-muted/30 focus-visible:bg-background border-border text-base focus-visible:ring-primary focus-visible:border-primary"
            />
            {errors.storagePosition && (
              <p className="text-xs font-bold text-destructive mt-1">{errors.storagePosition.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/20 p-5 rounded-3xl border border-border/50">
            <div className="space-y-2">
              <Label htmlFor="startPoint" className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                Start Point (Fixed)
              </Label>
              <Input
                id="startPoint"
                {...register('startPoint')}
                disabled
                className="h-12 px-4 rounded-xl font-bold bg-muted border-none opacity-80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endPoint" className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                Destination (Fixed)
              </Label>
              <Input
                id="endPoint"
                {...register('endPoint')}
                disabled
                className="h-12 px-4 rounded-xl font-bold bg-muted border-none opacity-80"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-lg hover:shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-3"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin size-6" />
                Registering Request...
              </>
            ) : (
              <>
                <PlusCircle className="size-6" />
                Call Forklift Pickup
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
