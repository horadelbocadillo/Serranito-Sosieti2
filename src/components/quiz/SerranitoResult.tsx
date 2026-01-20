import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, ArrowRight, RotateCcw } from 'lucide-react';

export interface SerranitoResultData {
  name: string;
  description: string;
  ingredients: {
    carne: string;
    pan: string;
    otrosIngredientes: string[];
    extras: string[];
  };
}

interface SerranitoResultProps {
  result: SerranitoResultData;
  onShare: () => void;
  onContinue: () => void;
  onRetry?: () => void;
  isSharing?: boolean;
}

const SerranitoResult = ({
  result,
  onShare,
  onContinue,
  onRetry,
  isSharing = false,
}: SerranitoResultProps) => {
  const ingredientLabels: Record<string, string> = {
    // Carnes
    lomo: 'Lomo de cerdo',
    pollo: 'Pollo',
    ternera: 'Ternera',
    // Panes
    viena: 'Pan de Viena',
    brioche: 'Pan Brioche',
    // Otros ingredientes
    tomate: 'Tomate',
    pimiento: 'Pimiento frito',
    jamon: 'Jamon Serrano',
    patatas: 'Patatas fritas',
    // Extras
    mayonesa: 'Mayonesa',
    alioli: 'Alioli',
    mojo: 'Mojo',
    tortilla: 'Tortilla francesa',
    patatas_dentro: 'Patatas dentro',
    sin_guarnicion: 'Sin guarnicion',
  };

  const getIngredientLabel = (id: string) => ingredientLabels[id] || id;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="text-6xl mb-4">🥖</div>
        <CardTitle className="text-3xl">{result.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg text-center text-muted-foreground italic">
          "{result.description}"
        </p>

        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-center mb-4">Tu receta:</h4>

          <div className="flex items-center gap-2">
            <span className="text-xl">🥩</span>
            <span className="font-medium">Carne:</span>
            <span>{getIngredientLabel(result.ingredients.carne)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl">🍞</span>
            <span className="font-medium">Pan:</span>
            <span>{getIngredientLabel(result.ingredients.pan)}</span>
          </div>

          {result.ingredients.otrosIngredientes.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-xl">🍅</span>
              <span className="font-medium">Ingredientes:</span>
              <span>{result.ingredients.otrosIngredientes.map(getIngredientLabel).join(', ')}</span>
            </div>
          )}

          {result.ingredients.extras.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-xl">🌶️</span>
              <span className="font-medium">Extras:</span>
              <span>{result.ingredients.extras.map(getIngredientLabel).join(', ')}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Repetir test
          </Button>
        )}
        <Button variant="outline" onClick={onShare} disabled={isSharing}>
          <Share2 className="w-4 h-4 mr-2" />
          {isSharing ? 'Compartiendo...' : 'Compartir en el feed'}
        </Button>
        <Button onClick={onContinue}>
          Continuar al feed
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SerranitoResult;
