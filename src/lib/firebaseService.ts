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
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        id: userId,
        darkMode: darkMode,
        preferredTheme: darkMode ? 'dark' : 'light',
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore theme persistence notice:', err);
    }
  }

  /**
   * Fetch User Dark Mode / Theme Preference from Firestore Profile
   */
  static async getUserThemePreference(userId: string): Promise<boolean | null> {
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
      console.warn('Error reading user theme from Firestore:', err);
      return null;
    }
  }

  /**
   * Listen to real-time theme updates for a user profile
   */
  static listenToUserThemePreference(userId: string, onThemeChange: (darkMode: boolean) => void): () => void {
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
        console.warn('Firestore theme snapshot notice:', err);
      });
    } catch (err) {
      console.warn('Error setting up theme snapshot:', err);
      return () => {};
    }
  }

  /**
   * Sync or Save User Profile to Firestore
   */
  static async syncUserProfile(user: Partial<User> & { id: string }): Promise<void> {
    try {
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, {
        ...user,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('Error syncing user profile to Firestore:', err);
    }
  }

  /**
   * Get User Profile from Firestore
   */
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as User;
      }
      return null;
    } catch (err) {
      console.error('Error fetching user profile from Firestore:', err);
      return null;
    }
  }

  /**
   * Save School to Firestore
   */
  static async saveSchool(school: School): Promise<void> {
    try {
      const schoolRef = doc(db, 'schools', school.id);
      await setDoc(schoolRef, {
        ...school,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('Error saving school to Firestore:', err);
    }
  }

  /**
   * Fetch All Schools from Firestore
   */
  static async getSchools(): Promise<School[]> {
    try {
      const colRef = collection(db, 'schools');
      const snap = await getDocs(colRef);
      return snap.docs.map(doc => doc.data() as School);
    } catch (err) {
      console.error('Error fetching schools from Firestore:', err);
      return [];
    }
  }

  /**
   * Save AI Generated Media item (Image/Veo Video) to Firestore
   */
  static async saveAIMediaItem(item: GeneratedAIMediaItem): Promise<void> {
    try {
      const mediaRef = doc(db, 'ai_media', item.id);
      await setDoc(mediaRef, {
        ...item,
        timestamp: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error('Error persisting AI Media item to Firestore:', err);
    }
  }

  /**
   * Fetch AI Media history from Firestore
   */
  static async getAIMediaHistory(): Promise<GeneratedAIMediaItem[]> {
    try {
      const colRef = collection(db, 'ai_media');
      const snap = await getDocs(colRef);
      return snap.docs.map(doc => doc.data() as GeneratedAIMediaItem);
    } catch (err) {
      console.error('Error fetching AI Media items from Firestore:', err);
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
    try {
      const colRef = collection(db, collectionName);
      const unsubscribe = onSnapshot(colRef, (snapshot) => {
        const items = snapshot.docs.map(doc => doc.data() as T);
        onData(items);
      }, (error) => {
        console.warn(`Firestore subscription note for ${collectionName}:`, error);
      });
      return unsubscribe;
    } catch (err) {
      console.error(`Error setting up Firestore subscription for ${collectionName}:`, err);
      return () => {};
    }
  }
}
