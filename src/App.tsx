import React, { useState, useEffect } from 'react';
import { DataProvider } from './context/DataContext';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { clearToken, getToken } from './lib/api';

function getSecretPath(): string {
  const raw = (import.meta as any).env?.VITE_ADMIN_SECRET_PATH as string | undefined;
  const fallback = '/admin-khalid-bin-wallid';
  if (!raw || raw.trim() === '') return fallback;
  const p = raw.trim();
  return p.startsWith('/') ? p : `/${p}`;
}

function isAllowedPath(): boolean {
  try {
    const secret = getSecretPath();
    const current = decodeURIComponent(window.location.pathname);
    // Allow exact secret path and with trailing slash
    return current === secret || current === `${secret}/`;
  } catch {
    return window.location.pathname === getSecretPath();
  }
}

function NotFound() {
  return (
    <div className="min-h-screen bg-[#202940] flex items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <h1 className="text-6xl font-black text-[#4B4038] mb-2">404</h1>
        <p className="text-sm text-[#9A8678]">Halaman tidak ditemukan.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [isAuthed, setIsAuthed] = useState<boolean>(() => sessionStorage.getItem('admin_auth') === 'true' && Boolean(getToken()));
  const [allowed, setAllowed] = useState<boolean>(() => isAllowedPath());

  useEffect(() => {
    const checkAuth = () => setIsAuthed(sessionStorage.getItem('admin_auth') === 'true' && Boolean(getToken()));
    const checkPath = () => setAllowed(isAllowedPath());
    window.addEventListener('storage', checkAuth);
    window.addEventListener('popstate', checkPath);
    // Also listen to pushState via custom event if needed
    const origPush = window.history.pushState;
    // @ts-ignore
    window.history.pushState = function (...args) {
      // @ts-ignore
      origPush.apply(window.history, args);
      checkPath();
    };
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('popstate', checkPath);
      window.history.pushState = origPush;
    };
  }, []);

  if (!allowed) {
    return <NotFound />;
  }

  const handleLogout = () => {
    clearToken();
    sessionStorage.removeItem('admin_auth');
    setIsAuthed(false);
  };

  return (
    <DataProvider>
      {isAuthed ? <AdminDashboard onLogout={handleLogout} /> : <AdminLogin onLogin={() => setIsAuthed(true)} />}
    </DataProvider>
  );
}
