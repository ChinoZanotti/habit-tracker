import { MONTHS, WEEKDAY_INITIALS, dateKey, range } from '../lib/dates.js';
import { dayShape, monthStats } from '../lib/streaks.js';
import IconButton from './IconButton.jsx';
import { Close } from './Icons.jsx';
import styles from './HabitGrid.module.css';

/** Grilla mensual: una fila por hábito, una columna por día, racha al final. */
export default function HabitGrid({ habits, today, year, month, onToggleDay, onRemoveHabit }) {
  const n = new Date(year, month + 1, 0).getDate();
  const days = range(1, n);
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDay = isCurrentMonth ? today.getDate() : null;
  const columns = { '--days': n };

  return (
    <section aria-label={`Hábitos de ${MONTHS[month]} ${year}`} className={styles.scroller}>
      <div className={styles.grid} style={columns}>
        <div className={styles.headRow}>
          <span className={`control ${styles.headName}`}>HÁBITO</span>
          {days.map((d) => (
            <span key={d} className={styles.headDay}>
              <span className={`${styles.weekday} muted`}>{WEEKDAY_INITIALS[new Date(year, month, d).getDay()]}</span>
              <span className={`${styles.dayNum} ${d === todayDay ? styles.dayNumToday : ''}`}>{d}</span>
            </span>
          ))}
          <span className={`control ${styles.headTotal}`}>RACHA</span>
        </div>

        {habits.length === 0 && (
          <p className={`label ${styles.empty}`}>Todavía no hay hábitos. Agregá el primero abajo.</p>
        )}

        {habits.map((habit) => {
          const stats = monthStats(habit.done, year, month, today);
          return (
            <div key={habit.id} className={styles.row}>
              <div className={styles.name}>
                <div className={styles.nameText}>
                  <span className={`label ${styles.ellipsis}`} title={habit.name}>{habit.name}</span>
                  <span className="caption muted">
                    {stats.done} días · mejor racha {stats.best}
                  </span>
                </div>
                <IconButton
                  label={`Eliminar ${habit.name}`}
                  variant="soft"
                  size={32}
                  className={styles.remove}
                  onClick={() => onRemoveHabit(habit.id)}
                >
                  <Close />
                </IconButton>
              </div>

              {days.map((d) => {
                const s = dayShape(habit.done, year, month, d, stats.lastDay);
                const cls = [styles.cell, d === todayDay && styles.today].filter(Boolean).join(' ');
                return (
                  <button
                    key={d}
                    type="button"
                    className={cls}
                    disabled={s.future}
                    aria-pressed={s.on}
                    aria-label={`${habit.name}, ${d} de ${MONTHS[month]}`}
                    onClick={() => onToggleDay(habit.id, dateKey(year, month, d))}
                  >
                    {s.on && (
                      <span
                        className={[styles.bar, s.joinPrev && styles.joinPrev, s.joinNext && styles.joinNext]
                          .filter(Boolean)
                          .join(' ')}
                      />
                    )}
                    {!s.on && !s.future && <span className={styles.dot} />}
                    {s.future && <span className={styles.futureDot} />}
                  </button>
                );
              })}

              <div className={styles.total}>
                <span className="title">{stats.streak}</span>
                <span className={styles.unit}>{stats.streak === 1 ? 'día seguido' : 'días seguidos'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
