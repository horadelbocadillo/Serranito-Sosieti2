import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import PostsList from '@/components/PostsList';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir al quiz si el usuario no lo ha completado
    if (!loading && user && !user.serranito_completed) {
      navigate('/serranito-quiz');
    }
  }, [user, loading, navigate]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Estas dentro de Serranito Sosieti</h1>
          <p className="text-xl text-muted-foreground">
            Arrehuntate con ghente guena
          </p>
        </div>

        <PostsList />
      </div>
    </Layout>
  );
};

export default Index;
