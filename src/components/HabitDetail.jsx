import { MONTHS, WEEK_HEAD_MONDAY, dateKey, monthKey, plural, range, todayLabel } from '../lib/dates.js';
import { isActiveIn } from '../hooks/useHabits.js';
import { dayShape, monthStats } from '../lib/streaks.js';
import IconButton from './IconButton.jsx';
import { ChevronLeft } from './Icons.jsx';
import { MonthStepper } from './MonthSelector.jsx';
import styles from './Mobile.module.css';

/** Detalle de un hábito en celular: racha grande + calendario del mes para marcar días. */
export default function HabitDetail({ habit, today, view, onViewChange, onToggleDay, onBack, onRequestRemove }) {
  const { year, month } = view;
  // Si el hábito se eliminó "desde" un mes, en ese mes y los siguientes no se puede marcar nada.
  const closed = !isActiveIn(habit, monthKey(year, month));
  const stats = monthStats(habit.done, year, month, today, { closed });
  const [endY, endM] = (habit.endedFrom || '').split('-').map(Number);
  const todayDay = stats.isCurrentMonth ? today.getDate() : null;

  // Calendario que empieza en lunes: huecos antes del día 1 y al final.
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = [...Array(offset).fill(null), ...range(1, stats.daysInMonth)];
  while (cells.length % 7) cells.push(null);
  const weeks = range(0, cells.length / 7 - 1).map((w) => cells.slice(w * 7, w * 7 + 7));

  return (
    <main className={`${styles.screen} ${styles.detail}`}>
      <div className={styles.topBar}>
        <IconButton label="Volver a la lista" size={44} onClick={onBack}>
          <ChevronLeft />
        </IconButton>
        <span className="caption">Hoy, {todayLabel(today)}</span>
      </div>

      <h1 className={`title ${styles.detailTitle}`}>{habit.name}</h1>

      <div className={styles.detailStreak}>
        <span className={`numeral-xl ${styles.heroNum}`}>{stats.streak}</span>
        <div className={styles.detailStreakText}>
          <span className="label">{stats.streak === 1 ? 'día seguido' : 'días seguidos'}</span>
          <span className="caption">
            Mejor racha {stats.best} · {plural(stats.done, 'día', 'días')} este mes
          </span>
        </div>
      </div>

      <MonthStepper view={view} today={today} onChange={onViewChange} className={styles.detailStepper} />
      {closed && (
        <p className={`caption ${styles.closedNote}`}>
          Este hábito se dejó de seguir desde {MONTHS[endM - 1].toLowerCase()} {endY}.
        </p>
      )}

      <div className={styles.calHead} aria-hidden="true">
        {WEEK_HEAD_MONDAY.map((w, i) => (
          <span key={i} className="muted">{w}</span>
        ))}
      </div>
      <div role="group" aria-label={`Días de ${MONTHS[month]}`} className={styles.calendar}>
        {weeks.map((week, wi) => (
          <div key={wi} className={styles.week}>
            {week.map((d, col) => {
              if (d === null) return <span key={`b${col}`} />;
              const s = dayShape(habit.done, year, month, d, stats.lastDay, {
                rowStart: col === 0,
                rowEnd: col === 6,
              });
              const cls = [styles.calDay, s.on && styles.calDayOn, s.future && styles.calDayFuture]
                .filter(Boolean)
                .join(' ');
              return (
                <button
                  key={d}
                  type="button"
                  className={cls}
                  disabled={s.future}
                  aria-pressed={s.on}
                  aria-label={`${d} de ${MONTHS[month]}`}
                  onClick={() => onToggleDay(habit.id, dateKey(year, month, d))}
                >
                  {s.on && (
                    <span
                      className={[styles.calBar, s.joinPrev && styles.joinPrev, s.joinNext && styles.joinNext]
                        .filter(Boolean)
                        .join(' ')}
                    />
                  )}
                  <span className={styles.calNum}>{d}</span>
                  {d === todayDay && <span className={styles.calToday} />}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {!closed && (
        <div className={styles.detailFooter}>
          <button type="button" className={`control ${styles.outlineBtn}`} onClick={() => onRequestRemove(habit.id)}>
            Eliminar hábito
          </button>
        </div>
      )}
    </main>
  );
}
