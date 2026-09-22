import React, { useState } from 'react';
import { useDataStore } from '../../context/DataContext';
import { VideoMoment } from '../../types';
import { AdminMediaUploader } from './AdminMediaUploader';
import { Plus, Edit2, Trash2, Video as VideoIcon, Clock, Check, X, Sparkles, Play } from 'lucide-react';

export const ManageVideosTab: React.FC = () => {
  const { videoMoments, addVideoMoment, updateVideoMoment, deleteVideoMoment } = useDataStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setTitle('');
    setVideoUrl('');
    setPosterUrl('');
    setDuration('');
    setDate('');
    setDescription('');
    setEditingId(null);
    setIsAdding(false);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsAdding(true);
    setDate(new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }));
    setDuration('02:30');
  };

  const handleStartEdit = (item: VideoMoment) => {
    setIsAdding(false);
    setEditingId(item.id);
    setTitle(item.title);
    setVideoUrl(item.videoUrl);
    setPosterUrl(item.posterUrl);
    setDuration(item.duration);
    setDate(item.date);
    setDescription(item.description);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Judul video momen wajib diisi.');
      return;
    }
    if (!videoUrl) {
      alert('File video wajib diunggah atau memiliki URL valid.');
      return;
    }

    if (editingId) {
      updateVideoMoment(editingId, {
        title: title.trim(),
        videoUrl,
        posterUrl: posterUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        duration: duration.trim() || '02:00',
        date: date.trim() || '2024',
        description: description.trim(),
      });
    } else {
      addVideoMoment({
        title: title.trim(),
        videoUrl,
        posterUrl: posterUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        duration: duration.trim() || '02:00',
        date: date.trim() || '2024',
        description: description.trim(),
      });
    }

    resetForm();
  };

  const handleDelete = (id: string, videoTitle: string) => {
    if (window.confirm(`Yakin ingin menghapus video "${videoTitle}"?`)) {
      deleteVideoMoment(id);
      if (editingId === id) resetForm();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#4B4038]">
        <div>
          <h3 className="text-xl font-extrabold text-[#CAAA98]">
            Kelola Momen Video (Video Moments Section)
          </h3>
          <p className="text-xs text-[#9A8678] mt-0.5">
            Unggah file video kenangan (.mp4), berikan judul, dan tulis narasi kisah di balik video.
          </p>
        </div>

        {!isAdding && !editingId && (
          <button
            type="button"
            onClick={handleStartAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#CAAA98] hover:bg-[#CAAA98]/90 text-[#202940] rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Video Baru</span>
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
              <span>{editingId ? 'Edit Data Video Momen' : 'Unggah Video Momen Baru'}</span>
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
            {/* Media Upload (Video & Poster) */}
            <div className="space-y-4">
              <AdminMediaUploader
                label="Unggah File Video (.mp4) *"
                value={videoUrl}
                onChange={setVideoUrl}
                type="video"
                aspectRatio="wide"
                helperText="Pilih rekaman video langsung dari HP/laptop atau masukkan URL video (.mp4)."
              />

              <AdminMediaUploader
                label="Foto Sampul / Poster Video (Opsional)"
                value={posterUrl}
                onChange={setPosterUrl}
                type="image"
                aspectRatio="wide"
                helperText="Thumbnail gambar yang ditampilkan sebelum video diputar."
              />
            </div>

            {/* Fields */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                  Judul Momen Video *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Aftermovie Perpisahan & Wisuda Angkatan IX"
                  className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                    Durasi Video (Menit:Detik)
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Contoh: 02:45"
                    className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                    Tanggal Video
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="Contoh: 15 Juni 2024"
                    className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                  Teks Cerita / Deskripsi Video
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsikan momen yang terekam dalam video ini..."
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
              <span>{editingId ? 'Perbarui Video' : 'Simpan Video'}</span>
            </button>
          </div>
        </form>
      )}

      {/* List of Videos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videoMoments.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-[#202940] border border-[#4B4038] hover:border-[#CAAA98]/60 transition-all flex flex-col sm:flex-row gap-4 group"
          >
            <div className="sm:w-40 sm:h-28 h-44 rounded-xl overflow-hidden bg-black/60 shrink-0 relative flex items-center justify-center">
              <img
                src={item.posterUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-[#CAAA98]/90 text-[#202940] flex items-center justify-center shadow-md">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
              <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-[#CAAA98]">
                {item.duration}
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] text-[#9A8678] mb-1">
                  <span>{item.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" /> {item.duration}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#CAAA98] line-clamp-1 mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-[#9A8678] line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-[#4B4038]/50">
                <button
                  type="button"
                  onClick={() => handleStartEdit(item)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#4B4038]/60 hover:bg-[#4B4038] text-[#CAAA98] hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.title)}
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

      {videoMoments.length === 0 && (
        <div className="p-8 text-center bg-[#202940]/50 border border-dashed border-[#4B4038] rounded-2xl text-xs text-[#9A8678]">
          Belum ada video momen. Klik tombol &ldquo;Tambah Video Baru&rdquo; di atas untuk menambahkan.
        </div>
      )}
    </div>
  );
};
