import { MONTHS, daysInMonth, keyOfDate, todayLabel } from '../lib/dates.js';
import { MonthStrip } from './MonthSelector.jsx';
import HabitGrid from './HabitGrid.jsx';
import AddHabitForm from './AddHabitForm.jsx';
import styles from './DesktopView.module.css';

export default function DesktopView({ habits, todayHabits, today, view, onViewChange, onToggleDay, onAddHabit, onRequestRemove }) {
  const { year, month } = view;
  const todayKey = keyOfDate(today);
  const doneToday = todayHabits.filter((h) => h.done.has(todayKey)).length;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.monthHero}>
          <span className={`numeral-xl ${styles.monthNum}`} aria-hidden="true">
            {String(month + 1).padStart(2, '0')}
          </span>
          <div className={styles.monthText}>
            <h1 className="title">{MONTHS[month]}</h1>
            <p className="caption">
              {year} · {daysInMonth(year, month)} días
            </p>
          </div>
        </div>
        <div className={styles.today}>
          <p className="caption">Hoy, {todayLabel(today)}</p>
          <p className="numeral-lg">
            {doneToday}
            <span className="muted">/{todayHabits.length}</span>
          </p>
          <p className="caption">hábitos cumplidos</p>
        </div>
      </header>

      <MonthStrip view={view} today={today} onChange={onViewChange} />

      <HabitGrid
        habits={habits}
        today={today}
        year={year}
        month={month}
        onToggleDay={onToggleDay}
        onRemoveHabit={onRequestRemove}
      />

      <AddHabitForm onAdd={onAddHabit} className={styles.add} />
    </main>
  );
}
