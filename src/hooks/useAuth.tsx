import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if user is admin
          setIsAdmin(session.user.email === 'horadelbocadillo@gmail.com');
          
          // Create or update user record
          setTimeout(async () => {
            const { error } = await (supabase as any)
              .from('users')
              .upsert({
                email: session.user.email!,
                display_name: session.user.email!.split('@')[0],
                last_login: new Date().toISOString()
              });
            
            if (error) console.error('Error upserting user:', error);
          }, 0);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsAdmin(session.user.email === 'horadelbocadillo@gmail.com');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // First, get the common password from config
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

      // Use the email as both email and password for Supabase auth
      // Since we're using a common password system, we'll use the email as the unique identifier
      const { error } = await supabase.auth.signUp({
        email,
        password: email + '_clubpass', // Create a unique password per user for Supabase
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error && error.message.includes('already registered')) {
        // If user already exists, sign them in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: email + '_clubpass'
        });
        
        if (signInError) {
          return { error: 'Error al iniciar sesión' };
        }
      } else if (error) {
        return { error: 'Error al crear la cuenta' };
      }

      return { error: null };
    } catch (error) {
      return { error: 'Error inesperado' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
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