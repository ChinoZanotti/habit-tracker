import { useEffect, useState } from 'react';
import { monthKey, startOfDay } from './lib/dates.js';
import { isConfigured } from './lib/supabase.js';
import { useAuth } from './hooks/useAuth.js';
import { isActiveIn, useHabits } from './hooks/useHabits.js';
import { useMediaQuery } from './hooks/useMediaQuery.js';
import DesktopView from './components/DesktopView.jsx';
import MobileHome from './components/MobileHome.jsx';
import HabitDetail from './components/HabitDetail.jsx';
import DeleteHabitDialog from './components/DeleteHabitDialog.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import StatusScreen, { ErrorBanner } from './components/StatusScreen.jsx';

/** Desde este ancho se muestra la grilla mensual; por debajo, la vista móvil (lista + detalle). */
const WIDE_QUERY = '(min-width: 900px)';

export default function App() {
  if (!isConfigured) {
    return (
      <StatusScreen title="Falta configurar Supabase">
        <p>
          Creá el archivo <code>.env.local</code> en la raíz del proyecto (copiá <code>.env.example</code>) con{' '}
          <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>.
        </p>
        <p>Después reiniciá <code>npm run dev</code>.</p>
      </StatusScreen>
    );
  }
  return <AuthGate />;
}

function AuthGate() {
  const { session, loading, signIn, signOut } = useAuth();
  if (loading) return <StatusScreen title="Cargando…" />;
  if (!session) return <LoginScreen onSignIn={signIn} />;
  return <Tracker userId={session.user.id} onSignOut={signOut} />;
}

/** "Hoy" se actualiza al volver a la app, por si quedó abierta de un día para otro. */
function useToday() {
  const [today, setToday] = useState(() => startOfDay(new Date()));
  useEffect(() => {
    const check = () => {
      const now = startOfDay(new Date());
      setToday((prev) => (prev.getTime() === now.getTime() ? prev : now));
    };
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    return () => {
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
    };
  }, []);
  return today;
}

function Tracker({ userId, onSignOut }) {
  const today = useToday();
  const { habits, loading, error, reload, dismissError, addHabit, removeHabit, endHabit, toggleDay } =
    useHabits(userId);
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedId, setSelectedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const isWide = useMediaQuery(WIDE_QUERY);

  if (loading) return <StatusScreen title="Cargando tus hábitos…" />;

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
    onSignOut,
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
      {error && <ErrorBanner message={error} onRetry={reload} onDismiss={dismissError} />}
      {screen}
      {dialog}
    </>
  );
}
