import React from 'react';
import { Menu, Loader2 } from 'lucide-react';
import { Role } from '../features/identity/types';

interface MainLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  onOpenSidebar: () => void;
  activeTabLabel: string;
  role: Role;
  loading?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  sidebar,
  onOpenSidebar,
  activeTabLabel,
  role,
  loading
}) => {
  return (
    <div className="min-h-screen bg-[#f9f9ff] flex font-sans overflow-hidden">
      {sidebar}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 bg-white border-b border-[#e7eeff] px-6 lg:px-10 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-5">
            <button onClick={onOpenSidebar} className="lg:hidden p-2.5 bg-[#f0f3ff] text-[#4c5b71] rounded-xl">
              <Menu size={22} />
            </button>
            <h2 className="text-xl font-extrabold text-[#111c2d]">
              {activeTabLabel}
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
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
