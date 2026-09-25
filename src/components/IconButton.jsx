import styles from './IconButton.module.css';

/**
 * Botón redondo del sistema (radius-full).
 * variant: "raised" (blanco) | "ink" (negro) | "soft" (secundario)
 * size: 44 | 48 | 32
 */
export default function IconButton({ label, variant = 'raised', size = 48, className = '', children, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`${styles.btn} ${styles[variant]} ${className}`}
      style={{ width: size, height: size }}
      {...rest}
    >
      {children}
    </button>
  );
}
