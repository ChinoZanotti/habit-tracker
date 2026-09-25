import { useId, useState } from 'react';
import IconButton from './IconButton.jsx';
import { Plus } from './Icons.jsx';
import styles from './AddHabitForm.module.css';

/** Campo "Nuevo hábito" + botón +. Enter también agrega (es un <form>). */
export default function AddHabitForm({ onAdd, showLabel = true, className = '' }) {
  const [name, setName] = useState('');
  const id = useId();

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name);
    setName('');
  };

  return (
    <form className={`${styles.form} ${className}`} onSubmit={submit}>
      <label htmlFor={id} className={showLabel ? `control ${styles.label}` : 'visually-hidden'}>
        Nuevo hábito
      </label>
      <input
        id={id}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={showLabel ? 'Ej. Ir al gimnasio' : 'Nuevo hábito'}
        maxLength={80}
        autoComplete="off"
        className={`label ${styles.input}`}
      />
      <IconButton label="Agregar hábito" variant="ink" type="submit">
        <Plus />
      </IconButton>
    </form>
  );
}
