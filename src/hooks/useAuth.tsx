import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  email: string;
  id: string;
}

interface AuthContextType {
  user: User | null;
  session: { user: User } | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem('serranito_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setSession({ user: userData });
        setIsAdmin(userData.email === 'horadelbocadillo@gmail.com');
      } catch (error) {
        localStorage.removeItem('serranito_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Get the common password from config
      const { data: configData, error: configError } = await (supabase as any)
        .from('config')
        .select('value')
        .eq('key', 'common_password')
        .single();

      if (configError || !configData) {
        return { error: 'Error al verificar la configuración' };
      }

      // Check if the provided password matches the common password
      if (password !== (configData as any).value) {
        return { error: 'Contraseña incorrecta' };
      }

      // Create user object and store in localStorage
      const userData: User = {
        email,
        id: email // Use email as ID for simplicity
      };

      // Store user in localStorage
      localStorage.setItem('serranito_user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setSession({ user: userData });
      setIsAdmin(email === 'horadelbocadillo@gmail.com');

      // Create or update user record in database
      await (supabase as any)
        .from('users')
        .upsert({
          email,
          display_name: email.split('@')[0],
          last_login: new Date().toISOString(),
          is_admin: email === 'horadelbocadillo@gmail.com'
        });

      return { error: null };
    } catch (error) {
      return { error: 'Error inesperado' };
    }
  };

  const logout = async () => {
    // Clear localStorage and state
    localStorage.removeItem('serranito_user');
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAdmin,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}