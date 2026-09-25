import { useMemo, useState } from 'react';
import { monthKey, startOfDay } from './lib/dates.js';
import { isActiveIn, useHabits } from './hooks/useHabits.js';
import { useMediaQuery } from './hooks/useMediaQuery.js';
import DesktopView from './components/DesktopView.jsx';
import MobileHome from './components/MobileHome.jsx';
import HabitDetail from './components/HabitDetail.jsx';
import DeleteHabitDialog from './components/DeleteHabitDialog.jsx';

/** Desde este ancho se muestra la grilla mensual; por debajo, la vista móvil (lista + detalle). */
const WIDE_QUERY = '(min-width: 900px)';

export default function App() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const { habits, addHabit, removeHabit, endHabit, toggleDay } = useHabits(today);
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedId, setSelectedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const isWide = useMediaQuery(WIDE_QUERY);

  const viewKey = monthKey(view.year, view.month);
  const todayKey = monthKey(today.getFullYear(), today.getMonth());
  // Hábitos que se siguen en el mes visible, y los que se siguen hoy (para el resumen "3/5").
  const visibleHabits = habits.filter((h) => isActiveIn(h, viewKey));
  const todayHabits = habits.filter((h) => isActiveIn(h, todayKey));

  const deleting = habits.find((h) => h.id === deletingId);
  const closeDelete = () => setDeletingId(null);
  const dialog = deleting && (
    <DeleteHabitDialog
      habit={deleting}
      view={view}
      onCancel={closeDelete}
      onEndFromMonth={() => {
        endHabit(deleting.id, viewKey);
        closeDelete();
        setSelectedId(null);
      }}
      onDeleteAll={() => {
        removeHabit(deleting.id);
        closeDelete();
        setSelectedId(null);
      }}
    />
  );

  const shared = {
    habits: visibleHabits,
    todayHabits,
    today,
    view,
    onViewChange: setView,
    onToggleDay: toggleDay,
    onRequestRemove: setDeletingId,
  };

  let screen;
  if (isWide) {
    screen = <DesktopView {...shared} onAddHabit={addHabit} />;
  } else {
    const selected = habits.find((h) => h.id === selectedId);
    screen = selected ? (
      <HabitDetail {...shared} habit={selected} onBack={() => setSelectedId(null)} />
    ) : (
      <MobileHome {...shared} onAddHabit={addHabit} onOpenHabit={setSelectedId} />
    );
  }

  return (
    <>
      {screen}
      {dialog}
    </>
  );
}
