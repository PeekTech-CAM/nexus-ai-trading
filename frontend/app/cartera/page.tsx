"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  LineChart,
  Wallet,
  LogOut,
  Cpu,
  ArrowUpRight,
  CreditCard,
  Key,
  Save,
  AlertTriangle,
  CheckCircle,
  History,
  PieChart,
  ArrowDownRight,
  RefreshCw,
  Download,
  PlusCircle
} from 'lucide-react';

// URL de Render (Para llamar al Backend)
const API_BASE_URL = "https://nexus-ai-trading-1.onrender.com"; // O usar process.env.NEXT_PUBLIC_API_URL

// Tipos base (Para evitar errores de TypeScript)
type Asset = {
  coin: string;
  amount: number;
  value: number;
  colorClass: string;
};

type Trade = {
  type: 'COMPRA' | 'VENTA';
  asset: string;
  amount: number;
  price: number;
  date: string;
  profit?: string | null;
};

// --- Muestras de datos ---
function colorForIndex(i: number) {
  const colors = ['bg-green-400', 'bg-orange-400', 'bg-blue-400', 'bg-purple-400', 'bg-rose-400'];
  return colors[i % colors.length];
}

function sampleAssets(): Asset[] {
  return [
    { coin: 'USDT', amount: 24500.0, value: 24500.0, colorClass: 'bg-green-400' },
    { coin: 'BTC', amount: 0.45, value: 39150.0, colorClass: 'bg-orange-400' },
    { coin: 'ETH', amount: 4.2, value: 12300.5, colorClass: 'bg-blue-400' },
    { coin: 'SOL', amount: 150, value: 20400.0, colorClass: 'bg-purple-400' },
  ];
}

function sampleHistory(): Trade[] {
  return [
    { type: 'COMPRA', asset: 'BTC/USDT', amount: 0.1, price: 86500, date: 'Hace 2h', profit: null },
    { type: 'VENTA', asset: 'ETH/USDT', amount: 2, price: 2950, date: 'Hace 5h', profit: '+12.5%' },
    { type: 'COMPRA', asset: 'SOL/USDT', amount: 50, price: 135, date: 'Ayer', profit: null },
    { type: 'VENTA', asset: 'BTC/USDT', amount: 0.05, price: 87100, date: 'Ayer', profit: '-1.2%' },
  ];
}
// --- Fin Muestras ---


export default function PortfolioPage() {
  const router = useRouter();

  // --- ESTADOS DE DATOS Y UI ---
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  
  // Clave y Secreto (Formulario)
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ error?: string; success?: string }>({});
  const [isDepositing, setIsDepositing] = useState(false);

  const [assets, setAssets] = useState<Asset[]>(sampleAssets());
  const [history, setHistory] = useState<Trade[]>(sampleHistory());
  const [isLoading, setIsLoading] = useState(false);
  
  const [notif, setNotif] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);

  const USER_EMAIL = 'ceo@nexus.com';

  // ----- Fetch portfolio data -----
  const fetchPortfolio = async () => {
    setIsLoading(true);
    // En producción, estas llamadas API traerían los datos reales de balance y historial del usuario.
    try {
      const [assetsRes, historyRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/portfolio`), // Asumo que esta ruta existe
        fetch(`${API_BASE_URL}/api/trades/recent`), // Asumo que esta ruta existe
      ]);

      if (assetsRes.ok) {
        const assetsJson = await assetsRes.json();
        setAssets(assetsJson.length ? assetsJson : sampleAssets());
      } else {
        setAssets(sampleAssets());
      }
      
      if (historyRes.ok) {
        const historyJson = await historyRes.json();
        setHistory(historyJson.length ? historyJson : sampleHistory());
      } else {
        setHistory(sampleHistory());
      }

    } catch (err) {
      console.error('Fetch portfolio error:', err);
      setNotif({ type: 'error', message: 'No se pudo cargar la cartera.' });
      setAssets(sampleAssets());
      setHistory(sampleHistory());
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 30000); // Actualiza cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notif) {
      const timer = setTimeout(() => setNotif(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notif]);


  // ----- 1. Save API keys (Encryption logic) -----
  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus({});
    try {
      // Llama al endpoint que guarda y encripta en MongoDB
      const res = await fetch(`${API_BASE_URL}/api/user/save-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: USER_EMAIL, apiKey, secretKey }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Error al guardar.');

      setSaveStatus({ success: 'Claves guardadas y bot activado.' });
      setNotif({ type: 'success', message: 'Claves encriptadas y listas.' });
      setShowKeyForm(false);
    } catch (err: any) {
      console.error(err);
      setSaveStatus({ error: err.message || 'Error desconocido' });
      setNotif({ type: 'error', message: 'Fallo al guardar claves.' });
    }
    setIsSaving(false);
  };

  // ----- 2. Deposit logic (Simulated) -----
  const handleDeposit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) {
      setNotif({ type: 'error', message: 'Introduce una cantidad válida' });
      return;
    }

    // En un entorno real, redirigiría a Stripe Checkout o a un procesador de pagos.
    // Aquí solo simulamos el proceso:
    try {
      setIsDepositing(true);
      setNotif({ type: 'info', message: `Procesando depósito de $${amt.toFixed(2)}...` });
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      setNotif({ type: 'success', message: `Depósito de $${amt.toFixed(2)} completado` });
      setDepositAmount('');
      setShowDepositModal(false);
      // Refrescamos la cartera para reflejar el cambio (simulado)
      setTimeout(() => fetchPortfolio(), 800);
    } catch (err) {
      setNotif({ type: 'error', message: 'Error al procesar el depósito' });
    } finally {
      setIsDepositing(false);
    }
  };

  // ----- Helpers -----
  const handleExportCSV = () => {
    const csv = [
      ['Coin', 'Amount', 'Value'],
      ...assets.map((a) => [a.coin, a.amount.toString(), a.value.toFixed(2)]),
    ].map((r) => r.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setNotif({ type: 'success', message: 'Exportado CSV correctamente' });
  };

  const handleLogout = () => {
    router.push('/');
  };

  const totalBalance = assets.reduce((acc, a) => acc + a.value, 0);

  // ----- Render -----
  return (
    <div className="min-h-screen bg-[#05060a] text-white flex font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 border-r border-slate-800 bg-gradient-to-b from-[#071126] to-[#04050a] flex flex-col p-6 hidden lg:flex">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl">
            <Cpu className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">NEXUS <span className="text-indigo-400">AI</span></h1>
            <p className="text-slate-400 text-xs">Trading Intelligence</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <button onClick={() => router.push('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-900 rounded-lg transition">
            <Activity className="w-5 h-5" /> <span>Dashboard</span>
          </button>
          <button onClick={() => router.push('/estrategias')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-900 rounded-lg transition">
            <LineChart className="w-5 h-5" /> <span>Estrategias</span>
          </button>
          <button onClick={() => router.push('/cartera')} className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600/10 text-indigo-300 border border-indigo-600/20 rounded-lg transition">
            <Wallet className="w-5 h-5" /> <span>Cartera</span>
          </button>
        </nav>

        <div className="mt-auto">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg w-full">
            <LogOut className="w-5 h-5" /> <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black pointer-events-none" />

        <header className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <h2 className="text-2xl font-semibold">Mi Cartera</h2>
            <p className="text-slate-400 text-sm">Gestión de activos y balance</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => fetchPortfolio()} className="px-4 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition flex items-center gap-2 text-sm">
              <RefreshCw className="w-4 h-4" /> <span>Refrescar</span>
            </button>

            {/* NUEVO BOTÓN: CONFIGURAR API KEYS */}
            <button onClick={() => setShowKeyForm(!showKeyForm)} className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition ${showKeyForm ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              <Key className="w-4 h-4" /> {showKeyForm ? 'Cerrar Config' : 'Configurar API Keys'}
            </button>

            {/* NUEVO BOTÓN: DEPOSITAR FONDOS (Abre Modal) */}
            <button 
              onClick={() => setShowDepositModal(true)} 
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition flex items-center gap-2 text-sm"
            >
              <PlusCircle className="w-4 h-4" /> Depositar Fondos
            </button>
            
            <button onClick={handleExportCSV} className="px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </header>

        {/* KEY FORM (CONDICIONAL) */}
        {showKeyForm && (
          <form onSubmit={handleSaveKeys} className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl mb-6 shadow-lg relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Key className="w-5 h-5 text-indigo-300" /> Configuración de Claves de Ejecución</h3>
              <div className="text-sm text-slate-400">Las claves serán encriptadas antes de ser almacenadas.</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API Key Pública" className="bg-black/30 border border-slate-700 p-3 rounded-lg focus:border-indigo-500 outline-none transition" />
              <input required type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} placeholder="Secret Key Privada" className="bg-black/30 border border-slate-700 p-3 rounded-lg focus:border-indigo-500 outline-none transition" />
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button disabled={isSaving || !apiKey || !secretKey} type="submit" className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center gap-2 transition">
                <Save className="w-4 h-4" /> {isSaving ? 'Guardando...' : 'Guardar Claves'}
              </button>
              <button onClick={() => { setApiKey(''); setSecretKey(''); setSaveStatus({}); }} type="button" className="px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition">Limpiar</button>

              {saveStatus.success && <div className="text-green-400 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {saveStatus.success}</div>}
              {saveStatus.error && <div className="text-red-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {saveStatus.error}</div>}
            </div>
          </form>
        )}

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-4 right-6 opacity-10"><Wallet className="w-28 h-28 text-white" /></div>
              <h4 className="text-slate-400 mb-2">Balance Total Estimado</h4>
              <div className="text-4xl md:text-5xl font-mono font-bold">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>

              <div className="flex gap-4 mt-4">
                <div className="bg-green-600/10 text-green-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"> <ArrowUpRight className="w-4 h-4" /> +$1,240.50 (Hoy)</div>
                <div className="bg-indigo-600/10 text-indigo-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">PNL Total: +12.4%</div>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-400" /> Distribución de Activos</h4>

              <div className="space-y-4">
                {assets.map((asset) => (
                  <div key={asset.coin}>
                    <div className="flex justify-between mb-1">
                      <div className="flex items-baseline gap-3">
                        <div className={`w-3 h-3 rounded ${asset.colorClass}`} />
                        <div className="font-semibold">{asset.coin}</div>
                      </div>
                      <div className="text-slate-400">${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className={`${asset.colorClass} h-full transition-all duration-500`} style={{ width: `${(asset.value / Math.max(totalBalance, 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2"><History className="w-5 h-5 text-orange-400" /> Historial Reciente</h4>

            <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 420 }}>
              {history.map((t, i) => (
                <div key={i} className="p-3 bg-black/30 rounded-xl border border-slate-800 hover:border-slate-600 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${t.type === 'COMPRA' ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'}`}>{t.type}</span>
                      <span className="ml-2 font-semibold">{t.asset}</span>
                    </div>
                    <div className="text-xs text-slate-400">{t.date}</div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-sm text-slate-300">{t.amount} @ ${t.price}</div>
                    {t.profit ? <div className={`text-sm font-semibold ${t.profit.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{t.profit}</div> : <div className="text-slate-500 text-sm">-</div>}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => router.push('/history')} 
              className="mt-auto py-3 px-4 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition text-sm"
            >
              Ver todo el historial
            </button>
          </aside>
        </div>

        {/* Notifications */}
        {notif && (
          <div 
            className={`fixed right-6 bottom-6 z-50 p-4 rounded-lg shadow-xl transition-all duration-300 ${
              notif.type === 'success' ? 'bg-green-600' : notif.type === 'error' ? 'bg-red-600' : 'bg-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              {notif.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {notif.type === 'error' && <AlertTriangle className="w-5 h-5" />}
              <div>{notif.message}</div>
              <button 
                onClick={() => setNotif(null)} 
                className="ml-2 hover:bg-white/10 rounded p-1 transition"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Deposit Modal */}
        {showDepositModal && (
          <div 
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowDepositModal(false);
            }}
          >
            <div className="bg-[#071022] p-6 rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl">
              <h3 className="text-lg font-semibold mb-2">Depositar Fondos</h3>
              <p className="text-slate-400 mb-4">Introduce la cantidad a depositar en USD. Esto simula un depósito en tu cuenta.</p>

              <form onSubmit={handleDeposit} className="space-y-3">
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  value={depositAmount} 
                  onChange={(e) => setDepositAmount(e.target.value)} 
                  placeholder="$0.00" 
                  className="w-full p-3 rounded-lg bg-black/30 border border-slate-700 focus:border-indigo-500 outline-none transition" 
                  autoFocus
                />

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <button 
                      type="submit" 
                      disabled={isDepositing || !depositAmount} 
                      className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition"
                    >
                      {isDepositing ? 'Procesando...' : 'Depositar'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowDepositModal(false);
                        setDepositAmount('');
                      }} 
                      className="px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                  <div className="text-slate-400 text-sm">Saldo: ${totalBalance.toFixed(2)}</div>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}