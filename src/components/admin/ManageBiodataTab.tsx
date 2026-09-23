import React, { useState } from 'react';
import { useDataStore } from '../../context/DataContext';
import { Student } from '../../types';
import { AdminMediaUploader } from './AdminMediaUploader';
import { Plus, Edit2, Trash2, Search, Check, X, Sparkles, User, Instagram, Link as LinkIcon } from 'lucide-react';

function extractInstagramUsername(input: string): string {
  let s = input.trim();
  if (!s) return 'alumni';
  // Remove protocol and domain
  s = s.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '');
  s = s.replace(/^instagram\.com\//i, '');
  s = s.replace(/^@/, '');
  // Take first path segment before / ? &
  s = s.split('/')[0].split('?')[0].split('&')[0].trim();
  // Clean invalid chars, keep alphanumeric . _ 
  s = s.replace(/[^a-zA-Z0-9._]/g, '');
  return s || 'alumni';
}

function toInstagramLink(username: string): string {
  const u = extractInstagramUsername(username);
  return `https://instagram.com/${u}`;
}

export const ManageBiodataTab: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState('Anggota Angkatan');
  const [photo, setPhoto] = useState('');
  const [photoLarge, setPhotoLarge] = useState('');
  const [photoSD, setPhotoSD] = useState('');
  const [photoSMP, setPhotoSMP] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  const [currentSchool, setCurrentSchool] = useState('');
  const [birthPlaceDate, setBirthPlaceDate] = useState('');
  const [address, setAddress] = useState('');
  const [hobby, setHobby] = useState('');
  const [dream, setDream] = useState('');
  const [message, setMessage] = useState('');
  const [impression, setImpression] = useState('');
  const [instagram, setInstagram] = useState('');

  const resetForm = () => {
    setName('');
    setNickname('');
    setRole('Anggota Angkatan');
    setPhoto('');
    setPhotoLarge('');
    setPhotoSD('');
    setPhotoSMP('');
    setPreviousSchool('');
    setCurrentSchool('');
    setBirthPlaceDate('');
    setAddress('');
    setHobby('');
    setDream('');
    setMessage('');
    setImpression('');
    setInstagram('');
    setEditingId(null);
    setIsAdding(false);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsAdding(true);
    setRole('Siswa / Anggota');
  };

  const handleStartEdit = (student: Student) => {
    setIsAdding(false);
    setEditingId(student.id);
    setName(student.name);
    setNickname(student.nickname);
    setRole(student.role);
    setPhoto(student.photo);
    setPhotoLarge(student.photoLarge || student.photo);
    setPhotoSD(student.photoSD || '');
    setPhotoSMP(student.photoSMP || '');
    setPreviousSchool(student.previousSchool || '');
    setCurrentSchool(student.currentSchool || '');
    setBirthPlaceDate(student.birthPlaceDate || '');
    setAddress(student.address || '');
    setHobby(student.hobby || '');
    setDream(student.dream || '');
    setMessage(student.message || '');
    setImpression(student.impression || '');
    // Show as full link for editing (was stored as @username)
    setInstagram(student.instagram ? toInstagramLink(student.instagram) : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama lengkap siswa wajib diisi.');
      return;
    }
    const defaultPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
    const profilePhoto = photo || defaultPhoto;

    const studentPayload: Omit<Student, 'id'> = {
      name: name.trim(),
      nickname: nickname.trim() || name.trim().split(' ')[0],
      role: role.trim() || 'Siswa',
      photo: profilePhoto,
      photoLarge: photoLarge || profilePhoto,
      photoSD: photoSD || profilePhoto,
      photoSMP: photoSMP || profilePhoto,
      previousSchool: previousSchool.trim() || 'SD',
      currentSchool: currentSchool.trim() || 'SMP/SMA',
      birthPlaceDate: birthPlaceDate.trim() || '-',
      address: address.trim() || '-',
      hobby: hobby.trim() || '-',
      dream: dream.trim() || '-',
      message: message.trim() || '-',
      impression: impression.trim() || '-',
      instagram: `@${extractInstagramUsername(instagram)}`,
    };

    if (editingId) {
      updateStudent(editingId, studentPayload);
    } else {
      addStudent(studentPayload);
    }

    resetForm();
  };

  const handleDelete = (id: string, studentName: string) => {
    if (window.confirm(`Yakin ingin menghapus profil siswa "${studentName}"?`)) {
      deleteStudent(id);
      if (editingId === id) resetForm();
    }
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#4B4038]">
        <div>
          <h3 className="text-xl font-extrabold text-[#CAAA98]">
            Kelola Biodata Siswa (Biodata Section)
          </h3>
          <p className="text-xs text-[#9A8678] mt-0.5">
            Tambah, perbarui profil lengkap, foto, kontak Instagram, pesan, dan kesan siswa angkatan.
          </p>
        </div>

        {!isAdding && !editingId && (
          <button
            type="button"
            onClick={handleStartAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#CAAA98] hover:bg-[#CAAA98]/90 text-[#202940] rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa Baru</span>
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
              <span>{editingId ? 'Edit Biodata Siswa' : 'Tambah Profil Siswa Baru'}</span>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="p-1.5 rounded-lg text-[#9A8678] hover:text-white hover:bg-[#4B4038] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Foto Profil Upload */}
            <div className="space-y-4">
              <AdminMediaUploader
                label="Unggah Foto Profil *"
                value={photo}
                onChange={(val) => {
                  setPhoto(val);
                  if (!photoLarge) setPhotoLarge(val);
                }}
                type="image"
                aspectRatio="square"
                helperText="Foto berformat persegi untuk thumbnail kartu dan modal biodata."
              />

              <div>
                <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                  Jabatan di Angkatan
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Contoh: Ketua Angkatan / Anggota"
                  className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                  Link Profil Instagram
                </label>
                <div className="relative">
                  <LinkIcon className="w-3.5 h-3.5 text-[#9A8678] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/username"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
                  />
                </div>
                {instagram && (
                  <p className="text-[11px] text-[#9A8678] mt-1.5">
                    Akan disimpan: <span className="text-[#CAAA98]">@{extractInstagramUsername(instagram)}</span> → <span className="text-[#CAAA98] underline">{toInstagramLink(instagram)}</span>
                  </p>
                )}
                <p className="text-[11px] text-[#9A8678] mt-1">Tempel link profil IG, bisa juga ketik username saja.</p>
              </div>
            </div>

            {/* Input Biodata Tengah */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                  Nama Lengkap *
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
                  Julukan / Nama Panggilan
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Contoh: Raihan / Kapten"
                  className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                  Tempat & Tanggal Lahir
                </label>
                <input
                  type="text"
                  value={birthPlaceDate}
                  onChange={(e) => setBirthPlaceDate(e.target.value)}
                  placeholder="Contoh: Jakarta, 14 Mei 2008"
                  className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                  Alamat Tempat Tinggal
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Jl. Melati No. 24, Jakarta Selatan"
                  className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                    Hobi
                  </label>
                  <input
                    type="text"
                    value={hobby}
                    onChange={(e) => setHobby(e.target.value)}
                    placeholder="Contoh: Basket, Gitar"
                    className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                    Cita-Cita
                  </label>
                  <input
                    type="text"
                    value={dream}
                    onChange={(e) => setDream(e.target.value)}
                    placeholder="Contoh: Diplomat"
                    className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Input Pesan & Kesan */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                  Pesan untuk Teman Angkatan
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis pesan penyemangat untuk kawan seangkatan..."
                  className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                  Kesan Selama Bersama
                </label>
                <textarea
                  rows={4}
                  value={impression}
                  onChange={(e) => setImpression(e.target.value)}
                  placeholder="Ceritakan kesan mendalam selama 3 tahun bersama..."
                  className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors resize-y"
                />
              </div>
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
              <span>{editingId ? 'Perbarui Biodata' : 'Simpan Siswa'}</span>
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
          placeholder="Cari siswa berdasarkan nama, julukan, atau jabatan..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
        />
      </div>

      {/* List of Students */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            className="p-4 rounded-2xl bg-[#202940] border border-[#4B4038] hover:border-[#CAAA98]/60 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40 shrink-0 relative border border-[#9A8678]/30">
                  <img
                    src={student.photo}
                    alt={student.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-[#4B4038] text-[10px] font-semibold text-[#CAAA98] mb-1">
                    {student.role}
                  </span>
                  <h4 className="text-sm font-bold text-white truncate">
                    {student.name}
                  </h4>
                  <p className="text-xs text-[#9A8678] truncate">
                    &ldquo;{student.nickname}&rdquo;
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#4B4038]/50 text-[11px] text-[#9A8678] space-y-1">
                <p className="truncate">
                  <span className="text-[#CAAA98]">Cita-cita:</span> {student.dream}
                </p>
                <p className="truncate flex items-center gap-1 text-[#CAAA98]">
                  <Instagram className="w-3 h-3" />
                  <span>{student.instagram}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-2 border-t border-[#4B4038]/50">
              <button
                type="button"
                onClick={() => handleStartEdit(student)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#4B4038]/60 hover:bg-[#4B4038] text-[#CAAA98] hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(student.id, student.name)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/80 text-red-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="p-8 text-center bg-[#202940]/50 border border-dashed border-[#4B4038] rounded-2xl text-xs text-[#9A8678]">
          Tidak ada siswa yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;.
        </div>
      )}
    </div>
  );
};
