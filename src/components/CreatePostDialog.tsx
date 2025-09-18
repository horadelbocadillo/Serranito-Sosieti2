import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from './RichTextEditor';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  is_event: z.boolean().default(false),
  event_date: z.date().optional(),
  event_end_date: z.date().optional(),
  event_location: z.string().optional(),
  event_description: z.string().optional(),
}).refine((data) => {
  if (data.is_event && !data.event_date) {
    return false;
  }
  return true;
}, {
  message: "La fecha del evento es obligatoria cuando se marca como evento",
  path: ["event_date"],
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
      content: '',
      is_event: false,
      event_date: undefined,
      event_end_date: undefined,
      event_location: '',
      event_description: ''
    }
  });

  const watchIsEvent = form.watch("is_event");

  useEffect(() => {
    if (editPost) {
      form.reset({
        title: editPost.title,
        content: editPost.content,
        is_event: editPost.is_event || false,
        event_date: editPost.event_date ? new Date(editPost.event_date) : undefined,
        event_end_date: editPost.event_end_date ? new Date(editPost.event_end_date) : undefined,
        event_location: editPost.event_location || '',
        event_description: editPost.event_description || ''
      });
    } else {
      form.reset({
        title: '',
        content: '',
        is_event: false,
        event_date: undefined,
        event_end_date: undefined,
        event_location: '',
        event_description: ''
      });
    }
  }, [editPost, form]);

  const onSubmit = async (data: PostFormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes estar autenticado para crear/editar posts',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    console.log('=== DEBUG EDIT POST ===');
    console.log('editPost:', editPost);
    console.log('form data:', data);
    console.log('user:', user);

    try {
      let result;

      if (editPost) {
        // EDITAR POST EXISTENTE - Solo admin puede hacerlo (controlado por RLS)
        console.log('Editando post con ID:', editPost.id);
        
        const { data: updatedPost, error } = await supabase
          .from('posts')
          .update({
            title: data.title,
            content: data.content,
            is_event: data.is_event,
            event_date: data.event_date?.toISOString(),
            event_end_date: data.event_end_date?.toISOString(),
            event_location: data.event_location,
            event_description: data.event_description,
            updated_at: new Date().toISOString()
          })
          .eq('id', editPost.id)
          .select('*')
          .single();

        if (error) {
          console.error('Error actualizando post:', error);
          if (error.code === 'PGRST116') {
            throw new Error('No tienes permisos para editar este post.');
          }
          throw error;
        }

        result = updatedPost;
        console.log('Post actualizado:', result);
      } else {
        // CREAR POST NUEVO - Solo admin puede hacerlo (controlado por RLS)
        console.log('Creando nuevo post');

        // Primero obtenemos nuestro user ID
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (userError || !userData) {
          console.error('Error obteniendo datos del usuario:', userError);
          throw new Error('No se pudo obtener la información del usuario.');
        }

        const { data: newPost, error } = await supabase
          .from('posts')
          .insert({
            title: data.title,
            content: data.content,
            author_id: userData.id,
            is_event: data.is_event,
            event_date: data.event_date?.toISOString(),
            event_end_date: data.event_end_date?.toISOString(),
            event_location: data.event_location,
            event_description: data.event_description
          })
          .select('*')
          .single();

        if (error) {
          console.error('Error creando post:', error);
          if (error.code === '42501') {
            throw new Error('No tienes permisos para crear posts.');
          }
          throw error;
        }
        
        result = newPost;
        console.log('Post creado:', result);
      }

      toast({
        title: editPost ? 'Post actualizado' : 'Post creado',
        description: editPost ? 'El post se ha actualizado correctamente' : 'El post se ha publicado correctamente'
      });

      onPostCreated(result);
      form.reset();
      onOpenChange(false); // Cerrar el diálogo después del éxito
      
    } catch (error: any) {
      console.error('Error creando/actualizando post:', error);
      
      let errorMessage = 'No se pudo guardar el post';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.details) {
        errorMessage = error.details;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
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

            <FormField
              control={form.control}
              name="is_event"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Añade la quedada a tu agenda
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Marca esta opción si quieres crear un evento de calendario
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {watchIsEvent && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="event_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha y hora de inicio *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP p")
                                ) : (
                                  <span>Selecciona fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                if (date) {
                                  const newDate = new Date(date);
                                  newDate.setHours(new Date().getHours());
                                  newDate.setMinutes(new Date().getMinutes());
                                  field.onChange(newDate);
                                }
                              }}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="event_end_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha y hora de fin</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP p")
                                ) : (
                                  <span>Selecciona fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                if (date) {
                                  const newDate = new Date(date);
                                  newDate.setHours(new Date().getHours() + 1);
                                  newDate.setMinutes(new Date().getMinutes());
                                  field.onChange(newDate);
                                }
                              }}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="event_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Casa de Pedro, Plaza Mayor..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción del evento</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción adicional del evento..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
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
