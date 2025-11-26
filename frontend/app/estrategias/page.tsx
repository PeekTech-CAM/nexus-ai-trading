"use client";
import { useState } from 'react';
import { Cpu, Shield, Target, Zap, ArrowRight, CheckCircle, LogOut, Activity, LineChart, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StrategyPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<any>(null);

  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    setStrategy(null);

    try {
        const res = await fetch('http://127.0.0.1:8000/api/ai/generate-strategy', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ prompt })
        });
        const data = await res.json();
        setStrategy(data);
    } catch (e) {
        console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex font-sans">
        
        {/* SIDEBAR (MENÚ LATERAL) */}
        <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col p-4 hidden md:flex z-20">
            <div className="flex items-center gap-2 mb-10 px-2">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                    <Cpu className="text-white w-5 h-5" />
                </div>
                <h1 className="font-bold text-xl tracking-tighter">NEXUS <span className="text-blue-500">AI</span></h1>
            </div>

            <nav className="space-y-2 flex-1">
                <button onClick={() => router.push('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-900 rounded-lg transition">
                    <Activity className="w-5 h-5" /> Dashboard
                </button>
                <button onClick={() => router.push('/estrategias')} className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-lg transition">
                    <LineChart className="w-5 h-5" /> Estrategias
                </button>
                <button onClick={() => router.push('/cartera')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-900 rounded-lg transition">
                    <Wallet className="w-5 h-5" /> Cartera
                </button>
            </nav>

            <button onClick={() => router.push('/')} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg mt-auto transition">
                <LogOut className="w-5 h-5" /> Cerrar Sesión
            </button>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Cpu className="text-blue-500" /> NEXUS STRATEGY FORGE
                    </h1>
                </div>
                
                {/* INPUT AREA */}
                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl shadow-2xl mb-8">
                    <h2 className="text-xl font-bold mb-4">Diseña tu Algoritmo</h2>
                    <p className="text-slate-400 mb-6">
                        Describe en lenguaje natural qué quieres. Nexus AI calculará los parámetros matemáticos óptimos.
                    </p>
                    
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ej: Quiero una estrategia para Bitcoin muy agresiva, para hacer scalping rápido en gráficos de 5 minutos..."
                        className="w-full h-32 bg-black border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                    />
                    
                    <button 
                        onClick={generate}
                        disabled={loading || !prompt}
                        className={`mt-4 w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                            loading ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.01]'
                        }`}
                    >
                        {loading ? (
                            <> <Cpu className="animate-spin" /> PROCESANDO MODELOS... </>
                        ) : (
                            <> <Zap /> GENERAR ESTRATEGIA </>
                        )}
                    </button>
                </div>

                {/* RESULTADO DE LA IA */}
                {strategy && (
                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/50 p-8 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                            
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-3xl font-black text-white mb-1">{strategy.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                                            IA GENERATED
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                            strategy.risk_level === 'Alto' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-green-500/20 text-green-300 border-green-500/30'
                                        }`}>
                                            RIESGO: {strategy.risk_level}
                                        </span>
                                    </div>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-black/40 p-4 rounded-xl border border-slate-700/50">
                                    <h4 className="text-slate-400 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Target className="w-4 h-4" /> Reglas de Entrada
                                    </h4>
                                    <p className="text-white">{strategy.entry_rules}</p>
                                </div>
                                <div className="bg-black/40 p-4 rounded-xl border border-slate-700/50">
                                    <h4 className="text-slate-400 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <LogOut className="w-4 h-4" /> Reglas de Salida
                                    </h4>
                                    <p className="text-white">{strategy.exit_rules}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-3 bg-slate-900 rounded-lg">
                                    <div className="text-slate-500 text-xs">Stop Loss</div>
                                    <div className="text-red-400 font-mono font-bold text-xl">{strategy.stop_loss}</div>
                                </div>
                                <div className="text-center p-3 bg-slate-900 rounded-lg">
                                    <div className="text-slate-500 text-xs">Take Profit</div>
                                    <div className="text-green-400 font-mono font-bold text-xl">{strategy.take_profit}</div>
                                </div>
                                <div className="text-center p-3 bg-slate-900 rounded-lg">
                                    <div className="text-slate-500 text-xs">Indicadores</div>
                                    <div className="text-blue-300 font-bold text-sm">{strategy.indicators?.length || 0} Activos</div>
                                </div>
                            </div>

                            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                                <h4 className="text-blue-400 text-xs uppercase font-bold mb-1">Análisis de Nexus AI</h4>
                                <p className="text-slate-300 text-sm italic">"{strategy.reasoning}"</p>
                            </div>

                            <button className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg font-bold transition border border-slate-600">
                                Guardar y Activar Bot
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    </div>
  );
}