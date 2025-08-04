import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  display_name: string;
  is_admin: boolean;
  last_login: string;
  created_at: string;
}

const UsersPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : users.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No hay usuarios registrados
              </p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.email}</h3>
                        {user.is_admin && (
                          <Badge variant="default">Admin</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Nombre: {user.display_name || 'Sin nombre'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Registrado: {new Date(user.created_at).toLocaleDateString('es-ES')}
                      </p>
                      {user.last_login && (
                        <p className="text-sm text-muted-foreground">
                          Último acceso: {new Date(user.last_login).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UsersPanel;