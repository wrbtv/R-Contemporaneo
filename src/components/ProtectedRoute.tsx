import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    async function verifySession() {
      if (!supabase) {
        if (mounted) {
          setIsAuthenticated(false);
          setLoading(false);
        }
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setIsAuthenticated(Boolean(session));
          setLoading(false);
        }
      } catch (err) {
        console.error('Erro ao verificar sessão:', err);
        if (mounted) {
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    }

    verifySession();

    // Listener para mudanças no estado de auth (logout, expiração de token)
    const { data: authListener } = supabase?.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsAuthenticated(Boolean(session));
        setLoading(false);
      }
    }) || { data: null };

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0a08] flex flex-col items-center justify-center text-[#f8f0e4]">
        <div className="w-10 h-10 border-2 border-[#d8a84e] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif text-sm text-[#f5d38b]">Verificando autenticação...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
