import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Send, 
  Truck, 
  History 
} from 'lucide-react';

// Features
import { jobsApi, Job, JobDetailsModal } from './features/jobs';
import { useIdentity } from './features/identity';
import { DashboardView } from './features/dashboard';
import { PdbView } from './features/role-pdb';
import { PdfDispatchView } from './features/role-pdf';
import { ForkliftOpsView } from './features/role-forklift';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { Sidebar } from './layouts/Sidebar';

export default function App() {
  const {
    role,
    setRole,
    userUid,
    handleSaveUid,
    lineProfile,
    activeTab,
    setActiveTab,
    handleLogin
  } = useIdentity();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await jobsApi.getJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAction = async () => {
    await fetchJobs();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: History, roles: ['ADMIN'] },
    { id: 'pdb-entry', label: 'PDB: Add Batch', icon: ClipboardList, roles: ['ADMIN', 'PDB'] },
    { id: 'pdf-dispatch', label: 'PDF: Assign Position', icon: Send, roles: ['ADMIN', 'PDF'] },
    { id: 'forklift-ops', label: 'Forklift: Delivery', icon: Truck, roles: ['ADMIN', 'FORKLIFT'] },
  ];

  const activeTabLabel = menuItems.find(i => i.id === activeTab)?.label || 'Overview';

  return (
    <MainLayout
      activeTabLabel={activeTabLabel}
      role={role}
      loading={loading}
      onOpenSidebar={() => setIsSidebarOpen(true)}
      sidebar={
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          role={role}
          setRole={setRole}
          menuItems={menuItems}
          userUid={userUid}
          lineProfile={lineProfile}
        />
      }
    >
      {activeTab === 'dashboard' && (
        <DashboardView 
          jobs={jobs} 
          onRefresh={fetchJobs} 
          onJobClick={setSelectedJob} 
        />
      )}
      {activeTab === 'pdb-entry' && (
        <PdbView 
          onAction={handleAction} 
          userUid={userUid} 
          onRegisterUid={handleSaveUid} 
          onLineLogin={handleLogin} 
        />
      )}
      {activeTab === 'pdf-dispatch' && (
        <PdfDispatchView 
          jobs={jobs} 
          onAction={handleAction} 
          userUid={userUid} 
          onRegisterUid={handleSaveUid} 
          onLineLogin={handleLogin} 
          onJobClick={setSelectedJob} 
        />
      )}
      {activeTab === 'forklift-ops' && (
        <ForkliftOpsView 
          jobs={jobs} 
          onAction={handleAction} 
          userUid={userUid} 
          onRegisterUid={handleSaveUid} 
          onLineLogin={handleLogin} 
          onJobClick={setSelectedJob} 
        />
      )}

      {selectedJob && (
        <JobDetailsModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
        />
      )}
    </MainLayout>
  );
}
