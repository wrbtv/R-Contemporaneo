import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Lock, Mail, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Se já estiver com sessão ativa, vai direto para o admin
  useEffect(() => {
    async function checkExistingSession() {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/admin');
      }
    }
    checkExistingSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg('O Supabase ainda não foi configurado no arquivo .env.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message === 'Invalid login credentials' 
          ? 'E-mail ou senha incorretos.' 
          : error.message);
      } else if (data.session) {
        navigate('/admin');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0a08] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-b from-[#1a110c] to-[#100b08] border border-[#80602f]/60 rounded-2xl p-8 shadow-2xl text-[#f8f0e4]">
        {/* Topo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-[#d8a84e] transition-colors mb-4">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Cardápio</span>
          </Link>
          
          <div className="w-14 h-14 mx-auto rounded-full border border-[#d8a84e] bg-[#21140e] flex items-center justify-center mb-3 shadow-lg shadow-[#d8a84e]/10">
            <ShieldCheck className="w-7 h-7 text-[#d8a84e]" />
          </div>
          
          <h1 className="font-serif text-2xl font-bold text-[#f5d38b]">
            Painel Administrativo
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Restaurante Contemporâneo
          </p>
        </div>

        {/* Alerta de Configuração Supabase */}
        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 bg-amber-950/40 border border-amber-600/50 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Configuração Pendente:</strong>
              Insira o <code className="text-amber-300">VITE_SUPABASE_URL</code> e <code className="text-amber-300">VITE_SUPABASE_ANON_KEY</code> no seu arquivo <code>.env</code> para autenticar.
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-950/40 border border-red-700/50 rounded-lg text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              E-mail do Administrador
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@rcontemporaneo.com.br"
                className="w-full bg-[#100a07] border border-[#593720] focus:border-[#d8a84e] text-xs text-white pl-10 pr-4 py-3 rounded-lg outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#100a07] border border-[#593720] focus:border-[#d8a84e] text-xs text-white pl-10 pr-4 py-3 rounded-lg outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#f1d18b] to-[#c7953d] text-[#241208] text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all shadow-xl shadow-[#d8a84e]/10 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin text-sm">⏳</span>
            ) : (
              <span>Entrar no Painel</span>
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-zinc-500 mt-6">
          Acesso restrito à gerência do Contemporâneo.
        </p>
      </div>
    </div>
  );
};
