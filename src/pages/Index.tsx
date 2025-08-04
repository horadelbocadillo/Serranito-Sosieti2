import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { isAdmin } = useAuth();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Bienvenido al Serranito Society</h1>
          <p className="text-xl text-muted-foreground">
            {isAdmin ? 'Panel de administración disponible' : 'Arrehúntate con ghente güena'}
          </p>
        </div>
        
        <div className="bg-card rounded-lg p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">Próximamente</h2>
          <p className="text-muted-foreground">
            Aquí aparecerán los posts del blog una vez implementemos la funcionalidad.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
