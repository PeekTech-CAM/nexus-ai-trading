"use client";
import { useState, useEffect } from 'react';
import { Activity, Cpu, Wallet, LogOut, TrendingUp, AlertTriangle, ShieldCheck, BarChart3, LineChart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChartComponent } from '../components/Chart';     // Asegúrate de tener este componente
import { MarketList } from '../components/MarketList';   // Asegúrate de tener este componente

// URL de tu API en Render
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexus-ai-trading-1.onrender.com";

export default function Dashboard() {
  const router = useRouter();
  
  // --- ESTADOS DE DATOS ---
  const [price, setPrice] = useState(0);
  const [change24h, setChange24h] = useState(0);
  const [rsi, setRsi] = useState(50);
  const [signal, setSignal] = useState("NEUTRAL");
  const [aiText, setAiText] = useState("Sincronizando Neural Net...");
  const [aiConfidence, setAiConfidence] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Datos del Gráfico
  const [candleData, setCandleData] = useState<any[]>([]);

  // --- CONEXIÓN AL CEREBRO (BACKEND) ---
  useEffect(() => {
    
    // 1. Obtener Datos Principales (Precio, RSI, IA)
    const fetchMarketData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/market/btc`);
        const data = await res.json();
        
        if (data.status === "LIVE" || data.price > 0) {
          setPrice(data.price);
          setChange24h(data.change_24h);
          setRsi(data.rsi);
          setSignal(data.signal);
          setLoading(false);
        }
        
        if (data.ai_analysis) {
            setAiText(data.ai_analysis);
            setAiConfidence(data.ai_confidence);
        }
      } catch (error) { 
          console.error("Error conectando API:", error);
          // No mostramos error en UI para mantener la estética, se queda cargando o con el último dato
      }
    };

    // 2. Obtener Velas Históricas para el Gráfico
    const fetchCandles = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/market/candles`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setCandleData(data);
            }
        } catch (error) { 
            console.error("Error cargando velas:", error); 
        }
    };

    // Llamadas iniciales
    fetchMarketData();
    fetchCandles();

    // Loops de actualización (Polling)
    const intervalPrice = setInterval(fetchMarketData, 4000); // Precio cada 4s
    const intervalChart = setInterval(fetchCandles, 60000);   // Gráfico cada 1min

    return () => {
        clearInterval(intervalPrice);
        clearInterval(intervalChart);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex font-sans overflow-hidden">
      
      {/* --- SIDEBAR (NAVEGACIÓN) --- */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col p-4 hidden md:flex z-20">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <Cpu className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-xl tracking-tighter">NEXUS <span className="text-blue-500">AI</span></h1>
        </div>

        <nav className="space-y-2 flex-1">
          <button onClick={() => router.push('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-lg transition hover:bg-blue-600/20">
            <Activity className="w-5 h-5" /> Dashboard
          </button>
          <button onClick={() => router.push('/estrategias')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-900 hover:text-white rounded-lg transition">
            <LineChart className="w-5 h-5" /> Estrategias
          </button>
          <button onClick={() => router.push('/cartera')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-900 hover:text-white rounded-lg transition">
            <Wallet className="w-5 h-5" /> Cartera
          </button>
        </nav>

        <button onClick={() => router.push('/')} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg mt-auto transition">
          <LogOut className="w-5 h-5" /> Cerrar Sesión
        </button>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 p-8 overflow-y-auto z-10 relative">
        {/* Fondo Matrix Sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8 relative z-20">
          <div>
            <h2 className="text-2xl font-bold">Panel de Control</h2>
            <p className="text-slate-400 text-sm">Bienvenido, CEO.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-mono text-green-400">SISTEMA ONLINE</span>
            </div>
          </div>
        </header>

        {/* --- TARJETAS SUPERIORES (DATOS EN VIVO) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-20">
          
          {/* 1. PRECIO BITCOIN */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl relative overflow-hidden group hover:border-blue-500/30 transition shadow-lg">
            <h3 className="text-slate-400 text-sm mb-1">Bitcoin (BTC/USDT)</h3>
            {loading ? (
               <div className="animate-pulse h-8 w-32 bg-slate-800 rounded"></div>
            ) : (
                <>
                    <p className="text-3xl font-mono font-bold text-white">
                        ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <div className={`flex items-center gap-2 mt-2 text-sm ${change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <TrendingUp className={`w-4 h-4 ${change24h < 0 ? 'rotate-180' : ''}`} /> 
                        {change24h.toFixed(2)}% (24h)
                    </div>
                </>
            )}
          </div>

          {/* 2. INDICADOR RSI + SEÑAL TÉCNICA */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl group hover:border-purple-500/30 transition shadow-lg">
            <h3 className="text-slate-400 text-sm mb-1 flex justify-between">
                <span>Indicador RSI (1H)</span>
                <BarChart3 className="w-4 h-4 text-purple-400"/>
            </h3>
            
            <div className="flex items-end gap-3">
                <p className="text-3xl font-mono font-bold text-white">{rsi ? rsi.toFixed(1) : '50.0'}</p>
                <span className={`px-2 py-1 rounded text-xs font-bold mb-1 border ${
                    signal === 'COMPRA' ? 'bg-green-500/10 text-green-400 border-green-500/50' : 
                    signal === 'VENTA' ? 'bg-red-500/10 text-red-400 border-red-500/50' : 'bg-slate-700/50 text-slate-300 border-slate-600'
                }`}>
                    {signal}
                </span>
            </div>
            
            {/* Barra Visual RSI */}
            <div className="w-full bg-slate-800 h-1.5 mt-3 rounded-full overflow-hidden relative">
                <div 
                    className={`h-full transition-all duration-500 ${rsi > 70 ? 'bg-red-500' : rsi < 30 ? 'bg-green-500' : 'bg-blue-500'}`} 
                    style={{ width: `${rsi}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-mono">
                <span>0</span><span className="text-green-700">30</span><span className="text-red-700">70</span><span>100</span>
            </div>
          </div>

          {/* 3. CEREBRO IA (GEMINI) */}
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 p-6 rounded-xl relative overflow-hidden shadow-lg">
            <h3 className="text-blue-300 text-sm mb-3 relative z-10 flex items-center gap-2 font-bold tracking-wider">
                <Cpu className="w-4 h-4" /> NEXUS BRAIN AI
            </h3>
            <p className="text-lg font-bold text-white mb-4 relative z-10 min-h-[3rem] flex items-center leading-tight">
                "{aiText}"
            </p>
            <div className="flex items-center gap-3 relative z-10">
                <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{ width: `${aiConfidence}%` }}></div>
                </div>
                <span className="text-xs text-blue-300 font-mono">{aiConfidence}% CONF.</span>
            </div>
          </div>
        </div>

        {/* --- ZONA INFERIOR: GRÁFICO + LISTA MERCADO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[450px] relative z-20">
          
          {/* GRÁFICO DE VELAS (LIGHTWEIGHT CHARTS) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow-lg overflow-hidden">
            <h3 className="text-slate-400 text-sm flex items-center gap-2 mb-4 pl-2">
                <ShieldCheck className="w-4 h-4 text-green-500"/> Análisis Técnico (Binance 1H)
            </h3>
            <div className="flex-1 w-full h-full">
               {candleData.length > 0 ? (
                   <ChartComponent data={candleData} />
               ) : (
                   <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-pulse gap-2">
                       <Activity className="w-8 h-8 opacity-50"/>
                       <span>Cargando historial de mercado...</span>
                   </div>
               )}
            </div>
          </div>

          {/* LISTA MULTI-ACTIVOS (MARKET WATCH) */}
          <div className="h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
             <MarketList />
          </div>

        </div>
      </main>
    </div>
  );
}