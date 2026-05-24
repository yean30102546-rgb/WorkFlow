import React, { useState } from 'react';
import { Fingerprint, MessageCircle } from 'lucide-react';

interface UidRegistrationProps {
  onRegister: (uid: string) => void;
  onLineLogin: () => void;
}

export const UidRegistration: React.FC<UidRegistrationProps> = ({ onRegister, onLineLogin }) => {
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
};
