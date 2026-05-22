import { useState, useEffect } from 'react';
import liff from '@line/liff';
import { Role } from '../types';

export const useIdentity = () => {
  const [role, setRole] = useState<Role>('ADMIN');
  const [userUid, setUserUid] = useState(localStorage.getItem('user_uid') || '');
  const [lineProfile, setLineProfile] = useState<{ displayName: string, pictureUrl?: string } | null>(null);
  const [isTabSetByUrl, setIsTabSetByUrl] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleSaveUid = (uid: string) => {
    setUserUid(uid);
    localStorage.setItem('user_uid', uid);
  };

  const handleLogin = () => {
    if (!liff.isLoggedIn()) liff.login();
  };

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
      if (liffId) {
        await liff.init({ liffId });
        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          setLineProfile({ displayName: profile.displayName, pictureUrl: profile.pictureUrl });
          handleSaveUid(profile.userId);
        }
      }
    } catch (err) {
      console.error('LIFF Initialization failed', err);
    }
  };

  useEffect(() => {
    initializeLiff();
  }, []);

  useEffect(() => {
    if (isTabSetByUrl) return; 
    if (role === 'PDB') setActiveTab('pdb-entry');
    if (role === 'PDF') setActiveTab('pdf-dispatch');
    if (role === 'FORKLIFT') setActiveTab('forklift-ops');
    if (role === 'ADMIN') setActiveTab('dashboard');
  }, [role, isTabSetByUrl]);

  return {
    role,
    setRole,
    userUid,
    handleSaveUid,
    lineProfile,
    activeTab,
    setActiveTab,
    handleLogin
  };
};
