import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import QuizStepper from '@/components/quiz/QuizStepper';
import IngredientSelector from '@/components/quiz/IngredientSelector';
import SerranitoResult from '@/components/quiz/SerranitoResult';
import { useSerranitoQuiz, QUIZ_DATA, STEP_TITLES } from '@/hooks/useSerranitoQuiz';
import { useAuth } from '@/hooks/useAuth';

const SerranitoQuiz = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [showResult, setShowResult] = useState(false);

  const {
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
  } = useSerranitoQuiz();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleFinish = async () => {
    const resultData = await generateResult();
    if (resultData) {
      await saveResult(resultData);
      setShowResult(true);
    }
  };

  const handleShare = async () => {
    if (result) {
      await shareToFeed(result);
    }
  };

  const handleContinue = () => {
    // Forzar recarga completa para que lea el localStorage actualizado
    window.location.href = '/';
  };

  const handleRetry = () => {
    resetQuiz();
    setShowResult(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Mostrar resultado final
  if (showResult && result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-orange-950 dark:to-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Tu Serranito Perfecto</h1>
            <p className="text-muted-foreground mt-2">
              Asi es como te gusta el Serranito
            </p>
          </div>
          <SerranitoResult
            result={result}
            onShare={handleShare}
            onContinue={handleContinue}
            onRetry={handleRetry}
            isSharing={isSharing}
          />
        </div>
      </div>
    );
  }

  // Renderizar paso actual del quiz
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <IngredientSelector
            title="Elige el tipo de carne"
            subtitle="La base de todo buen Serranito"
            ingredients={QUIZ_DATA.carnes}
            selected={selections.carne ? [selections.carne] : []}
            onSelect={(id) => handleSelect('carne', id)}
          />
        );
      case 1:
        return (
          <IngredientSelector
            title="Elige el pan"
            subtitle="El abrazo perfecto para tu serranito"
            ingredients={QUIZ_DATA.panes}
            selected={selections.pan ? [selections.pan] : []}
            onSelect={(id) => handleSelect('pan', id)}
          />
        );
      case 2:
        return (
          <IngredientSelector
            title="Lo que no puede faltar"
            subtitle="Los acompañantes de siempre"
            ingredients={QUIZ_DATA.otrosIngredientes}
            selected={selections.otrosIngredientes}
            onSelect={(id) => handleSelect('otrosIngredientes', id, true)}
            multiSelect
          />
        );
      case 3:
        return (
          <IngredientSelector
            title="Los extras"
            subtitle="Aqui es donde se pone interesante..."
            ingredients={QUIZ_DATA.extras}
            selected={selections.extras}
            onSelect={(id) => handleSelect('extras', id, true)}
            multiSelect
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-orange-950 dark:to-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl flex items-center justify-center gap-3">
              <span>🥖</span>
              <span>El Juego del Serranito Perfecto</span>
              <span>🥖</span>
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Descubre cual es tu Serranito ideal
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Stepper */}
            <QuizStepper
              currentStep={currentStep}
              totalSteps={totalSteps}
              stepTitles={STEP_TITLES}
            />

            {/* Contenido del paso actual */}
            <div className="min-h-[300px] pt-8">
              {renderCurrentStep()}
            </div>

            {/* Botones de navegacion */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>

              {isLastStep ? (
                <Button
                  onClick={handleFinish}
                  disabled={!canProceed() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      Ver mi Serranito
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SerranitoQuiz;
