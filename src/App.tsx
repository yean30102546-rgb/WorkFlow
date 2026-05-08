import React, { useState, useEffect } from 'react';
import liff from '@line/liff';
import { 
  ClipboardList, 
  Send, 
  Truck, 
  History, 
  Map as MapIcon, 
  Settings, 
  Bell, 
  Menu,
  X,
  ChevronRight,
  Plus,
  Loader2,
  CheckCircle2,
  Camera,
  MapPin,
  Package,
  Fingerprint,
  User,
  MessageCircle,
  ExternalLink,
  Clock,
  Info,
  Calendar
} from 'lucide-react';
import { api, Job } from './services/api';

type Role = 'ADMIN' | 'PDB' | 'PDF' | 'FORKLIFT';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [role, setRole] = useState<Role>('ADMIN');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [userUid, setUserUid] = useState(localStorage.getItem('user_uid') || '');
  const [lineProfile, setLineProfile] = useState<{ displayName: string, pictureUrl?: string } | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [isTabSetByUrl, setIsTabSetByUrl] = useState(false);

  useEffect(() => {
    initializeLiff();
    fetchJobs();
  }, []);

  useEffect(() => {
    if (isTabSetByUrl) return; // Don't override if user specifically linked to a tab
    if (role === 'PDB') setActiveTab('pdb-entry');
    if (role === 'PDF') setActiveTab('pdf-dispatch');
    if (role === 'FORKLIFT') setActiveTab('forklift-ops');
    if (role === 'ADMIN') setActiveTab('dashboard');
  }, [role, isTabSetByUrl]);

  const initializeLiff = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlUid = urlParams.get('uid');
      if (urlUid) handleSaveUid(urlUid);

      const urlTab = urlParams.get('tab');
      if (urlTab) {
        setActiveTab(urlTab);
        setIsTabSetByUrl(true);
      }

      const liffId = import.meta.env.VITE_LIFF_ID;
      await liff.init({ liffId });
      if (liff.isLoggedIn()) {
        const profile = await liff.getProfile();
        setLineProfile({ displayName: profile.displayName, pictureUrl: profile.pictureUrl });
        handleSaveUid(profile.userId);
      }
    } catch (err) {
      console.error('LIFF Initialization failed', err);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await api.getJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    }
    setLoading(false);
  };

  const handleAction = async () => {
    await fetchJobs();
  };

  const handleSaveUid = (uid: string) => {
    setUserUid(uid);
    localStorage.setItem('user_uid', uid);
  };

  const handleLogin = () => {
    if (!liff.isLoggedIn()) liff.login();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: History, roles: ['ADMIN'] },
    { id: 'pdb-entry', label: 'PDB: Add Batch', icon: ClipboardList, roles: ['ADMIN', 'PDB'] },
    { id: 'pdf-dispatch', label: 'PDF: Assign Position', icon: Send, roles: ['ADMIN', 'PDF'] },
    { id: 'forklift-ops', label: 'Forklift: Delivery', icon: Truck, roles: ['ADMIN', 'FORKLIFT'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-[#f9f9ff] flex font-sans overflow-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-[#e7eeff] transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-[#e7eeff]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#4c5b71] rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
              <Truck size={20} />
            </div>
            <h1 className="font-bold text-lg text-[#4c5b71]">ImproveFlow</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-[#44474c]">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                activeTab === item.id 
                ? 'bg-[#4c5b71] text-white shadow-lg translate-x-1' 
                : 'text-[#44474c] hover:bg-[#f0f3ff]'
              }`}
            >
              <item.icon size={22} />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#e7eeff] space-y-4">
          <div className="bg-[#f0f3ff] rounded-2xl p-4">
            <p className="text-[10px] font-bold text-[#4c5b71] uppercase tracking-widest mb-3">Dev Role Switcher</p>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full text-xs bg-white border border-[#dee8ff] rounded-xl px-3 py-2.5 font-bold text-[#4c5b71]"
            >
              <option value="ADMIN">System Admin</option>
              <option value="PDB">User 1: PDB</option>
              <option value="PDF">User 2: PDF</option>
              <option value="FORKLIFT">User 3: Forklift</option>
            </select>
          </div>
          
          {userUid && (
            <div className="flex items-center gap-3 px-2 py-1 bg-green-50 rounded-xl border border-green-100 p-2">
              {lineProfile?.pictureUrl ? (
                <img src={lineProfile.pictureUrl} className="w-8 h-8 rounded-full" alt="Profile" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                  <Fingerprint size={16} />
                </div>
              )}
              <div className="min-w-0 text-xs">
                <p className="font-bold text-green-700">Connected</p>
                <p className="truncate text-green-800">{lineProfile?.displayName || userUid}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 bg-white border-b border-[#e7eeff] px-6 lg:px-10 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-5">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2.5 bg-[#f0f3ff] text-[#4c5b71] rounded-xl">
              <Menu size={22} />
            </button>
            <h2 className="text-xl font-extrabold text-[#111c2d]">
              {menuItems.find(i => i.id === activeTab)?.label || 'Overview'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {loading && <Loader2 className="animate-spin text-[#4c5b71]" size={20} />}
            <div className="w-11 h-11 bg-[#4c5b71] rounded-2xl flex items-center justify-center text-white font-black">
              {role[0]}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
            {activeTab === 'dashboard' && <DashboardView jobs={jobs} onRefresh={fetchJobs} onJobClick={setSelectedJob} />}
            {activeTab === 'pdb-entry' && <PdbView onAction={handleAction} userUid={userUid} onRegisterUid={handleSaveUid} onLineLogin={handleLogin} />}
            {activeTab === 'pdf-dispatch' && <PdfDispatchView jobs={jobs} onAction={handleAction} userUid={userUid} onRegisterUid={handleSaveUid} onLineLogin={handleLogin} onJobClick={setSelectedJob} />}
            {activeTab === 'forklift-ops' && <ForkliftOpsView jobs={jobs} onAction={handleAction} userUid={userUid} onRegisterUid={handleSaveUid} onLineLogin={handleLogin} onJobClick={setSelectedJob} />}
          </div>
        </div>

        {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
      </main>
    </div>
  );
}

// --- Components ---

function JobDetailsModal({ job, onClose }: { job: Job, onClose: () => void }) {
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
}

function UidRegistration({ onRegister, onLineLogin }: { onRegister: (uid: string) => void, onLineLogin: () => void }) {
  const [input, setInput] = useState('');
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-[32px] border-2 border-dashed border-[#dee8ff] text-center space-y-6 shadow-xl">
      <Fingerprint size={48} className="mx-auto text-[#4c5b71]" />
      <h3 className="text-2xl font-black text-[#111c2d]">User Identification</h3>
      <div className="space-y-4">
        <button onClick={onLineLogin} className="w-full flex items-center justify-center gap-3 py-4 bg-[#06c755] text-white rounded-2xl font-black">
          <MessageCircle size={24} />
          Connect with LINE
        </button>
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-[#e7eeff]"></div>
          <span className="text-[10px] font-black text-[#44474c]">OR</span>
          <div className="flex-1 h-px bg-[#e7eeff]"></div>
        </div>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Manual ID / Scan ID" className="w-full px-6 py-4 bg-[#f9f9ff] rounded-2xl text-center font-bold text-lg outline-none" />
        <button onClick={() => onRegister(input)} className="w-full bg-[#4c5b71] text-white py-4 rounded-2xl font-black">Register Manually</button>
      </div>
    </div>
  );
}

function DashboardView({ jobs, onRefresh, onJobClick }: { jobs: Job[], onRefresh: () => void, onJobClick: (job: Job) => void }) {
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
          <div key={i} className="bg-white p-5 lg:p-7 rounded-3xl border border-[#e7eeff] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.bg }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <span className="text-[10px] font-black text-[#44474c] uppercase tracking-widest">{stat.label}</span>
            </div>
            <h3 className="text-2xl lg:text-3xl font-black text-[#111c2d]">{stat.value}</h3>
          </div>
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
}

function PdbView({ onAction, userUid, onRegisterUid, onLineLogin }: { onAction: () => void, userUid: string, onRegisterUid: (uid: string) => void, onLineLogin: () => void }) {
  const [formData, setFormData] = useState({ batchNumber: '', itemNumber: '', itemName: '', storagePosition: '' });
  const [submitting, setSubmitting] = useState(false);
  if (!userUid) return <UidRegistration onRegister={onRegisterUid} onLineLogin={onLineLogin} />;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try { await api.submitJob({ ...formData, uid: userUid }); setFormData({ batchNumber: '', itemNumber: '', itemName: '', storagePosition: '' }); onAction(); alert('PDB: Job Submitted!'); } catch (err) { alert('Submission failed.'); }
    setSubmitting(false);
  };
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-[32px] shadow-2xl border border-[#e7eeff] overflow-hidden">
      <div className="bg-[#4c5b71] p-8 text-white"><h3 className="text-2xl font-black">PDB: Add Batch Data</h3><p className="text-sm opacity-70">Register new incoming batch</p></div>
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2"><label className="text-[10px] font-black text-[#44474c] uppercase">Batch Number</label><input required value={formData.batchNumber} onChange={e => setFormData({...formData, batchNumber: e.target.value})} className="w-full px-6 py-4 bg-[#f9f9ff] rounded-2xl font-bold outline-none" placeholder="B-XXXX" /></div>
          <div className="space-y-2"><label className="text-[10px] font-black text-[#44474c] uppercase">Item Number</label><input required value={formData.itemNumber} onChange={e => setFormData({...formData, itemNumber: e.target.value})} className="w-full px-6 py-4 bg-[#f9f9ff] rounded-2xl font-bold outline-none" placeholder="ITM-XXXX" /></div>
        </div>
        <div className="space-y-2"><label className="text-[10px] font-black text-[#44474c] uppercase">Item Name</label><input required value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} className="w-full px-6 py-4 bg-[#f9f9ff] rounded-2xl font-bold outline-none" placeholder="Product Description" /></div>
        <div className="space-y-2"><label className="text-[10px] font-black text-[#44474c] uppercase">Initial Storage Position</label><input required value={formData.storagePosition} onChange={e => setFormData({...formData, storagePosition: e.target.value})} className="w-full px-6 py-4 bg-[#f9f9ff] rounded-2xl font-bold outline-none" placeholder="Loading Area A" /></div>
        <button disabled={submitting} className="w-full bg-[#4c5b71] text-white py-5 rounded-[20px] font-black text-lg active:scale-95 transition-transform">
          {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Submit to PDF'}
        </button>
      </form>
    </div>
  );
}

function PdfDispatchView({ jobs, onAction, userUid, onRegisterUid, onLineLogin, onJobClick }: { jobs: Job[], onAction: () => void, userUid: string, onRegisterUid: (uid: string) => void, onLineLogin: () => void, onJobClick: (job: Job) => void }) {
  const pendingJobs = jobs.filter(j => j.status === 'Pending');
  if (!userUid) return <UidRegistration onRegister={onRegisterUid} onLineLogin={onLineLogin} />;
  return (
    <div className="space-y-8">
      <div className="bg-sky-600 text-white p-6 rounded-3xl flex justify-between items-center"><div><h3 className="font-black text-lg">PDF: Dispatcher</h3><p className="text-xs opacity-70">Assign positions for incoming batches</p></div><MapIcon size={24} /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{pendingJobs.map((job) => (<DispatchCard key={job.id} job={job} onAction={onAction} onInfo={() => onJobClick(job)} />))}</div>
    </div>
  );
}

function DispatchCard({ job, onAction, onInfo }: { job: Job, onAction: () => void, onInfo: () => void }) {
  const [pos, setPos] = useState(''); const [loading, setLoading] = useState(false);
  const handleAssign = async () => { if (!pos) return; setLoading(true); try { await api.assignPosition(job.id, pos); onAction(); } catch (err) { alert('Failed.'); } setLoading(false); };
  return (
    <div className="bg-white p-8 rounded-[32px] border border-[#e7eeff] shadow-sm flex flex-col group relative">
      <button onClick={onInfo} className="absolute top-6 right-6 p-2 text-[#4c5b71] hover:bg-[#f0f3ff] rounded-xl"><Info size={18} /></button>
      <div className="mb-6"><p className="text-[10px] font-black text-[#4c5b71] uppercase mb-1">Batch: {job.batchNumber}</p><h4 className="font-black text-xl text-[#111c2d]">{job.itemName}</h4><p className="text-xs text-[#44474c] mt-1">Pickup: {job.storagePosition}</p></div>
      <div className="mt-auto space-y-4"><label className="text-[10px] font-black text-[#44474c] uppercase tracking-widest">Assign Final Position</label><div className="flex gap-3"><input value={pos} onChange={e => setPos(e.target.value)} className="flex-1 px-5 py-3 bg-[#f9f9ff] rounded-2xl font-bold outline-none" placeholder="Shelf / Zone" /><button onClick={handleAssign} disabled={loading || !pos} className="bg-sky-600 text-white px-6 rounded-2xl font-black">{loading ? <Loader2 className="animate-spin" /> : 'Assign'}</button></div></div>
    </div>
  );
}

function ForkliftOpsView({ jobs, onAction, userUid, onRegisterUid, onLineLogin, onJobClick }: { jobs: Job[], onAction: () => void, userUid: string, onRegisterUid: (uid: string) => void, onLineLogin: () => void, onJobClick: (job: Job) => void }) {
  const activeJobs = jobs.filter(j => j.status === 'Assigned' || j.status === 'Picking');
  if (!userUid) return <UidRegistration onRegister={onRegisterUid} onLineLogin={onLineLogin} />;
  return (
    <div className="space-y-8">
      <div className="bg-amber-500 text-white p-6 rounded-3xl flex justify-between items-center"><div><h3 className="font-black text-lg">Forklift Operations</h3><p className="text-xs opacity-70">Follow PDF instructions for delivery</p></div><Truck size={24} /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{activeJobs.map((job) => (<ForkliftCard key={job.id} job={job} onAction={onAction} onInfo={() => onJobClick(job)} />))}</div>
    </div>
  );
}

function ForkliftCard({ job, onAction, onInfo }: { job: Job, onAction: () => void, onInfo: () => void }) {
  const [loading, setLoading] = useState(false);
  const handleStart = async () => { setLoading(true); await api.startJob(job.id); setLoading(false); onAction(); };
  const handleComplete = async () => { setLoading(true); await api.completeJob(job.id, 'photo'); setLoading(false); onAction(); };
  return (
    <div className="bg-white rounded-[32px] border border-[#e7eeff] shadow-sm overflow-hidden flex flex-col p-8 relative">
      <button onClick={onInfo} className="absolute top-6 right-6 p-2 text-[#4c5b71] hover:bg-[#f0f3ff] rounded-xl"><Info size={18} /></button>
      <div className="flex justify-between items-start mb-6"><h4 className="font-black text-xl text-[#111c2d] pr-8">{job.itemName}</h4></div>
      <div className="space-y-4 mb-8">
        <div className="bg-[#f9f9ff] p-4 rounded-2xl"><p className="text-[10px] font-black text-[#44474c] uppercase flex items-center gap-2"><MapPin size={10}/> FROM PDB</p><p className="text-lg font-black text-[#4c5b71]">{job.storagePosition}</p></div>
        <div className="bg-[#f0f9ff] p-4 rounded-2xl"><p className="text-[10px] font-black text-sky-600 uppercase flex items-center gap-2"><ChevronRight size={10}/> TO PDF</p><p className="text-lg font-black text-sky-700">{job.dropoffPosition}</p></div>
      </div>
      <button onClick={job.status === 'Assigned' ? handleStart : handleComplete} className={`w-full py-5 rounded-2xl font-black text-lg text-white ${job.status === 'Assigned' ? 'bg-[#4c5b71]' : 'bg-green-600'}`}>{job.status === 'Assigned' ? 'Pickup Item' : 'Confirm Delivery'}</button>
    </div>
  );
}

function StatusBadge({ status }: { status: Job['status'] }) {
  const styles = { Pending: 'bg-amber-100 text-amber-700', Assigned: 'bg-sky-100 text-sky-700', Picking: 'bg-[#4c5b71] text-white animate-pulse', Delivered: 'bg-green-100 text-green-700' };
  return <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase ${styles[status]}`}>{status}</span>;
}
