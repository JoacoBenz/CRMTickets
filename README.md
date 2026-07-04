# Resguardo

Sistema de **custodia / escrow** para operaciones de compra-venta de entradas de
reventa. Un administrador media entre comprador y vendedor, y cada operación tiene
un **link público** donde ambas partes ven el estado en tiempo real, sin tener que
preguntar.

- **Página pública** `/op/[id]` — talón de entrada read-only, se actualiza sola.
- **Panel admin** `/admin` — login con Supabase Auth, alta de operaciones y avance
  de estado "de un toque".

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
- La vista pública muestra **solo**: evento, monto, fee, estado, aliases y fecha de
  actualización. Nada de teléfonos, mails ni nombres.
- **RLS activado**: lectura pública (anon) permitida; escritura y cambios de estado
  solo para usuarios autenticados.
- Los cambios de estado y el alta se hacen vía **Route Handlers con la service role**
  (`app/api/operaciones/...`), nunca desde el cliente con la anon key. Cada handler
  verifica que haya un admin logueado antes de escribir.

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
2. **Correr la migración**: en el dashboard, andá a **SQL Editor → New query**, pegá
   todo el contenido de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   y ejecutá (*Run*). Esto crea el enum, la tabla, el trigger de `updated_at` y las
   políticas RLS.
3. **(Opcional) Seed**: pegá y ejecutá [`supabase/seed.sql`](supabase/seed.sql) para
   tener 2-3 operaciones de ejemplo.
4. **Copiar las keys**: **Project Settings → API**. Copiá:
   - *Project URL* → `NEXT_PUBLIC_SUPABASE_URL`
   - *anon public* → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - *service_role* → `SUPABASE_SERVICE_ROLE_KEY` (¡mantenela secreta!)
   Pegalas en `.env.local`.
5. **Crear el usuario admin**: **Authentication → Users → Add user → Create new user**.
   Poné email y contraseña, y marcá *Auto Confirm User* (o desactivá la confirmación
   por email en **Authentication → Providers → Email**). Con esas credenciales entrás
   a `/admin`.
6. **Reiniciá** `npm run dev` para tomar las variables y listo: entrá a `/admin`,
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
  op/[id]/page.tsx               página pública (read-only, auto-refresh)
  admin/page.tsx                 panel (server: auth + fetch)
  admin/login/page.tsx           login email/password
  api/operaciones/route.ts       POST crear (service role)
  api/operaciones/[id]/status/route.ts   PATCH cambiar estado (service role)
components/
  StatusStub.tsx  ProgressSteps.tsx  StatusChip.tsx  AutoRefresh.tsx
  admin/  AdminDashboard  NewOperacionForm  OperacionCard  Toast  LogoutButton
lib/
  operaciones.ts                 tipos, máquina de estados, labels, colores, helpers
  supabase/client.ts  supabase/server.ts
middleware.ts                    refresca sesión y protege /admin
supabase/
  migrations/0001_init.sql       enum + tabla + trigger + RLS
  seed.sql                       datos de ejemplo
```

## Alcance (MVP)

Fase 2 (no incluido todavía): notificaciones automáticas de WhatsApp por API. Por
ahora el panel genera el mensaje listo para pegar con el botón **Copiar WhatsApp**.
