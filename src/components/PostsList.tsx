import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Calendar, MapPin, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import CreatePostDialog from './CreatePostDialog';
import CommentsSection from './CommentsSection';
import ReactionsBar from './ReactionsBar';
import { downloadICS } from '@/lib/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  is_event?: boolean;
  event_date?: string;
  event_end_date?: string;
  event_location?: string;
  event_description?: string;
}

const PostsList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
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

  const onPostUpdated = (updatedPost: Post) => {
    setPosts(posts.map(post => post.id === updatedPost.id ? updatedPost : post));
    setEditingPost(null);
  };

  const deletePost = async (postId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este post?')) return;
    
    try {
      const { error } = await (supabase as any)
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleAddToCalendar = (post: Post) => {
    if (!post.is_event || !post.event_date) return;

    const startDate = new Date(post.event_date);
    const endDate = post.event_end_date ? new Date(post.event_end_date) : new Date(startDate.getTime() + 60 * 60 * 1000);

    downloadICS({
      title: post.title,
      description: post.event_description || post.content.replace(/<[^>]*>/g, ''), // Strip HTML tags
      location: post.event_location,
      startDate,
      endDate,
      uid: `post-${post.id}@app.com`
    });
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
        <h2 className="text-3xl font-bold">Nuestras conversaciones secretas</h2>
        {isAdmin && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva conversación
          </Button>
        )}
      </div>

      {posts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-xl font-semibold mb-2">No hay posts aún</h3>
            <p className="text-muted-foreground mb-4">
              {isAdmin 
                ? 'Sólo el ADMIN debería ver esto, avísele si lo ves tú' 
                : 'escríbele a horadelbocadillo@gmail.com'
              }
            </p>
            {isAdmin && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear primera conversación
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{post.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPost(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-neutral max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }} />
                
                {post.is_event && post.event_date && (
                  <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4" />
                      Evento
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      {format(new Date(post.event_date), "PPP 'a las' p", { locale: es })}
                      {post.event_end_date && (
                        <span> - {format(new Date(post.event_end_date), "p", { locale: es })}</span>
                      )}
                    </div>
                    {post.event_location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4" />
                        {post.event_location}
                      </div>
                    )}
                    {post.event_description && (
                      <p className="text-sm text-muted-foreground">
                        {post.event_description}
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddToCalendar(post)}
                      className="mt-2"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Añadir a calendario
                    </Button>
                  </div>
                )}
                
                <ReactionsBar postId={post.id} />
                <CommentsSection postId={post.id} />
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

      <CreatePostDialog 
        open={!!editingPost}
        onOpenChange={(open) => !open && setEditingPost(null)}
        onPostCreated={onPostUpdated}
        editPost={editingPost}
      />
    </div>
  );
};

export default PostsList;
