import { keyOfDate, range } from '../lib/dates.js';
import { dayShape, monthStats } from '../lib/streaks.js';
import IconButton from './IconButton.jsx';
import { Check, Ring } from './Icons.jsx';
import styles from './Mobile.module.css';

/** Tarjeta de hábito en celular: nombre, barra del mes, racha y check de hoy. */
export default function HabitCard({ habit, today, view, canCheckToday = true, onOpen, onToggleToday }) {
  const { year, month } = view;
  const stats = monthStats(habit.done, year, month, today);
  const doneToday = habit.done.has(keyOfDate(today));
  const todayDay = stats.isCurrentMonth ? today.getDate() : null;

  return (
    <article className={styles.card}>
      <button type="button" className={styles.cardMain} onClick={onOpen} aria-label={`Ver ${habit.name}`}>
        <span className={`label ${styles.ellipsis}`}>{habit.name}</span>
        <span className="caption muted">
          {stats.done} días · mejor {stats.best}
        </span>
        <span className={styles.strip} aria-hidden="true">
          {range(1, stats.daysInMonth).map((d) => {
            const s = dayShape(habit.done, year, month, d, stats.lastDay);
            const cls = [
              styles.seg,
              s.on && styles.segOn,
              s.joinPrev && styles.segJoinPrev,
              s.joinNext && styles.segJoinNext,
              !s.on && !s.future && (d === todayDay ? styles.segToday : styles.segOpen),
            ]
              .filter(Boolean)
              .join(' ');
            return <span key={d} className={cls} />;
          })}
        </span>
      </button>

      <div className={styles.cardStreak}>
        <span className="title">{stats.streak}</span>
        <span className={styles.unit}>{stats.streak === 1 ? 'día' : 'días'}</span>
      </div>

      {canCheckToday && (
      <IconButton
        size={44}
        variant={doneToday ? 'ink' : 'raised'}
        aria-pressed={doneToday}
        label={doneToday ? `${habit.name}: cumplido hoy` : `Marcar ${habit.name} como cumplido hoy`}
        onClick={onToggleToday}
      >
        {doneToday ? <Check /> : <Ring />}
      </IconButton>
      )}
    </article>
  );
}
