import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DisplayNameModal from '@/components/DisplayNameModal';

interface User {
  email: string;
  id: string;
  display_name?: string;
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
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem('serranito_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setSession({ user: userData });
        setIsAdmin(userData.email === 'horadelbocadillo@gmail.com');
        
        // Check if user needs to set display_name
        if (!userData.display_name) {
          setShowDisplayNameModal(true);
        }
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

      // Get or create user in database
      let { data: existingUser, error: fetchError } = await (supabase as any)
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // User doesn't exist, create new user
        const { data: newUser, error: createError } = await (supabase as any)
          .from('users')
          .insert({
            email,
            last_login: new Date().toISOString(),
            is_admin: email === 'horadelbocadillo@gmail.com'
          })
          .select()
          .single();

        if (createError) {
          return { error: 'Error al crear el usuario' };
        }
        existingUser = newUser;
      } else if (fetchError) {
        return { error: 'Error al verificar usuario' };
      } else {
        // Update last login
        await (supabase as any)
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('email', email);
      }

      // Create user object with database data
      const userData: User = {
        email,
        id: existingUser.id,
        display_name: existingUser.display_name
      };

      // Store user in localStorage
      localStorage.setItem('serranito_user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setSession({ user: userData });
      setIsAdmin(existingUser.is_admin || false);

      // Check if user needs to set display_name
      if (!existingUser.display_name) {
        setShowDisplayNameModal(true);
      }

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
    setShowDisplayNameModal(false);
  };

  const handleDisplayNameComplete = (displayName: string) => {
    if (user) {
      const updatedUser = { ...user, display_name: displayName };
      localStorage.setItem('serranito_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSession({ user: updatedUser });
    }
    setShowDisplayNameModal(false);
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
      {showDisplayNameModal && user && (
        <DisplayNameModal
          isOpen={showDisplayNameModal}
          userEmail={user.email}
          onComplete={handleDisplayNameComplete}
        />
      )}
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