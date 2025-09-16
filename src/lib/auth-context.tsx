"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as fbSignOut, User, getIdTokenResult } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface UserData {
  uid: string;
  email: string | null;
  role: string;
  clubId?: string;
  // You can add non-security/display-only fields here from Firestore, but do not trust for authz
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[Auth] onAuthStateChanged', firebaseUser);
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // Get custom claims from the ID token (source of truth for role/clubId)
          const tokenResult = await getIdTokenResult(firebaseUser, true);
          const claims = tokenResult?.claims as any;
          const role = (claims?.role as string) || 'user';
          const clubId = claims?.clubId as string | undefined;

          // Optionally read Firestore user doc for display-only fields
          let displayData: Record<string, any> | null = null;
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            console.log('[Auth] Firestore userDoc', userDoc.exists() ? userDoc.data() : null);
            if (userDoc.exists()) displayData = userDoc.data();
          } catch (e) {
            console.warn('[Auth] Failed to load Firestore user doc', e);
          }

          // Never trust role/clubId from Firestore; always take them from claims
          setUserData({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role,
            ...(clubId ? { clubId } : {}),
            // merge only safe/display fields if needed
            ...(displayData ? Object.fromEntries(Object.entries(displayData).filter(([k]) => k !== 'role' && k !== 'clubId')) : {}),
          } as UserData);
        } catch (e) {
          console.error('[Auth] Failed to get token claims', e);
          setUserData({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'user' });
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    console.log('[Auth] signIn called', email);
    await signInWithEmailAndPassword(auth, email, password);
    try {
      const idToken = await auth.currentUser?.getIdToken(true);
      if (idToken) {
        // Fetch CSRF token and send it
        const csrf = await fetch('/api/csrf', { cache: 'no-store' }).then(r => r.json()).catch(() => null);
        await fetch('/api/session/login', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...(csrf?.token ? { 'x-csrf-token': csrf.token } : {}) },
          body: JSON.stringify({ idToken }),
          credentials: 'same-origin',
        });
      }
    } catch (e) {
      console.error('[Auth] Failed to establish server session', e);
    }
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    console.log('[Auth] signOut called');
    try {
      const csrf = await fetch('/api/csrf', { cache: 'no-store' }).then(r => r.json()).catch(() => null);
      await fetch('/api/session/logout', { method: 'POST', credentials: 'same-origin', headers: csrf?.token ? { 'x-csrf-token': csrf.token } : {} });
    } catch (e) {
      console.warn('[Auth] Failed to clear server session cookie', e);
    }
    await fbSignOut(auth);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
