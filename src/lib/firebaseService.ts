/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  auth,
  db,
  googleAuthProvider,
  signInWithPopup,
  firebaseSignOut,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  FirebaseUser
} from './firebase';
import { User, School, Student, GeneratedAIMediaItem } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Info:', JSON.stringify(errInfo));
  return errInfo;
}

export class FirebaseService {
  /**
   * Google Sign-in with Firebase Auth
   */
  static async signInWithGoogle(): Promise<{ user: FirebaseUser | null; error: Error | null }> {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      return { user: result.user, error: null };
    } catch (err: any) {
      console.error('Firebase Google Sign-In Error:', err);
      return { user: null, error: err };
    }
  }

  /**
   * Firebase Sign Out
   */
  static async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Firebase Sign Out Error:', err);
    }
  }

  /**
   * Save User Dark Mode / Theme Preference directly to Firestore Profile
   */
  static async saveUserThemePreference(userId: string, darkMode: boolean): Promise<void> {
    const path = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        id: userId,
        darkMode: darkMode,
        preferredTheme: darkMode ? 'dark' : 'light',
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  /**
   * Fetch User Dark Mode / Theme Preference from Firestore Profile
   */
  static async getUserThemePreference(userId: string): Promise<boolean | null> {
    const path = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        if (typeof data.darkMode === 'boolean') {
          return data.darkMode;
        }
        if (data.preferredTheme === 'dark') return true;
        if (data.preferredTheme === 'light') return false;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  }

  /**
   * Listen to real-time theme updates for a user profile
   */
  static listenToUserThemePreference(userId: string, onThemeChange: (darkMode: boolean) => void): () => void {
    const path = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      return onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (typeof data.darkMode === 'boolean') {
            onThemeChange(data.darkMode);
          } else if (data.preferredTheme === 'dark') {
            onThemeChange(true);
          } else if (data.preferredTheme === 'light') {
            onThemeChange(false);
          }
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, path);
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return () => {};
    }
  }

  /**
   * Sync or Save User Profile to Firestore
   */
  static async syncUserProfile(user: Partial<User> & { id: string }): Promise<void> {
    const path = `users/${user.id}`;
    try {
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, {
        ...user,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  /**
   * Get User Profile from Firestore
   */
  static async getUserProfile(userId: string): Promise<User | null> {
    const path = `users/${userId}`;
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as User;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      return null;
    }
  }

  /**
   * Save School to Firestore
   */
  static async saveSchool(school: School): Promise<void> {
    const path = `schools/${school.id}`;
    try {
      const schoolRef = doc(db, 'schools', school.id);
      await setDoc(schoolRef, {
        ...school,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  /**
   * Fetch All Schools from Firestore
   */
  static async getSchools(): Promise<School[]> {
    const path = 'schools';
    try {
      const colRef = collection(db, 'schools');
      const snap = await getDocs(colRef);
      return snap.docs.map(doc => doc.data() as School);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  }

  /**
   * Save AI Generated Media item (Image/Veo Video) to Firestore
   */
  static async saveAIMediaItem(item: GeneratedAIMediaItem): Promise<void> {
    const path = `ai_media/${item.id}`;
    try {
      const mediaRef = doc(db, 'ai_media', item.id);
      await setDoc(mediaRef, {
        ...item,
        timestamp: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  /**
   * Fetch AI Media history from Firestore
   */
  static async getAIMediaHistory(): Promise<GeneratedAIMediaItem[]> {
    const path = 'ai_media';
    try {
      const colRef = collection(db, 'ai_media');
      const snap = await getDocs(colRef);
      return snap.docs.map(doc => doc.data() as GeneratedAIMediaItem);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  }

  /**
   * Subscribe to real-time changes on collection
   */
  static subscribeToCollection<T>(
    collectionName: string,
    onData: (data: T[]) => void
  ): () => void {
    const path = collectionName;
    try {
      const colRef = collection(db, collectionName);
      const unsubscribe = onSnapshot(colRef, (snapshot) => {
        const items = snapshot.docs.map(doc => doc.data() as T);
        onData(items);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
      return unsubscribe;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return () => {};
    }
  }
}
