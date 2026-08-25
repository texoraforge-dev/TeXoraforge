/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';

// Default Firebase credentials from provisioning
const firebaseConfig = {
  projectId: "gen-lang-client-0346532684",
  appId: "1:626116306791:web:6321c270ccc62ca1bd31c2",
  apiKey: "AIzaSyADti05pdzIjoSZyLlyczREXLd0rjX1jXg",
  authDomain: "gen-lang-client-0346532684.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-remixtexoraforge-93206435-4953-4da8-92b5-de7539ed824a",
  storageBucket: "gen-lang-client-0346532684.firebasestorage.app",
  messagingSenderId: "626116306791",
  oAuthClientId: "626116306791-munsqpks22utcmlh5d1qrmlt9k9186u1.apps.googleusercontent.com"
};

// Initialize Firebase safely
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Authentication & Firestore instances
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});

export {
  app,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  firebaseSignOut,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
};

export type { FirebaseUser, DocumentData };
