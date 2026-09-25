# Habit Tracker — frontend

React + Vite (JavaScript), estilos con CSS Modules y las variables del sistema de diseño "Habit Tracker".

## Arrancar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
```

## Responsive

| Ancho | Vista |
| --- | --- |
| ≥ 1200 px | Grilla mensual completa (escritorio) |
| 900–1199 px | La misma grilla, con columnas más compactas |
| < 900 px | Vista móvil: lista "Hoy" con check del día + detalle del hábito con calendario |

Si la grilla no entra (ventanas muy angostas por encima de 900 px), se desplaza horizontalmente.

## Estructura

```
src/
  App.jsx                 elige la vista según el ancho (useMediaQuery)
  hooks/useHabits.js      estado de los hábitos — ÚNICO punto a cambiar al conectar la API
  hooks/useMediaQuery.js
  lib/dates.js            fechas locales "YYYY-MM-DD", nombres de meses/días
  lib/streaks.js          racha actual, mejor racha, forma de la barra
  data/sampleHabits.js    datos de ejemplo (relativos a hoy, se pierden al recargar)
  components/
    DesktopView, HabitGrid          escritorio / tablet
    MobileHome, HabitCard, HabitDetail   celular
    DeleteHabitDialog               confirmación de borrado (modal / hoja en celular)
    MonthSelector, AddHabitForm, IconButton, Icons
  styles/tokens.css       tokens del sistema de diseño
```

## Reglas de la racha

- Cuenta los días seguidos marcados hasta hoy. Si hoy todavía no se marcó, cuenta hasta ayer (el día no terminó).
- Un día sin marcar la vuelve a 0.
- Cruza meses: el 1 de octubre continúa la racha de septiembre.
- En un mes pasado, la columna RACHA muestra la racha al último día de ese mes.
- Los días futuros no se pueden marcar.

## Botón "Hoy"

Vuelve al mes actual. En escritorio está siempre junto al selector de año (apagado si ya estás en el mes de hoy); en celular aparece junto al nombre del mes solo cuando estás viendo otro mes.

## Eliminar un hábito

Siempre pide confirmación. Si el hábito tiene días registrados antes del mes que estás viendo, pregunta:

- **Solo desde este mes**: el hábito deja de aparecer desde ese mes en adelante (se borran sus días de ese mes y los siguientes) y se conserva el historial anterior. Se guarda como `endedFrom: "YYYY-MM"`.
- **También los meses anteriores**: se borra el hábito con todo su historial.

Si no tiene historial previo, es una confirmación simple.

## Próximo paso: backend

Modelo sugerido para Postgres:

```sql
CREATE TABLE habits (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  ended_from DATE,          -- primer día del mes desde el que se dejó de seguir (NULL = activo)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE habit_days (
  habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  day      DATE    NOT NULL,
  PRIMARY KEY (habit_id, day)
);
```

Endpoints que espera `useHabits.js`:

```
GET    /api/habits                    -> [{ id, name, endedFrom, done: ["2026-09-25", ...] }]
POST   /api/habits          { name }
DELETE /api/habits/:id                  (borra todo el historial)
POST   /api/habits/:id/end   { from: "2026-09" }   (solo desde ese mes)
PUT    /api/habits/:id/days/:date     (marcar)
DELETE /api/habits/:id/days/:date     (desmarcar)
```
