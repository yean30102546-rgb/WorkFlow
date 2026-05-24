"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Liff } from '@line/liff';
import { syncUser } from '@/app/actions/users';

interface LiffContextType {
  liff: Liff | null;
  isLoggedIn: boolean;
  profile: {
    userId: string;
    displayName: string;
    pictureUrl?: string;
  } | null;
  role: 'OPERATOR' | 'DRIVER' | 'ADMIN' | null;
  loading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
  isMock: boolean;
  setMockProfile: (userId: string, displayName: string) => void;
}

const LiffContext = createContext<LiffContextType | undefined>(undefined);

export const LiffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [liffObject, setLiffObject] = useState<Liff | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [profile, setProfile] = useState<LiffContextType['profile']>(null);
  const [role, setRole] = useState<LiffContextType['role']>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState<boolean>(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const mockUid = searchParams.get('uid');
    const mockName = searchParams.get('name') || 'Factory Worker';

    // If query params specify mock credentials, use them directly
    if (mockUid) {
      setProfile({
        userId: mockUid,
        displayName: mockName,
      });
      syncUser(mockUid, mockName).then((res) => {
        if (res.success) setRole(res.role as any);
      });
      setIsLoggedIn(true);
      setIsMock(true);
      setLoading(false);
      return;
    }

    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    console.log('Initializing LIFF with ID:', liffId);
    if (!liffId || liffId === 'your-liff-id') {
      console.warn('LINE LIFF ID is not configured. Falling back to development mock mode.');
      setProfile({
        userId: 'dev-mock-operator',
        displayName: 'Dev Operator',
      });
      syncUser('dev-mock-operator', 'Dev Operator').then((res) => {
        if (res.success) setRole(res.role as any);
      });
      setIsLoggedIn(true);
      setIsMock(true);
      setLoading(false);
      return;
    }

    import('@line/liff')
      .then(async (module) => {
        const liff = module.default;
        await liff.init({ liffId });
        setLiffObject(liff);

        const loggedIn = liff.isLoggedIn();
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
          const userProfile = await liff.getProfile();
          setProfile({
            userId: userProfile.userId,
            displayName: userProfile.displayName,
            pictureUrl: userProfile.pictureUrl,
          });
          syncUser(userProfile.userId, userProfile.displayName, userProfile.pictureUrl).then((res) => {
            if (res.success) setRole(res.role as any);
          });
          // Clean up URL query parameters (code, state) left by LINE OAuth redirect
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (url.searchParams.has('code') || url.searchParams.has('state')) {
              url.searchParams.delete('code');
              url.searchParams.delete('state');
              window.history.replaceState({}, document.title, url.pathname + url.search);
            }
          }
        } else {
          // If accessing inside LINE app client (such as from LINE OA), automatically log in
          if (liff.isInClient()) {
            liff.login({ redirectUri: window.location.href });
            return;
          }

          // Check local storage for quick testing fallback
          const savedUid = localStorage.getItem('mock_user_uid');
          if (savedUid) {
            const savedName = localStorage.getItem('mock_user_name') || 'Saved Mock User';
            setProfile({
              userId: savedUid,
              displayName: savedName,
            });
            syncUser(savedUid, savedName).then((res) => {
              if (res.success) setRole(res.role as any);
            });
            setIsLoggedIn(true);
            setIsMock(true);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('LIFF initialization failed:', err);
        setError(err.message || 'Failed to initialize LIFF');
        // Fallback to mock for testing instead of hard crash
        setProfile({
          userId: 'fallback-mock-operator',
          displayName: 'Fallback Operator',
        });
        syncUser('fallback-mock-operator', 'Fallback Operator').then((res) => {
          if (res.success) setRole(res.role as any);
        });
        setIsLoggedIn(true);
        setIsMock(true);
        setLoading(false);
      });
  }, []);

  const login = () => {
    if (liffObject && !isLoggedIn) {
      // Use current window location to ensure redirect returns to the active dev port (e.g. 3001)
      liffObject.login({ redirectUri: window.location.href });
    } else {
      // Mock login for dev/testing
      const newUid = prompt('Enter Mock User ID:', 'operator-1') || 'operator-1';
      const newName = prompt('Enter Mock Display Name:', 'John Operator') || 'John Operator';
      setMockProfile(newUid, newName);
    }
  };

  const logout = () => {
    if (liffObject && isLoggedIn) {
      liffObject.logout();
      setIsLoggedIn(false);
      setProfile(null);
      setRole(null);
    } else {
      setIsLoggedIn(false);
      setProfile(null);
      setRole(null);
      localStorage.removeItem('mock_user_uid');
      localStorage.removeItem('mock_user_name');
    }
  };

  const setMockProfile = (userId: string, displayName: string) => {
    setProfile({ userId, displayName });
    syncUser(userId, displayName).then((res) => {
      if (res.success) setRole(res.role as any);
    });
    setIsLoggedIn(true);
    setIsMock(true);
    localStorage.setItem('mock_user_uid', userId);
    localStorage.setItem('mock_user_name', displayName);
  };

  return (
    <LiffContext.Provider
      value={{
        liff: liffObject,
        isLoggedIn,
        profile,
        role,
        loading,
        error,
        login,
        logout,
        isMock,
        setMockProfile,
      }}
    >
      {children}
    </LiffContext.Provider>
  );
};

export const useLiff = () => {
  const context = useContext(LiffContext);
  if (!context) {
    throw new Error('useLiff must be used within a LiffProvider');
  }
  return context;
};
