'use client';

import React, { useEffect, useState } from 'react';
import { getDriverStats } from '@/app/actions/jobs';
import { Trophy, CheckCircle, Award } from 'lucide-react';

interface DriverStatsCardProps {
  driverId: string;
  refreshTrigger?: number; // Used to trigger a refetch when a job is completed
}

export const DriverStatsCard: React.FC<DriverStatsCardProps> = ({ driverId, refreshTrigger = 0 }) => {
  const [stats, setStats] = useState<{ totalCompleted: number; completedToday: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await getDriverStats(driverId);
        if (isMounted) {
          if (res.success && res.stats) {
            setStats(res.stats);
          } else {
            // Fallback to default stats if database query fails or empty
            setStats({ totalCompleted: 0, completedToday: 0 });
          }
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setStats({ totalCompleted: 0, completedToday: 0 });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();

    return () => { isMounted = false; };
  }, [driverId, refreshTrigger]);

  if (loading || !stats) {
    return (
      <div className="w-full h-24 bg-card/50 animate-pulse rounded-3xl border border-border flex items-center justify-center">
        <span className="text-muted-foreground text-sm font-medium">กำลังโหลดสถิติ...</span>
      </div>
    );
  }

  // Calculate some simple gamification milestones
  const isTargetMet = stats.completedToday >= 10; // Target: 10 jobs per day
  const progress = Math.min((stats.completedToday / 10) * 100, 100);

  return (
    <div className="w-full bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl border border-primary/20 p-5 shadow-sm relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 opacity-10">
        <Trophy size={100} />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Award className="text-primary size-5" />
              สถิติการทำงานของคุณ
            </h3>
            <p className="text-sm text-muted-foreground">เป้าหมายรายวัน: {stats.completedToday} / 10 งาน</p>
          </div>
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold shadow-sm">
            Lv. {Math.floor(stats.totalCompleted / 50) + 1}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-border rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${isTargetMet ? 'bg-[#06C755]' : 'bg-primary'}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-3 border border-border flex items-center gap-3 shadow-sm">
            <div className="bg-green-500/10 p-2 rounded-xl">
              <CheckCircle className="text-green-600 size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">เสร็จวันนี้</p>
              <p className="font-black text-xl text-foreground">{stats.completedToday}</p>
            </div>
          </div>
          
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-3 border border-border flex items-center gap-3 shadow-sm">
            <div className="bg-blue-500/10 p-2 rounded-xl">
              <Trophy className="text-blue-600 size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">รวมทั้งหมด</p>
              <p className="font-black text-xl text-foreground">{stats.totalCompleted}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
