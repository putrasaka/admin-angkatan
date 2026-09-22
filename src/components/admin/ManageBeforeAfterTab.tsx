import React, { useState } from 'react';
import { useDataStore } from '../../context/DataContext';
import { Student } from '../../types';
import { AdminMediaUploader } from './AdminMediaUploader';
import { Plus, Edit2, Trash2, Search, Check, X, Sparkles, ArrowLeftRight, School } from 'lucide-react';

export const ManageBeforeAfterTab: React.FC = () => {
  const { students, updateStudent, addStudent, deleteStudent } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [photoSD, setPhotoSD] = useState('');
  const [photoSMP, setPhotoSMP] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  const [currentSchool, setCurrentSchool] = useState('');

  const resetForm = () => {
    setName('');
    setNickname('');
    setPhotoSD('');
    setPhotoSMP('');
    setPreviousSchool('');
    setCurrentSchool('');
    setEditingId(null);
    setIsAdding(false);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const handleStartEdit = (student: Student) => {
    setIsAdding(false);
    setEditingId(student.id);
    setName(student.name);
    setNickname(student.nickname);
    setPhotoSD(student.photoSD || '');
    setPhotoSMP(student.photoSMP || '');
    setPreviousSchool(student.previousSchool || '');
    setCurrentSchool(student.currentSchool || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama siswa wajib diisi.');
      return;
    }
    if (!photoSD || !photoSMP) {
      alert('Foto SD (Before) dan Foto SMP (After) wajib diunggah.');
      return;
    }

    if (editingId) {
      updateStudent(editingId, {
        name: name.trim(),
        nickname: nickname.trim() || name.trim().split(' ')[0],
        photoSD,
        photoSMP,
        previousSchool: previousSchool.trim() || 'SD',
        currentSchool: currentSchool.trim() || 'SMP/SMA',
      });
    } else {
      addStudent({
        name: name.trim(),
        nickname: nickname.trim() || name.trim().split(' ')[0],
        role: 'Anggota Angkatan',
        photo: photoSMP,
        photoLarge: photoSMP,
        photoSD,
        photoSMP,
        previousSchool: previousSchool.trim() || 'SD',
        currentSchool: currentSchool.trim() || 'SMP/SMA',
        birthPlaceDate: '-',
        address: '-',
        hobby: '-',
        dream: '-',
        message: 'Senang bisa belajar dan tumbuh bersama kalian semua.',
        impression: 'Kenangan yang akan selalu saya simpan selamanya.',
        instagram: '@alumni',
      });
    }

    resetForm();
  };

  const handleDelete = (id: string, studentName: string) => {
    if (window.confirm(`Yakin ingin menghapus data komparasi Before-After "${studentName}"?`)) {
      deleteStudent(id);
      if (editingId === id) resetForm();
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.currentSchool && s.currentSchool.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#4B4038]">
        <div>
          <h3 className="text-xl font-extrabold text-[#CAAA98]">
            Kelola Before - After (Before-After Section)
          </h3>
          <p className="text-xs text-[#9A8678] mt-0.5">
            Kelola foto transformasi masa kecil SD (Before) dan masa remaja SMP/sekarang (After) beserta nama sekolah.
          </p>
        </div>

        {!isAdding && !editingId && (
          <button
            type="button"
            onClick={handleStartAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#CAAA98] hover:bg-[#CAAA98]/90 text-[#202940] rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Komparasi Siswa</span>
          </button>
        )}
      </div>

      {/* Form Add / Edit */}
      {(isAdding || editingId) && (
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 bg-[#202940] border border-[#CAAA98]/50 rounded-2xl shadow-xl space-y-5 relative"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#4B4038]">
            <div className="flex items-center gap-2 text-sm font-bold text-[#CAAA98]">
              <Sparkles className="w-4 h-4 text-[#CAAA98]" />
              <span>{editingId ? 'Edit Komparasi Before-After' : 'Tambah Komparasi Siswa Baru'}</span>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="p-1.5 rounded-lg text-[#9A8678] hover:text-white hover:bg-[#4B4038] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Fields: Name, SD Photo, SMP Photo, Schools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ahmad Raihan Pratama"
                  className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                  Nama Panggilan / Julukan
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Contoh: Raihan"
                  className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                    Sekolah Dulu (SD)
                  </label>
                  <input
                    type="text"
                    value={previousSchool}
                    onChange={(e) => setPreviousSchool(e.target.value)}
                    placeholder="Contoh: SDIT Nurul Fikri"
                    className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                    Nama Sekolah Sekarang *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentSchool}
                    onChange={(e) => setCurrentSchool(e.target.value)}
                    placeholder="Contoh: SMA Negeri 1 Teladan"
                    className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Media Uploads side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AdminMediaUploader
                label="Foto Masa SD (Before) *"
                value={photoSD}
                onChange={setPhotoSD}
                type="image"
                aspectRatio="square"
                helperText="Foto masa kecil saat duduk di bangku SD."
              />

              <AdminMediaUploader
                label="Foto SMP / Sekarang (After) *"
                value={photoSMP}
                onChange={setPhotoSMP}
                type="image"
                aspectRatio="square"
                helperText="Foto terkini saat lulus atau bersekolah sekarang."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#4B4038]">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl border border-[#4B4038] text-xs font-semibold text-[#9A8678] hover:text-white hover:bg-[#4B4038] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-[#CAAA98] hover:bg-[#CAAA98]/90 text-[#202940] rounded-xl text-xs font-bold transition-colors shadow-md cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingId ? 'Perbarui Komparasi' : 'Simpan Komparasi'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter / Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8678]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama siswa atau sekolah sekarang..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
        />
      </div>

      {/* List Before-After Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-[#202940] border border-[#4B4038] hover:border-[#CAAA98]/60 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-[#CAAA98]">
                    {item.name}
                  </h4>
                  <p className="text-xs text-[#9A8678]">
                    Sekarang di: <span className="text-white font-medium">{item.currentSchool || 'Belum diisi'}</span>
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#4B4038] text-[10px] font-semibold text-[#CAAA98]">
                  SD: {item.previousSchool || 'SD'}
                </span>
              </div>

              {/* Two Photos Side by Side Preview */}
              <div className="grid grid-cols-2 gap-3 py-1">
                <div className="space-y-1">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-[#9A8678]">
                    Before (SD)
                  </span>
                  <div className="aspect-square rounded-xl overflow-hidden bg-black/40 border border-[#4B4038]">
                    <img
                      src={item.photoSD || item.photo}
                      alt={`SD ${item.name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-[#CAAA98]">
                    After (SMP / Now)
                  </span>
                  <div className="aspect-square rounded-xl overflow-hidden bg-black/40 border border-[#CAAA98]/30">
                    <img
                      src={item.photoSMP || item.photo}
                      alt={`SMP ${item.name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-2 border-t border-[#4B4038]/50">
              <button
                type="button"
                onClick={() => handleStartEdit(item)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#4B4038]/60 hover:bg-[#4B4038] text-[#CAAA98] hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit Foto & Sekolah</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id, item.name)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/80 text-red-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center bg-[#202940]/50 border border-dashed border-[#4B4038] rounded-2xl text-xs text-[#9A8678]">
          Tidak ada data komparasi yang cocok dengan &ldquo;{searchQuery}&rdquo;.
        </div>
      )}
    </div>
  );
};
