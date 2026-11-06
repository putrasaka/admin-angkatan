import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Student, Moment, GraduationData, VideoMoment } from '../types';
import { STUDENTS, MOMENTS_FEED, GRADUATION_DATA, VIDEO_MOMENTS } from '../data/dummyData';
import { mapStudentRow, mapMomentRow, mapVideoRow, mapGalleryRow, mapGraduationInfo, toStudentRow, toMomentRow, toVideoRow } from '../lib/mappers';
import { adminOp, getToken } from '../lib/api';

export interface ToastNotification { id: string; message: string; type: 'success' | 'error' | 'info'; }

interface DataContextType {
  students: Student[]; moments: Moment[]; graduationData: GraduationData; videoMoments: VideoMoment[];
  isLoading: boolean; isApiConfigured: boolean;
  addMoment: (moment: Omit<Moment, 'id'>) => Promise<void>;
  updateMoment: (id: string, updated: Partial<Moment>) => Promise<void>;
  deleteMoment: (id: string) => Promise<void>;
  addVideoMoment: (video: Omit<VideoMoment, 'id'>) => Promise<void>;
  updateVideoMoment: (id: string, updated: Partial<VideoMoment>) => Promise<void>;
  deleteVideoMoment: (id: string) => Promise<void>;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, updated: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  updateGraduationInfo: (info: Partial<Omit<GraduationData, 'gallery' | 'graduates'>>) => Promise<void>;
  updateGraduatesList: (names: string[]) => Promise<void>;
  addGraduationGraduate: (name: string) => Promise<void>;
  removeGraduationGraduate: (index: number) => Promise<void>;
  addGraduationGallery: (photo: { image: string; caption: string }) => Promise<void>;
  updateGraduationGallery: (id: string, photo: Partial<{ image: string; caption: string }>) => Promise<void>;
  deleteGraduationGallery: (id: string) => Promise<void>;
  resetToDefaultData: () => Promise<void>;
  toasts: ToastNotification[]; dismissToast: (id: string) => void; showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(STUDENTS);
  const [moments, setMoments] = useState<Moment[]>(MOMENTS_FEED);
  const [graduationData, setGraduationData] = useState<GraduationData>(GRADUATION_DATA);
  const [videoMoments, setVideoMoments] = useState<VideoMoment[]>(VIDEO_MOMENTS);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismissToast(id), 4000);
  };
  const dismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const reportError = (err: unknown) => showToast((err as Error).message || 'Terjadi kesalahan', 'error');

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setStudents((data.students ?? []).map(mapStudentRow));
      setMoments((data.moments ?? []).map(mapMomentRow));
      setVideoMoments((data.videos ?? []).map(mapVideoRow));

      const graduates = data.graduates ?? [];
      const gallery = (data.gallery ?? []).map(mapGalleryRow);
      setGraduationData(
        data.graduationInfo
          ? mapGraduationInfo(data.graduationInfo, graduates, gallery)
          : { ...GRADUATION_DATA, graduates, gallery }
      );

      setIsApiConfigured(true);
      setDataReady(true);
    } catch (err) {
      console.error(err);
      setIsApiConfigured(false);
      setDataReady(false);
      showToast('Gagal memuat data dari server', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const ensureApi = () => {
    if (!getToken()) {
      showToast('Sesi login habis. Silakan login ulang.', 'error');
      return false;
    }
    if (!dataReady) {
      showToast('Data belum termuat dari server.', 'error');
      return false;
    }
    return true;
  };

  // --- STUDENTS ---
  const addStudent = async (data: Omit<Student, 'id'>) => {
    if (!ensureApi()) return;
    const newStudent: Student = { ...data, id: `std-${Date.now()}` };
    setStudents((p) => [...p, newStudent]);
    try {
      await adminOp({ table: 'students', op: 'insert', row: toStudentRow(newStudent) });
      showToast(`Biodata "${newStudent.name}" berhasil ditambah!`);
    } catch (err) { reportError(err); }
  };
  const updateStudent = async (id: string, updated: Partial<Student>) => {
    if (!ensureApi()) return;
    setStudents((p) => p.map((s) => s.id === id ? { ...s, ...updated } : s));
    const row: any = {};
    if (updated.name !== undefined) row.name = updated.name;
    if (updated.nickname !== undefined) row.nickname = updated.nickname;
    if (updated.role !== undefined) row.role = updated.role;
    if (updated.photo !== undefined) row.photo = updated.photo;
    if (updated.photoLarge !== undefined) row.photo_large = updated.photoLarge;
    if (updated.photoSD !== undefined) row.photo_sd = updated.photoSD;
    if (updated.photoSMP !== undefined) row.photo_smp = updated.photoSMP;
    if (updated.previousSchool !== undefined) row.previous_school = updated.previousSchool;
    if (updated.currentSchool !== undefined) row.current_school = updated.currentSchool;
    if (updated.birthPlaceDate !== undefined) row.birth_place_date = updated.birthPlaceDate;
    if (updated.address !== undefined) row.address = updated.address;
    if (updated.hobby !== undefined) row.hobby = updated.hobby;
    if (updated.dream !== undefined) row.dream = updated.dream;
    if (updated.message !== undefined) row.message = updated.message;
    if (updated.impression !== undefined) row.impression = updated.impression;
    if (updated.instagram !== undefined) row.instagram = updated.instagram;
    try {
      await adminOp({ table: 'students', op: 'update', id, row });
      showToast('Biodata diperbarui!');
    } catch (err) { reportError(err); }
  };
  const deleteStudent = async (id: string) => {
    if (!ensureApi()) return;
    const target = students.find((s) => s.id === id);
    setStudents((p) => p.filter((s) => s.id !== id));
    try {
      await adminOp({ table: 'students', op: 'delete', id });
      showToast(`Profil "${target?.name}" dihapus.`, 'info');
    } catch (err) { reportError(err); }
  };

  // --- MOMENTS ---
  const addMoment = async (data: Omit<Moment, 'id'>) => {
    if (!ensureApi()) return;
    const nm: Moment = { ...data, id: `mom-${Date.now()}` };
    setMoments((p) => [nm, ...p]);
    try {
      await adminOp({ table: 'moments', op: 'insert', row: toMomentRow(nm) });
      showToast(`Momen "${nm.title}" ditambah!`);
    } catch (err) { reportError(err); }
  };
  const updateMoment = async (id: string, updated: Partial<Moment>) => {
    if (!ensureApi()) return;
    setMoments((p) => p.map((m) => m.id === id ? { ...m, ...updated } : m));
    const row: any = {};
    if (updated.title !== undefined) row.title = updated.title;
    if (updated.image !== undefined) row.image = updated.image;
    if (updated.date !== undefined) row.date = updated.date;
    if (updated.story !== undefined) row.story = updated.story;
    if (updated.tag !== undefined) row.tag = updated.tag;
    try {
      await adminOp({ table: 'moments', op: 'update', id, row });
      showToast('Momen diperbarui!');
    } catch (err) { reportError(err); }
  };
  const deleteMoment = async (id: string) => {
    if (!ensureApi()) return;
    const t = moments.find((m) => m.id === id);
    setMoments((p) => p.filter((m) => m.id !== id));
    try {
      await adminOp({ table: 'moments', op: 'delete', id });
      showToast(`Momen "${t?.title}" dihapus.`, 'info');
    } catch (err) { reportError(err); }
  };

  // --- VIDEOS ---
  const addVideoMoment = async (data: Omit<VideoMoment, 'id'>) => {
    if (!ensureApi()) return;
    const nv: VideoMoment = { ...data, id: `vid-${Date.now()}` };
    setVideoMoments((p) => [nv, ...p]);
    try {
      await adminOp({ table: 'video_moments', op: 'insert', row: toVideoRow(nv) });
      showToast(`Video "${nv.title}" ditambah!`);
    } catch (err) { reportError(err); }
  };
  const updateVideoMoment = async (id: string, updated: Partial<VideoMoment>) => {
    if (!ensureApi()) return;
    setVideoMoments((p) => p.map((v) => v.id === id ? { ...v, ...updated } : v));
    const row: any = {};
    if (updated.title !== undefined) row.title = updated.title;
    if (updated.videoUrl !== undefined) row.video_url = updated.videoUrl;
    if (updated.posterUrl !== undefined) row.poster_url = updated.posterUrl;
    if (updated.duration !== undefined) row.duration = updated.duration;
    if (updated.date !== undefined) row.date = updated.date;
    if (updated.description !== undefined) row.description = updated.description;
    try {
      await adminOp({ table: 'video_moments', op: 'update', id, row });
      showToast('Video diperbarui!');
    } catch (err) { reportError(err); }
  };
  const deleteVideoMoment = async (id: string) => {
    if (!ensureApi()) return;
    const t = videoMoments.find((v) => v.id === id);
    setVideoMoments((p) => p.filter((v) => v.id !== id));
    try {
      await adminOp({ table: 'video_moments', op: 'delete', id });
      showToast(`Video "${t?.title}" dihapus.`, 'info');
    } catch (err) { reportError(err); }
  };

  // --- GRADUATION ---
  const updateGraduationInfo = async (info: Partial<Omit<GraduationData, 'gallery' | 'graduates'>>) => {
    if (!ensureApi()) return;
    setGraduationData((p) => ({ ...p, ...info }));
    const row: any = {};
    if (info.mainBanner !== undefined) row.main_banner = info.mainBanner;
    if (info.title !== undefined) row.title = info.title;
    if (info.cohortName !== undefined) row.cohort_name = info.cohortName;
    if (info.date !== undefined) row.date = info.date;
    if (info.location !== undefined) row.location = info.location;
    if (info.description !== undefined) row.description = info.description;
    try {
      await adminOp({ table: 'graduation_info', op: 'update', id: '1', row });
      showToast('Info wisuda diperbarui!');
    } catch (err) { reportError(err); }
  };
  const updateGraduatesList = async (names: string[]) => {
    if (!ensureApi()) return;
    setGraduationData((p) => ({ ...p, graduates: names }));
    try {
      await adminOp({
        table: 'graduates',
        op: 'replace',
        rows: names.map((name, idx) => ({ name, position: idx + 1 })),
      });
      showToast('Daftar wisudawan diperbarui!');
    } catch (err) { reportError(err); }
  };
  const addGraduationGraduate = async (name: string) => {
    if (!name.trim()) return;
    if (!ensureApi()) return;
    const next = [...graduationData.graduates, name.trim()];
    setGraduationData((p) => ({ ...p, graduates: next }));
    try {
      await adminOp({ table: 'graduates', op: 'insert', row: { name: name.trim(), position: next.length } });
      showToast('Wisudawan ditambah!');
    } catch (err) { reportError(err); }
  };
  const removeGraduationGraduate = async (index: number) => {
    if (!ensureApi()) return;
    const name = graduationData.graduates[index];
    const next = graduationData.graduates.filter((_, i) => i !== index);
    setGraduationData((p) => ({ ...p, graduates: next }));
    try {
      await adminOp({
        table: 'graduates',
        op: 'replace',
        rows: next.map((n, i) => ({ name: n, position: i + 1 })),
      });
      showToast(`"${name}" dihapus`, 'info');
    } catch (err) { reportError(err); }
  };
  const addGraduationGallery = async (photo: { image: string; caption: string }) => {
    if (!ensureApi()) return;
    const id = `grad-${Date.now()}`;
    setGraduationData((p) => ({ ...p, gallery: [...p.gallery, { id, ...photo }] }));
    try {
      await adminOp({
        table: 'graduation_gallery',
        op: 'insert',
        row: { id, image: photo.image, caption: photo.caption },
      });
      showToast('Foto galeri ditambah!');
    } catch (err) { reportError(err); }
  };
  const updateGraduationGallery = async (id: string, photo: Partial<{ image: string; caption: string }>) => {
    if (!ensureApi()) return;
    setGraduationData((p) => ({ ...p, gallery: p.gallery.map((g) => g.id === id ? { ...g, ...photo } : g) }));
    const row: any = {};
    if (photo.image !== undefined) row.image = photo.image;
    if (photo.caption !== undefined) row.caption = photo.caption;
    try {
      await adminOp({ table: 'graduation_gallery', op: 'update', id, row });
      showToast('Foto diperbarui!');
    } catch (err) { reportError(err); }
  };
  const deleteGraduationGallery = async (id: string) => {
    if (!ensureApi()) return;
    setGraduationData((p) => ({ ...p, gallery: p.gallery.filter((g) => g.id !== id) }));
    try {
      await adminOp({ table: 'graduation_gallery', op: 'delete', id });
      showToast('Foto dihapus.', 'info');
    } catch (err) { reportError(err); }
  };

  const resetToDefaultData = async () => {
    showToast('Untuk reset data, jalankan db/seed.sql di Neon (repo public).', 'info');
  };

  return (
    <DataContext.Provider value={{ students, moments, graduationData, videoMoments, isLoading, isApiConfigured, addMoment, updateMoment, deleteMoment, addVideoMoment, updateVideoMoment, deleteVideoMoment, addStudent, updateStudent, deleteStudent, updateGraduationInfo, updateGraduatesList, addGraduationGraduate, removeGraduationGraduate, addGraduationGallery, updateGraduationGallery, deleteGraduationGallery, resetToDefaultData, toasts, dismissToast, showToast, refresh: fetchAll }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataStore = () => {
  const c = useContext(DataContext);
  if (!c) throw new Error('useDataStore must be used within a DataProvider');
  return c;
};
