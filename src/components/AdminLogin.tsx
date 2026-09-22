import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = (import.meta as any).env?.VITE_ADMIN_PASSWORD as string | undefined;
    // Jika ENV belum di-set (development), pakai fallback 'admin123' agar bisa dicoba lokal
    const validPassword = expected && expected !== '' ? expected : 'admin123';
    if (password === validPassword) {
      sessionStorage.setItem('admin_auth', 'true');
      setError('');
      onLogin();
    } else {
      setError('Password salah. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-[#202940] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-[#202940] border-2 border-[#4B4038] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#4B4038] border border-[#CAAA98]/30 text-[#CAAA98] mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-[#CAAA98]">Login Admin</h1>
          <p className="text-xs text-[#9A8678] mt-1">Masukkan password bersama untuk mengelola data</p>
        </div>

        {error && <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-300">{error}</div>}

        <div>
          <label className="block text-xs font-semibold text-[#9A8678] mb-1 uppercase tracking-wider">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#9A8678] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-sm text-[#CAAA98] placeholder-[#9A8678]/60 outline-none transition-colors"
              autoFocus
            />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A8678] hover:text-[#CAAA98] p-1">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" className="w-full py-3 bg-[#CAAA98] hover:bg-[#CAAA98]/90 text-[#202940] font-bold rounded-xl shadow-md transition-colors">
          Masuk ke Dashboard
        </button>
      </form>
    </div>
  );
};
