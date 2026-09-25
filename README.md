# Habit Tracker

React + Vite (JavaScript), estilos con CSS Modules y las variables del sistema de diseño "Habit Tracker".
Los datos se guardan en **Supabase** (Postgres en la nube) y se sincronizan entre todos tus dispositivos.

## 1. Configurar Supabase (una sola vez)

1. Creá una cuenta en https://supabase.com y un proyecto nuevo (elegí la región más cercana, p. ej. São Paulo).
2. **Base de datos:** en el proyecto andá a *SQL Editor → New query*, pegá todo el contenido de `supabase/schema.sql` y tocá *Run*. Crea las tablas, la seguridad por usuario (RLS) y los permisos.
3. **Tu usuario:** en *Authentication → Users → Add user → Create new user*, cargá tu email y una contraseña, con la opción de confirmar automáticamente activada.
4. **Cerrar el registro:** en la configuración de *Authentication* (proveedores / sign in), desactivá la opción de permitir que se registren usuarios nuevos. Así nadie más puede crearse una cuenta en tu app.
5. **Claves:** en *Project Settings → API Keys* copiá la **publishable key** (`sb_publishable_…`; si tu proyecto muestra la "anon key" antigua, sirve igual). La **URL del proyecto** está en *Project Settings → Data API* (`https://xxxx.supabase.co`).
   No uses nunca la *secret / service_role key* en el frontend.

## 2. Correr la app

```bash
cp .env.example .env.local   # y completá URL y publishable key
npm install
npm run dev                  # http://localhost:5173
```

`.env.local` no se sube a git (está en `.gitignore`). La publishable key es pública por diseño: lo que protege tus datos son las políticas RLS del paso 2.

## 3. Publicarla para usarla desde el celular (opcional)

Cualquier hosting de sitios estáticos sirve (Netlify, Vercel, Cloudflare Pages):

- Comando de build: `npm run build` · carpeta publicada: `dist`
- Variables de entorno: las mismas dos de `.env.local`
- En el celular, abrí la URL y usá "Agregar a pantalla de inicio".

## Cómo funciona

- **Guardado:** cada toque se ve al instante y se guarda en segundo plano. Si falla (sin conexión), se deshace y aparece un aviso con "Reintentar".
- **Sincronización:** al volver a la app (cambiar de pestaña o reabrirla) se recargan los datos, así lo que marcaste en el celular aparece en la compu.
- **"Hoy"** se recalcula al volver a la app, por si quedó abierta de un día para otro.

## Responsive

| Ancho | Vista |
| --- | --- |
| ≥ 1200 px | Grilla mensual completa (escritorio) |
| 900–1199 px | La misma grilla, con columnas más compactas |
| < 900 px | Vista móvil: lista "Hoy" con check del día + detalle del hábito con calendario |

## Estructura

```
supabase/schema.sql       tablas, RLS y permisos (pegar en el SQL Editor)
src/
  App.jsx                 configuración → login → tracker
  lib/supabase.js         cliente de Supabase (lee .env.local)
  hooks/useAuth.js        sesión (email + contraseña)
  hooks/useHabits.js      carga y guarda hábitos en Supabase
  hooks/useMediaQuery.js
  lib/dates.js            fechas locales "YYYY-MM-DD", nombres de meses/días
  lib/streaks.js          racha actual, mejor racha, forma de la barra
  components/
    LoginScreen, StatusScreen (cargando / error / falta configurar)
    DesktopView, HabitGrid          escritorio / tablet
    MobileHome, HabitCard, HabitDetail   celular
    DeleteHabitDialog               confirmación de borrado
    MonthSelector, AddHabitForm, IconButton, Icons
  styles/tokens.css       tokens del sistema de diseño
```

## Modelo de datos

- `habits`: `id`, `user_id`, `name`, `ended_from` (primer día del mes desde el que se dejó de seguir, o vacío), `created_at`
- `habit_days`: `habit_id`, `user_id`, `day` — una fila por día cumplido

## Reglas

- **Racha:** días seguidos marcados hasta hoy; si hoy todavía no se marcó, cuenta hasta ayer. Un día sin marcar la vuelve a 0. Cruza meses. En un mes pasado, RACHA es la racha al último día de ese mes. Los días futuros no se pueden marcar.
- **Botón "Hoy":** vuelve al mes actual (escritorio: siempre visible, apagado en el mes de hoy; celular: aparece solo en otros meses).
- **Eliminar:** siempre pide confirmación. Si hay historial anterior al mes visible, pregunta si eliminar **solo desde ese mes** (se guarda `ended_from` y se conserva lo anterior) o **también los meses anteriores** (se borra todo).
