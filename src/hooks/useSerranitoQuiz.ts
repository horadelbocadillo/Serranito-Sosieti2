import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { SerranitoResultData } from '@/components/quiz/SerranitoResult';

export interface QuizSelections {
  carne: string;
  pan: string;
  otrosIngredientes: string[];
  extras: string[];
}

const INITIAL_SELECTIONS: QuizSelections = {
  carne: '',
  pan: '',
  otrosIngredientes: [],
  extras: [],
};

// Datos de ingredientes para cada paso
export const QUIZ_DATA = {
  carnes: [
    { id: 'lomo', name: 'Lomo de cerdo', emoji: '🐷', description: 'Del Iberico' },
    { id: 'pollo', name: 'Pollo', emoji: '🐔', description: 'Mas ligero' },
    { id: 'ternera', name: 'Ternera', emoji: '🐄', description: 'Pa los carnivoros' },
  ],
  panes: [
    { id: 'viena', name: 'Pan de Viena', emoji: '🥖', description: 'Crujiente por fuera, tierno por dentro' },
    { id: 'brioche', name: 'Pan Brioche', emoji: '🍞', description: 'Suave y mantecoso' },
  ],
  otrosIngredientes: [
    { id: 'tomate', name: 'Tomate', emoji: '🍅', description: 'Frescura mediterranea' },
    { id: 'pimiento', name: 'Pimiento frito', emoji: '🫑', description: 'El toque andaluz' },
    { id: 'jamon', name: 'Jamon Serrano', emoji: '🥓', description: 'Porque si' },
    { id: 'patatas', name: 'Patatas fritas', emoji: '🍟', description: 'De las de verdad' },
  ],
  extras: [
    { id: 'mayonesa', name: 'Mayonesa', emoji: '🥚', description: 'Clasica y cremosa' },
    { id: 'alioli', name: 'Alioli', emoji: '🧄', description: 'Con ajo, claro' },
    { id: 'mojo', name: 'Mojo', emoji: '🌶️', description: 'Picante canario' },
    { id: 'tortilla', name: 'Tortilla francesa', emoji: '🍳', description: 'Controversial' },
    { id: 'patatas_dentro', name: 'Patatas dentro', emoji: '🥔', description: 'El debate eterno' },
    { id: 'sin_guarnicion', name: 'Sin guarnicion', emoji: '❌', description: 'Minimalista' },
  ],
};

export const STEP_TITLES = ['Carne', 'Pan', 'Ingredientes', 'Extras'];

// Generador de nombres creativos basados en ingredientes
const generateSerranitoName = (selections: QuizSelections): string => {
  const names: string[] = [];

  // Nombre base segun carne
  if (selections.carne === 'lomo') names.push('El Clasico');
  else if (selections.carne === 'pollo') names.push('Te queremos de todas formas');
  else if (selections.carne === 'ternera') names.push('Lo tuyo es gourmet');

  // Modificador segun ingredientes clasicos (jamon + tomate + pimiento)
  const tieneClasicos = selections.otrosIngredientes.includes('jamon') &&
    selections.otrosIngredientes.includes('tomate') &&
    selections.otrosIngredientes.includes('pimiento');

  if (tieneClasicos) {
    names.push('de toda la vida de Dio');
  } else {
    // Modificadores individuales de extras
    if (selections.extras.includes('patatas_dentro')) names.push('- piensas fuera de la caja');
    else if (selections.extras.includes('tortilla')) names.push('- ERROR');
    else if (selections.extras.includes('mojo')) names.push('plus Picante');
    else if (selections.extras.includes('alioli') || selections.extras.includes('mayonesa')) names.push('- bueno, vale');
  }

  // Si no hay modificadores, usar segun pan
  if (names.length === 1) {
    if (selections.pan === 'brioche') names.push('- que locura es esta?!');
    else names.push('de sevillanas maneras');
  }

  return names.join(' ');
};

// Genera descripcion creativa (version local sin IA)
const generateLocalDescription = (selections: QuizSelections, name: string): string => {
  const descriptions: string[] = [];

  descriptions.push(`Tu serranito es "${name}".`);

  // Descripcion de la carne
  const carneDesc: Record<string, string> = {
    lomo: 'Un jugoso lomo de cerdo a la plancha',
    pollo: 'Pechuga de pollo bien doradita',
    ternera: 'Ternera tierna y sabrosa',
  };
  descriptions.push(carneDesc[selections.carne] || 'Una carne misteriosa');

  // Pan
  const panDesc: Record<string, string> = {
    viena: 'abrazado por un crujiente pan de Viena',
    brioche: 'envuelto en un suave pan brioche',
  };
  descriptions.push(panDesc[selections.pan] || 'en un pan especial');

  // Otros ingredientes
  if (selections.otrosIngredientes.length > 0) {
    const ingredientesText = selections.otrosIngredientes.map(e => {
      const map: Record<string, string> = {
        tomate: 'tomate fresco',
        pimiento: 'pimiento frito al punto',
        jamon: 'jamon iberico',
        patatas: 'patatas fritas bien crujientes',
      };
      return map[e] || e;
    });
    descriptions.push(`con ${ingredientesText.join(', ')}`);
  }

  // Extras
  const extrasFiltered = selections.extras.filter(e => e !== 'sin_guarnicion');
  if (extrasFiltered.length > 0) {
    const extrasText = extrasFiltered.map(p => {
      const map: Record<string, string> = {
        mayonesa: 'mayonesa casera',
        alioli: 'alioli potente',
        mojo: 'mojo picon',
        tortilla: 'tortilla francesa bien cuajada',
        patatas_dentro: 'patatas crujientes dentro',
      };
      return map[p] || p;
    });
    descriptions.push(`y los toques especiales de ${extrasText.join(' y ')}`);
  }

  // Si eligio sin guarnicion
  if (selections.extras.includes('sin_guarnicion')) {
    descriptions.push('Solo, que el serranito ya es suficiente.');
  }

  // Mensaje final segun "personalidad"
  if (selections.extras.includes('tortilla')) {
    descriptions.push('Puedes ser expulsado en cualquier momento.');
  } else if (selections.extras.includes('patatas_dentro')) {
    descriptions.push('Eres de los valientes, piensas fuera de la caja.');
  } else if (selections.extras.includes('alioli')) {
    descriptions.push('Espanta Dracula.');
  } else if (selections.extras.includes('mojo')) {
    descriptions.push('Con ascendente isleno.');
  } else if (selections.otrosIngredientes.length === 0 && selections.extras.length === 0) {
    descriptions.push('Purista y clasico, respetas la tradicion.');
  } else if (selections.extras.length >= 3) {
    descriptions.push('No te cortas un pelo. Tienes hambre, eh?');
  }

  return descriptions.filter(d => d).join(' ');
};

export const useSerranitoQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<QuizSelections>(INITIAL_SELECTIONS);
  const [result, setResult] = useState<SerranitoResultData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const totalSteps = 4;

  const handleSelect = useCallback((category: keyof QuizSelections, value: string, multiSelect = false) => {
    setSelections(prev => {
      if (multiSelect) {
        const current = prev[category] as string[];
        const updated = current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value];
        return { ...prev, [category]: updated };
      }
      return { ...prev, [category]: value };
    });
  }, []);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0: return selections.carne !== '';
      case 1: return selections.pan !== '';
      case 2: return true; // Otros ingredientes son opcionales
      case 3: return true; // Extras son opcionales
      default: return false;
    }
  }, [currentStep, selections]);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1 && canProceed()) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, canProceed]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const generateResult = useCallback(async (): Promise<SerranitoResultData | null> => {
    if (!canProceed()) return null;

    setIsGenerating(true);

    try {
      const name = generateSerranitoName(selections);

      // Intentar llamar a la funcion Edge para descripcion con IA
      let description = '';

      try {
        const { data, error } = await supabase.functions.invoke('generate-serranito', {
          body: { selections, name }
        });

        if (!error && data?.description) {
          description = data.description;
        }
      } catch {
        // Si falla la funcion Edge, usar generacion local
        console.log('Usando generacion local de descripcion');
      }

      // Fallback a descripcion local
      if (!description) {
        description = generateLocalDescription(selections, name);
      }

      const resultData: SerranitoResultData = {
        name,
        description,
        ingredients: {
          carne: selections.carne,
          pan: selections.pan,
          otrosIngredientes: selections.otrosIngredientes,
          extras: selections.extras,
        },
      };

      setResult(resultData);
      return resultData;
    } catch (error) {
      console.error('Error generando resultado:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar tu serranito perfecto',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [selections, canProceed, toast]);

  const saveResult = useCallback(async (resultData: SerranitoResultData) => {
    if (!user) return false;

    // Siempre guardar en localStorage primero (funciona offline)
    const storedUser = localStorage.getItem('serranito_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      userData.serranito_completed = true;
      userData.serranito_result = resultData;
      localStorage.setItem('serranito_user', JSON.stringify(userData));
    }

    // Intentar guardar en base de datos (puede fallar)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          serranito_result: resultData as unknown as Record<string, unknown>,
          serranito_completed: true,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error guardando en DB (continuando con localStorage):', error);
        // No mostramos error al usuario, ya está guardado en localStorage
      }
    } catch (error) {
      console.error('Error guardando en DB:', error);
      // No bloqueamos, ya está en localStorage
    }

    return true;
  }, [user]);

  const shareToFeed = useCallback(async (resultData: SerranitoResultData) => {
    if (!user) return false;

    setIsSharing(true);

    try {
      const content = `🥖 <strong>Mi Serranito Perfecto: ${resultData.name}</strong><br/><br/>${resultData.description}`;

      const { error } = await supabase
        .from('posts')
        .insert({
          title: `Mi Serranito Perfecto: ${resultData.name}`,
          content,
          author_id: user.id,
          is_event: false,
        });

      if (error) throw error;

      toast({
        title: 'Compartido',
        description: 'Tu serranito ha sido publicado en el feed',
      });

      return true;
    } catch (error) {
      console.error('Error compartiendo en feed:', error);
      toast({
        title: 'Error',
        description: 'No se pudo compartir en el feed',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSharing(false);
    }
  }, [user, toast]);

  const resetQuiz = useCallback(() => {
    setCurrentStep(0);
    setSelections(INITIAL_SELECTIONS);
    setResult(null);
  }, []);

  return {
    currentStep,
    totalSteps,
    selections,
    result,
    isGenerating,
    isSharing,
    handleSelect,
    canProceed,
    nextStep,
    prevStep,
    generateResult,
    saveResult,
    shareToFeed,
    resetQuiz,
  };
};
