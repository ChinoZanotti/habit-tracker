import { MONTHS, MONTHS_SHORT, isSameMonth, shiftMonth } from '../lib/dates.js';
import IconButton from './IconButton.jsx';
import { ChevronLeft, ChevronRight } from './Icons.jsx';
import styles from './MonthSelector.module.css';

const todayView = (today) => ({ year: today.getFullYear(), month: today.getMonth() });

/** Escritorio: flechas de año + botón Hoy + los 12 meses como pastillas. */
export function MonthStrip({ view, today, onChange }) {
  const { year, month } = view;
  const isCurrent = isSameMonth(view, today);
  return (
    <nav aria-label="Selector de mes" className={styles.strip}>
      <div className={styles.year}>
        <IconButton label="Año anterior" onClick={() => onChange({ year: year - 1, month })}>
          <ChevronLeft />
        </IconButton>
        <span className={`label ${styles.yearLabel}`}>{year}</span>
        <IconButton label="Año siguiente" onClick={() => onChange({ year: year + 1, month })}>
          <ChevronRight />
        </IconButton>
      </div>
      <button
        type="button"
        className={`control ${styles.todayBtn}`}
        disabled={isCurrent}
        onClick={() => onChange(todayView(today))}
        aria-label="Ir al mes de hoy"
      >
        Hoy
      </button>
      <div className={styles.pills}>
        {MONTHS_SHORT.map((name, i) => (
          <button
            key={name}
            type="button"
            aria-pressed={i === month}
            aria-label={MONTHS[i]}
            className={`control ${styles.pill} ${i === month ? styles.active : ''}`}
            onClick={() => onChange({ year, month: i })}
          >
            {name.toUpperCase()}
          </button>
        ))}
      </div>
    </nav>
  );
}

/** Móvil: ‹ Mes Año [Hoy] › — el botón Hoy aparece solo si se está viendo otro mes. */
export function MonthStepper({ view, today, onChange, className = '' }) {
  const isCurrent = isSameMonth(view, today);
  return (
    <nav aria-label="Selector de mes" className={`${styles.stepper} ${className}`}>
      <IconButton label="Mes anterior" size={44} onClick={() => onChange(shiftMonth(view, -1))}>
        <ChevronLeft />
      </IconButton>
      <span className={styles.stepperCenter}>
        <span className="label" aria-live="polite">
          {MONTHS[view.month]} {view.year}
        </span>
        {!isCurrent && (
          <button
            type="button"
            className={`control ${styles.todayPill}`}
            onClick={() => onChange(todayView(today))}
            aria-label="Ir al mes de hoy"
          >
            Hoy
          </button>
        )}
      </span>
      <IconButton label="Mes siguiente" size={44} onClick={() => onChange(shiftMonth(view, 1))}>
        <ChevronRight />
      </IconButton>
    </nav>
  );
}
