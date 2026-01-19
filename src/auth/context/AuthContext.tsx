import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { FirebaseAuth, googleProvider } from "../../firebase/config";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loginWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(FirebaseAuth, googleProvider);
    } catch (error: unknown) {
      console.error("Error al iniciar sesión con Google:", error);
      
      if (error instanceof FirebaseError) {
        const detailedError = new Error(error.message);
        (detailedError as any).code = error.code;
        throw detailedError;
      }
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error("Error desconocido al iniciar sesión con Google");
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(FirebaseAuth);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error al cerrar sesión:", error.message);
        throw error;
      }
      throw new Error("Error desconocido al cerrar sesión");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FirebaseAuth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    currentUser,
    loading,
    loginWithGoogle,
    logout,
  }), [currentUser, loading, loginWithGoogle, logout]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
