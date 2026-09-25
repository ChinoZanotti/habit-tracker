import { useState } from 'react';
import styles from './LoginScreen.module.css';

/** Inicio de sesión con email y contraseña (el usuario se crea en Supabase → Authentication). */
export default function LoginScreen({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const message = await onSignIn(email, password);
    if (message) {
      setError(message);
      setBusy(false);
    }
  };

  return (
    <main className={styles.screen}>
      <form className={styles.card} onSubmit={submit} noValidate>
        <h1 className={`title ${styles.title}`}>
          Habit
          <br />
          Tracker
        </h1>

        <div className={styles.field}>
          <label htmlFor="login-email" className="control">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`label ${styles.input}`}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="login-password" className="control">Contraseña</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`label ${styles.input}`}
          />
        </div>

        {error && (
          <p role="alert" className={`caption ${styles.error}`}>
            {error}
          </p>
        )}

        <button type="submit" className={`control ${styles.submit}`} disabled={busy || !email || !password}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
