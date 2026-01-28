# Serranito Sosieti - Contexto del Proyecto

## Descripcion General
Aplicacion social/comunidad para aficionados al serranito sevillano. Permite a usuarios comentar posts, eventos y reaccionar con emojis. El único que puede crear post es el Admin. Esto funciona como un club privado al que se tiene acceso mediante una clave única que es el Admin el que la crea y cambia bajo su criterio.

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
├── migrations/                # Migraciones SQL
└── triggers/
    └── gamification.sql       # Trigger comentario automatico quiz
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
SUPABASE_ANON_KEY=<TU_ANON_KEY>
```

## Requisitos

- **Node.js >= 18** (requerido por Vite 5.x)

## Estado de RLS por Tabla

<!-- TODO: Completar con el estado actual en Supabase -->
| Tabla | RLS |
|-------|-----|
| users | ? |
| posts | ? |
| comments | ? |
| reactions | ? |
| config | ? |

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

## Sistema de Gamificacion - Quiz Serranito

### Trigger Automatico de Comentarios
**ESTADO ACTUAL**: ACTIVO

Existe un trigger SQL que se ejecuta cuando un usuario completa el quiz del serranito.

**Comportamiento**:
- Cuando `serranito_completed` cambia de `false` a `true`, se crea un comentario automatico
- El comentario se inserta en el **post mas reciente del admin**
- Contenido: `'¡He completado el juego! Mi resultado: ' || (serranito_result::text)`

**SQL completo y comandos para activar/desactivar**: `supabase/triggers/gamification.sql`

## Recapitulaciones de Sesion

### 2026-01-28
**Objetivo**: Revisar y optimizar el archivo CLAUDE.md para equilibrar contexto e informacion util

**Acciones**:
- Analisis completo del archivo CLAUDE.md existente
- Creacion de `supabase/triggers/gamification.sql` con el SQL del trigger (extraido de CLAUDE.md)
- Actualizacion de CLAUDE.md: añadida seccion Requisitos (Node >= 18), tabla Estado RLS, placeholder para ANON_KEY
- Reduccion de la seccion del trigger de 40 lineas a 6 con referencia al archivo externo
- Creacion del slash command `/recapitula` en `.claude/commands/recapitula.md`

**Archivos modificados**:
- `Serranito-Sosieti2_codigdo_lovable/CLAUDE.md`
- `Serranito-Sosieti2_codigdo_lovable/supabase/triggers/gamification.sql` (nuevo)
- `.claude/commands/recapitula.md` (nuevo)

**Decisiones**:
- Mover SQL largo a archivo externo: reduce ruido en CLAUDE.md sin perder informacion
- No corregir tildes: no aporta valor funcional al contexto tecnico
- Usar Vercel en lugar de Lovable: permite flexibilidad en estructura de repos

**Pendientes**:
- Completar tabla de RLS con estado real de cada tabla en Supabase
- Decidir estructura de repos (fusionar o mantener separados) y hacer commit

---
