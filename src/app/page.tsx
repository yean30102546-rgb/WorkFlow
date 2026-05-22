"use client";

import React, { useState, useEffect } from 'react';
import { useLiff } from '@/providers/LiffProvider';
import { useJobs, Job } from '@/hooks/useJobs';
import { OperatorForm } from '@/components/OperatorForm';
import { JobCard } from '@/components/JobCard';
import { cancelJob } from '@/app/actions/jobs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  LogOut, 
  Truck, 
  ClipboardList, 
  Circle, 
  History, 
  Settings2,
  XCircle,
  PackageOpen,
  Loader2,
  Zap,
  Shield,
  Smartphone,
  LineChart,
  ArrowRight,
  Lock,
  X,
  Workflow
} from 'lucide-react';

export default function DashboardPage() {
  const { profile, loading: authLoading, login, logout, isMock, setMockProfile } = useLiff();
  const { jobs, loading: jobsLoading, refetch } = useJobs();
  const [role, setRole] = useState<'operator' | 'driver'>('operator');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Set default role from URL parameter if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRole = params.get('role');
    if (urlRole === 'operator' || urlRole === 'driver') {
      setRole(urlRole);
    }
  }, []);

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
      <div className="flex-grow flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-primary selection:text-white font-sans overflow-x-hidden">
        {/* Sleek Landing Header */}
        <header className="sticky top-0 z-45 backdrop-blur-md bg-slate-950/80 border-b border-slate-900 px-6 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-tr from-indigo-500 to-emerald-500 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                <Truck size={20} className="font-bold" />
              </div>
              <div>
                <h1 className="font-black text-xl tracking-tight leading-none bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Forklift-JIT
                </h1>
                <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> Factory Logistics
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowLoginModal(true)}
              className="h-10 px-6 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-black text-sm transition-all duration-300 shadow-md shadow-white/5 cursor-pointer flex items-center gap-1.5"
            >
              <Lock size={14} />
              <span>เข้าสู่ระบบ</span>
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-20 pb-16 px-6 text-center max-w-4xl mx-auto z-10">
          {/* Ambient light glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-indigo-500/10 to-emerald-500/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

          <Badge className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-full font-bold text-xs mb-6 inline-flex gap-1.5">
            <Zap size={12} className="text-indigo-400 animate-pulse" />
            <span>ระบบเรียกฟอร์คลิฟต์อัจฉริยะยุคใหม่</span>
          </Badge>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.15] mb-6">
            เพิ่มประสิทธิภาพการจัดส่งในโรงงานด้วย{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-emerald-400 to-indigo-300 bg-clip-text text-transparent font-black">
              Forklift-JIT
            </span>
          </h2>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            ระบบจัดส่งฟอร์คลิฟต์แบบ Just-In-Time ช่วยลดเวลาการรอคอย ป้องกันคอขวดในไลน์การผลิต 
            และอัปเดตสถานะแบบวินาทีต่อวินาทีผ่านระบบการสื่อสารแบบ Real-time
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => setShowLoginModal(true)}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-black text-base cursor-pointer shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 group transition-all duration-300 hover:scale-[1.02]"
            >
              <span>เริ่มใช้งานระบบ</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <a
              href="#features"
              className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-base cursor-pointer transition-all duration-300 flex items-center justify-center"
            >
              ดูคุณสมบัติเด่น
            </a>
          </div>
        </section>

        {/* Live Status Stats Bar */}
        <section className="max-w-5xl mx-auto w-full px-6 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/60 backdrop-blur-md border border-slate-900 rounded-[32px] p-8 shadow-xl">
            <div className="text-center md:text-left space-y-1 md:border-r border-slate-800/80 md:pr-8">
              <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">ระยะเวลาเรียกรับของ</span>
              <p className="text-3xl font-black text-white">&lt; 3.2 นาที</p>
              <p className="text-xs text-slate-500">ตอบสนองการผลิตได้ทันที (JIT Target)</p>
            </div>
            <div className="text-center md:text-left space-y-1 md:border-r border-slate-800/80 md:px-8">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">ความแม่นยำสถานะจัดส่ง</span>
              <p className="text-3xl font-black text-white">99.8%</p>
              <p className="text-xs text-slate-500">อัปเดตแบบเรียลไทม์ลดข้อผิดพลาด</p>
            </div>
            <div className="text-center md:text-left space-y-1 md:pl-8">
              <span className="text-xs font-black text-violet-400 uppercase tracking-wider">ประสิทธิภาพไลน์ผลิต</span>
              <p className="text-3xl font-black text-white">+25%</p>
              <p className="text-xs text-slate-500">ลดชั่วโมงการจอดรอรถฟอร์คลิฟต์</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-6xl mx-auto w-full px-6 py-12 mb-24 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="text-3xl font-black text-white mb-4">คุณสมบัติหลักเพื่อระบบโลจิสติกส์ในโรงงาน</h3>
            <p className="text-slate-400 text-sm md:text-base">
              ออกแบบขึ้นมาเพื่อตอบสนองการทำงานในสภาพแวดล้อมจริงของโรงงานอุตสาหกรรม ใช้งานง่าย บนทุกอุปกรณ์
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-900 hover:border-indigo-500/20 rounded-[24px] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 flex gap-5 group">
              <div className="size-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black text-white">JIT Dispatching (เรียกงานระบบทันที)</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  โอเปอเรเตอร์หน้างานส่งคำขอจัดส่งสินค้าได้รวดเร็วเพียงกรอกข้อมูลบาร์โค้ด ตำแหน่งจัดเก็บ และปลายทาง 
                  ระบบจะทำการบันทึกและป้อนงานเข้าคิวคนขับรถฟอร์คลิฟต์ทันที
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-900 hover:border-emerald-500/20 rounded-[24px] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 flex gap-5 group">
              <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                <Workflow size={24} />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black text-white">Live Tracking & Real-time (ติดตามสด)</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  ด้วยการเชื่อมต่อข้อมูลผ่านระบบ Supabase Realtime ทั้งฝั่งหน้างานผลิตและฝั่งคนขับฟอร์คลิฟต์ 
                  จะเห็นความเคลื่อนไหวและสถานะของงานปรับเปลี่ยนแบบสดๆ โดยไม่ต้องกดรีเฟรชหน้าจอ
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-900 hover:border-violet-500/20 rounded-[24px] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 flex gap-5 group">
              <div className="size-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                <Smartphone size={24} />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black text-white">Driver Workspace (แดชบอร์ดคนขับ)</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  พนักงานขับรถฟอร์คลิฟต์สามารถดูรายการคิวงานจัดส่งทั้งหมดในโรงงาน กดรับงาน อัปเดตการรับสินค้า (Picked Up) 
                  และรายงานเมื่อจัดส่งถึงเป้าหมายเรียบร้อยแล้ว ได้ผ่านหน้าจอมือถือและแท็บเล็ต
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-900 hover:border-rose-500/20 rounded-[24px] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 flex gap-5 group">
              <div className="size-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                <LineChart size={24} />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black text-white">Traceable Logistics (ตรวจสอบประวัติได้)</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  เก็บบันทึกประวัติและสถิติข้อมูลของทุกรายการรับส่งสินค้า เพื่อใช้ประเมินความเร็วในการทำงาน 
                  วิเคราะห์หาจุดที่เกิดความล่าช้า และนำไปประยุกต์ปรับปรุงกระบวนการแบบลีน (Lean Production)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Operational Workflow Steps */}
        <section className="bg-slate-900/30 border-y border-slate-900/80 py-20 px-6 mb-24">
          <div className="max-w-6xl mx-auto w-full">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h3 className="text-3xl font-black text-white mb-4">ขั้นตอนการทำงานที่แสนเรียบง่าย</h3>
              <p className="text-slate-400 text-sm md:text-base">
                เปลี่ยนความยุ่งเหยิงของการจัดส่งในโรงงาน ให้เสร็จสิ้นได้ใน 3 ขั้นตอนหลัก
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector line for large screens */}
              <div className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-indigo-500/20 via-emerald-500/20 to-indigo-500/20 -z-10" />

              {/* Step 1 */}
              <div className="text-center space-y-4">
                <div className="size-14 rounded-full bg-slate-900 border-2 border-indigo-500 text-indigo-400 flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-indigo-500/10">
                  1
                </div>
                <h4 className="font-bold text-white text-lg">โอเปอเรเตอร์สั่งงาน</h4>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                  ระบุรายละเอียดสิ่งของ ตำแหน่งชั้นจัดเก็บ (Storage Cell) และปลายทางของไลน์ผลิตเพื่อส่งสัญญาณเรียกรับ
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center space-y-4">
                <div className="size-14 rounded-full bg-slate-900 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-emerald-500/10">
                  2
                </div>
                <h4 className="font-bold text-white text-lg">คนขับรับและเริ่มดำเนินการ</h4>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                  คนขับเห็นรายการในคิวและกดรับงาน นำรถไปรับสินค้า ณ จุดจัดเก็บ จากนั้นกดเปลี่ยนสถานะเป็น Picked Up
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center space-y-4">
                <div className="size-14 rounded-full bg-slate-900 border-2 border-indigo-500 text-indigo-400 flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-indigo-500/10">
                  3
                </div>
                <h4 className="font-bold text-white text-lg">จัดส่งสำเร็จเรียบร้อย</h4>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                  เมื่อสินค้าถึงไลน์รับปลายทางเสร็จสิ้น กดปุ่มรายงานสำเร็จ (Complete) ข้อมูลจะส่งบันทึกเข้าสู่ส่วนกลาง
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-4xl mx-auto w-full px-6 mb-24 text-center">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-900 rounded-[32px] p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
            
            <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
              พร้อมเพิ่มประสิทธิภาพโลจิสติกส์ในโรงงานของคุณแล้วหรือยัง?
            </h3>
            
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto mb-8">
              ลงทะเบียนเข้าใช้งานผ่าน LINE LIFF ได้สะดวกสบาย ปลอดภัยสูง 
              พร้อมสิทธิรับการแจ้งเตือนงานแบบเรียลไทม์ผ่านมือถือของพนักงานโดยตรง
            </p>

            <Button
              onClick={() => setShowLoginModal(true)}
              className="h-14 px-10 rounded-2xl bg-white hover:bg-slate-200 text-slate-950 font-black text-base cursor-pointer shadow-lg shadow-white/5 transition-all duration-300 hover:scale-[1.02]"
            >
              เข้าสู่ระบบเพื่อทดลองใช้งาน
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-900/60 py-8 px-6 text-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} Forklift-JIT. All rights reserved. พัฒนาขึ้นเพื่ออุตสาหกรรมการผลิตยุค 4.0</p>
        </footer>

        {/* Glassmorphic Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[32px] p-8 space-y-8 relative shadow-2xl animate-in zoom-in-95 duration-200 text-center">
              {/* Close Button */}
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-lg border border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="mx-auto size-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <Truck size={30} />
              </div>
              
              <div>
                <h3 className="text-2xl font-black text-white">เข้าสู่ระบบ Forklift-JIT</h3>
                <p className="text-slate-400 mt-2 text-xs">เลือกวิธีการเข้าใช้งานเพื่อทำงานต่อในระบบ</p>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={() => {
                    setShowLoginModal(false);
                    login();
                  }}
                  className="w-full h-14 rounded-2xl bg-[#06C755] hover:bg-[#05b04b] text-white font-black text-base border-none cursor-pointer flex items-center justify-center gap-3 shadow-lg shadow-[#06C755]/10"
                >
                  {/* Custom LINE Icon */}
                  <svg className="size-5 fill-white" viewBox="0 0 24 24">
                    <path d="M24 10.3c0-5.7-5.4-10.3-12-10.3S0 4.6 0 10.3c0 5.1 4.3 9.3 10.1 10.1.4.1.9.3.8.8l-.2 1.5c-.1.5.1.7.5.5.4-.2 4-2.4 5.6-4.1 4.7-1.4 7.2-4.9 7.2-8.8z"/>
                  </svg>
                  <span>เข้าสู่ระบบด้วย LINE</span>
                </Button>
                
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    สำหรับนักพัฒนา (Mock Account)
                  </span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => {
                      setShowLoginModal(false);
                      setMockProfile('op-101', 'Operator Somchai');
                    }}
                    variant="outline"
                    className="h-12 rounded-xl font-bold cursor-pointer border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white"
                  >
                    จำลอง โอเปอเรเตอร์
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowLoginModal(false);
                      setMockProfile('drv-505', 'Driver Somsak');
                    }}
                    variant="outline"
                    className="h-12 rounded-xl font-bold cursor-pointer border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white"
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
    if (!confirm('Are you sure you want to cancel this forklift request?')) return;
    setCancellingId(jobId);
    try {
      await cancelJob(jobId);
      refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to cancel job');
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
                <Circle className="size-2 fill-green-500 text-green-500 animate-pulse" /> Live Connected
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
                <p className="text-[9px] text-muted-foreground font-mono">{isMock ? 'Mock Session' : 'LINE User'}</p>
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
        <div className="bg-muted p-1.5 rounded-2xl w-fit flex gap-1 mb-8 self-center sm:self-start">
          <button
            onClick={() => setRole('operator')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all cursor-pointer ${
              role === 'operator' 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ClipboardList size={16} />
            Operator Portal
          </button>
          <button
            onClick={() => setRole('driver')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all cursor-pointer ${
              role === 'driver' 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Truck size={16} />
            Forklift Driver
          </button>
        </div>

        {/* Portals */}
        {role === 'operator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Operator Request Form */}
            <div className="lg:col-span-2">
              <OperatorForm 
                operatorId={profile.userId} 
                operatorName={profile.displayName}
                onJobCreated={refetch}
              />
            </div>

            {/* Operator Live Tracking panel */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                <h3 className="text-lg font-black text-foreground mb-4 flex items-center gap-2">
                  <Circle className="size-3 fill-green-500 text-green-500 animate-pulse" />
                  Your Active Requests ({activeOperatorJobs.length})
                </h3>

                {jobsLoading ? (
                  <div className="py-8 flex justify-center">
                    <Loader2 className="animate-spin text-muted-foreground" />
                  </div>
                ) : activeOperatorJobs.length === 0 ? (
                  <div className="py-12 text-center bg-muted/20 rounded-2xl border border-dashed border-border/50 text-muted-foreground flex flex-col items-center">
                    <PackageOpen className="size-10 mb-2 opacity-50" />
                    <p className="text-sm font-bold">No active forklift pickups.</p>
                    <p className="text-xs opacity-75 mt-0.5">Use the form to request a forklift driver.</p>
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
                            <Badge className={`border-none font-bold text-[9px] ${
                              job.status === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-sky-500 text-white'
                            }`}>
                              {job.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            From: <span className="font-black text-foreground/80">{job.itemDetails.storagePosition}</span> 
                            {' '}➜ To: <span className="font-black text-primary">{job.endPoint}</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                            Batch: {job.itemDetails.batchNumber} | ID: {job.itemDetails.itemNumber}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {job.status === 'PENDING' && (
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
                              <span className="hidden sm:inline ml-1.5 font-bold">Cancel</span>
                            </Button>
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
                  <History size={16} /> Completed Pickups
                </h3>
                {pastOperatorJobs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No completed forklift history yet.</p>
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
                        <Badge className={`border-none ${
                          job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                        }`}>
                          {job.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Driver View */
          <div className="space-y-8 flex-1 flex flex-col">
            {/* Header statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-sky-500/10 border border-sky-500/20 p-5 rounded-2xl text-left">
                <span className="text-xs font-black text-sky-600 uppercase tracking-wider">Available Pickups</span>
                <p className="text-3xl font-black text-sky-700 mt-1">{availableDriverJobs.length}</p>
              </div>
              <div className="bg-green-600/10 border border-green-600/20 p-5 rounded-2xl text-left">
                <span className="text-xs font-black text-green-600 uppercase tracking-wider">Your Active Tasks</span>
                <p className="text-3xl font-black text-green-700 mt-1">{activeDriverJobs.length}</p>
              </div>
            </div>

            {/* Active Driver Jobs list */}
            {activeDriverJobs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                  <Circle className="size-3 fill-green-500 text-green-500 animate-pulse" />
                  Your Claimed Pickups
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
            <div className="space-y-4 flex-1">
              <h3 className="text-lg font-black text-foreground">Available Jobs Queue</h3>
              {jobsLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="animate-spin text-muted-foreground" />
                </div>
              ) : availableDriverJobs.length === 0 ? (
                <div className="py-16 text-center bg-card rounded-3xl border border-border text-muted-foreground flex flex-col items-center justify-center max-w-xl mx-auto">
                  <PackageOpen className="size-12 mb-2 text-muted-foreground/60" />
                  <p className="text-base font-bold">The pickup queue is empty.</p>
                  <p className="text-sm opacity-75 mt-0.5">We will let you know when an operator requests a pickup.</p>
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
          </div>
        )}
      </main>
    </div>
  );
}
