import React, { useState } from 'react';
import { useDataStore } from '../../context/DataContext';
import { ManageMomentsTab } from './ManageMomentsTab';
import { ManageVideosTab } from './ManageVideosTab';
import { ManageBiodataTab } from './ManageBiodataTab';
import { ManageBeforeAfterTab } from './ManageBeforeAfterTab';
import { ManageGraduationTab } from './ManageGraduationTab';
import { ManageVisitorsTab } from './ManageVisitorsTab';
import {
  Camera,
  Video,
  Users,
  ArrowLeftRight,
  GraduationCap,
  UserRound,
  Eye,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

type AdminTab = 'moments' | 'videos' | 'biodata' | 'before-after' | 'graduation' | 'visitors';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { students, moments, videoMoments, graduationData, resetToDefaultData, toasts, dismissToast, isSupabaseConfigured } = useDataStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('moments');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const tabs: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; count?: number }[] = [
    { id: 'moments', label: 'Momen Foto', icon: Camera, count: moments.length },
    { id: 'videos', label: 'Momen Video', icon: Video, count: videoMoments.length },
    { id: 'biodata', label: 'Biodata Siswa', icon: Users, count: students.length },
    { id: 'before-after', label: 'Before - After', icon: ArrowLeftRight, count: students.length },
    { id: 'graduation', label: 'Wisuda & Galeri', icon: GraduationCap, count: graduationData.gallery.length },
    { id: 'visitors', label: 'Pengunjung', icon: UserRound },
  ];

  return (
    <div className="min-h-screen bg-[#202940] text-[#CAAA98] pb-16 font-sans">
      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-start gap-3 transition-all animate-in slide-in-from-bottom-2 ${
              toast.type === 'error'
                ? 'bg-red-950/90 border-red-700 text-red-200'
                : toast.type === 'info'
                ? 'bg-[#4B4038]/95 border-[#9A8678] text-[#CAAA98]'
                : 'bg-[#202940]/95 border-[#CAAA98] text-white'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            ) : toast.type === 'info' ? (
              <Info className="w-5 h-5 text-[#CAAA98] shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs font-medium">{toast.message}</div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-[#9A8678] hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Admin Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#202940]/95 backdrop-blur-md border-b border-[#4B4038] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4B4038] border border-[#CAAA98]/40 flex items-center justify-center text-[#CAAA98] shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white tracking-wide">
                  Dashboard Admin
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#CAAA98] text-[#202940] text-[10px] font-bold uppercase tracking-wider">
                  Live CRUD
                </span>
              </div>
              <p className="text-[11px] text-[#9A8678]">
                Buku Kenangan Angkatan Khalid Bin Walid • {isSupabaseConfigured ? 'Supabase Sync (Global)' : 'Mode Lokal (isi ENV Supabase)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#4B4038] hover:border-[#9A8678] bg-[#202940] text-[#9A8678] hover:text-[#CAAA98] text-xs font-semibold transition-colors cursor-pointer"
              title="Kembalikan semua data ke sampel awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Sampel Data</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-900/40 hover:bg-red-800 text-red-200 border border-red-800/50 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-[#202940] border border-[#4B4038] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4B4038]/60 text-[#CAAA98] flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#9A8678] block font-medium">Momen Foto</span>
              <span className="text-lg font-extrabold text-white">{moments.length}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#202940] border border-[#4B4038] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4B4038]/60 text-[#CAAA98] flex items-center justify-center shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#9A8678] block font-medium">Video Kenangan</span>
              <span className="text-lg font-extrabold text-white">{videoMoments.length}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#202940] border border-[#4B4038] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4B4038]/60 text-[#CAAA98] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#9A8678] block font-medium">Biodata Siswa</span>
              <span className="text-lg font-extrabold text-white">{students.length}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#202940] border border-[#4B4038] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4B4038]/60 text-[#CAAA98] flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#9A8678] block font-medium">Wisudawan & Galeri</span>
              <span className="text-lg font-extrabold text-white">
                {graduationData.graduates.length} / {graduationData.gallery.length}
              </span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#202940] border border-[#4B4038] overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#CAAA98] text-[#202940] shadow-md'
                    : 'text-[#9A8678] hover:text-[#CAAA98] hover:bg-[#4B4038]/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-[#202940] text-[#CAAA98]' : 'bg-[#4B4038] text-[#9A8678]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panes */}
        <div className="bg-[#202940] border border-[#4B4038] rounded-3xl p-5 sm:p-7 shadow-xl">
          {activeTab === 'moments' && <ManageMomentsTab />}
          {activeTab === 'videos' && <ManageVideosTab />}
          {activeTab === 'biodata' && <ManageBiodataTab />}
          {activeTab === 'before-after' && <ManageBeforeAfterTab />}
          {activeTab === 'graduation' && <ManageGraduationTab />}
          {activeTab === 'visitors' && <ManageVisitorsTab />}
        </div>
      </main>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#202940] border border-[#4B4038] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-800/60 text-amber-400 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-white">
                Reset ke Data Sampel Awal?
              </h4>
              <p className="text-xs text-[#9A8678] mt-1">
                Tindakan ini akan mengembalikan data Momen, Video, Biodata Siswa, Before-After, dan Wisuda ke data awal bawaan sistem.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl border border-[#4B4038] text-xs font-semibold text-[#9A8678] hover:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDefaultData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
