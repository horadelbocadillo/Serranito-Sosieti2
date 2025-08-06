import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DisplayNameModalProps {
  isOpen: boolean;
  userEmail: string;
  onComplete: (displayName: string) => void;
}

const DisplayNameModal = ({ isOpen, userEmail, onComplete }: DisplayNameModalProps) => {
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      toast({
        title: "Error",
        description: "Por favor, introduce tu nombre visible",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('users')
        .update({ display_name: displayName.trim() })
        .eq('email', userEmail);

      if (error) throw error;

      toast({
        title: "¡Perfecto!",
        description: "Tu nombre visible ha sido guardado"
      });

      onComplete(displayName.trim());
    } catch (error) {
      console.error('Error guardando display_name:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar tu nombre. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Completa tu perfil</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">
              ¿Cómo quieres aparecer en la Serranito Sosieti?
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Este nombre saldrá en tus comentarios, piénsatelo"
              required
              disabled={loading}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || !displayName.trim()}
          >
            {loading ? "Guardando..." : "Continuar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DisplayNameModal;
