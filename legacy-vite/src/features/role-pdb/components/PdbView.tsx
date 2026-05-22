import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { jobsApi } from '../../jobs';
import { UidRegistration } from '../../identity';

interface PdbViewProps {
  onAction: () => void;
  userUid: string;
  onRegisterUid: (uid: string) => void;
  onLineLogin: () => void;
}

export const PdbView: React.FC<PdbViewProps> = ({ onAction, userUid, onRegisterUid, onLineLogin }) => {
  const [formData, setFormData] = useState({ batchNumber: '', itemNumber: '', itemName: '', storagePosition: '' });
  const [submitting, setSubmitting] = useState(false);

  if (!userUid) return <UidRegistration onRegister={onRegisterUid} onLineLogin={onLineLogin} />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setSubmitting(true);
    try { 
      await jobsApi.submitJob({ ...formData, uid: userUid }); 
      setFormData({ batchNumber: '', itemNumber: '', itemName: '', storagePosition: '' }); 
      onAction(); 
      alert('PDB: Job Submitted!'); 
    } catch (err) { 
      alert('Submission failed.'); 
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-[32px] shadow-2xl border border-[#e7eeff] overflow-hidden">
      <div className="bg-[#4c5b71] p-8 text-white">
        <h3 className="text-2xl font-black">PDB: Add Batch Data</h3>
        <p className="text-sm opacity-70">Register new incoming batch</p>
      </div>
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#44474c] uppercase">Batch Number</label>
            <input required value={formData.batchNumber} onChange={e => setFormData({...formData, batchNumber: e.target.value})} className="w-full px-6 py-4 bg-[#f9f9ff] rounded-2xl font-bold outline-none" placeholder="B-XXXX" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#44474c] uppercase">Item Number</label>
            <input required value={formData.itemNumber} onChange={e => setFormData({...formData, itemNumber: e.target.value})} className="w-full px-6 py-4 bg-[#f9f9ff] rounded-2xl font-bold outline-none" placeholder="ITM-XXXX" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-[#44474c] uppercase">Item Name</label>
          <input required value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} className="w-full px-6 py-4 bg-[#f9f9ff] rounded-2xl font-bold outline-none" placeholder="Product Description" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-[#44474c] uppercase">Initial Storage Position</label>
          <input required value={formData.storagePosition} onChange={e => setFormData({...formData, storagePosition: e.target.value})} className="w-full px-6 py-4 bg-[#f9f9ff] rounded-2xl font-bold outline-none" placeholder="Loading Area A" />
        </div>
        <button disabled={submitting} className="w-full bg-[#4c5b71] text-white py-5 rounded-[20px] font-black text-lg active:scale-95 transition-transform">
          {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Submit to PDF'}
        </button>
      </form>
    </div>
  );
};
