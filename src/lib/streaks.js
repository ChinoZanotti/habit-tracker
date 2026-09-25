import { addDays, compareMonth, daysInMonth, dateKey, keyOfDate } from './dates.js';

/**
 * Racha actual: días seguidos marcados que terminan en `refDate`.
 * Si `refDate` es hoy y todavía no se marcó, se cuenta hasta ayer
 * (el día no terminó, así que la racha no se corta todavía).
 * Cruza meses: un 1 de octubre sigue la racha de septiembre.
 */
export function streakEndingAt(done, refDate, today) {
  let d = refDate;
  if (keyOfDate(d) === keyOfDate(today) && !done.has(keyOfDate(d))) d = addDays(d, -1);
  let count = 0;
  while (done.has(keyOfDate(d))) {
    count += 1;
    d = addDays(d, -1);
  }
  return count;
}

/**
 * Datos de un hábito para el mes visible.
 * - lastDay: último día que se puede marcar (hoy en el mes actual, fin de mes en el pasado, 0 en el futuro)
 * - streak: racha al cierre del mes (o a hoy, si es el mes actual)
 * - best: mejor racha dentro del mes
 * - done: días cumplidos en el mes
 */
export function monthStats(done, year, month, today, { closed = false } = {}) {
  const n = daysInMonth(year, month);
  const cmp = compareMonth(year, month, today);
  // closed: el hábito ya no se sigue en este mes (se eliminó "desde este mes"): nada se puede marcar.
  const lastDay = closed ? 0 : cmp < 0 ? n : cmp === 0 ? today.getDate() : 0;
  const streak = lastDay ? streakEndingAt(done, new Date(year, month, lastDay), today) : 0;

  let best = 0;
  let run = 0;
  let count = 0;
  for (let d = 1; d <= n; d += 1) {
    if (done.has(dateKey(year, month, d))) {
      run += 1;
      count += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return { daysInMonth: n, lastDay, isCurrentMonth: cmp === 0, streak, best, done: count };
}

/**
 * Forma de un día dentro de la barra: si está marcado y si se une con el anterior / siguiente.
 * `rowStart` / `rowEnd` cortan la barra (p. ej. al cambiar de semana en el calendario).
 */
export function dayShape(done, year, month, day, lastDay, { rowStart = false, rowEnd = false } = {}) {
  const future = day > lastDay;
  const on = !future && done.has(dateKey(year, month, day));
  const joinPrev = on && !rowStart && done.has(dateKey(year, month, day - 1));
  const joinNext = on && !rowEnd && day + 1 <= lastDay && done.has(dateKey(year, month, day + 1));
  return { on, future, joinPrev, joinNext };
}
