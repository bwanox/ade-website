"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as fbSignOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface UserData {
  uid: string;
  email: string | null;
  role: string;
  clubId?: string;
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
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        console.log('[Auth] Firestore userDoc', userDoc.exists() ? userDoc.data() : null);
        if (userDoc.exists()) {
          setUserData({ uid: firebaseUser.uid, email: firebaseUser.email, ...userDoc.data() } as UserData);
        } else {
          setUserData(null);
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
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    console.log('[Auth] signOut called');
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
