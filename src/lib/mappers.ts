import { Student, Moment, GraduationData, VideoMoment } from '../types';

export function mapStudentRow(row: any): Student {
  return {
    id: row.id,
    name: row.name,
    nickname: row.nickname,
    role: row.role,
    photo: row.photo,
    photoLarge: row.photo_large,
    photoSD: row.photo_sd,
    photoSMP: row.photo_smp,
    previousSchool: row.previous_school,
    currentSchool: row.current_school,
    birthPlaceDate: row.birth_place_date,
    address: row.address,
    hobby: row.hobby,
    dream: row.dream,
    message: row.message,
    impression: row.impression,
    instagram: row.instagram,
  };
}
export function mapMomentRow(row: any): Moment {
  return { id: row.id, title: row.title, image: row.image, date: row.date, tag: row.tag, story: row.story };
}
export function mapVideoRow(row: any): VideoMoment {
  return { id: row.id, title: row.title, description: row.description, videoUrl: row.video_url, posterUrl: row.poster_url, duration: row.duration, date: row.date };
}
export function mapGalleryRow(row: any): GraduationData['gallery'][number] {
  return { id: row.id, image: row.image, caption: row.caption };
}
export function mapGraduationInfo(row: any, graduates: string[], gallery: GraduationData['gallery']): GraduationData {
  return { mainBanner: row.main_banner, title: row.title, cohortName: row.cohort_name, date: row.date, location: row.location, description: row.description, graduates, gallery };
}
export function toStudentRow(s: Student) {
  return { id: s.id, name: s.name, nickname: s.nickname, role: s.role, photo: s.photo, photo_large: s.photoLarge, photo_sd: s.photoSD, photo_smp: s.photoSMP, previous_school: s.previousSchool, current_school: s.currentSchool, birth_place_date: s.birthPlaceDate, address: s.address, hobby: s.hobby, dream: s.dream, message: s.message, impression: s.impression, instagram: s.instagram };
}
export function toMomentRow(m: Moment) {
  return { id: m.id, title: m.title, image: m.image, date: m.date, tag: m.tag, story: m.story };
}
export function toVideoRow(v: VideoMoment) {
  return { id: v.id, title: v.title, description: v.description, video_url: v.videoUrl, poster_url: v.posterUrl, duration: v.duration, date: v.date };
}
