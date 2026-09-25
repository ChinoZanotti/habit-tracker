import { useCallback, useEffect, useReducer, useRef } from 'react';
import { supabase } from '../lib/supabase.js';

/**
 * Hábitos guardados en Supabase (tablas habits y habit_days, ver supabase/schema.sql).
 *
 * Forma de un hábito en la app:
 *   { id, name, done: Set<"YYYY-MM-DD">, endedFrom: "YYYY-MM" | null }
 *
 * Los cambios se aplican primero en pantalla (se siente instantáneo) y después
 * se guardan. Si el guardado falla, se deshace o se recarga desde la base y se
 * muestra un aviso.
 */

const PAGE = 1000; // Supabase devuelve como máximo 1000 filas por pedido

const toHabit = (row, days = []) => ({
  id: row.id,
  name: row.name,
  endedFrom: row.ended_from ? row.ended_from.slice(0, 7) : null,
  done: new Set(days),
});

async function fetchAll() {
  const { data: rows, error } = await supabase
    .from('habits')
    .select('id, name, ended_from')
    .order('created_at', { ascending: true });
  if (error) throw error;

  const daysByHabit = new Map();
  for (let from = 0; ; from += PAGE) {
    const { data, error: e } = await supabase
      .from('habit_days')
      .select('habit_id, day')
      .order('habit_id')
      .order('day')
      .range(from, from + PAGE - 1);
    if (e) throw e;
    for (const { habit_id, day } of data) {
      if (!daysByHabit.has(habit_id)) daysByHabit.set(habit_id, []);
      daysByHabit.get(habit_id).push(day);
    }
    if (data.length < PAGE) break;
  }

  return rows.map((r) => toHabit(r, daysByHabit.get(r.id)));
}

function reducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { ...state, loading: state.habits.length === 0 };
    case 'loaded':
      return { ...state, habits: action.habits, loading: false };
    case 'error':
      return { ...state, loading: false, error: action.message };
    case 'dismiss':
      return { ...state, error: null };
    case 'add':
      return { ...state, habits: [...state.habits, action.habit] };
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
    case 'set-day':
      return {
        ...state,
        habits: state.habits.map((h) => {
          if (h.id !== action.id) return h;
          const done = new Set(h.done);
          if (action.on) done.add(action.date);
          else done.delete(action.date);
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

const SAVE_ERROR = 'No se pudo guardar el último cambio. Revisá tu conexión.';

export function useHabits(userId) {
  const [state, dispatch] = useReducer(reducer, { habits: [], loading: true, error: null });
  const stateRef = useRef(state);
  stateRef.current = state;

  const reload = useCallback(async () => {
    dispatch({ type: 'loading' });
    try {
      dispatch({ type: 'loaded', habits: await fetchAll() });
    } catch {
      dispatch({ type: 'error', message: 'No se pudieron cargar tus hábitos. Revisá tu conexión.' });
    }
  }, []);

  // Carga inicial, y recarga al volver a la app (así el celular y la compu quedan sincronizados).
  useEffect(() => {
    if (!userId) return undefined;
    reload();
    const onVisible = () => document.visibilityState === 'visible' && reload();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [userId, reload]);

  const failed = useCallback(async () => {
    dispatch({ type: 'error', message: SAVE_ERROR });
    await reload();
  }, [reload]);

  const addHabit = useCallback(async (name) => {
    const clean = name.trim();
    if (!clean) return;
    const { data, error } = await supabase.from('habits').insert({ name: clean }).select('id, name, ended_from').single();
    if (error) dispatch({ type: 'error', message: 'No se pudo crear el hábito. Revisá tu conexión.' });
    else dispatch({ type: 'add', habit: toHabit(data) });
  }, []);

  const removeHabit = useCallback(async (id) => {
    dispatch({ type: 'remove', id });
    const { error } = await supabase.from('habits').delete().eq('id', id); // habit_days se borra en cascada
    if (error) failed();
  }, [failed]);

  const endHabit = useCallback(async (id, from) => {
    dispatch({ type: 'end', id, from });
    const firstDay = `${from}-01`;
    const { error } = await supabase.from('habits').update({ ended_from: firstDay }).eq('id', id);
    const { error: e2 } = error
      ? { error }
      : await supabase.from('habit_days').delete().eq('habit_id', id).gte('day', firstDay);
    if (error || e2) failed();
  }, [failed]);

  const toggleDay = useCallback(async (id, date) => {
    const habit = stateRef.current.habits.find((h) => h.id === id);
    if (!habit) return;
    const on = !habit.done.has(date);
    dispatch({ type: 'set-day', id, date, on });

    const { error } = on
      ? await supabase.from('habit_days').insert({ habit_id: id, day: date })
      : await supabase.from('habit_days').delete().eq('habit_id', id).eq('day', date);

    // 23505 = ya estaba marcado (doble toque o marcado desde otro dispositivo): no es un error.
    if (error && error.code !== '23505') {
      dispatch({ type: 'set-day', id, date, on: !on });
      dispatch({ type: 'error', message: SAVE_ERROR });
    }
  }, []);

  const dismissError = useCallback(() => dispatch({ type: 'dismiss' }), []);

  return {
    habits: state.habits,
    loading: state.loading,
    error: state.error,
    reload,
    dismissError,
    addHabit,
    removeHabit,
    endHabit,
    toggleDay,
  };
}
