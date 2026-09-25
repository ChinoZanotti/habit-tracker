import styles from './StatusScreen.module.css';

/** Pantalla simple para "Cargando…" o "Falta configurar". */
export default function StatusScreen({ title, children }) {
  return (
    <main className={styles.screen} aria-busy={!children}>
      <div className={styles.box}>
        <h1 className="title">{title}</h1>
        {children && <div className={`caption ${styles.body}`}>{children}</div>}
      </div>
    </main>
  );
}

/** Aviso fijo arriba cuando algo no se pudo cargar o guardar. */
export function ErrorBanner({ message, onRetry, onDismiss }) {
  return (
    <div role="alert" className={styles.banner}>
      <span className="caption">{message}</span>
      <div className={styles.bannerActions}>
        <button type="button" className={`control ${styles.bannerBtn}`} onClick={onRetry}>
          Reintentar
        </button>
        <button type="button" className={`control ${styles.bannerGhost}`} onClick={onDismiss}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
