import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  description?: string;
}

interface IngredientSelectorProps {
  title: string;
  subtitle?: string;
  ingredients: Ingredient[];
  selected: string[];
  onSelect: (ingredientId: string) => void;
  multiSelect?: boolean;
}

const IngredientSelector = ({
  title,
  subtitle,
  ingredients,
  selected,
  onSelect,
  multiSelect = false,
}: IngredientSelectorProps) => {
  const handleSelect = (ingredientId: string) => {
    onSelect(ingredientId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        {subtitle && (
          <p className="text-muted-foreground">{subtitle}</p>
        )}
        {multiSelect && (
          <p className="text-sm text-muted-foreground mt-1">
            (Puedes seleccionar varios)
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {ingredients.map((ingredient) => {
          const isSelected = selected.includes(ingredient.id);
          return (
            <Button
              key={ingredient.id}
              variant="outline"
              onClick={() => handleSelect(ingredient.id)}
              className={cn(
                'h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200',
                isSelected && 'ring-2 ring-primary bg-primary/10 border-primary'
              )}
            >
              <span className="text-4xl">{ingredient.emoji}</span>
              <span className="font-medium">{ingredient.name}</span>
              {ingredient.description && (
                <span className="text-xs text-muted-foreground text-center">
                  {ingredient.description}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default IngredientSelector;
