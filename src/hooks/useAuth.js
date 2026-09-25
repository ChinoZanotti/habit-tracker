import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

/** Sesión de Supabase: { session, loading, signIn, signOut }. La sesión queda guardada en el dispositivo. */
export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (!error) return null;
    if (error.message?.toLowerCase().includes('invalid login')) return 'Email o contraseña incorrectos.';
    return 'No se pudo iniciar sesión. Revisá tu conexión e intentá de nuevo.';
  }, []);

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  return { session, loading, signIn, signOut };
}
