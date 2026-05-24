"use client";

import React, { useState, useEffect } from 'react';
import { useLiff } from '@/providers/LiffProvider';
import { useJobs, Job } from '@/hooks/useJobs';
import { useUsers } from '@/hooks/useUsers';
import { OperatorForm } from '@/components/OperatorForm';
import { JobCard } from '@/components/JobCard';
import { DriverStatsCard } from '@/components/DriverStatsCard';
import { acceptJob, completeJob, cancelJob } from '@/app/actions/jobs';
import { shareToLine } from '@/lib/line';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Users,
  BarChart,
  LogOut,
  Truck,
  ClipboardList,
  Circle,
  History,
  Settings2,
  PackageOpen,
  Loader2,
  Zap,
  Shield,
  Smartphone,
  LineChart,
  ArrowRight,
  Lock,
  X,
  Workflow,
  MessageSquare,
  Share2,
  Play,
  XCircle,
  CheckCircle2
} from 'lucide-react';

const formatDuration = (ms: number | null) => {
  if (ms === null || isNaN(ms) || ms < 0) return '-';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} นาที ${seconds} วินาที`;
};

export default function DashboardPage() {
  const { liff, profile, loading: authLoading, login, logout, isMock, setMockProfile } = useLiff();
  const { jobs, loading: jobsLoading, refetch } = useJobs();
  const { users, refetch: refetchUsers, changeRole, loading: usersLoading } = useUsers();
  const [role, setRole] = useState<'operator' | 'driver' | 'dashboard'>('operator');
  const [operatorTab, setOperatorTab] = useState<'request' | 'history'>('request');
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'users'>('overview');
  const [isRoleLocked, setIsRoleLocked] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // LINE Notification and Flex Message simulation states
  const [activeLineNotification, setActiveLineNotification] = useState<any | null>(null);
  const [showLineChat, setShowLineChat] = useState<boolean>(false);
  const [showNotificationToast, setShowNotificationToast] = useState<boolean>(false);
  const [acceptingLineJob, setAcceptingLineJob] = useState<boolean>(false);
  const [completingLineJob, setCompletingLineJob] = useState<boolean>(false);

  // Set default role from URL parameter if present and lock it
  useEffect(() => {
    if (authLoading) return;

    const params = new URLSearchParams(window.location.search);
    const urlRole = params.get('role');
    if (urlRole === 'operator' || urlRole === 'driver' || urlRole === 'dashboard') {
      setRole(urlRole as 'operator' | 'driver' | 'dashboard');
      if (!isMock) {
        setIsRoleLocked(true); // ป้องกันไม่ให้สลับหน้าต่างหากเข้ามาผ่านเมนูที่กำหนด
      } else {
        setIsRoleLocked(false); // ในโหมดจำลองปล่อยให้สลับหน้าเพื่อทดสอบได้
      }
    }
  }, [isMock, authLoading]);

  // Handle URL actions (like when clicking Accept/Complete button in real LINE chat linking to this app)
  useEffect(() => {
    const handleUrlActions = async () => {
      if (!profile) return;
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const jobId = params.get('jobId');

      if (jobId) {
        if (action === 'claim') {
          setRole('driver');
          const res = await acceptJob(jobId, profile.userId);
          if (res.success) {
            // Remove query params
            const url = new URL(window.location.href);
            url.searchParams.delete('action');
            url.searchParams.delete('jobId');
            window.history.replaceState({}, document.title, url.pathname + url.search);
            refetch();
          }
        } else if (action === 'complete') {
          setRole('driver');
          const res = await completeJob(jobId);
          if (res.success) {
            // Remove query params
            const url = new URL(window.location.href);
            url.searchParams.delete('action');
            url.searchParams.delete('jobId');
            window.history.replaceState({}, document.title, url.pathname + url.search);
            refetch();
          }
        }
      }
    };
    handleUrlActions();
  }, [profile]);

  const handleShareToLine = async (job: any) => {
    await shareToLine(liff, job, 'call');
  };

  const handleShareCompleteToLine = async (job: any) => {
    await shareToLine(liff, job, 'complete');
  };

  // Called when operator submits a new forklift request
  const handleJobCreated = (newJob: any) => {
    setActiveLineNotification(newJob);
    setShowNotificationToast(true);
    refetch();

    // Auto close toast after 10s
    setTimeout(() => {
      setShowNotificationToast((prev) => {
        if (prev) return false;
        return prev;
      });
    }, 10000);
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-sm font-bold text-muted-foreground">Initializing Factory Session...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-grow flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-white font-sans overflow-x-hidden">
        {/* Sleek Landing Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border px-6 py-3.5">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src="/sfc-logo.png"
                alt="SFC Excellence Logo"
                className="h-9 md:h-11 w-auto object-contain"
              />
              <div className="h-6 w-px bg-border hidden sm:block" />
              <div className="hidden sm:block">
                <h1 className="font-bold text-sm tracking-tight leading-none text-foreground">
                  Forklift-JIT
                </h1>
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" /> Live Connected
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowLoginModal(true)}
              className="h-10 px-5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-sm transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Lock size={14} />
              <span>เข้าสู่ระบบ</span>
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-24 pb-16 px-6 text-center max-w-4xl mx-auto z-10 animate-fade-in-up">
          {/* Ambient light glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full font-bold text-[11px] mb-6 inline-flex gap-1.5 shadow-none animate-pulse-soft">
            <Zap size={12} className="text-primary animate-pulse" />
            <span>ระบบเรียกฟอร์คลิฟต์อัจฉริยะ JIT</span>
          </Badge>

          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.2] mb-6 animate-fade-in-up animation-delay-100 opacity-0 animation-fill-forwards">
            เพิ่มประสิทธิภาพคลังสินค้าโรงงานด้วย{' '}
            <span className="bg-gradient-to-r from-primary via-indigo-600 to-primary bg-clip-text text-transparent font-extrabold">
              Forklift-JIT
            </span>
          </h2>

          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in-up animation-delay-200 opacity-0 animation-fill-forwards">
            ยกระดับความเร็วในการจัดส่งด้วยระบบ Just-In-Time (JIT) ลดเวลาการจอดรอรถของพนักงาน
            และสื่อสารระหว่างหน้างานผลิตกับคนขับฟอร์คลิฟต์ได้อย่างไร้รอยต่อแบบเรียลไทม์
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-fade-in-up animation-delay-300 opacity-0 animation-fill-forwards">
            <Button
              onClick={() => setShowLoginModal(true)}
              className="w-full sm:w-auto h-11 px-8 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-sm cursor-pointer shadow-sm flex items-center justify-center gap-2 group transition-all duration-200"
            >
              <span>เริ่มใช้งานระบบ</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Button>

            <a
              href="#features"
              className="w-full sm:w-auto h-11 px-8 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground hover:text-foreground font-semibold text-sm cursor-pointer transition-all duration-200 flex items-center justify-center"
            >
              ดูคุณสมบัติเด่น
            </a>
          </div>
        </section>

        {/* Live Status Stats Bar */}
        <section className="max-w-5xl mx-auto w-full px-6 mb-20 animate-fade-in-up animation-delay-300 opacity-0 animation-fill-forwards">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="text-center md:text-left space-y-1 md:border-r border-border md:pr-8">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ระยะเวลาเรียกรับของ</span>
              <p className="text-3xl font-extrabold text-foreground">&lt; 3.2 นาที</p>
              <p className="text-xs text-muted-foreground">ตอบสนองการผลิตได้ทันที (JIT Target)</p>
            </div>
            <div className="text-center md:text-left space-y-1 md:border-r border-border md:px-8">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ความแม่นยำสถานะจัดส่ง</span>
              <p className="text-3xl font-extrabold text-foreground">99.8%</p>
              <p className="text-xs text-muted-foreground">อัปเดตแบบเรียลไทม์ลดข้อผิดพลาด</p>
            </div>
            <div className="text-center md:text-left space-y-1 md:pl-8">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ประสิทธิภาพไลน์ผลิต</span>
              <p className="text-3xl font-extrabold text-foreground">+25%</p>
              <p className="text-xs text-muted-foreground">ลดชั่วโมงการจอดรอรถฟอร์คลิฟต์</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-6xl mx-auto w-full px-6 py-8 mb-20 scroll-mt-24 animate-fade-in-up animation-delay-300 opacity-0 animation-fill-forwards">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">คุณสมบัติระบบเพื่อระบบโลจิสติกส์ในโรงงาน</h3>
            <p className="text-muted-foreground text-xs">
              ออกแบบขึ้นมาเพื่อตอบสนองการทำงานในสภาพแวดล้อมจริงของโรงงานอุตสาหกรรม ใช้งานง่าย บนทุกอุปกรณ์
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="bg-card border border-border hover:border-primary/20 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex gap-4 group cursor-default">
              <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                <Zap size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-foreground">JIT Dispatching (เรียกงานระบบทันที)</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  โอเปอเรเตอร์หน้างานส่งคำขอจัดส่งสินค้าได้รวดเร็วเพียงกรอกข้อมูลบาร์โค้ด ตำแหน่งจัดเก็บ และปลายทาง ระบบจะทำการบันทึกและป้อนงานเข้าคิวคนขับรถฟอร์คลิฟต์ทันที
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border hover:border-primary/20 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex gap-4 group cursor-default">
              <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                <Workflow size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-foreground">Live Tracking & Real-time (ติดตามสด)</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  ด้วยการเชื่อมต่อข้อมูลผ่านระบบ Supabase Realtime ทั้งฝั่งหน้างานผลิตและฝั่งคนขับฟอร์คลิฟต์ จะเห็นความเคลื่อนไหวและสถานะของงานปรับเปลี่ยนแบบสดๆ โดยไม่ต้องกดรีเฟรชหน้าจอ
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border hover:border-primary/20 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex gap-4 group cursor-default">
              <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                <Smartphone size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-foreground">Driver Workspace (แดชบอร์ดคนขับ)</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  พนักงานขับรถฟอร์คลิฟต์สามารถดูรายการคิวงานจัดส่งทั้งหมดในโรงงาน กดรับงาน อัปเดตการรับสินค้า (Picked Up) และรายงานเมื่อจัดส่งถึงเป้าหมายเรียบร้อยแล้ว ได้ผ่านหน้าจอมือถือและแท็บเล็ต
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-card border border-border hover:border-primary/20 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex gap-4 group cursor-default">
              <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                <LineChart size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-foreground">Traceable Logistics (ตรวจสอบประวัติได้)</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  เก็บบันทึกประวัติและสถิติข้อมูลของทุกรายการรับส่งสินค้า เพื่อใช้ประเมินความเร็วในการทำงาน วิเคราะห์หาจุดที่เกิดความล่าช้า และนำไปประยุกต์ปรับปรุงกระบวนการแบบลีน (Lean Production)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Operational Workflow Steps */}
        <section className="bg-secondary/30 border-y border-border py-16 px-6 mb-20 animate-fade-in-up animation-delay-300 opacity-0 animation-fill-forwards">
          <div className="max-w-6xl mx-auto w-full">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">ขั้นตอนการทำงานที่แสนเรียบง่าย</h3>
              <p className="text-muted-foreground text-xs">
                เปลี่ยนความยุ่งเหยิงของการจัดส่งในโรงงาน ให้เสร็จสิ้นได้ใน 3 ขั้นตอนหลัก
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector line for large screens */}
              <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-0.5 bg-border -z-10" />

              {/* Step 1 */}
              <div className="text-center space-y-3 group cursor-default">
                <div className="size-10 rounded-full bg-background border border-border text-primary flex items-center justify-center font-bold text-sm mx-auto shadow-sm group-hover:scale-110 group-hover:border-primary transition-all duration-300">
                  1
                </div>
                <h4 className="font-bold text-foreground text-base">โอเปอเรเตอร์สั่งงาน</h4>
                <p className="text-muted-foreground text-xs leading-relaxed max-w-xs mx-auto">
                  ระบุรายละเอียดสิ่งของ ตำแหน่งชั้นจัดเก็บ (Storage Cell) และปลายทางของไลน์ผลิตเพื่อส่งสัญญาณเรียกรับ
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center space-y-3 group cursor-default">
                <div className="size-10 rounded-full bg-background border border-border text-primary flex items-center justify-center font-bold text-sm mx-auto shadow-sm group-hover:scale-110 group-hover:border-primary transition-all duration-300">
                  2
                </div>
                <h4 className="font-bold text-foreground text-base">คนขับรับและดำเนินการ</h4>
                <p className="text-muted-foreground text-xs leading-relaxed max-w-xs mx-auto">
                  คนขับเห็นรายการในคิวและกดรับงาน นำรถไปรับสินค้า ณ จุดจัดเก็บ จากนั้นกดเปลี่ยนสถานะเป็น Picked Up
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center space-y-3 group cursor-default">
                <div className="size-10 rounded-full bg-background border border-border text-primary flex items-center justify-center font-bold text-sm mx-auto shadow-sm group-hover:scale-110 group-hover:border-primary transition-all duration-300">
                  3
                </div>
                <h4 className="font-bold text-foreground text-base">จัดส่งสำเร็จเรียบร้อย</h4>
                <p className="text-muted-foreground text-xs leading-relaxed max-w-xs mx-auto">
                  เมื่อสินค้าถึงไลน์รับปลายทางเสร็จสิ้น กดปุ่มรายงานสำเร็จ (Complete) ข้อมูลจะส่งบันทึกเข้าสู่ส่วนกลาง
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-4xl mx-auto w-full px-6 mb-20 text-center animate-fade-in-up animation-delay-300 opacity-0 animation-fill-forwards">
          <div className="bg-card border border-border rounded-2xl p-10 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/5 blur-[80px] rounded-full pointer-events-none animate-float" />

            <h3 className="text-2xl font-bold text-foreground mb-3">
              พร้อมเพิ่มประสิทธิภาพโลจิสติกส์ในโรงงานของคุณแล้วหรือยัง?
            </h3>

            <p className="text-muted-foreground text-xs max-w-xl mx-auto mb-6">
              เข้าใช้งานผ่าน LINE LIFF ได้สะดวกสบาย ปลอดภัยสูง พร้อมสิทธิรับการแจ้งเตือนงานแบบเรียลไทม์ผ่านมือถือของพนักงานโดยตรง
            </p>

            <Button
              onClick={() => setShowLoginModal(true)}
              className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm cursor-pointer shadow-sm transition-all duration-200 hover:scale-[1.01]"
            >
              เข้าสู่ระบบเพื่อทดลองใช้งาน
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-border py-6 px-6 text-center text-[10px] text-muted-foreground">
          <p>© {new Date().getFullYear()} SFC Excellence Forklift-JIT. All rights reserved. พัฒนาขึ้นเพื่ออุตสาหกรรมการผลิตยุค 4.0</p>
        </footer>

        {/* Glassmorphic Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 space-y-6 relative shadow-lg animate-scale-in text-center">
              {/* Close Button */}
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="mx-auto flex justify-center py-2">
                <img
                  src="/sfc-logo.png"
                  alt="SFC Excellence Logo"
                  className="h-14 w-auto object-contain"
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground">เข้าสู่ระบบ Forklift-JIT</h3>
                <p className="text-muted-foreground mt-1 text-xs">เลือกวิธีการเข้าใช้งานเพื่อทำงานต่อในระบบ</p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setShowLoginModal(false);
                    login();
                  }}
                  className="w-full h-12 rounded-xl bg-[#06C755] hover:bg-[#05b04b] text-white font-bold text-sm border-none cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  {/* Custom LINE Icon */}
                  <svg className="size-4 fill-white" viewBox="0 0 24 24">
                    <path d="M24 10.3c0-5.7-5.4-10.3-12-10.3S0 4.6 0 10.3c0 5.1 4.3 9.3 10.1 10.1.4.1.9.3.8.8l-.2 1.5c-.1.5.1.7.5.5.4-.2 4-2.4 5.6-4.1 4.7-1.4 7.2-4.9 7.2-8.8z" />
                  </svg>
                  <span>เข้าสู่ระบบด้วย LINE</span>
                </Button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    สำหรับนักพัฒนา (Mock Account)
                  </span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {
                      setShowLoginModal(false);
                      setMockProfile('op-101', 'Operator Somchai');
                    }}
                    variant="outline"
                    className="h-10 rounded-xl text-xs font-semibold cursor-pointer border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    จำลอง โอเปอเรเตอร์
                  </Button>
                  <Button
                    onClick={() => {
                      setShowLoginModal(false);
                      setMockProfile('drv-505', 'Driver Somsak');
                    }}
                    variant="outline"
                    className="h-10 rounded-xl text-xs font-semibold cursor-pointer border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    จำลอง คนขับรถ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleCancelJob = async (jobId: string) => {
    if (!confirm('ยืนยันการยกเลิกคำสั่งงานฟอร์คลิฟต์นี้?')) return;
    setCancellingId(jobId);
    try {
      const res = await cancelJob(jobId);
      if (!res.success) {
        alert(res.errorMessage || res.error || 'Failed to cancel job');
      } else {
        refetch();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to cancel job. Connection error.');
    } finally {
      setCancellingId(null);
    }
  };

  // Filter jobs for operator (showing only theirs)
  const operatorJobs = jobs.filter(j => j.operatorId === profile.userId);
  const activeOperatorJobs = operatorJobs.filter(j => j.status !== 'COMPLETED' && j.status !== 'CANCELLED');
  const pastOperatorJobs = operatorJobs.filter(j => j.status === 'COMPLETED' || j.status === 'CANCELLED');

  // Filter jobs for driver
  const availableDriverJobs = jobs.filter(j => j.status === 'PENDING');
  const activeDriverJobs = jobs.filter(j => j.status === 'PICKED_UP' && j.driverId === profile.userId);
  const driverHistoryJobs = jobs.filter(j => j.status === 'COMPLETED' && j.driverId === profile.userId);

  const getStatusBadge = (status: string) => {
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

  // Dashboard calculations
  const totalJobsCount = jobs.length;
  const pendingJobsCount = jobs.filter(j => j.status === 'PENDING').length;
  const activeJobsCount = jobs.filter(j => j.status === 'PICKED_UP').length;
  const completedJobsCount = jobs.filter(j => j.status === 'COMPLETED').length;

  // Average waiting time (createdAt -> pickedUpAt)
  const waitingTimes = jobs
    .filter(j => j.pickedUpAt)
    .map(j => new Date(j.pickedUpAt!).getTime() - new Date(j.createdAt).getTime());
  const avgWaitingTime = waitingTimes.length > 0
    ? waitingTimes.reduce((a, b) => a + b, 0) / waitingTimes.length
    : null;

  // Average delivery time (pickedUpAt -> completedAt)
  const deliveryTimes = jobs
    .filter(j => j.pickedUpAt && j.completedAt)
    .map(j => new Date(j.completedAt!).getTime() - new Date(j.pickedUpAt!).getTime());
  const avgDeliveryTime = deliveryTimes.length > 0
    ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length
    : null;

  return (
    <div className="flex-grow flex flex-col min-h-screen bg-background">
      {/* Premium Glassmorphic Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl">
              <Truck size={20} className="font-bold" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight leading-none text-foreground">Forklift-JIT</h1>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5 tracking-wider flex items-center gap-1">
                <Circle className="size-2 fill-green-500 text-green-500 animate-pulse" /> เชื่อมต่อระบบเรียลไทม์
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-muted/50 p-2 rounded-2xl border border-border">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {profile.displayName.charAt(0)}
              </div>
              <div className="text-left pr-2">
                <p className="text-xs font-black text-foreground">{profile.displayName}</p>
                <p className="text-[9px] text-muted-foreground font-mono">{isMock ? 'บัญชีจำลอง (Mock)' : 'ผู้ใช้งาน LINE'}</p>
              </div>
            </div>

            <Button
              onClick={logout}
              variant="ghost"
              size="icon"
              className="rounded-xl border border-border size-10 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      {/* Role Selection & Main Workspace */}
      <main className="max-w-6xl w-full mx-auto px-6 py-8 flex-1 flex flex-col">
        {/* Role Selector Tabs */}
        {!isRoleLocked && (
          <div className="bg-muted p-1.5 rounded-2xl w-fit flex flex-wrap gap-1 mb-8 self-center sm:self-start">
            <button
              onClick={() => setRole('operator')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all cursor-pointer ${role === 'operator'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <ClipboardList size={16} />
              หน้าของโอเปอเรเตอร์ (ผู้แจ้งงาน)
            </button>
            <button
              onClick={() => setRole('driver')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all cursor-pointer ${role === 'driver'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Truck size={16} />
              หน้าของคนขับฟอร์คลิฟต์ (Driver)
            </button>
            <button
              onClick={() => setRole('dashboard')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all cursor-pointer ${role === 'dashboard'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <LineChart size={16} />
              สรุปภาพรวม (Dashboard)
            </button>
          </div>
        )}

        {/* Portals */}
        {role === 'operator' && (
          <div className="space-y-6 flex-1 flex flex-col animate-fade-in">
            {/* Operator Sub-tabs */}
            <div className="bg-muted p-1.5 rounded-2xl w-fit flex flex-wrap gap-1 mb-2 self-center sm:self-start">
              <button
                onClick={() => setOperatorTab('request')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer ${operatorTab === 'request'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <ClipboardList size={16} />
                หน้าแจ้งงาน
              </button>
              <button
                onClick={() => setOperatorTab('history')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer ${operatorTab === 'history'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <History size={16} />
                ประวัติย้อนหลังทั้งหมด
              </button>
            </div>

            {operatorTab === 'request' ? (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start animate-fade-in">
                {/* Operator Request Form */}
                <div className="lg:col-span-2">
                  <OperatorForm
                    operatorId={profile.userId}
                    operatorName={profile.displayName}
                    onJobCreated={handleJobCreated}
                  />
                </div>

                {/* Operator Live Tracking panel */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                    <h3 className="text-lg font-black text-foreground mb-4 flex items-center gap-2">
                      <Circle className="size-3 fill-green-500 text-green-500 animate-pulse" />
                      รายการเรียกฟอร์คลิฟต์ที่กำลังดำเนินการ ({activeOperatorJobs.length})
                    </h3>

                    {jobsLoading ? (
                      <div className="py-8 flex justify-center">
                        <Loader2 className="animate-spin text-muted-foreground" />
                      </div>
                    ) : activeOperatorJobs.length === 0 ? (
                      <div className="py-12 text-center bg-muted/20 rounded-2xl border border-dashed border-border/50 text-muted-foreground flex flex-col items-center">
                        <PackageOpen className="size-10 mb-2 opacity-50" />
                        <p className="text-sm font-bold">ไม่มีรายการเรียกฟอร์คลิฟต์ที่กำลังดำเนินการในขณะนี้</p>
                        <p className="text-xs opacity-75 mt-0.5">กรุณากรอกข้อมูลในแบบฟอร์มด้านซ้ายเพื่อเรียกคนขับ</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {activeOperatorJobs.map((job) => (
                          <div key={job.id} className="py-4 flex justify-between items-center group first:pt-0 last:pb-0">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-base text-foreground">
                                  {job.itemDetails.itemName}
                                </span>
                                <Badge className={`border-none font-bold text-[9px] ${job.status === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-sky-500 text-white'
                                  }`}>
                                  {job.status === 'PENDING' ? 'รอคนขับ' : 'กำลังดำเนินการ'}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                จาก: <span className="font-black text-foreground/80">{job.itemDetails.storagePosition}</span>
                                {' '}➜ ถึง: <span className="font-black text-primary">{job.endPoint}</span>
                              </p>
                              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                                หมายเลขแบทช์ (Batch): {job.itemDetails.batchNumber} | รหัสสินค้า (Item ID): {job.itemDetails.itemNumber}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {job.status === 'PENDING' && (
                                <>
                                  <Button
                                    onClick={() => handleShareToLine(job)}
                                    variant="outline"
                                    size="sm"
                                    className="h-10 px-3 hover:bg-[#06C755]/10 border-[#06C755]/25 text-[#06C755] hover:text-[#06C755] rounded-xl cursor-pointer flex items-center gap-1.5 transition-all duration-200 active:scale-95 shadow-none"
                                  >
                                    <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                                      <path d="M24 10.3c0-5.7-5.4-10.3-12-10.3S0 4.6 0 10.3c0 5.1 4.3 9.3 10.1 10.1.4.1.9.3.8.8l-.2 1.5c-.1.5.1.7.5.5.4-.2 4-2.4 5.6-4.1 4.7-1.4 7.2-4.9 7.2-8.8z" />
                                    </svg>
                                    <span className="hidden sm:inline font-bold">ส่งการ์ดเรียก</span>
                                  </Button>
                                  <Button
                                    onClick={() => handleCancelJob(job.id)}
                                    disabled={cancellingId === job.id}
                                    variant="ghost"
                                    size="sm"
                                    className="h-10 px-3 hover:bg-destructive/10 text-destructive rounded-xl border border-destructive/20 cursor-pointer"
                                  >
                                    {cancellingId === job.id ? (
                                      <Loader2 className="animate-spin size-4" />
                                    ) : (
                                      <XCircle size={16} />
                                    )}
                                    <span className="hidden sm:inline ml-1.5 font-bold">ยกเลิกงาน</span>
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* History panel */}
                  <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                    <h3 className="text-base font-black text-foreground/75 mb-4 flex items-center gap-2">
                      <History size={16} /> ประวัติงานที่เสร็จสิ้น
                    </h3>
                    {pastOperatorJobs.length === 0 ? (
                      <p className="text-xs text-muted-foreground">ยังไม่มีประวัติการเรียกฟอร์คลิฟต์ที่เสร็จสมบูรณ์</p>
                    ) : (
                      <div className="divide-y divide-border/60">
                        {pastOperatorJobs.slice(0, 5).map((job) => (
                          <div key={job.id} className="py-3 flex justify-between items-center text-sm first:pt-0 last:pb-0">
                            <div>
                              <p className="font-bold text-foreground/80">{job.itemDetails.itemName}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {job.itemDetails.storagePosition} ➜ {job.endPoint}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {job.status === 'COMPLETED' && (
                                <Button
                                  onClick={() => handleShareCompleteToLine(job)}
                                  variant="ghost"
                                  size="xs"
                                  className="h-8 px-2 hover:bg-[#06C755]/10 text-[#06C755] hover:text-[#06C755] border border-transparent hover:border-[#06C755]/20 rounded-lg cursor-pointer flex items-center gap-1 transition-all duration-200 active:scale-95"
                                >
                                  <svg className="size-3 fill-current" viewBox="0 0 24 24">
                                    <path d="M24 10.3c0-5.7-5.4-10.3-12-10.3S0 4.6 0 10.3c0 5.1 4.3 9.3 10.1 10.1.4.1.9.3.8.8l-.2 1.5c-.1.5.1.7.5.5.4-.2 4-2.4 5.6-4.1 4.7-1.4 7.2-4.9 7.2-8.8z" />
                                  </svg>
                                  <span className="text-[11px] font-bold">แชร์การ์ดจบงาน</span>
                                </Button>
                              )}
                              <Badge className={`border-none ${job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                                }`}>
                                {job.status === 'COMPLETED' ? 'เสร็จสิ้น' : 'ยกเลิกแล้ว'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col flex-1 animate-fade-in">
                <h3 className="text-lg font-black text-foreground mb-4">ประวัติการเรียกฟอร์คลิฟต์ทั้งหมดของคุณ</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground uppercase font-bold tracking-wider">
                        <th className="py-3 px-2">ID Task / สินค้า</th>
                        <th className="py-3 px-2">สเตตัส</th>
                        <th className="py-3 px-2">จุดรับ ➜ จุดส่ง</th>
                        <th className="py-3 px-2">คนขับที่รับงาน</th>
                        <th className="py-3 px-2">เวลารอรับของ</th>
                        <th className="py-3 px-2">เวลาจัดส่ง</th>
                        <th className="py-3 px-2">รูปรับ ➜ รูปส่ง</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pastOperatorJobs.map((j) => {
                        // eslint-disable-next-line react-hooks/purity
                        const waitTimeMs = j.pickedUpAt ? new Date(j.pickedUpAt).getTime() - new Date(j.createdAt).getTime() : Date.now() - new Date(j.createdAt).getTime();
                        const deliveryTimeMs = j.completedAt && j.pickedUpAt ? new Date(j.completedAt).getTime() - new Date(j.pickedUpAt).getTime() : null;

                        return (
                          <tr key={j.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-2">
                              <span className="font-bold block text-foreground">{j.itemDetails.itemName}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">{j.itemDetails.batchNumber}</span>
                            </td>
                            <td className="py-3 px-2">{getStatusBadge(j.status)}</td>
                            <td className="py-3 px-2 font-bold">
                              <span className="text-amber-600">{j.itemDetails.storagePosition}</span>
                              <ArrowRight size={10} className="inline mx-1 text-muted-foreground" />
                              <span className="text-sky-600">{j.endPoint}</span>
                            </td>
                            <td className="py-3 px-2 font-medium">
                              <span className="block text-foreground text-[10px]">{j.driverId || '-'}</span>
                            </td>
                            <td className="py-3 px-2 text-muted-foreground font-semibold">
                              {formatDuration(waitTimeMs)}
                            </td>
                            <td className="py-3 px-2 text-muted-foreground font-semibold">
                              {deliveryTimeMs ? formatDuration(deliveryTimeMs) : j.status === 'PICKED_UP' ? 'กำลังย้าย...' : '-'}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex gap-1.5">
                                {j.requestImageUrl ? (
                                  <a href={j.requestImageUrl} target="_blank" rel="noreferrer" className="relative size-8 rounded border border-border overflow-hidden block">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={j.requestImageUrl} alt="Request" className="w-full h-full object-cover" />
                                  </a>
                                ) : (
                                  <span className="size-8 bg-muted/40 rounded border border-border/50 flex items-center justify-center text-[8px] text-muted-foreground font-bold">ไม่มีรูป</span>
                                )}
                                {j.successImageUrl ? (
                                  <a href={j.successImageUrl} target="_blank" rel="noreferrer" className="relative size-8 rounded border border-border overflow-hidden block">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={j.successImageUrl} alt="Success" className="w-full h-full object-cover" />
                                  </a>
                                ) : (
                                  <span className="size-8 bg-muted/40 rounded border border-border/50 flex items-center justify-center text-[8px] text-muted-foreground font-bold">ไม่มีรูป</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {pastOperatorJobs.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-muted-foreground font-bold">
                            ไม่มีประวัติงานย้อนหลัง
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {role === 'driver' && (
          <div className="space-y-8 flex-1 flex flex-col animate-fade-in">
            <DriverStatsCard driverId={profile.userId} refreshTrigger={jobs.length} />

            {/* Header statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-sky-500/10 border border-sky-500/20 p-5 rounded-2xl text-left">
                <span className="text-xs font-black text-sky-600 uppercase tracking-wider">งานที่รอคนขับรับ (Available)</span>
                <p className="text-3xl font-black text-sky-700 mt-1">{availableDriverJobs.length}</p>
              </div>
              <div className="bg-green-600/10 border border-green-600/20 p-5 rounded-2xl text-left">
                <span className="text-xs font-black text-green-600 uppercase tracking-wider">งานที่รับดำเนินการแล้ว (Active)</span>
                <p className="text-3xl font-black text-green-700 mt-1">{activeDriverJobs.length}</p>
              </div>
            </div>

            {/* Active Driver Jobs list */}
            {activeDriverJobs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                  <Circle className="size-3 fill-green-500 text-green-500 animate-pulse" />
                  รายการงานที่คุณรับสิทธิ์ดำเนินการอยู่
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeDriverJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      driverId={profile.userId}
                      onActionComplete={refetch}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Available Driver Jobs list */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-foreground">รายการคิวงานเรียกฟอร์คลิฟต์ที่พร้อมรับ</h3>
              {jobsLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="animate-spin text-muted-foreground" />
                </div>
              ) : availableDriverJobs.length === 0 ? (
                <div className="py-16 text-center bg-card rounded-3xl border border-border text-muted-foreground flex flex-col items-center justify-center max-w-xl mx-auto">
                  <PackageOpen className="size-12 mb-2 text-muted-foreground/60" />
                  <p className="text-base font-bold">ขณะนี้ไม่มีคิวงานเรียกฟอร์คลิฟต์</p>
                  <p className="text-sm opacity-75 mt-0.5">ระบบจะแสดงงานตรงนี้ทันทีเมื่อมีโอเปอเรเตอร์เรียกใช้งานฟอร์คลิฟต์</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableDriverJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      driverId={profile.userId}
                      onActionComplete={refetch}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Driver completed history section */}
            <div className="space-y-4 border-t border-border pt-8 animate-fade-in">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                <History className="size-5" />
                ประวัติงานที่คุณส่งเสร็จสมบูรณ์ ({driverHistoryJobs.length})
              </h3>
              {jobsLoading ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="animate-spin text-muted-foreground" />
                </div>
              ) : driverHistoryJobs.length === 0 ? (
                <div className="py-10 text-center bg-card rounded-3xl border border-border text-muted-foreground max-w-xl mx-auto">
                  <p className="text-sm font-bold">ยังไม่มีประวัติงานที่คุณจัดส่งสำเร็จ</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {driverHistoryJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      driverId={profile.userId}
                      onActionComplete={refetch}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {role === 'dashboard' && (
          <div className="space-y-6 flex-1 flex flex-col animate-fade-in">
            {/* Dashboard Sub-tabs */}
            <div className="bg-muted p-1.5 rounded-2xl w-fit flex flex-wrap gap-1 mb-2 self-center sm:self-start">
              <button
                onClick={() => setDashboardTab('overview')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer ${dashboardTab === 'overview'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <BarChart size={16} />
                ภาพรวมงาน (Overview)
              </button>
              <button
                onClick={() => {
                  setDashboardTab('users');
                  refetchUsers();
                }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer ${dashboardTab === 'users'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Users size={16} />
                จัดการสิทธิ์พนักงาน (Users)
              </button>
            </div>

            {dashboardTab === 'overview' ? (
              <div className="space-y-8 animate-fade-in flex-1 flex flex-col">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card border border-border p-5 rounded-2xl text-left shadow-sm">
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-wider block">งานทั้งหมด</span>
                    <p className="text-3xl font-black text-foreground mt-1">{totalJobsCount}</p>
                  </div>
                  <div className="bg-card border border-border p-5 rounded-2xl text-left shadow-sm">
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-wider block">กำลังดำเนินการ</span>
                    <p className="text-3xl font-black text-foreground mt-1">{activeJobsCount}</p>
                  </div>
                  <div className="bg-card border border-border p-5 rounded-2xl text-left shadow-sm">
                    <span className="text-xs font-black text-[#06C755] uppercase tracking-wider block">ส่งสำเร็จแล้ว</span>
                    <p className="text-3xl font-black text-[#06C755] mt-1">{completedJobsCount}</p>
                  </div>
                  <div className="bg-card border border-border p-5 rounded-2xl text-left shadow-sm">
                    <span className="text-xs font-black text-amber-500 uppercase tracking-wider block">รอคนขับรับ</span>
                    <p className="text-3xl font-black text-amber-500 mt-1">{pendingJobsCount}</p>
                  </div>
                </div>

                {/* Timings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl text-left flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-amber-700 uppercase tracking-wider block">เวลารอรับของเฉลี่ย (Avg Waiting Time)</span>
                      <p className="text-xl font-black text-amber-800 mt-1">{formatDuration(avgWaitingTime)}</p>
                    </div>
                    <Zap size={24} className="text-amber-500" />
                  </div>
                  <div className="bg-sky-500/5 border border-sky-500/10 p-5 rounded-2xl text-left flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-sky-700 uppercase tracking-wider block">เวลาทำงานเฉลี่ย (Avg Delivery Time)</span>
                      <p className="text-xl font-black text-sky-800 mt-1">{formatDuration(avgDeliveryTime)}</p>
                    </div>
                    <Truck size={24} className="text-sky-500" />
                  </div>
                </div>

                {/* Detailed Table */}
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col flex-1">
                  <h3 className="text-lg font-black text-foreground mb-4">ตารางคิวงานสรุปทั้งหมด</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground uppercase font-bold tracking-wider">
                          <th className="py-3 px-2">ID Task / สินค้า</th>
                          <th className="py-3 px-2">ผู้เรียก / คนขับ</th>
                          <th className="py-3 px-2">สเตตัส</th>
                          <th className="py-3 px-2">จุดรับ ➜ จุดส่ง</th>
                          <th className="py-3 px-2">เวลารอรับของ</th>
                          <th className="py-3 px-2">เวลาจัดส่ง</th>
                          <th className="py-3 px-2">รูปรับ ➜ รูปส่ง</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {jobs.map((j) => {
                          // eslint-disable-next-line react-hooks/purity
                          const waitTimeMs = j.pickedUpAt ? new Date(j.pickedUpAt).getTime() - new Date(j.createdAt).getTime() : Date.now() - new Date(j.createdAt).getTime();
                          const deliveryTimeMs = j.completedAt && j.pickedUpAt ? new Date(j.completedAt).getTime() - new Date(j.pickedUpAt).getTime() : null;

                          return (
                            <tr key={j.id} className="hover:bg-muted/30 transition-colors">
                              <td className="py-3 px-2">
                                <span className="font-bold block text-foreground">{j.itemDetails.itemName}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">{j.itemDetails.batchNumber}</span>
                              </td>
                              <td className="py-3 px-2 font-medium">
                                <span className="block text-foreground text-[10px]">Op: {j.operatorId}</span>
                                <span className="block text-muted-foreground text-[10px]">Dr: {j.driverId || '-'}</span>
                              </td>
                              <td className="py-3 px-2">{getStatusBadge(j.status)}</td>
                              <td className="py-3 px-2 font-bold">
                                <span className="text-amber-600">{j.itemDetails.storagePosition}</span>
                                <ArrowRight size={10} className="inline mx-1 text-muted-foreground" />
                                <span className="text-sky-600">{j.endPoint}</span>
                              </td>
                              <td className="py-3 px-2 text-muted-foreground font-semibold">
                                {formatDuration(waitTimeMs)}
                              </td>
                              <td className="py-3 px-2 text-muted-foreground font-semibold">
                                {deliveryTimeMs ? formatDuration(deliveryTimeMs) : j.status === 'PICKED_UP' ? 'กำลังย้าย...' : '-'}
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex gap-1.5">
                                  {j.requestImageUrl ? (
                                    <a href={j.requestImageUrl} target="_blank" rel="noreferrer" className="relative size-8 rounded border border-border overflow-hidden block">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={j.requestImageUrl} alt="Request" className="w-full h-full object-cover" />
                                    </a>
                                  ) : (
                                    <span className="size-8 bg-muted/40 rounded border border-border/50 flex items-center justify-center text-[8px] text-muted-foreground font-bold">ไม่มีรูป</span>
                                  )}
                                  {j.successImageUrl ? (
                                    <a href={j.successImageUrl} target="_blank" rel="noreferrer" className="relative size-8 rounded border border-border overflow-hidden block">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={j.successImageUrl} alt="Success" className="w-full h-full object-cover" />
                                    </a>
                                  ) : (
                                    <span className="size-8 bg-muted/40 rounded border border-border/50 flex items-center justify-center text-[8px] text-muted-foreground font-bold">ไม่มีรูป</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {jobs.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-muted-foreground font-bold">
                              ไม่มีประวัติงานในระบบ
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col flex-1 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-black text-foreground">ระบบจัดการสิทธิ์ผู้ใช้งาน (User Roles)</h3>
                    <p className="text-xs text-muted-foreground mt-1">กำหนดสิทธิ์พนักงานว่าใครคือ Operator (แจ้งงาน) และ Driver (ขับฟอร์คลิฟต์)</p>
                  </div>
                  <Button 
                    onClick={() => refetchUsers()}
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-xl border border-border shadow-sm text-xs font-bold"
                  >
                    <History size={14} className="mr-1.5" />
                    รีเฟรชข้อมูล
                  </Button>
                </div>
                
                {usersLoading ? (
                  <div className="py-16 flex justify-center">
                    <Loader2 className="animate-spin text-muted-foreground size-8" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground uppercase font-bold tracking-wider">
                          <th className="py-3 px-4">โปรไฟล์ / ชื่อผู้ใช้งาน</th>
                          <th className="py-3 px-4">User ID (LINE)</th>
                          <th className="py-3 px-4">วันที่ลงทะเบียน</th>
                          <th className="py-3 px-4">บทบาท (Role)</th>
                          <th className="py-3 px-4 text-right">จัดการสิทธิ์</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {u.pictureUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={u.pictureUrl} alt={u.displayName} className="size-8 rounded-full border border-border" />
                                ) : (
                                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {u.displayName.charAt(0)}
                                  </div>
                                )}
                                <span className="font-bold text-foreground">{u.displayName}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-mono text-muted-foreground text-[10px]">{u.id}</span>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(u.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={`border-none font-bold text-[10px] ${
                                u.role === 'ADMIN' ? 'bg-purple-500 text-white' : 
                                u.role === 'DRIVER' ? 'bg-sky-500 text-white' : 
                                'bg-amber-500 text-white'
                              }`}>
                                {u.role}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                <Button
                                  onClick={() => changeRole(u.id, 'OPERATOR')}
                                  disabled={u.role === 'OPERATOR'}
                                  variant="outline"
                                  size="xs"
                                  className={`h-7 px-2.5 rounded-lg text-[10px] font-bold ${u.role === 'OPERATOR' ? 'opacity-50 cursor-not-allowed border-amber-500/20 text-amber-600 bg-amber-500/5' : 'hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/20 border-border cursor-pointer'}`}
                                >
                                  ตั้งเป็น Operator
                                </Button>
                                <Button
                                  onClick={() => changeRole(u.id, 'DRIVER')}
                                  disabled={u.role === 'DRIVER'}
                                  variant="outline"
                                  size="xs"
                                  className={`h-7 px-2.5 rounded-lg text-[10px] font-bold ${u.role === 'DRIVER' ? 'opacity-50 cursor-not-allowed border-sky-500/20 text-sky-600 bg-sky-500/5' : 'hover:bg-sky-500/10 hover:text-sky-600 hover:border-sky-500/20 border-border cursor-pointer'}`}
                                >
                                  ตั้งเป็น Driver
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating LINE Simulator Toggle */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => {
            if (jobs && jobs.length > 0) {
              const latestJob = [...jobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
              setActiveLineNotification(latestJob);
              setShowLineChat(true);
            } else {
              alert('กรุณาสร้างคำสั่งงานฟอร์คลิฟต์ก่อนเพื่อใช้เครื่องมือจำลอง LINE!');
            }
          }}
          className="rounded-full shadow-lg bg-[#06C755] hover:bg-[#05b34c] text-white flex items-center gap-2 px-5 py-6 h-12 hover:scale-105 active:scale-95 cursor-pointer transition-all"
        >
          <MessageSquare size={18} />
          <span className="font-black text-sm">จำลอง LINE Bot (LINE Simulator)</span>
        </Button>
      </div>

      {/* LINE Notification Toast Mock (Slides in from top-right) */}
      {showNotificationToast && activeLineNotification && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-slate-900/95 backdrop-blur border border-slate-800 text-white p-4 rounded-2xl shadow-xl transition-all duration-500 ease-out transform translate-y-0 scale-100 flex gap-3 animate-fade-in-up cursor-pointer hover:border-slate-700"
          onClick={() => {
            setShowNotificationToast(false);
            setShowLineChat(true);
          }}>
          <div className="size-10 rounded-xl bg-[#06C755] flex items-center justify-center text-white shrink-0 shadow-inner font-bold text-lg">
            LINE
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-[#06C755]">LINE Notify</span>
              <span className="text-[10px] text-slate-400">เมื่อสักครู่</span>
            </div>
            <p className="text-sm font-bold truncate mt-0.5">📦 เรียกฟอร์คลิฟต์แบทช์ {activeLineNotification.itemDetails.batchNumber}</p>
            <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
              สินค้า: {activeLineNotification.itemDetails.itemName} | จุดรับ: {activeLineNotification.itemDetails.storagePosition}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowNotificationToast(false);
            }}
            className="size-5 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* LINE Simulation Chat Modal */}
      {showLineChat && activeLineNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#8b9bb4] w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border-8 border-slate-800 flex flex-col relative aspect-[9/19] h-[80vh] max-h-[700px]">
            {/* Phone notch/top header */}
            <div className="bg-slate-900 text-white px-6 py-2.5 flex justify-between items-center text-[10px] shrink-0">
              <span className="font-bold">12:00</span>
              <div className="w-20 h-4 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-1" />
              <div className="flex gap-1">
                <span className="size-2 bg-white rounded-full opacity-80" />
                <span className="size-2 bg-white rounded-full opacity-80" />
              </div>
            </div>

            {/* LINE App Bar */}
            <div className="bg-[#2c3e50] text-white px-4 py-3 flex items-center gap-3 border-b border-black/10 shrink-0">
              <button
                onClick={() => setShowLineChat(false)}
                className="hover:opacity-80 p-1 text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
              <div className="size-8 rounded-full bg-[#06C755] flex items-center justify-center font-bold text-sm shrink-0">
                JIT
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm leading-none text-white">Forklift-JIT Bot</p>
                <p className="text-[10px] text-slate-300 mt-1">Official Account</p>
              </div>
            </div>

            {/* Chat Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#8b9bb4] flex flex-col">
              {/* Timestamp bubble */}
              <span className="self-center bg-black/10 text-white rounded-full px-3 py-0.5 text-[9px] font-bold">
                วันนี้
              </span>

              {/* Bot Welcome Message */}
              <div className="flex items-start gap-2 max-w-[85%]">
                <div className="size-7 rounded-full bg-[#06C755] flex items-center justify-center text-white text-[9px] shrink-0 font-bold">
                  JIT
                </div>
                <div className="bg-white text-slate-800 rounded-2xl rounded-tl-none p-3 text-xs shadow-sm">
                  <p className="font-bold">สวัสดีครับ ยินดีต้อนรับสู่ระบบสั่งงานอัตโนมัติ SFC JIT!</p>
                  <p className="mt-1 font-medium">คุณสามารถกดปุ่มการทำงานบนการ์ด หรือกดเพื่อส่งแชร์ข้อมูลให้คนอื่นในกลุ่ม LINE ได้ครับ</p>
                </div>
              </div>

              {/* Flex Message Card */}
              <div className="flex items-start gap-2 max-w-[85%] flex-row">
                <div className="size-7 rounded-full bg-[#06C755] flex items-center justify-center text-white text-[9px] shrink-0 font-bold">
                  JIT
                </div>

                {/* Flex Message Contents */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200/50 w-full text-left">
                  {/* Card Header */}
                  <div className={`px-4 py-3 text-white transition-colors duration-300 ${activeLineNotification.status === 'PENDING' ? 'bg-sky-600' :
                    activeLineNotification.status === 'PICKED_UP' ? 'bg-amber-600' : 'bg-green-600'
                    }`}>
                    <span className="text-[9px] font-black opacity-80 block tracking-wider uppercase">SFC EXCELLENCE</span>
                    <h4 className="font-black text-sm flex items-center gap-1.5 mt-0.5">
                      {activeLineNotification.status === 'PENDING' ? (
                        <>🚨 ใบสั่งงานฟอร์คลิฟต์</>
                      ) : activeLineNotification.status === 'PICKED_UP' ? (
                        <>🚚 ใบนำส่งสินค้า (กำลังย้าย)</>
                      ) : (
                        <>✅ จัดส่งสินค้าเรียบร้อย</>
                      )}
                    </h4>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-400 font-medium">หมายเลขแบทช์</span>
                      <span className="font-bold text-slate-800">{activeLineNotification.itemDetails.batchNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-400 font-medium">รายการสินค้า</span>
                      <span className="font-bold text-slate-800 text-right truncate max-w-[110px]">{activeLineNotification.itemDetails.itemName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-400 font-medium">จุดรับสินค้า</span>
                      <span className="font-bold text-amber-600">{activeLineNotification.itemDetails.storagePosition}</span>
                    </div>
                    <div className="flex justify-between pb-0.5">
                      <span className="text-slate-400 font-medium">จุดส่งมอบ</span>
                      <span className="font-bold text-sky-600">{activeLineNotification.endPoint}</span>
                    </div>
                    {activeLineNotification.status !== 'PENDING' && (
                      <div className="flex justify-between border-t border-slate-100 pt-1.5 font-bold">
                        <span className="text-slate-400 font-medium">ผู้ขับรับงาน</span>
                        <span className="text-slate-700">{profile.displayName}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="px-4 pb-4 pt-1 space-y-2">
                    {activeLineNotification.status === 'PENDING' && (
                      <>
                        <Button
                          onClick={async () => {
                            setAcceptingLineJob(true);
                            try {
                              const res = await acceptJob(activeLineNotification.id, profile.userId);
                              if (res.success) {
                                setRole('driver');
                                setActiveLineNotification({
                                  ...activeLineNotification,
                                  status: 'PICKED_UP',
                                  driverId: profile.userId
                                });
                                refetch();
                              }
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setAcceptingLineJob(false);
                            }
                          }}
                          disabled={acceptingLineJob}
                          className="w-full h-9 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                        >
                          {acceptingLineJob ? (
                            <Loader2 className="animate-spin size-3" />
                          ) : (
                            <>
                              <Play size={12} className="fill-current" />
                              รับงาน (Claim Task)
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => handleShareToLine(activeLineNotification)}
                          variant="outline"
                          className="w-full h-9 rounded-xl border-border bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Share2 size={12} />
                          แชร์เข้าห้องแชท LINE
                        </Button>
                      </>
                    )}

                    {activeLineNotification.status === 'PICKED_UP' && (
                      <>
                        <Button
                          onClick={async () => {
                            setCompletingLineJob(true);
                            try {
                              const res = await completeJob(activeLineNotification.id);
                              if (res.success) {
                                setActiveLineNotification({
                                  ...activeLineNotification,
                                  status: 'COMPLETED'
                                });
                                refetch();
                              }
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setCompletingLineJob(false);
                            }
                          }}
                          disabled={completingLineJob}
                          className="w-full h-9 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                        >
                          {completingLineJob ? (
                            <Loader2 className="animate-spin size-3" />
                          ) : (
                            <>
                              <CheckCircle2 size={12} />
                              ส่งสินค้าสำเร็จ (Arrived)
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => handleShareCompleteToLine(activeLineNotification)}
                          variant="outline"
                          className="w-full h-9 rounded-xl border-border bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Share2 size={12} />
                          แชร์ยืนยันจบงานไปที่ LINE
                        </Button>
                      </>
                    )}

                    {activeLineNotification.status === 'COMPLETED' && (
                      <div className="w-full text-center text-[11px] font-black text-green-700 bg-green-500/10 py-2.5 rounded-xl border border-green-500/20">
                        ✓ จัดส่งเรียบร้อยแล้ว
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Input field mock */}
            <div className="bg-slate-100 p-2 flex items-center gap-2 border-t border-slate-200 shrink-0">
              <input
                type="text"
                placeholder="พิมพ์ข้อความ..."
                disabled
                className="flex-1 bg-white border border-slate-300 rounded-full px-3 py-1.5 text-xs text-slate-400 cursor-not-allowed"
              />
              <button className="size-7 bg-[#06C755] rounded-full flex items-center justify-center text-white font-black cursor-not-allowed opacity-50 shrink-0">
                ➜
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
