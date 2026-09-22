import React, { useState } from 'react';
import { useDataStore } from '../../context/DataContext';
import { AdminMediaUploader } from './AdminMediaUploader';
import { Plus, Edit2, Trash2, Check, X, Sparkles, MapPin, Calendar, Users, Image as ImageIcon } from 'lucide-react';

export const ManageGraduationTab: React.FC = () => {
  const {
    graduationData,
    updateGraduationInfo,
    addGraduationGraduate,
    removeGraduationGraduate,
    addGraduationGallery,
    updateGraduationGallery,
    deleteGraduationGallery,
  } = useDataStore();

  // Info Form State
  const [mainBanner, setMainBanner] = useState(graduationData.mainBanner);
  const [title, setTitle] = useState(graduationData.title);
  const [cohortName, setCohortName] = useState(graduationData.cohortName);
  const [date, setDate] = useState(graduationData.date);
  const [location, setLocation] = useState(graduationData.location);
  const [description, setDescription] = useState(graduationData.description);

  // New Graduate Name Input
  const [newGraduateName, setNewGraduateName] = useState('');

  // Gallery Form State
  const [galleryEditingId, setGalleryEditingId] = useState<string | null>(null);
  const [isAddingGallery, setIsAddingGallery] = useState(false);
  const [galleryImage, setGalleryImage] = useState('');
  const [galleryCaption, setGalleryCaption] = useState('');

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateGraduationInfo({
      mainBanner,
      title: title.trim(),
      cohortName: cohortName.trim(),
      date: date.trim(),
      location: location.trim(),
      description: description.trim(),
    });
  };

  const handleAddGraduate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGraduateName.trim()) {
      addGraduationGraduate(newGraduateName.trim());
      setNewGraduateName('');
    }
  };

  const handleSaveGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryImage) {
      alert('Foto galeri wisuda wajib diunggah.');
      return;
    }
    if (!galleryCaption.trim()) {
      alert('Keterangan / caption foto wajib diisi.');
      return;
    }

    if (galleryEditingId) {
      updateGraduationGallery(galleryEditingId, {
        image: galleryImage,
        caption: galleryCaption.trim(),
      });
    } else {
      addGraduationGallery({
        image: galleryImage,
        caption: galleryCaption.trim(),
      });
    }

    setGalleryEditingId(null);
    setIsAddingGallery(false);
    setGalleryImage('');
    setGalleryCaption('');
  };

  const handleStartEditGallery = (item: { id: string; image: string; caption: string }) => {
    setIsAddingGallery(false);
    setGalleryEditingId(item.id);
    setGalleryImage(item.image);
    setGalleryCaption(item.caption);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-[#4B4038]">
        <h3 className="text-xl font-extrabold text-[#CAAA98]">
          Kelola Wisuda (Graduation Section)
        </h3>
        <p className="text-xs text-[#9A8678] mt-0.5">
          Edit foto utama wisuda, lokasi acara, daftar nama peserta, serta kelola foto-foto tambahan galeri wisuda.
        </p>
      </div>

      {/* 1. INFO UTAMA & BANNER WISUDA */}
      <form
        onSubmit={handleSaveInfo}
        className="p-5 sm:p-6 bg-[#202940] border border-[#4B4038] rounded-2xl space-y-5 shadow-lg"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#4B4038]">
          <h4 className="text-sm font-bold text-[#CAAA98] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#CAAA98]" />
            <span>Informasi Acara & Foto Banner Utama</span>
          </h4>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#CAAA98] hover:bg-[#CAAA98]/90 text-[#202940] rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Info Acara</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <AdminMediaUploader
              label="Foto Utama Wisuda (Banner Besar) *"
              value={mainBanner}
              onChange={setMainBanner}
              type="image"
              aspectRatio="banner"
              helperText="Banner foto wisuda resolusi tinggi yang tampil di kepala bagian Wisuda."
            />
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                Judul Acara Wisuda
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Wisuda & Pelepasan Siswa Angkatan Khalid Bin Walid"
                className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                Nama Angkatan & Tahun Ajaran
              </label>
              <input
                type="text"
                value={cohortName}
                onChange={(e) => setCohortName(e.target.value)}
                placeholder="Contoh: Angkatan IX Tahun Ajaran 2023/2024"
                className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                  Waktu & Tanggal Acara
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Contoh: Sabtu, 15 Juni 2024 • 08.00 WIB"
                  className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                  Info Lokasi Acara
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Grand Ballroom Graha Cendekia"
                  className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                Deskripsi Prosesi Wisuda
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat prosesi pelepasan wisudawan..."
                className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors resize-y"
              />
            </div>
          </div>
        </div>
      </form>

      {/* 2. DAFTAR NAMA PESERTA WISUDA */}
      <div className="p-5 sm:p-6 bg-[#202940] border border-[#4B4038] rounded-2xl space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#4B4038]">
          <div>
            <h4 className="text-sm font-bold text-[#CAAA98] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#CAAA98]" />
              <span>Daftar Nama Peserta Wisuda ({graduationData.graduates.length} Siswa)</span>
            </h4>
            <p className="text-xs text-[#9A8678]">
              Nama-nama yang ditampilkan pada daftar gulir prosesi wisudawan.
            </p>
          </div>
        </div>

        {/* Input tambah nama peserta */}
        <form onSubmit={handleAddGraduate} className="flex gap-2 max-w-md">
          <input
            type="text"
            value={newGraduateName}
            onChange={(e) => setNewGraduateName(e.target.value)}
            placeholder="Ketik nama wisudawan baru..."
            className="flex-1 px-3.5 py-2 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#4B4038] hover:bg-[#CAAA98] text-[#CAAA98] hover:text-[#202940] rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </form>

        {/* Chip list */}
        <div className="flex flex-wrap gap-2 pt-2 max-h-64 overflow-y-auto pr-1">
          {graduationData.graduates.map((name, index) => (
            <div
              key={`${name}-${index}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4B4038]/50 border border-[#9A8678]/40 rounded-full text-xs text-[#CAAA98] group hover:border-[#CAAA98] transition-colors"
            >
              <span className="text-[10px] text-[#9A8678] font-mono">#{index + 1}</span>
              <span>{name}</span>
              <button
                type="button"
                onClick={() => removeGraduationGraduate(index)}
                title="Hapus nama"
                className="text-[#9A8678] hover:text-red-400 p-0.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. GALERI FOTO TAMBAHAN WISUDA */}
      <div className="p-5 sm:p-6 bg-[#202940] border border-[#4B4038] rounded-2xl space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#4B4038]">
          <div>
            <h4 className="text-sm font-bold text-[#CAAA98] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#CAAA98]" />
              <span>Foto-Foto Tambahan Galeri Wisuda ({graduationData.gallery.length} Foto)</span>
            </h4>
            <p className="text-xs text-[#9A8678]">
              Koleksi momen upacara, sungkeman, pengalungan medali, dan selebrasi toga wisuda.
            </p>
          </div>

          {!isAddingGallery && !galleryEditingId && (
            <button
              type="button"
              onClick={() => {
                setGalleryEditingId(null);
                setGalleryImage('');
                setGalleryCaption('');
                setIsAddingGallery(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#CAAA98] hover:bg-[#CAAA98]/90 text-[#202940] rounded-xl text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Foto Galeri</span>
            </button>
          )}
        </div>

        {/* Form Tambah/Edit Foto Galeri Wisuda */}
        {(isAddingGallery || galleryEditingId) && (
          <form
            onSubmit={handleSaveGallery}
            className="p-4 bg-[#202940] border border-[#CAAA98]/40 rounded-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#4B4038]">
              <span className="text-xs font-bold text-[#CAAA98]">
                {galleryEditingId ? 'Edit Foto Galeri Wisuda' : 'Upload Foto Baru ke Galeri Wisuda'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsAddingGallery(false);
                  setGalleryEditingId(null);
                }}
                className="text-[#9A8678] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminMediaUploader
                label="Unggah Foto Galeri Wisuda *"
                value={galleryImage}
                onChange={setGalleryImage}
                type="image"
                aspectRatio="wide"
                helperText="Pilih foto dokumentasi wisuda dari galeri."
              />

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#CAAA98] mb-1">
                    Keterangan / Caption Foto *
                  </label>
                  <input
                    type="text"
                    required
                    value={galleryCaption}
                    onChange={(e) => setGalleryCaption(e.target.value)}
                    placeholder="Contoh: Pengalungan Medali Kelulusan oleh Kepala Sekolah"
                    className="w-full px-3.5 py-2.5 bg-[#202940] border border-[#4B4038] focus:border-[#CAAA98] rounded-xl text-xs text-white placeholder-[#9A8678] focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingGallery(false);
                      setGalleryEditingId(null);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-[#4B4038] text-xs text-[#9A8678] hover:text-white cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#CAAA98] hover:bg-[#CAAA98]/90 text-[#202940] rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{galleryEditingId ? 'Perbarui Foto' : 'Simpan ke Galeri'}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Grid Foto Galeri Wisuda */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {graduationData.gallery.map((item) => (
            <div
              key={item.id}
              className="rounded-xl overflow-hidden bg-[#202940] border border-[#4B4038] group relative flex flex-col justify-between"
            >
              <div className="aspect-video w-full overflow-hidden bg-black/40 relative">
                <img
                  src={item.image}
                  alt={item.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-2 flex-1 flex flex-col justify-between">
                <p className="text-[11px] text-[#CAAA98] font-medium line-clamp-2 mb-2">
                  {item.caption}
                </p>

                <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-[#4B4038]/50">
                  <button
                    type="button"
                    onClick={() => handleStartEditGallery(item)}
                    className="p-1.5 rounded-md bg-[#4B4038]/60 hover:bg-[#4B4038] text-[#CAAA98] hover:text-white transition-colors cursor-pointer"
                    title="Edit caption/foto"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Hapus foto ini dari galeri wisuda?')) {
                        deleteGraduationGallery(item.id);
                      }
                    }}
                    className="p-1.5 rounded-md bg-red-950/40 hover:bg-red-900/80 text-red-300 transition-colors cursor-pointer"
                    title="Hapus foto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
