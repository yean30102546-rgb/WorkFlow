import React from 'react';
import { Truck } from 'lucide-react';

interface StatusBadgeProps {
  status: 'Pending' | 'Assigned' | 'Picking' | 'Delivered';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = { 
    Pending: 'bg-amber-100 text-amber-700', 
    Assigned: 'bg-sky-100 text-sky-700', 
    Picking: 'bg-[#4c5b71] text-white animate-pulse', 
    Delivered: 'bg-green-100 text-green-700' 
  };
  return (
    <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase ${styles[status]}`}>
      {status}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
}

export function StatCard({ label, value, icon: Icon, color, bg }: StatCardProps) {
  return (
    <div className="bg-white p-5 lg:p-7 rounded-3xl border border-[#e7eeff] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
          <Icon size={20} style={{ color }} />
        </div>
        <span className="text-[10px] font-black text-[#44474c] uppercase tracking-widest">{label}</span>
      </div>
      <h3 className="text-2xl lg:text-3xl font-black text-[#111c2d]">{value}</h3>
    </div>
  );
}
