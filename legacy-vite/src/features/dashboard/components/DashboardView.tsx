import React from 'react';
import { Package, Loader2, Map as MapIcon, CheckCircle2, History, ChevronRight, Info } from 'lucide-react';
import { Job } from '../../jobs';
import { StatCard, StatusBadge } from '../../../components/Common';

interface DashboardViewProps {
  jobs: Job[];
  onRefresh: () => void;
  onJobClick: (job: Job) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ jobs, onRefresh, onJobClick }) => {
  const stats = [
    { label: 'Total Jobs', value: jobs.length, icon: Package, color: '#4c5b71', bg: '#f0f3ff' },
    { label: 'PDB Pending', value: jobs.filter(j => j.status === 'Pending').length, icon: Loader2, color: '#6f5636', bg: '#fff9f5' },
    { label: 'PDF Assigned', value: jobs.filter(j => j.status === 'Assigned').length, icon: MapIcon, color: '#0ea5e9', bg: '#f0f9ff' },
    { label: 'Completed', value: jobs.filter(j => j.status === 'Delivered').length, icon: CheckCircle2, color: '#22c55e', bg: '#f0fff4' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-[#e7eeff] shadow-sm overflow-hidden">
        <div className="px-6 lg:px-8 py-5 border-b border-[#e7eeff] flex justify-between items-center bg-[#fcfdff]">
          <h3 className="font-black text-[#111c2d]">Workflow Monitor</h3>
          <button onClick={onRefresh} className="p-2 text-[#4c5b71] hover:bg-[#f0f3ff] rounded-xl"><History size={18} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-[#fcfdff]">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-[#44474c] uppercase tracking-widest">Job Details</th>
                <th className="px-8 py-4 text-[10px] font-black text-[#44474c] uppercase tracking-widest">Flow (PDB &rarr; PDF)</th>
                <th className="px-8 py-4 text-[10px] font-black text-[#44474c] uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-[#44474c] uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7eeff]">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-[#f9f9ff] group transition-colors">
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-[#111c2d]">{job.itemName}</p>
                    <p className="text-[10px] font-bold text-[#44474c]">Batch: {job.batchNumber} | ID: {job.id}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="text-[#4c5b71]">{job.storagePosition}</span>
                      <ChevronRight size={14} className="text-[#dee8ff]" />
                      <span className={job.dropoffPosition ? 'text-sky-600' : 'text-[#dee8ff]'}>
                        {job.dropoffPosition || 'Pending PDF'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => onJobClick(job)} className="p-2 bg-[#f0f3ff] text-[#4c5b71] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <Info size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
