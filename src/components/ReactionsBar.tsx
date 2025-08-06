import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Reaction {
  id: string;
  emoji: string;
  user_id: string;
  post_id?: string;
  comment_id?: string;
}

interface ReactionsBarProps {
  postId?: string;
  commentId?: string;
}

const EMOJI_OPTIONS = ['👍', '👎', '❤️', '😀'];

const ReactionsBar = ({ postId, commentId }: ReactionsBarProps) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    fetchReactions();
  }, [postId, commentId]);

  const fetchReactions = async () => {
    try {
      let query = (supabase as any).from('reactions').select('*');
      
      if (postId) {
        query = query.eq('post_id', postId);
      }
      if (commentId) {
        query = query.eq('comment_id', commentId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setReactions(data || []);
      
      if (user) {
        const userEmojis = new Set<string>(
          (data || [])
            .filter((r: any) => r.user_id === user.id)
            .map((r: any) => r.emoji)
        );
        setUserReactions(userEmojis);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const toggleReaction = async (emoji: string) => {
    if (!user) return;

    try {
      const hasReacted = userReactions.has(emoji);
      
      if (hasReacted) {
        // Remove reaction
        const reaction = reactions.find(r => r.emoji === emoji && r.user_id === user.id);
        if (reaction) {
          const { error } = await (supabase as any)
            .from('reactions')
            .delete()
            .eq('id', reaction.id);
          
          if (error) throw error;
          
          setReactions(reactions.filter(r => r.id !== reaction.id));
          setUserReactions(prev => {
            const newSet = new Set(prev);
            newSet.delete(emoji);
            return newSet;
          });
        }
      } else {
        // Add reaction
        const newReaction = {
          emoji,
          user_id: user.id,
          ...(postId && { post_id: postId }),
          ...(commentId && { comment_id: commentId })
        };

        const { data, error } = await (supabase as any)
          .from('reactions')
          .insert(newReaction)
          .select()
          .single();
        
        if (error) throw error;
        
        setReactions([...reactions, data]);
        setUserReactions(prev => new Set([...prev, emoji]));
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const getEmojiCount = (emoji: string) => {
    return reactions.filter(r => r.emoji === emoji).length;
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      {EMOJI_OPTIONS.map((emoji) => {
        const count = getEmojiCount(emoji);
        const hasReacted = userReactions.has(emoji);
        
        return (
          <Button
            key={emoji}
            variant={hasReacted ? "secondary" : "ghost"}
            size="sm"
            onClick={() => toggleReaction(emoji)}
            disabled={!user}
            className="h-8 px-2"
          >
            <span className="mr-1">{emoji}</span>
            {count > 0 && <span className="text-xs">{count}</span>}
          </Button>
        );
      })}
    </div>
  );
};

export default ReactionsBar;