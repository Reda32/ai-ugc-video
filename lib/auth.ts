import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuthInstance, getDbInstance } from './firebase';

export async function signUp(email: string, password: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(getAuthInstance(), email, password);
  await setDoc(doc(getDbInstance(), 'users', credential.user.uid), {
    uid: credential.user.uid,
    email,
    credits: 10,
    createdAt: serverTimestamp(),
  });
  return credential.user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(getAuthInstance(), email, password);
  return credential.user;
}

export async function logOut(): Promise<void> {
  await signOut(getAuthInstance());
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(getAuthInstance(), callback);
}
