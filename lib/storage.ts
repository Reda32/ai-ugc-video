import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadFaceImage(userId: string, file: File): Promise<string> {
  const storageRef = ref(storage, `faces/${userId}/image.jpg`);
  await uploadBytes(storageRef, file, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}

export async function uploadPreviewVideo(templateId: string, file: File): Promise<string> {
  const storageRef = ref(storage, `templates/${templateId}/preview.mp4`);
  await uploadBytes(storageRef, file, { contentType: 'video/mp4' });
  return getDownloadURL(storageRef);
}
