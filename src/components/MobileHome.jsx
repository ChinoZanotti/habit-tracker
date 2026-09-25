import { MONTHS_SHORT, WEEKDAYS_SHORT, compareMonth, keyOfDate } from '../lib/dates.js';
import { MonthStepper } from './MonthSelector.jsx';
import HabitCard from './HabitCard.jsx';
import AddHabitForm from './AddHabitForm.jsx';
import styles from './Mobile.module.css';

/** Pantalla principal en celular: hoy + lista de hábitos con su barra del mes. */
export default function MobileHome({ habits, todayHabits, today, view, onViewChange, onToggleDay, onAddHabit, onOpenHabit }) {
  const todayKey = keyOfDate(today);
  const doneToday = todayHabits.filter((h) => h.done.has(todayKey)).length;
  const activeToday = new Set(todayHabits.map((h) => h.id));
  const isCurrent = compareMonth(view.year, view.month, today) === 0;

  // Mes actual: "25 Vie, Sep". Otro mes: "08 Ago, 2026".
  const hero = isCurrent
    ? { num: today.getDate(), a: `${WEEKDAYS_SHORT[today.getDay()]},`, b: MONTHS_SHORT[today.getMonth()] }
    : { num: String(view.month + 1).padStart(2, '0'), a: `${MONTHS_SHORT[view.month]},`, b: view.year };

  return (
    <main className={styles.screen}>
      <MonthStepper view={view} today={today} onChange={onViewChange} />

      <header className={styles.hero}>
        <span className={`numeral-xl ${styles.heroNum}`}>{hero.num}</span>
        <h1 className={`title ${styles.heroText}`}>
          <span>{hero.a}</span>
          <span>{hero.b}</span>
        </h1>
      </header>
      <p className={`caption ${styles.heroCaption}`}>
        {doneToday} de {todayHabits.length} hábitos cumplidos hoy
      </p>

      <section aria-label="Hábitos" className={styles.list}>
        {habits.length === 0 && (
          <p className={`label ${styles.empty}`}>Todavía no hay hábitos. Agregá el primero abajo.</p>
        )}
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            today={today}
            view={view}
            canCheckToday={activeToday.has(habit.id)}
            onOpen={() => onOpenHabit(habit.id)}
            onToggleToday={() => onToggleDay(habit.id, todayKey)}
          />
        ))}
      </section>

      <div className={styles.addBar}>
        <AddHabitForm onAdd={onAddHabit} showLabel={false} />
      </div>
    </main>
  );
}
