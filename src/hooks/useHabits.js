import { useCallback, useReducer } from 'react';
import { buildSampleHabits } from '../data/sampleHabits.js';

/**
 * Estado de los hábitos. Por ahora vive en memoria con datos de ejemplo.
 *
 * Forma de un hábito:
 *   { id, name, done: Set<"YYYY-MM-DD">, endedFrom: "YYYY-MM" | null }
 *
 * endedFrom: el hábito se eliminó "desde ese mes en adelante". Sigue apareciendo
 * (con su historial) en los meses anteriores y desaparece desde ese mes.
 *
 * Cuando exista el backend (Express + Postgres), este hook es el único lugar
 * que cambia: cada acción llama a la API y luego actualiza el estado.
 *   GET    /api/habits                           -> lista con sus fechas cumplidas
 *   POST   /api/habits             { name }
 *   DELETE /api/habits/:id                       -> borra el hábito y todo su historial
 *   POST   /api/habits/:id/end     { from }      -> lo termina desde el mes "from" (YYYY-MM)
 *   PUT    /api/habits/:id/days/:date            -> marcar día
 *   DELETE /api/habits/:id/days/:date            -> desmarcar día
 */
function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const name = action.name.trim();
      if (!name) return state;
      return {
        nextId: state.nextId + 1,
        habits: [...state.habits, { id: state.nextId, name, done: new Set(), endedFrom: null }],
      };
    }
    case 'remove':
      return { ...state, habits: state.habits.filter((h) => h.id !== action.id) };
    case 'end': {
      const firstDay = `${action.from}-01`;
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.id
            ? { ...h, endedFrom: action.from, done: new Set([...h.done].filter((d) => d < firstDay)) }
            : h,
        ),
      };
    }
    case 'toggle':
      return {
        ...state,
        habits: state.habits.map((h) => {
          if (h.id !== action.id) return h;
          const done = new Set(h.done);
          if (done.has(action.date)) done.delete(action.date);
          else done.add(action.date);
          return { ...h, done };
        }),
      };
    default:
      return state;
  }
}

/** ¿El hábito se sigue en el mes "YYYY-MM"? */
export const isActiveIn = (habit, mKey) => !habit.endedFrom || mKey < habit.endedFrom;

/** ¿Tiene días cumplidos antes del mes "YYYY-MM"? */
export const hasHistoryBefore = (habit, mKey) => [...habit.done].some((d) => d < `${mKey}-01`);

export function useHabits(today) {
  const [state, dispatch] = useReducer(reducer, today, (t) => {
    const habits = buildSampleHabits(t);
    return { habits, nextId: Math.max(0, ...habits.map((h) => h.id)) + 1 };
  });

  const addHabit = useCallback((name) => dispatch({ type: 'add', name }), []);
  const removeHabit = useCallback((id) => dispatch({ type: 'remove', id }), []);
  const endHabit = useCallback((id, from) => dispatch({ type: 'end', id, from }), []);
  const toggleDay = useCallback((id, date) => dispatch({ type: 'toggle', id, date }), []);

  return { habits: state.habits, addHabit, removeHabit, endHabit, toggleDay };
}
