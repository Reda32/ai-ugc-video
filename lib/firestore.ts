import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

// --- User ---
export interface UserDoc {
  uid: string;
  email: string;
  credits: number;
}

export async function getUser(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

export async function updateCredits(uid: string, credits: number): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { credits });
}

// --- Templates ---
export interface Template {
  id: string;
  title: string;
  description: string;
  preview_url: string;
  cost: number;
}

export async function getTemplates(): Promise<Template[]> {
  const snap = await getDocs(collection(db, 'templates'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Template));
}

export async function getTemplate(id: string): Promise<Template | null> {
  const snap = await getDoc(doc(db, 'templates', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Template) : null;
}

export async function addTemplate(data: Omit<Template, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'templates'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// --- Videos ---
export type VideoStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface VideoDoc {
  id: string;
  user_id: string;
  template_id: string;
  face_url: string;
  output_url: string;
  status: VideoStatus;
  createdAt: DocumentData;
}

export async function getUserVideos(uid: string): Promise<VideoDoc[]> {
  const q = query(
    collection(db, 'videos'),
    where('user_id', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as VideoDoc));
}

export async function createVideoDoc(data: {
  user_id: string;
  template_id: string;
  face_url: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, 'videos'), {
    ...data,
    output_url: '',
    status: 'pending' as VideoStatus,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateVideoDoc(
  videoId: string,
  data: Partial<{ status: VideoStatus; output_url: string }>
): Promise<void> {
  await updateDoc(doc(db, 'videos', videoId), data);
}
