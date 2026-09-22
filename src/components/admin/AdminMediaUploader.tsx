import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Video as VideoIcon, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { convertImageFileToBase64, convertVideoFileToUrl } from '../../utils/mediaUtils';

interface AdminMediaUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  type?: 'image' | 'video';
  aspectRatio?: 'square' | 'wide' | 'banner' | 'avatar';
  helperText?: string;
}

export const AdminMediaUploader: React.FC<AdminMediaUploaderProps> = ({
  label,
  value,
  onChange,
  type = 'image',
  aspectRatio = 'wide',
  helperText,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      if (type === 'image') {
        const base64 = await convertImageFileToBase64(file);
        onChange(base64);
      } else {
        const videoUrl = await convertVideoFileToUrl(file);
        onChange(videoUrl);
      }
    } catch (err: unknown) {
      alert((err as Error).message || 'Gagal memproses file.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square max-w-[180px]';
      case 'avatar':
        return 'w-24 h-24 rounded-full';
      case 'banner':
        return 'aspect-[21/9] w-full max-h-[220px]';
      case 'wide':
      default:
        return 'aspect-video w-full max-h-[200px]';
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#CAAA98]">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-[#9A8678] hover:text-[#CAAA98] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          {showUrlInput ? 'Tutup Input URL' : 'Atau Masukkan URL'}
        </button>
      </div>

      {showUrlInput && (
        <div className="flex items-center gap-2 p-2 bg-[#202940] border border-[#4B4038] rounded-xl">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={`Tempel URL ${type === 'image' ? 'gambar (https://...)' : 'video (https://...)'}`}
            className="flex-1 text-xs bg-transparent text-white px-2 py-1 focus:outline-none placeholder-[#9A8678]"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-1 bg-[#CAAA98] text-[#202940] rounded-lg text-xs font-bold hover:bg-[#CAAA98]/90 transition-colors cursor-pointer"
          >
            Terapkan
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={type === 'image' ? 'image/*' : 'video/*'}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Preview or Upload Trigger Area */}
      {value ? (
        <div className="relative group border border-[#4B4038] rounded-2xl overflow-hidden bg-[#202940] p-1">
          <div className={`${getAspectClass()} mx-auto relative overflow-hidden rounded-xl bg-black/40 flex items-center justify-center`}>
            {type === 'image' ? (
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80';
                }}
              />
            ) : (
              <video
                src={value}
                controls
                className="w-full h-full object-cover"
              />
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2 text-xs text-[#CAAA98]">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memproses file...</span>
              </div>
            )}
          </div>

          {/* Action Overlay */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Ganti file media"
              className="p-1.5 rounded-lg bg-[#202940]/90 border border-[#4B4038] text-[#CAAA98] hover:text-white hover:bg-[#4B4038] transition-colors cursor-pointer shadow-md"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              title="Hapus media"
              className="p-1.5 rounded-lg bg-red-950/90 border border-red-800/60 text-red-300 hover:bg-red-900 transition-colors cursor-pointer shadow-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#4B4038] hover:border-[#CAAA98] rounded-2xl p-5 text-center cursor-pointer transition-colors bg-[#202940]/50 hover:bg-[#4B4038]/30 group flex flex-col items-center justify-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-[#4B4038] text-[#CAAA98] group-hover:scale-110 transition-transform flex items-center justify-center">
            {isProcessing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : type === 'image' ? (
              <ImageIcon className="w-5 h-5" />
            ) : (
              <VideoIcon className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-[#CAAA98]">
              {isProcessing ? 'Mengunggah & Mengompresi...' : `Klik untuk Pilih ${type === 'image' ? 'Foto' : 'Video'}`}
            </p>
            <p className="text-[11px] text-[#9A8678] mt-0.5">
              Dari Galeri HP / File Komputer ({type === 'image' ? 'JPG, PNG, WebP' : 'MP4, WebM'})
            </p>
          </div>
        </div>
      )}

      {helperText && <p className="text-[11px] text-[#9A8678]">{helperText}</p>}
    </div>
  );
};
