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
        // Editar vía Edge Function con validación de admin
        console.log('Editando post con ID:', editPost.id);

        const res = await fetch('https://jrvwprlhtmlmokzynezh.supabase.co/functions/v1/admin-posts', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': user.email,
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydndwcmxodG1sbW9renluZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDc1MjksImV4cCI6MjA2OTg4MzUyOX0.04knlB4p2OIA48-KBnZThoS6UbzL7gwCu3r232B7i9w'
          },
          body: JSON.stringify({
            id: editPost.id,
            title: data.title,
            content: data.content,
            is_event: data.is_event,
            event_date: data.event_date?.toISOString() ?? null,
            event_end_date: data.event_end_date?.toISOString() ?? null,
            event_location: data.event_location ?? null,
            event_description: data.event_description ?? null,
          })
        });

        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          const message = payload?.error ?? 'No tienes permisos para editar este post.';
          throw new Error(message);
        }

        result = payload?.data ?? payload;
        console.log('Post actualizado:', result);
      } else {
        // CREAR POST NUEVO mediante Edge Function con validación de admin
        console.log('Creando nuevo post');

        const res = await fetch('https://jrvwprlhtmlmokzynezh.supabase.co/functions/v1/admin-posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': user.email,
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydndwcmxodG1sbW9renluZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDc1MjksImV4cCI6MjA2OTg4MzUyOX0.04knlB4p2OIA48-KBnZThoS6UbzL7gwCu3r232B7i9w'
          },
          body: JSON.stringify({
            title: data.title,
            content: data.content,
            is_event: data.is_event,
            event_date: data.event_date?.toISOString() ?? null,
            event_end_date: data.event_end_date?.toISOString() ?? null,
            event_location: data.event_location ?? null,
            event_description: data.event_description ?? null,
          })
        });

        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          const message = payload?.error ?? 'No tienes permisos para crear posts.';
          throw new Error(message);
        }

        result = payload?.data ?? payload;
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
                        <div className="space-y-2">
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
                                    format(field.value, "PPP")
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
                                    const currentValue = field.value || new Date();
                                    const newDate = new Date(date);
                                    newDate.setHours(currentValue.getHours());
                                    newDate.setMinutes(currentValue.getMinutes());
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
                          <div className="flex gap-2">
                            <Input
                              type="time"
                              value={field.value ? format(field.value, "HH:mm") : ""}
                              onChange={(e) => {
                                if (field.value && e.target.value) {
                                  const [hours, minutes] = e.target.value.split(':');
                                  const newDate = new Date(field.value);
                                  newDate.setHours(parseInt(hours), parseInt(minutes));
                                  field.onChange(newDate);
                                } else if (e.target.value) {
                                  const [hours, minutes] = e.target.value.split(':');
                                  const newDate = new Date();
                                  newDate.setHours(parseInt(hours), parseInt(minutes));
                                  field.onChange(newDate);
                                }
                              }}
                              className="flex-1"
                            />
                          </div>
                        </div>
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
                        <div className="space-y-2">
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
                                    format(field.value, "PPP")
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
                                    const currentValue = field.value || new Date();
                                    const newDate = new Date(date);
                                    newDate.setHours(currentValue.getHours());
                                    newDate.setMinutes(currentValue.getMinutes());
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
                          <div className="flex gap-2">
                            <Input
                              type="time"
                              value={field.value ? format(field.value, "HH:mm") : ""}
                              onChange={(e) => {
                                if (field.value && e.target.value) {
                                  const [hours, minutes] = e.target.value.split(':');
                                  const newDate = new Date(field.value);
                                  newDate.setHours(parseInt(hours), parseInt(minutes));
                                  field.onChange(newDate);
                                } else if (e.target.value) {
                                  const [hours, minutes] = e.target.value.split(':');
                                  const newDate = new Date();
                                  newDate.setHours(parseInt(hours), parseInt(minutes));
                                  field.onChange(newDate);
                                }
                              }}
                              className="flex-1"
                            />
                          </div>
                        </div>
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
