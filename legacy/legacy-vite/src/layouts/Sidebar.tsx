import React from 'react';
import { Truck, X, Fingerprint } from 'lucide-react';
import { Role } from '../features/identity/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: Role;
  setRole: (role: Role) => void;
  menuItems: Array<{ id: string; label: string; icon: React.ElementType; roles: string[] }>;
  userUid: string;
  lineProfile: { displayName: string, pictureUrl?: string } | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  role,
  setRole,
  menuItems,
  userUid,
  lineProfile
}) => {
  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-[#e7eeff] transition-transform duration-300 lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-[#e7eeff]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#4c5b71] rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
              <Truck size={20} />
            </div>
            <h1 className="font-bold text-lg text-[#4c5b71]">ImproveFlow</h1>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-[#44474c]">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                onClose();
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
    </>
  );
};
