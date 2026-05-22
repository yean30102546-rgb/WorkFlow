import React from 'react';
import { X, Package, Fingerprint, Plus, MapPin, ChevronRight, Clock, User } from 'lucide-react';
import { Job } from '../types';
import { StatusBadge } from '../../../components/Common';

interface JobDetailsModalProps {
  job: Job;
  onClose: () => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#111c2d]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-br from-[#4c5b71] to-[#2b3a4e] p-8 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            <X size={20} />
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <Package size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Job Details</p>
              <h3 className="text-2xl font-black">{job.itemName}</h3>
            </div>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={job.status} />
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-[#44474c] uppercase tracking-widest flex items-center gap-2">
                <Fingerprint size={12} /> Job ID
              </p>
              <p className="font-bold text-[#111c2d]">{job.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-[#44474c] uppercase tracking-widest flex items-center gap-2">
                <Plus size={12} /> Batch No.
              </p>
              <p className="font-bold text-[#111c2d]">{job.batchNumber}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-[#4c5b71]" />
              </div>
              <div className="flex-1 pb-4 border-b border-[#e7eeff]">
                <p className="text-[10px] font-black text-[#4c5b71] uppercase tracking-widest">Initial Storage (PDB)</p>
                <p className="text-lg font-black text-[#111c2d]">{job.storagePosition}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                <ChevronRight size={20} className="text-sky-600" />
              </div>
              <div className="flex-1 pb-4 border-b border-[#e7eeff]">
                <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Final Dropoff (PDF)</p>
                <p className="text-lg font-black text-[#111c2d]">{job.dropoffPosition || 'Waiting for PDF Assignment...'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#f9f9ff] p-4 rounded-2xl space-y-2">
              <p className="text-[10px] font-black text-[#44474c] uppercase flex items-center gap-2"><Clock size={12}/> Timeline</p>
              <div className="text-xs space-y-1 font-bold text-[#4c5b71]">
                <p className="flex justify-between"><span>Created:</span> <span>{new Date(job.timestamp).toLocaleTimeString()}</span></p>
                <p className="flex justify-between"><span>Picked Up:</span> <span>{job.startTime ? new Date(job.startTime).toLocaleTimeString() : '-'}</span></p>
                <p className="flex justify-between"><span>Delivered:</span> <span>{job.endTime ? new Date(job.endTime).toLocaleTimeString() : '-'}</span></p>
              </div>
            </div>
            <div className="bg-[#f9f9ff] p-4 rounded-2xl space-y-2">
              <p className="text-[10px] font-black text-[#44474c] uppercase flex items-center gap-2"><User size={12}/> User Info</p>
              <p className="text-[10px] font-mono font-bold break-all text-[#4c5b71]">UID: {job.uid}</p>
            </div>
          </div>

          <button onClick={onClose} className="w-full py-4 bg-[#4c5b71] text-white rounded-2xl font-black text-lg active:scale-95 transition-transform shadow-xl shadow-[#4c5b71]/20">
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
