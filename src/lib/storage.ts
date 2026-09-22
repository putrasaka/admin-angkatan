import { supabase, isSupabaseConfigured } from './supabase';

// Upload to Supabase Storage bucket 'media' if configured, else fallback to base64 (handled by caller)
export async function uploadToStorage(file: File, folder: string = 'media'): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(path, file, { upsert: false });
    if (error) {
      console.warn('Storage upload failed, fallback to base64', error.message);
      return null;
    }
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.warn('Storage exception', e);
    return null;
  }
}
