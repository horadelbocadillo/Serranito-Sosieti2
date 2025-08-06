import Layout from '@/components/Layout';
import PostsList from '@/components/PostsList';

const Index = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Estás dentro de Serranito Sosieti</h1>
          <p className="text-xl text-muted-foreground">
            Arrehúntate con ghente güena
          </p>
        </div>
        
        <PostsList />
      </div>
    </Layout>
  );
};

export default Index;
