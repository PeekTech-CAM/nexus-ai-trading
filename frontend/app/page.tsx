"use client";
import { useState } from 'react';
import { User, Lock, Zap, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation'; 

export default function Home() {
  const router = useRouter(); // Hook para navegar
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const url = `http://127.0.0.1:8000${endpoint}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || 'Error de conexión');

      // ÉXITO
      setStatus({ loading: false, error: '', success: isLogin ? 'ACCESO CONCEDIDO' : 'CUENTA CREADA' });
      
      if(isLogin) {
        // --- AQUÍ ESTÁ LA MAGIA: REDIRECCIÓN ---
        setTimeout(() => {
            router.push('/dashboard');
        }, 1000); 
      }

    } catch (err: any) {
      setStatus({ loading: false, error: err.message, success: '' });
    }
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo Matrix */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            NEXUS <span className="text-blue-500">AI</span>
          </h1>
          <p className="text-slate-400 text-sm tracking-widest uppercase mt-2">
            Trading Intelligence System v1.0
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                placeholder="Identificador de Usuario"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                placeholder="Clave de Acceso"
              />
            </div>

            <button 
              type="submit"
              disabled={status.loading}
              className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-lg shadow-lg transform transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ${status.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {status.loading ? 'PROCESANDO...' : (isLogin ? 'INICIAR SISTEMA' : 'CREAR CUENTA')}
              {!status.loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {status.error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm animate-pulse">
              <AlertCircle className="w-4 h-4" />
              {status.error}
            </div>
          )}
          
          {status.success && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-400 text-sm text-center justify-center font-bold">
              <Zap className="w-4 h-4" />
              {status.success}
            </div>
          )}

          <div className="mt-6 text-center border-t border-slate-800 pt-4">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setStatus({ loading: false, error: '', success: '' });
              }}
              className="text-slate-500 text-sm hover:text-white transition-colors"
            >
              {isLogin ? '¿No tienes acceso? Solicita una cuenta' : '¿Ya tienes cuenta? Accede aquí'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}