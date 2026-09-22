import React, { useState, useEffect } from 'react';
import { DataProvider } from './context/DataContext';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';

export default function App() {
  const [isAuthed, setIsAuthed] = useState<boolean>(() => sessionStorage.getItem('admin_auth') === 'true');

  useEffect(() => {
    const check = () => setIsAuthed(sessionStorage.getItem('admin_auth') === 'true');
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setIsAuthed(false);
  };

  return (
    <DataProvider>
      {isAuthed ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <AdminLogin onLogin={() => setIsAuthed(true)} />
      )}
    </DataProvider>
  );
}
