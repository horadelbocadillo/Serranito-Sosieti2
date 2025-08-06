import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Reply } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  post_id: string;
}

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection = ({ postId }: CommentsSectionProps) => {
  const [userUUID, setUserUUID] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
  const fetchUserUUID = async () => {
    if (!user?.email) return;

    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (data?.id) {
      setUserUUID(data.id); // Guarda el UUID correcto
    } else {
      console.error('Error obteniendo UUID del usuario:', error);
    }
  };

  fetchUserUUID();
}, [user]);
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const submitComment = async (content: string, parentId: string | null = null) => {
    if (!userUUID || !content.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('comments')
        .insert({
          content: content.trim(),
          post_id: postId,
          user_id: userUUID,
          parent_id: parentId
        })
        .select()
        .single();

      if (error) throw error;
      
      setComments([...comments, data]);
      setNewComment('');
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = () => {
    submitComment(newComment);
  };

  const handleSubmitReply = (parentId: string) => {
    submitComment(replyContent, parentId);
  };

  const parentComments = comments.filter(comment => !comment.parent_id);
  const getReplies = (commentId: string) => 
    comments.filter(comment => comment.parent_id === commentId);

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        <span className="font-medium">Comentarios ({comments.length})</span>
      </div>

      {user && (
        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..."
            className="min-h-[80px]"
          />
          <Button 
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || loading}
            size="sm"
          >
            Comentar
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {parentComments.map((comment) => {
          const replies = getReplies(comment.id);
          
          return (
            <div key={comment.id} className="space-y-2">
              <Card>
                <CardContent className="p-3">
                  <p className="text-sm">{comment.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString('es-ES')}
                    </span>
                    {user && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Responder
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {replyingTo === comment.id && (
                <div className="ml-6 space-y-2">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Escribe una respuesta..."
                    className="min-h-[60px]"
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={!replyContent.trim() || loading}
                    >
                      Responder
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setReplyingTo(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {replies.length > 0 && (
                <div className="ml-6 space-y-2">
                  {replies.map((reply) => (
                    <Card key={reply.id}>
                      <CardContent className="p-3">
                        <p className="text-sm">{reply.content}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(reply.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommentsSection;
