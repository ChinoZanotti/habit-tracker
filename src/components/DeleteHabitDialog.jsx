import { useEffect, useRef } from 'react';
import { MONTHS } from '../lib/dates.js';
import { hasHistoryBefore } from '../hooks/useHabits.js';
import styles from './DeleteHabitDialog.module.css';

/**
 * Confirmación para eliminar un hábito.
 * Si tiene días registrados antes del mes que se está viendo, pregunta:
 *   - Solo desde este mes (se conserva el historial anterior), o
 *   - También los meses anteriores (se borra todo).
 * Usa <dialog> nativo: foco atrapado, Esc cierra, fondo inerte.
 */
export default function DeleteHabitDialog({ habit, view, onCancel, onEndFromMonth, onDeleteAll }) {
  const ref = useRef(null);
  const mKey = `${view.year}-${String(view.month + 1).padStart(2, '0')}`;
  const monthName = `${MONTHS[view.month].toLowerCase()} ${view.year}`;
  const prev = new Date(view.year, view.month - 1, 1);
  const prevName = `${MONTHS[prev.getMonth()].toLowerCase()} ${prev.getFullYear()}`;
  const withHistory = hasHistoryBefore(habit, mKey);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.open && dialog.close();
  }, []);

  const handleCancel = (e) => {
    e.preventDefault(); // Esc: cerramos nosotros para mantener el estado en React
    onCancel();
  };

  const handleBackdrop = (e) => {
    if (e.target === ref.current) onCancel();
  };

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="delete-title"
      aria-describedby="delete-desc"
      onCancel={handleCancel}
      onClick={handleBackdrop}
    >
      <div className={styles.body}>
        <h2 id="delete-title" className={`title ${styles.title}`}>
          ¿Eliminar «{habit.name}»?
        </h2>

        {withHistory ? (
          <>
            <p id="delete-desc" className="caption">
              Tiene días registrados en meses anteriores. Elegí qué querés eliminar.
            </p>
            <div className={styles.options}>
              <button type="button" className={styles.option} onClick={onEndFromMonth} autoFocus>
                <span className="label">Solo desde {monthName}</span>
                <span className="caption">Se conserva el historial hasta {prevName}.</span>
              </button>
              <button type="button" className={`${styles.option} ${styles.optionDanger}`} onClick={onDeleteAll}>
                <span className="label">También los meses anteriores</span>
                <span className="caption">Se borra el hábito y todo su historial.</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <p id="delete-desc" className="caption">
              Se borra el hábito y todos sus días marcados.
            </p>
            <div className={styles.options}>
              <button type="button" className={`control ${styles.primary}`} onClick={onDeleteAll}>
                Eliminar
              </button>
            </div>
          </>
        )}

        <button type="button" className={`control ${styles.cancel}`} onClick={onCancel} autoFocus={!withHistory}>
          Cancelar
        </button>
      </div>
    </dialog>
  );
}
