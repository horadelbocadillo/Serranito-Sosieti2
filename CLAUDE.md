# Serranito Sosieti - Contexto del Proyecto

## Descripcion General
Aplicacion social/comunidad para aficionados al serranito sevillano. Permite a usuarios compartir posts, eventos, comentar y reaccionar con emojis.

## Stack Tecnologico

### Frontend
- **React 18.3** con TypeScript 5.8
- **Vite** como bundler
- **React Router v6** para navegacion
- **React Query** para estado asincrono
- **React Hook Form** + **Zod** para formularios y validacion
- **Tailwind CSS 3.4** + **shadcn/ui** (componentes Radix UI)
- **Lucide React** para iconos
- **date-fns** para fechas

### Backend
- **Supabase** (BaaS)
- **PostgreSQL** como base de datos
- **Edge Functions** (Deno) para logica serverless

## Estructura de Carpetas

```
src/
├── components/
│   ├── ui/                    # Componentes shadcn/ui
│   ├── quiz/                  # Componentes del quiz del serranito
│   ├── Layout.tsx             # Layout principal con header
│   ├── PostsList.tsx          # Feed de posts
│   ├── CreatePostDialog.tsx   # Crear/editar posts
│   ├── CommentsSection.tsx    # Comentarios anidados
│   ├── ReactionsBar.tsx       # Reacciones con emojis
│   ├── RichTextEditor.tsx     # Editor de texto
│   └── DisplayNameModal.tsx   # Modal nombre de usuario
├── hooks/
│   ├── useAuth.tsx            # Autenticacion con Context API
│   ├── useSerranitoQuiz.ts    # Logica del quiz
│   ├── use-mobile.tsx         # Deteccion de movil
│   └── use-toast.ts           # Notificaciones
├── pages/
│   ├── Index.tsx              # Feed principal
│   ├── Auth.tsx               # Login
│   ├── SerranitoQuiz.tsx      # Quiz del serranito perfecto
│   ├── AdminPanel.tsx         # Panel admin
│   ├── UsersPanel.tsx         # Gestion usuarios
│   └── NotFound.tsx           # 404
├── integrations/
│   └── supabase/
│       ├── client.ts          # Cliente Supabase configurado
│       └── types.ts           # Tipos autogenerados
├── lib/
│   ├── utils.ts               # Utilidades (cn para clases)
│   └── calendar.ts            # Generador ICS
├── App.tsx                    # Rutas
└── main.tsx                   # Entry point

supabase/
├── functions/
│   ├── admin-posts/           # CRUD posts para admin
│   └── generate-serranito/    # Generacion descripcion IA
└── migrations/                # Migraciones SQL
```

## Base de Datos (Supabase)

### Tablas Principales

**users**
- `id` (uuid, PK)
- `email` (text, unique)
- `display_name` (text, nullable)
- `is_admin` (boolean, default false)
- `last_login` (timestamp)
- `serranito_result` (jsonb, nullable) - Resultado del quiz
- `serranito_completed` (boolean, default false)
- `created_at` (timestamp)

**posts**
- `id` (uuid, PK)
- `title` (text)
- `content` (text)
- `author_id` (uuid, FK -> users)
- `is_event` (boolean)
- `event_date`, `event_end_date`, `event_location`, `event_description`
- `created_at`, `updated_at`

**comments**
- `id` (uuid, PK)
- `content` (text)
- `post_id` (uuid, FK -> posts)
- `user_id` (uuid, FK -> users)
- `parent_id` (uuid, FK -> comments, nullable) - Para respuestas anidadas
- `created_at`, `updated_at`

**reactions**
- `id` (uuid, PK)
- `emoji` (text)
- `user_id` (uuid, FK -> users)
- `post_id` (uuid, FK -> posts, nullable)
- `comment_id` (uuid, FK -> comments, nullable)
- `created_at`

**config**
- `id` (uuid, PK)
- `key` (text, unique)
- `value` (text)
- Contiene `common_password` para login compartido

## Sistema de Autenticacion

- **No usa Supabase Auth** - sistema custom basado en email + contrasena comun
- Contrasena guardada en tabla `config` (key: 'common_password')
- Session almacenada en `localStorage` como `serranito_user`
- Admin identificado por email: `horadelbocadillo@gmail.com`
- Header `x-user-email` enviado en requests para identificar usuario

## Patrones de Codigo

### Context API para Auth
```typescript
const { user, login, logout, isAdmin, loading } = useAuth();
```

### Validacion con Zod
```typescript
const schema = z.object({ title: z.string().min(1) });
const form = useForm({ resolver: zodResolver(schema) });
```

### Queries Supabase
```typescript
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false });
```

### Toast Notifications
```typescript
const { toast } = useToast();
toast({ title: "Exito", description: "Mensaje" });
```

## Rutas Disponibles

| Ruta | Componente | Descripcion |
|------|------------|-------------|
| `/auth` | Auth | Login |
| `/` | Index | Feed principal |
| `/serranito-quiz` | SerranitoQuiz | Quiz del serranito perfecto |
| `/admin` | AdminPanel | Panel admin (solo admins) |
| `/users` | UsersPanel | Gestion usuarios (solo admins) |

## Funcionalidades Principales

1. **Posts/Eventos** - CRUD completo, eventos con fecha y ubicacion
2. **Comentarios** - Anidados con respuestas
3. **Reacciones** - Emojis en posts y comentarios
4. **Descarga ICS** - Exportar eventos al calendario
5. **Quiz Serranito** - Onboarding para crear tu serranito perfecto
6. **Panel Admin** - Gestion de contenido y usuarios

## Edge Functions

### admin-posts
- Metodos: POST, PUT
- Requiere header `x-user-email` de admin
- Usa service role key para bypass RLS

### generate-serranito
- Metodo: POST
- Body: `{ selections, name }`
- Intenta Claude API -> OpenAI API -> Fallback local
- Secrets necesarios: `ANTHROPIC_API_KEY` o `OPENAI_API_KEY`

## Variables de Entorno

```
SUPABASE_URL=https://jrvwprlhtmlmokzynezh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

## Comandos Utiles

```bash
npm run dev          # Desarrollo
npm run build        # Build produccion
supabase db push     # Aplicar migraciones
supabase functions deploy generate-serranito  # Deploy edge function
```

## REGLAS IMPORTANTES DE DESARROLLO

### Cambios en Base de Datos
**SIEMPRE** que se añadan nuevos campos, tablas o cambios en la base de datos:
1. **ANTES de implementar el código**, informar al usuario de los cambios necesarios en Supabase
2. Proporcionar el SQL exacto para ejecutar en Supabase > SQL Editor:
   ```sql
   -- Ejemplo: añadir nueva columna
   ALTER TABLE nombre_tabla ADD COLUMN IF NOT EXISTS nuevo_campo TIPO;
   ```
3. **IMPORTANTE**: Si se añaden columnas manualmente en Supabase, puede activarse RLS automáticamente
4. Si hay errores de acceso después de cambios en DB, verificar que RLS esté desactivado o tenga políticas correctas:
   ```sql
   -- Desactivar RLS si es necesario
   ALTER TABLE public.nombre_tabla DISABLE ROW LEVEL SECURITY;
   ```
5. **ESPERAR** confirmación del usuario antes de continuar con el código
6. Esto evita errores 400/403/404 por campos inexistentes o permisos

### Cambios en Edge Functions
- Las Edge Functions modificadas localmente **NO se aplican automáticamente**
- Informar al usuario que debe ejecutar: `supabase functions deploy nombre-funcion`
- O indicar que la función no está desplegada si hay errores 404

### Orden de Operaciones para Features con DB
1. Diseñar cambios de base de datos
2. **Dar instrucciones al usuario para aplicar cambios en Supabase**
3. Esperar confirmación
4. Implementar código frontend/backend
5. Probar

## Sistema de Gamificación - Quiz Serranito

### Trigger Automático de Comentarios
**ESTADO ACTUAL**: ACTIVO ✅

Existe un trigger SQL en la base de datos que se ejecuta automáticamente cuando un usuario completa el quiz del serranito:

```sql
-- Función que inserta comentario automático
CREATE OR REPLACE FUNCTION public.insert_gamification_comment()
RETURNS TRIGGER AS $$
DECLARE
    target_post_id uuid;
    admin_id uuid;
BEGIN
    -- Solo actuamos si el usuario ha completado el juego y antes no lo estaba
    IF (NEW.serranito_completed = true AND (OLD.serranito_completed IS NULL OR OLD.serranito_completed = false)) THEN

        -- Buscamos el ID del último post del administrador
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
```

**Comportamiento**:
- Cuando `serranito_completed` cambia de `false` a `true`, se crea un comentario automático
- El comentario se inserta en el **post más reciente del admin** (ordenado por `created_at DESC`)
- Contenido: `'¡He completado el juego! Mi resultado: ' || (serranito_result::text)`

**IMPORTANTE**: En futuras sesiones, preguntar al usuario si desea mantener este trigger activo o desactivarlo.

**Para desactivar el trigger**:
```sql
-- Desactivar trigger
DROP TRIGGER IF EXISTS trigger_shared_gamification ON public.users;
DROP FUNCTION IF EXISTS public.insert_gamification_comment();
```

**Para reactivar el trigger**: Volver a ejecutar el SQL completo mostrado arriba.
