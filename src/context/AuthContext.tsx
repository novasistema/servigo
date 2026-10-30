import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from '../lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<User>;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  registerWithEmail: (email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
  requireAuth: (action: () => void, promptMessage?: string) => void;
  isAuthModalOpen: boolean;
  authModalMessage: string;
  closeAuthModal: () => void;
  openAuthModal: (msg?: string) => void;
  pendingAction: (() => void) | null;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['ajnovasistemas@gmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMessage, setAuthModalMessage] = useState<string>('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user && pendingAction) {
        pendingAction();
        setPendingAction(null);
        setIsAuthModalOpen(false);
      }
    });

    return unsubscribe;
  }, [pendingAction]);

  const isAdmin = Boolean(currentUser?.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase()));

  const loginWithGoogle = async (): Promise<User> => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  const loginWithEmail = async (email: string, pass: string): Promise<User> => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  };

  const registerWithEmail = async (email: string, pass: string): Promise<User> => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    return result.user;
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  };

  const openAuthModal = (msg?: string) => {
    setAuthModalMessage(msg || 'Inicia sesión para continuar');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingAction(null);
  };

  const requireAuth = (action: () => void, promptMessage?: string) => {
    if (currentUser) {
      action();
    } else {
      setPendingAction(() => action);
      openAuthModal(promptMessage || 'Por favor, inicia sesión para continuar con esta acción.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        loading,
        isAdmin,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        requireAuth,
        isAuthModalOpen,
        authModalMessage,
        closeAuthModal,
        openAuthModal,
        pendingAction,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
