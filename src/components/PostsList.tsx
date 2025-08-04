import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import CreatePostDialog from './CreatePostDialog';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
}

const PostsList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onPostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
    setShowCreateDialog(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Posts del Blog</h2>
        {isAdmin && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Nuevo Post
          </Button>
        )}
      </div>

      {posts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-xl font-semibold mb-2">No hay posts aún</h3>
            <p className="text-muted-foreground mb-4">
              {isAdmin 
                ? 'Sé el primero en crear un post para la comunidad' 
                : 'Los posts aparecerán aquí cuando los administradores los publiquen'
              }
            </p>
            {isAdmin && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Post
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{post.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreatePostDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onPostCreated={onPostCreated}
      />
    </div>
  );
};

export default PostsList;