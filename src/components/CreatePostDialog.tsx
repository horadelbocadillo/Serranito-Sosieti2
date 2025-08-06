import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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

interface PostFormData {
  title: string;
  content: string;
}

const CreatePostDialog = ({ open, onOpenChange, onPostCreated, editPost }: CreatePostDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<PostFormData>({
    defaultValues: {
      title: '',
      content: ''
    }
  });

  // Sincroniza el formulario si se edita un post existente
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
      // Buscar ID del autor
      const { data: userData, error: userError } = await (supabase as any)
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (userError) throw userError;

      let result;
     if (editPost) {
  // Actualizar post existente
  const { data: updatedPosts, error } = await (supabase as any)
    .from('posts')
    .update({
      title: data.title,
      content: data.content
    })
    .eq('id', editPost.id)
    .select('id, title, content, author_id'); // selecciona columnas explícitas

  if (error) throw error;

  if (!updatedPosts || updatedPosts.length === 0) {
    throw new Error('No se encontró ningún post para actualizar');
  }

  result = updatedPosts[0]; // toma la primera fila
}
      else {
        // Crear nuevo post
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
      form.reset(); // Limpia el formulario después de enviar
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el post',
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
              rules={{ required: 'El título es obligatorio' }}
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
              rules={{ required: 'El contenido es obligatorio' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido</FormLabel>
                  <FormControl>
                    <RichTextEditor 
                      placeholder="Escribe el contenido del post..."
                      value={field.value}
                      onChange={field.onChange}
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
                  : (editPost ? 'Actualizar Post' : 'Publicar Post')
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
