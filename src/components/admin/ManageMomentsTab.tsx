import React, { useState } from 'react';
import { useDataStore } from '../../context/DataContext';
import { Moment } from '../../types';
import { AdminMediaUploader } from './AdminMediaUploader';
import { Plus, Edit2, Trash2, Calendar, Check, X, Sparkles } from 'lucide-react';

export const ManageMomentsTab: React.FC = () => {
  const { moments, addMoment, updateMoment, deleteMoment } = useDataStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [date, setDate] = useState('');
  const [story, setStory] = useState('');

  const resetForm = () => {
    setTitle('');
    setImage('');
    setDate('');
    setStory('');
    setEditingId(null);
    setIsAdding(false);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsAdding(true);
    setDate(new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }));
  };

  const handleStartEdit = (moment: Moment) => {
    setIsAdding(false);
    setEditingId(moment.id);
    setTitle(moment.title);
    setImage(moment.image);
    setDate(moment.date);
    setStory(moment.story);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Judul momen wajib diisi.');
      return;
    }
    if (!image) {
      alert('Foto momen wajib diunggah.');
      return;
    }

    if (editingId) {
      updateMoment(editingId, {
        title: title.trim(),
        image,
        date: date.trim() || '2024',
        story: story.trim(),
      });
    } else {
      addMoment({
        title: title.trim(),
        image,
        date: date.trim() || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
        story: story.trim(),
      });
    }

    resetForm();
  };

  const handleDelete = (id: string, momentTitle: string) => {
    if (window.confirm(`Yakin ingin menghapus momen "${momentTitle}"?`)) {
      deleteMoment(id);
      if (editingId === id) resetForm();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#4B4038]">
        <div>
          <h3 className="text-xl font-extrabold text-[#CAAA98]">
            Kelola Momen Foto (Moments Section)
          </h3>
          <p className="text-xs text-[#9A8678] mt-0.5">
            Tambah, sunting, dan hapus foto kenangan beserta cerita narasi momen angkatan.
          </p>
        </div>

        {!isAdding && !editingId && (
          <button
            type="button"
            onClick={handleStartAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#CAAA98] hover:bg-[#CAAA98]/90 text-[#202940] rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Momen Baru</span>
          </button>
        )}
      </div>

      {/* Form Add / Edit */}
      {(isAdding || editingId) && (
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 bg-[#202940] border border-[#CAAA98]/50 rounded-2xl shadow-xl space-y-4 relative"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#4B4038]">
            <div className="flex items-center gap-2 text-sm font-bold text-[#CAAA98]">
              <Sparkles className="w-4 h-4 text-[#CAAA98]" />
              <span>{editingId ? 'Edit Momen Kenangan' : 'Tambah Momen Kenangan Baru'}</span>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="p-1.5 rounded-lg text-[#9A8678] hover:text-white hover:bg-[#4B4038] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Media Upload */}
            <div>
              <AdminMediaUploader
                label="Unggah Foto Momen *"
                value={image}
                onChange={setImage}
                type="image"
                aspectRatio="wide"
                helperText="Pilih foto langsung dari galeri HP atau laptop. Otomatis dikompresi untuk penyimpanan cepat."
              />
            </div>

            {/* Inputs */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                  Judul Momen * (misal: Bukber Akbar)
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Bukber Akbar & Khataman Al-Qur'an"
                  className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                  Tanggal Pelaksanaan
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Contoh: 05 April 2024"
                  className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                  Teks Cerita Momen
                </label>
                <textarea
                  rows={4}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Ceritakan momen seru, kesan mendalam, atau hal lucu yang terjadi..."
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
              <span>{editingId ? 'Perbarui Momen' : 'Simpan Momen'}</span>
            </button>
          </div>
        </form>
      )}

      {/* List of Moments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {moments.map((moment) => (
          <div
            key={moment.id}
            className="p-4 rounded-2xl bg-[#202940] border border-[#4B4038] hover:border-[#CAAA98]/60 transition-all flex flex-col sm:flex-row gap-4 group"
          >
            <div className="sm:w-36 sm:h-28 h-40 rounded-xl overflow-hidden bg-black/40 shrink-0 relative">
              <img
                src={moment.image}
                alt={moment.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] text-[#9A8678] mb-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {moment.date}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#CAAA98] line-clamp-1 mb-1">
                  {moment.title}
                </h4>
                <p className="text-xs text-[#9A8678] line-clamp-2">
                  {moment.story || 'Tidak ada narasi.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-[#4B4038]/50">
                <button
                  type="button"
                  onClick={() => handleStartEdit(moment)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#4B4038]/60 hover:bg-[#4B4038] text-[#CAAA98] hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(moment.id, moment.title)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/80 text-red-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {moments.length === 0 && (
        <div className="p-8 text-center bg-[#202940]/50 border border-dashed border-[#4B4038] rounded-2xl text-xs text-[#9A8678]">
          Belum ada momen kenangan. Klik tombol &ldquo;Tambah Momen Baru&rdquo; di atas untuk menambahkan.
        </div>
      )}
    </div>
  );
};
