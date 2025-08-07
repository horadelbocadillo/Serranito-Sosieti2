import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from './RichTextEditor';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated: (post: any) => void;
  editPost?: any;
}

// Zod schema de validación
const postSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  content: z.string().min(1, 'El contenido es obligatorio'),
});

type PostFormData = z.infer<typeof postSchema>;

const CreatePostDialog = ({ open, onOpenChange, onPostCreated, editPost }: CreatePostDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: ''
    }
  });

  useEffect(() => {
    if (editPost) {
      form.reset({
        title: editPost.title,
        content: editPost.content
      });
    } else {
      form.reset({
        title: '',
        content: ''
      });
    }
  }, [editPost, form]);

  const onSubmit = async (data: PostFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { data: userData, error: userError } = await (supabase as any)
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (userError) throw userError;

      let result;

     if (editPost) {
  const { data: updatedPost, error } = await (supabase as any)
    .from('posts')
    .update({
      title: data.title,
      content: data.content,
      updated_at: new Date().toISOString()
    })
    .eq('id', editPost.id)
    .select('*')
    .single();

  if (error) {
    console.error('Error actualizando post:', error);
    throw error;
  }

  result = updatedPost;
  console.log('Post actualizado:', result);
}

        result = updatedPosts[0];
      } else {
        const { data: newPost, error } = await (supabase as any)
          .from('posts')
          .insert({
            title: data.title,
            content: data.content,
            author_id: userData.id
          })
          .select()
          .single();

        if (error) throw error;
        result = newPost;
      }

      toast({
        title: editPost ? 'Post actualizado' : 'Post creado',
        description: editPost ? 'El post se ha actualizado correctamente' : 'El post se ha publicado correctamente'
      });

      onPostCreated(result);
      form.reset();
    } catch (error) {
      console.error('Error creando/actualizando post:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el post',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editPost ? 'Editar Post' : 'Crear Nuevo Post'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Escribe el título del post..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

           <FormField
  control={form.control}
  name="content"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Contenido</FormLabel>
      <FormControl>
        <RichTextEditor
          placeholder="Escribe el contenido del post..."
          value={field.value || ''}
          onChange={(val) => field.onChange(val)}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? (editPost ? 'Actualizando...' : 'Publicando...')
                  : (editPost ? 'Actualizar Post' : 'Publicar Post')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
