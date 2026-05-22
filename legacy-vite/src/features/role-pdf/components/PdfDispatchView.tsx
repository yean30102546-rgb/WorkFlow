import React, { useState } from 'react';
import { Map as MapIcon, Loader2, Info } from 'lucide-react';
import { Job, jobsApi } from '../../jobs';
import { UidRegistration } from '../../identity';

interface DispatchCardProps {
  job: Job;
  onAction: () => void;
  onInfo: () => void;
}

const DispatchCard: React.FC<DispatchCardProps> = ({ job, onAction, onInfo }) => {
  const [pos, setPos] = useState(''); 
  const [loading, setLoading] = useState(false);
  
  const handleAssign = async () => { 
    if (!pos) return; 
    setLoading(true); 
    try { 
      await jobsApi.assignPosition(job.id, pos); 
      onAction(); 
    } catch (err) { 
      alert('Failed.'); 
    } 
    setLoading(false); 
  };

  return (
    <div className="bg-white p-8 rounded-[32px] border border-[#e7eeff] shadow-sm flex flex-col group relative">
      <button onClick={onInfo} className="absolute top-6 right-6 p-2 text-[#4c5b71] hover:bg-[#f0f3ff] rounded-xl">
        <Info size={18} />
      </button>
      <div className="mb-6">
        <p className="text-[10px] font-black text-[#4c5b71] uppercase mb-1">Batch: {job.batchNumber}</p>
        <h4 className="font-black text-xl text-[#111c2d]">{job.itemName}</h4>
        <p className="text-xs text-[#44474c] mt-1">Pickup: {job.storagePosition}</p>
      </div>
      <div className="mt-auto space-y-4">
        <label className="text-[10px] font-black text-[#44474c] uppercase tracking-widest">Assign Final Position</label>
        <div className="flex gap-3">
          <input value={pos} onChange={e => setPos(e.target.value)} className="flex-1 px-5 py-3 bg-[#f9f9ff] rounded-2xl font-bold outline-none" placeholder="Shelf / Zone" />
          <button onClick={handleAssign} disabled={loading || !pos} className="bg-sky-600 text-white px-6 rounded-2xl font-black">
            {loading ? <Loader2 className="animate-spin" /> : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface PdfDispatchViewProps {
  jobs: Job[];
  onAction: () => void;
  userUid: string;
  onRegisterUid: (uid: string) => void;
  onLineLogin: () => void;
  onJobClick: (job: Job) => void;
}

export const PdfDispatchView: React.FC<PdfDispatchViewProps> = ({ 
  jobs, 
  onAction, 
  userUid, 
  onRegisterUid, 
  onLineLogin, 
  onJobClick 
}) => {
  const pendingJobs = jobs.filter(j => j.status === 'Pending');
  if (!userUid) return <UidRegistration onRegister={onRegisterUid} onLineLogin={onLineLogin} />;
  
  return (
    <div className="space-y-8">
      <div className="bg-sky-600 text-white p-6 rounded-3xl flex justify-between items-center">
        <div>
          <h3 className="font-black text-lg">PDF: Dispatcher</h3>
          <p className="text-xs opacity-70">Assign positions for incoming batches</p>
        </div>
        <MapIcon size={24} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pendingJobs.map((job) => (
          <DispatchCard key={job.id} job={job} onAction={onAction} onInfo={() => onJobClick(job)} />
        ))}
      </div>
    </div>
  );
};
