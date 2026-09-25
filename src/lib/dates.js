export const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
export const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const WEEKDAY_INITIALS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
/** Encabezado de calendario que empieza en lunes. */
export const WEEK_HEAD_MONDAY = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const pad = (n) => String(n).padStart(2, '0');

/** Clave de fecha local "YYYY-MM-DD": es el formato que también usará la API / Postgres (DATE). */
export const dateKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
export const keyOfDate = (date) => dateKey(date.getFullYear(), date.getMonth(), date.getDate());

export const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
export const addDays = (date, n) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
export const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

/** <0 si (y, m) es anterior al mes de `today`, 0 si es el mismo, >0 si es posterior. */
export const compareMonth = (y, m, today) =>
  y === today.getFullYear() ? m - today.getMonth() : y - today.getFullYear();

export const shiftMonth = ({ year, month }, delta) => {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
};

/** Clave de mes "YYYY-MM" (se compara como texto: "2026-08" < "2026-09"). */
export const monthKey = (y, m) => `${y}-${pad(m + 1)}`;

export const isSameMonth = (view, today) =>
  view.year === today.getFullYear() && view.month === today.getMonth();

export const range =(a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

export const todayLabel = (today) =>
  `${WEEKDAYS_SHORT[today.getDay()]} ${today.getDate()} ${MONTHS_SHORT[today.getMonth()]}`;
