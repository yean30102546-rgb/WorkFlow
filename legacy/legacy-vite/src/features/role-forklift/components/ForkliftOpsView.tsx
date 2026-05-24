import React, { useState } from 'react';
import { Truck, Info, MapPin, ChevronRight } from 'lucide-react';
import { Job, jobsApi } from '../../jobs';
import { UidRegistration } from '../../identity';

interface ForkliftCardProps {
  job: Job;
  onAction: () => void;
  onInfo: () => void;
}

const ForkliftCard: React.FC<ForkliftCardProps> = ({ job, onAction, onInfo }) => {
  const [loading, setLoading] = useState(false);
  
  const handleStart = async () => { 
    setLoading(true); 
    await jobsApi.startJob(job.id); 
    setLoading(false); 
    onAction(); 
  };
  
  const handleComplete = async () => { 
    setLoading(true); 
    await jobsApi.completeJob(job.id, 'photo'); 
    setLoading(false); 
    onAction(); 
  };
  
  return (
    <div className="bg-white rounded-[32px] border border-[#e7eeff] shadow-sm overflow-hidden flex flex-col p-8 relative">
      <button onClick={onInfo} className="absolute top-6 right-6 p-2 text-[#4c5b71] hover:bg-[#f0f3ff] rounded-xl">
        <Info size={18} />
      </button>
      <div className="flex justify-between items-start mb-6">
        <h4 className="font-black text-xl text-[#111c2d] pr-8">{job.itemName}</h4>
      </div>
      <div className="space-y-4 mb-8">
        <div className="bg-[#f9f9ff] p-4 rounded-2xl">
          <p className="text-[10px] font-black text-[#44474c] uppercase flex items-center gap-2">
            <MapPin size={10}/> FROM PDB
          </p>
          <p className="text-lg font-black text-[#4c5b71]">{job.storagePosition}</p>
        </div>
        <div className="bg-[#f0f9ff] p-4 rounded-2xl">
          <p className="text-[10px] font-black text-sky-600 uppercase flex items-center gap-2">
            <ChevronRight size={10}/> TO PDF
          </p>
          <p className="text-lg font-black text-sky-700">{job.dropoffPosition}</p>
        </div>
      </div>
      <button 
        onClick={job.status === 'Assigned' ? handleStart : handleComplete} 
        disabled={loading}
        className={`w-full py-5 rounded-2xl font-black text-lg text-white ${job.status === 'Assigned' ? 'bg-[#4c5b71]' : 'bg-green-600'}`}
      >
        {job.status === 'Assigned' ? 'Pickup Item' : 'Confirm Delivery'}
      </button>
    </div>
  );
};

interface ForkliftOpsViewProps {
  jobs: Job[];
  onAction: () => void;
  userUid: string;
  onRegisterUid: (uid: string) => void;
  onLineLogin: () => void;
  onJobClick: (job: Job) => void;
}

export const ForkliftOpsView: React.FC<ForkliftOpsViewProps> = ({ 
  jobs, 
  onAction, 
  userUid, 
  onRegisterUid, 
  onLineLogin, 
  onJobClick 
}) => {
  const activeJobs = jobs.filter(j => j.status === 'Assigned' || j.status === 'Picking');
  if (!userUid) return <UidRegistration onRegister={onRegisterUid} onLineLogin={onLineLogin} />;
  
  return (
    <div className="space-y-8">
      <div className="bg-amber-500 text-white p-6 rounded-3xl flex justify-between items-center">
        <div>
          <h3 className="font-black text-lg">Forklift Operations</h3>
          <p className="text-xs opacity-70">Follow PDF instructions for delivery</p>
        </div>
        <Truck size={24} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeJobs.map((job) => (
          <ForkliftCard key={job.id} job={job} onAction={onAction} onInfo={() => onJobClick(job)} />
        ))}
      </div>
    </div>
  );
};
