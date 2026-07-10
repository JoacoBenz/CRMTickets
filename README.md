# AdminTickets

Sistema de **custodia / escrow** para operaciones de compra-venta de entradas de
reventa. Un administrador media entre comprador y vendedor, y cada operación tiene
un **link público** donde ambas partes ven el estado en tiempo real, sin tener que
preguntar.

- **Página pública** `/op/[id]` — talón de entrada read-only, se actualiza sola.
- **Módulo de carga** `/moderador` — el moderador carga la entrada a vender con
  los datos (alias) de comprador y vendedor, y comparte el link.
- **Módulo de administración** `/admin` — el administrador chequea la lista y
  actualiza los estados "de un toque".

## Roles

| Rol             | Puede                                                        |
| --------------- | ------------------------------------------------------------ |
| `administrador` | Ver lista, avanzar/cancelar/reabrir estados, y también cargar |
| `moderador`     | Solo cargar operaciones y copiar el link/mensaje              |

El rol vive en `app_metadata.role` del usuario de Supabase (el usuario no puede
editarlo). Un usuario **sin rol asignado no tiene acceso a ningún módulo** (ve
la página `/sin-acceso`): así una cuenta creada por fuera nunca obtiene
permisos por accidente. **Todo usuario, incluido el primero, necesita rol
explícito.** Se asigna en el SQL Editor:

```sql
-- administrador
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
    || '{"role":"administrador"}'::jsonb
where email = 'admin@ejemplo.com';

-- moderador
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
    || '{"role":"moderador"}'::jsonb
where email = 'moderador@ejemplo.com';
```

El moderador que intenta entrar a `/admin` es redirigido a `/moderador`, y el
cambio de estados está bloqueado para moderadores también en la API.

> ⚠️ **Desactivá los registros públicos**: Supabase trae el signup por email
> habilitado por defecto. Andá a **Authentication → Sign In / Up** y
> deshabilitá *Allow new users to sign up*. Los usuarios se crean solo desde
> el dashboard.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth)
- Deploy pensado para Vercel

## Modelo de datos

Tabla `operaciones`:

| campo             | tipo                | notas                                         |
| ----------------- | ------------------- | --------------------------------------------- |
| `id`              | uuid (pk)           | va en el **link público** (impredecible)      |
| `code`            | text único          | legible para el admin, ej `BX-7F3K9Q2M`       |
| `evento`          | text                |                                               |
| `comprador_alias` | text (nullable)     |                                               |
| `vendedor_alias`  | text (nullable)     |                                               |
| `monto`           | integer             | ARS, sin decimales                            |
| `fee`             | integer             | comisión del admin, ARS                       |
| `status`          | enum                | `esperando_entrada` · `entrada_recibida` · `confirmada` · `cancelada` |
| `created_at`      | timestamptz         |                                               |
| `updated_at`      | timestamptz         | actualizado por trigger                       |

### Máquina de estados

```
esperando_entrada → entrada_recibida → confirmada
        └─────────────┴──────────────→ cancelada   (desde cualquier no-terminal)
cancelada → esperando_entrada                        (reabrir)
```

## Seguridad

- La página pública se accede **solo por el uuid** (impredecible). Nunca se expone
  un id incremental.
- La vista pública muestra **solo**: evento, monto, estado, aliases y fecha de
  actualización. Nada de teléfonos, mails, nombres ni comisión (la comisión es
  un dato interno del panel).
- **RLS en deny-all**: la tabla no tiene ninguna policy para `anon` ni
  `authenticated` — nadie puede leerla ni escribirla directo contra PostgREST,
  ni siquiera un usuario logueado (no se puede saltar la API con el JWT).
- La vista pública lee vía el RPC `operacion_publica(uuid)` (security definer),
  que exige el uuid exacto y devuelve solo los campos públicos. Los paneles y
  las APIs leen y escriben en el **servidor con la service role**, validando
  sesión + rol antes de tocar nada.
- La **máquina de estados también vive en la base**: un trigger de Postgres
  rechaza cualquier transición inválida, sin importar quién escriba (SQL
  Editor, scripts, otro servicio).
- Los cambios de estado usan **update condicional** (`where status = <leído>`):
  dos clicks simultáneos no se pisan; el que llega tarde recibe 409.
- **Auditoría**: cada creación y cambio de estado queda registrado en
  `operacion_eventos` (quién, qué transición, cuándo).

## Setup local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Copiá el ejemplo y completá con los datos de tu proyecto Supabase:

```bash
cp .env.example .env.local
```

| Variable                         | Dónde sacarla                                        |
| -------------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | Supabase → Project Settings → **Data API** → URL     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Project Settings → **API Keys** → `anon` / publishable|
| `SUPABASE_SERVICE_ROLE_KEY`      | Project Settings → **API Keys** → `service_role` (secreta) |
| `NEXT_PUBLIC_SITE_URL`           | opcional en local; en prod, la URL del deploy         |

### 3. Correr

```bash
npm run dev
```

Abrí http://localhost:3000/admin

## Conectar tu proyecto de Supabase (pasos exactos)

1. **Crear proyecto** en https://supabase.com/dashboard → *New project*. Elegí una
   región cercana (ej. São Paulo) y guardá la contraseña de la base.
2. **Correr las migraciones EN ORDEN**: en el dashboard, andá a **SQL Editor →
   New query** y ejecutá una por una:
   [`0001_init.sql`](supabase/migrations/0001_init.sql) (enum, tabla, trigger de
   `updated_at`), [`0002_public_read_rpc.sql`](supabase/migrations/0002_public_read_rpc.sql)
   (RPC de lectura pública) y [`0003_lockdown.sql`](supabase/migrations/0003_lockdown.sql)
   (RLS deny-all, trigger de transiciones, `created_by` y auditoría).
3. **(Opcional) Seed**: pegá y ejecutá [`supabase/seed.sql`](supabase/seed.sql) para
   tener 2-3 operaciones de ejemplo.
4. **Copiar las keys**: **Project Settings → API**. Copiá:
   - *Project URL* → `NEXT_PUBLIC_SUPABASE_URL`
   - *anon public* → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - *service_role* → `SUPABASE_SERVICE_ROLE_KEY` (¡mantenela secreta!)
   Pegalas en `.env.local`.
5. **Crear el usuario admin**: **Authentication → Users → Add user → Create new user**.
   Poné email y contraseña, y marcá *Auto Confirm User*. Después **asignale el rol**
   con el SQL de la sección [Roles](#roles) (sin rol no entra a ningún módulo).
6. **Desactivar signups públicos**: **Authentication → Sign In / Up** →
   deshabilitá *Allow new users to sign up* (ver sección Roles).
7. **Reiniciá** `npm run dev` para tomar las variables y listo: entrá a `/admin`,
   creá una operación y abrí su link público con "Ver".

### Deploy en Vercel

1. Importá el repo en Vercel.
2. Cargá las 3 variables de Supabase + `NEXT_PUBLIC_SITE_URL` (la URL final del
   proyecto) en **Settings → Environment Variables**.
3. Deploy. La migración de Supabase se corre una sola vez desde el SQL Editor (no
   depende de Vercel).

## Estructura del proyecto

```
app/
  page.tsx                       landing
  op/[id]/page.tsx               página pública (read-only, auto-refresh, RPC)
  admin/page.tsx                 módulo administrador (estados)
  moderador/page.tsx             módulo moderador (carga)
  admin/login/page.tsx           login email/password (redirige según rol)
  sin-acceso/page.tsx            usuarios autenticados sin rol asignado
  api/operaciones/route.ts       POST crear (requiere rol, service role)
  api/operaciones/[id]/status/route.ts   PATCH estado (solo admin, update condicional)
components/
  StatusStub.tsx  ProgressSteps.tsx  StatusChip.tsx  AutoRefresh.tsx  AppHeader.tsx
  admin/  AdminDashboard  NewOperacionForm  OperacionCard  Toast  LogoutButton
  moderador/  ModeradorDashboard
lib/
  operaciones.ts                 tipos, máquina de estados, labels, colores, helpers
  operaciones.test.ts            tests de la máquina de estados (npm test)
  auth.ts                        roles (administrador / moderador / sin rol)
  urls.ts                        base URL de links públicos + validación de uuid
  supabase/client.ts  supabase/server.ts
middleware.ts                    refresca sesión, protege /admin y /moderador por rol
supabase/
  migrations/0001_init.sql       enum + tabla + trigger updated_at
  migrations/0002_public_read_rpc.sql   RPC de lectura pública por uuid
  migrations/0003_lockdown.sql   RLS deny-all + trigger transiciones + auditoría
  seed.sql                       datos de ejemplo
```

## Tests

```bash
npm test
```

Cubren la máquina de estados (`canTransition`, `nextStatus`), el formato de los
codes y el mensaje de WhatsApp.

## Alcance (MVP)

Fase 2 (no incluido todavía): notificaciones automáticas de WhatsApp por API. Por
ahora el panel genera el mensaje listo para pegar con el botón **Copiar WhatsApp**.
