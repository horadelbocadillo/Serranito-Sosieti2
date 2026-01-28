-- Trigger: Comentario automatico al completar el quiz del serranito
-- ESTADO ACTUAL: ACTIVO

-- Funcion que inserta comentario automatico
CREATE OR REPLACE FUNCTION public.insert_gamification_comment()
RETURNS TRIGGER AS $$
DECLARE
    target_post_id uuid;
    admin_id uuid;
BEGIN
    -- Solo actuamos si el usuario ha completado el juego y antes no lo estaba
    IF (NEW.serranito_completed = true AND (OLD.serranito_completed IS NULL OR OLD.serranito_completed = false)) THEN

        -- Buscamos el ID del ultimo post del administrador
        SELECT p.id INTO target_post_id
        FROM public.posts p
        JOIN public.users u ON p.author_id = u.id
        WHERE u.is_admin = true
        ORDER BY p.created_at DESC
        LIMIT 1;

        -- Si encontramos el post, insertamos el comentario
        IF target_post_id IS NOT NULL THEN
            INSERT INTO public.comments (id, post_id, user_id, content, created_at, updated_at)
            VALUES (
                gen_random_uuid(),
                target_post_id,
                NEW.id,
                '¡He completado el juego! Mi resultado: ' || (NEW.serranito_result::text),
                now(),
                now()
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que vigila la tabla users
CREATE TRIGGER trigger_shared_gamification
AFTER UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.insert_gamification_comment();

-- ============================================
-- PARA DESACTIVAR:
-- ============================================
-- DROP TRIGGER IF EXISTS trigger_shared_gamification ON public.users;
-- DROP FUNCTION IF EXISTS public.insert_gamification_comment();

-- ============================================
-- PARA REACTIVAR:
-- ============================================
-- Ejecutar todo el SQL de arriba (desde CREATE OR REPLACE FUNCTION)
