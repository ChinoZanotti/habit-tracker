import { addDays, keyOfDate, range } from '../lib/dates.js';

/**
 * Datos de ejemplo, relativos a hoy para que siempre se vean rachas "vivas".
 * Cada número es "hace N días" (0 = hoy).
 * Se pierden al recargar: se reemplazan por la API cuando exista el backend.
 */
const PATTERNS = [
  { id: 1, name: 'Ir al gimnasio', ago: [...range(0, 6), ...range(8, 10), ...range(12, 16), 18, 19, 21, 22, 23, ...range(30, 40)] },
  { id: 2, name: 'Leer 20 minutos', ago: [...range(1, 8), ...range(11, 24), ...range(26, 60)] },
  { id: 3, name: 'Tomar 2 L de agua', ago: [0, ...range(2, 5), ...range(12, 16), 19, 20, 21] },
  { id: 4, name: 'Meditar', ago: [...range(12, 15), 21, 22] },
  { id: 5, name: 'Dormir antes de las 23 h', ago: range(0, 44) },
];

export function buildSampleHabits(today) {
  return PATTERNS.map(({ id, name, ago }) => ({
    id,
    name,
    done: new Set(ago.map((n) => keyOfDate(addDays(today, -n)))),
    endedFrom: null,
  }));
}
