import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Student, Moment, GraduationData, VideoMoment } from '../types';
import { STUDENTS, MOMENTS_FEED, GRADUATION_DATA, VIDEO_MOMENTS } from '../data/dummyData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapStudentRow, mapMomentRow, mapVideoRow, mapGalleryRow, mapGraduationInfo, toStudentRow, toMomentRow, toVideoRow } from '../lib/mappers';

export interface ToastNotification { id: string; message: string; type: 'success' | 'error' | 'info'; }

interface DataContextType {
  students: Student[]; moments: Moment[]; graduationData: GraduationData; videoMoments: VideoMoment[];
  isLoading: boolean; isSupabaseConfigured: boolean;
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
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismissToast(id), 4000);
  };
  const dismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const fetchAll = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setIsLoading(true);
    try {
      const [stuRes, momRes, gradInfoRes, graduatesRes, galleryRes, vidRes] = await Promise.all([
        supabase.from('students').select('*').order('created_at', { ascending: true }),
        supabase.from('moments').select('*').order('created_at', { ascending: true }),
        supabase.from('graduation_info').select('*').eq('id', 1).single(),
        supabase.from('graduates').select('*').order('position', { ascending: true }),
        supabase.from('graduation_gallery').select('*').order('created_at', { ascending: true }),
        supabase.from('video_moments').select('*').order('created_at', { ascending: true }),
      ]);
      if (stuRes.data) setStudents(stuRes.data.map(mapStudentRow));
      if (momRes.data) setMoments(momRes.data.map(mapMomentRow));
      if (vidRes.data) setVideoMoments(vidRes.data.map(mapVideoRow));
      const graduates = graduatesRes.data ? graduatesRes.data.map((r: any) => r.name) : GRADUATION_DATA.graduates;
      const gallery = galleryRes.data ? galleryRes.data.map(mapGalleryRow) : GRADUATION_DATA.gallery;
      if (gradInfoRes.data) setGraduationData(mapGraduationInfo(gradInfoRes.data, graduates, gallery));
      else setGraduationData({ ...GRADUATION_DATA, graduates, gallery });
    } catch (err) {
      console.error(err);
      showToast('Gagal sync Supabase', 'error');
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { if (isSupabaseConfigured) fetchAll(); }, [fetchAll]);

  // Fallback dummy if not configured — keep local state
  const ensureSupabase = () => {
    if (!isSupabaseConfigured || !supabase) {
      showToast('Supabase belum dikonfigurasi (isi ENV). Data hanya lokal.', 'info');
      return false;
    }
    return true;
  };

  // --- STUDENTS ---
  const addStudent = async (data: Omit<Student, 'id'>) => {
    const newStudent: Student = { ...data, id: `std-${Date.now()}` };
    setStudents((p) => [...p, newStudent]);
    if (!ensureSupabase()) { showToast(`Biodata "${newStudent.name}" ditambah (lokal)`, 'success'); return; }
    const { error } = await supabase!.from('students').insert(toStudentRow(newStudent));
    if (error) showToast(error.message, 'error'); else showToast(`Biodata "${newStudent.name}" berhasil ditambah!`);
  };
  const updateStudent = async (id: string, updated: Partial<Student>) => {
    setStudents((p) => p.map((s) => s.id === id ? { ...s, ...updated } : s));
    if (!ensureSupabase()) return;
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
    const { error } = await supabase!.from('students').update(row).eq('id', id);
    if (error) showToast(error.message, 'error'); else showToast('Biodata diperbarui!');
  };
  const deleteStudent = async (id: string) => {
    const target = students.find((s) => s.id === id);
    setStudents((p) => p.filter((s) => s.id !== id));
    if (!ensureSupabase()) { showToast(`Profil "${target?.name}" dihapus (lokal)`, 'info'); return; }
    const { error } = await supabase!.from('students').delete().eq('id', id);
    if (error) showToast(error.message, 'error'); else showToast(`Profil "${target?.name}" dihapus.`, 'info');
  };

  // --- MOMENTS ---
  const addMoment = async (data: Omit<Moment, 'id'>) => {
    const nm: Moment = { ...data, id: `mom-${Date.now()}` };
    setMoments((p) => [nm, ...p]);
    if (!ensureSupabase()) return;
    const { error } = await supabase!.from('moments').insert(toMomentRow(nm));
    if (error) showToast(error.message, 'error'); else showToast(`Momen "${nm.title}" ditambah!`);
  };
  const updateMoment = async (id: string, updated: Partial<Moment>) => {
    setMoments((p) => p.map((m) => m.id === id ? { ...m, ...updated } : m));
    if (!ensureSupabase()) return;
    const row: any = {}; if (updated.title !== undefined) row.title = updated.title; if (updated.image !== undefined) row.image = updated.image; if (updated.date !== undefined) row.date = updated.date; if (updated.story !== undefined) row.story = updated.story; if (updated.tag !== undefined) row.tag = updated.tag;
    const { error } = await supabase!.from('moments').update(row).eq('id', id);
    if (error) showToast(error.message, 'error'); else showToast('Momen diperbarui!');
  };
  const deleteMoment = async (id: string) => {
    const t = moments.find((m) => m.id === id);
    setMoments((p) => p.filter((m) => m.id !== id));
    if (!ensureSupabase()) return;
    const { error } = await supabase!.from('moments').delete().eq('id', id);
    if (error) showToast(error.message, 'error'); else showToast(`Momen "${t?.title}" dihapus.`, 'info');
  };

  // --- VIDEOS ---
  const addVideoMoment = async (data: Omit<VideoMoment, 'id'>) => {
    const nv: VideoMoment = { ...data, id: `vid-${Date.now()}` };
    setVideoMoments((p) => [nv, ...p]);
    if (!ensureSupabase()) return;
    const { error } = await supabase!.from('video_moments').insert(toVideoRow(nv));
    if (error) showToast(error.message, 'error'); else showToast(`Video "${nv.title}" ditambah!`);
  };
  const updateVideoMoment = async (id: string, updated: Partial<VideoMoment>) => {
    setVideoMoments((p) => p.map((v) => v.id === id ? { ...v, ...updated } : v));
    if (!ensureSupabase()) return;
    const row: any = {}; if (updated.title !== undefined) row.title = updated.title; if (updated.videoUrl !== undefined) row.video_url = updated.videoUrl; if (updated.posterUrl !== undefined) row.poster_url = updated.posterUrl; if (updated.duration !== undefined) row.duration = updated.duration; if (updated.date !== undefined) row.date = updated.date; if (updated.description !== undefined) row.description = updated.description;
    const { error } = await supabase!.from('video_moments').update(row).eq('id', id);
    if (error) showToast(error.message, 'error'); else showToast('Video diperbarui!');
  };
  const deleteVideoMoment = async (id: string) => {
    const t = videoMoments.find((v) => v.id === id);
    setVideoMoments((p) => p.filter((v) => v.id !== id));
    if (!ensureSupabase()) return;
    const { error } = await supabase!.from('video_moments').delete().eq('id', id);
    if (error) showToast(error.message, 'error'); else showToast(`Video "${t?.title}" dihapus.`, 'info');
  };

  // --- GRADUATION ---
  const updateGraduationInfo = async (info: Partial<Omit<GraduationData, 'gallery' | 'graduates'>>) => {
    setGraduationData((p) => ({ ...p, ...info }));
    if (!ensureSupabase()) return;
    const row: any = {}; if (info.mainBanner !== undefined) row.main_banner = info.mainBanner; if (info.title !== undefined) row.title = info.title; if (info.cohortName !== undefined) row.cohort_name = info.cohortName; if (info.date !== undefined) row.date = info.date; if (info.location !== undefined) row.location = info.location; if (info.description !== undefined) row.description = info.description;
    const { error } = await supabase!.from('graduation_info').update(row).eq('id', 1);
    if (error) showToast(error.message, 'error'); else showToast('Info wisuda diperbarui!');
  };
  const updateGraduatesList = async (names: string[]) => {
    setGraduationData((p) => ({ ...p, graduates: names }));
    if (!ensureSupabase()) return;
    await supabase!.from('graduates').delete().neq('id', 0);
    const rows = names.map((name, idx) => ({ name, position: idx + 1 }));
    if (rows.length) { const { error } = await supabase!.from('graduates').insert(rows); if (error) showToast(error.message, 'error'); }
    showToast('Daftar wisudawan diperbarui!');
  };
  const addGraduationGraduate = async (name: string) => {
    if (!name.trim()) return;
    const next = [...graduationData.graduates, name.trim()];
    setGraduationData((p) => ({ ...p, graduates: next }));
    if (!ensureSupabase()) return;
    const { error } = await supabase!.from('graduates').insert({ name: name.trim(), position: next.length });
    if (error) showToast(error.message, 'error'); else showToast('Wisudawan ditambah!');
  };
  const removeGraduationGraduate = async (index: number) => {
    const name = graduationData.graduates[index];
    const next = graduationData.graduates.filter((_, i) => i !== index);
    setGraduationData((p) => ({ ...p, graduates: next }));
    if (!ensureSupabase()) return;
    // simplest: delete and reinsert to fix positions
    await supabase!.from('graduates').delete().neq('id', 0);
    const rows = next.map((n, i) => ({ name: n, position: i + 1 }));
    if (rows.length) await supabase!.from('graduates').insert(rows);
    showToast(`"${name}" dihapus`, 'info');
  };
  const addGraduationGallery = async (photo: { image: string; caption: string }) => {
    const id = `grad-${Date.now()}`;
    setGraduationData((p) => ({ ...p, gallery: [...p.gallery, { id, ...photo }] }));
    if (!ensureSupabase()) return;
    const { error } = await supabase!.from('graduation_gallery').insert({ id, image: photo.image, caption: photo.caption });
    if (error) showToast(error.message, 'error'); else showToast('Foto galeri ditambah!');
  };
  const updateGraduationGallery = async (id: string, photo: Partial<{ image: string; caption: string }>) => {
    setGraduationData((p) => ({ ...p, gallery: p.gallery.map((g) => g.id === id ? { ...g, ...photo } : g) }));
    if (!ensureSupabase()) return;
    const row: any = {}; if (photo.image !== undefined) row.image = photo.image; if (photo.caption !== undefined) row.caption = photo.caption;
    const { error } = await supabase!.from('graduation_gallery').update(row).eq('id', id);
    if (error) showToast(error.message, 'error'); else showToast('Foto diperbarui!');
  };
  const deleteGraduationGallery = async (id: string) => {
    setGraduationData((p) => ({ ...p, gallery: p.gallery.filter((g) => g.id !== id) }));
    if (!ensureSupabase()) return;
    const { error } = await supabase!.from('graduation_gallery').delete().eq('id', id);
    if (error) showToast(error.message, 'error'); else showToast('Foto dihapus.', 'info');
  };

  const resetToDefaultData = async () => {
    if (!ensureSupabase()) { setStudents(STUDENTS); setMoments(MOMENTS_FEED); setGraduationData(GRADUATION_DATA); setVideoMoments(VIDEO_MOMENTS); showToast('Reset lokal', 'info'); return; }
    showToast('Reset via Supabase: jalankan seed.sql ulang', 'info');
  };

  return (
    <DataContext.Provider value={{ students, moments, graduationData, videoMoments, isLoading, isSupabaseConfigured, addMoment, updateMoment, deleteMoment, addVideoMoment, updateVideoMoment, deleteVideoMoment, addStudent, updateStudent, deleteStudent, updateGraduationInfo, updateGraduatesList, addGraduationGraduate, removeGraduationGraduate, addGraduationGallery, updateGraduationGallery, deleteGraduationGallery, resetToDefaultData, toasts, dismissToast, showToast, refresh: fetchAll }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataStore = () => {
  const c = useContext(DataContext);
  if (!c) throw new Error('useDataStore must be used within a DataProvider');
  return c;
};
