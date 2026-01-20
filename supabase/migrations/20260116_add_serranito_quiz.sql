-- Migración para añadir campos del quiz del serranito perfecto
-- Añadir columna para guardar el resultado del quiz (JSON con ingredientes y descripción)
ALTER TABLE users ADD COLUMN IF NOT EXISTS serranito_result JSONB;

-- Añadir columna para marcar si el usuario completó el quiz
ALTER TABLE users ADD COLUMN IF NOT EXISTS serranito_completed BOOLEAN DEFAULT false;

-- Comentarios para documentar la estructura del JSON
COMMENT ON COLUMN users.serranito_result IS 'JSON con los ingredientes seleccionados y la descripción generada del serranito perfecto del usuario';
COMMENT ON COLUMN users.serranito_completed IS 'Indica si el usuario ha completado el quiz del serranito';
