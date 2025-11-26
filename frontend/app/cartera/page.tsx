"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Activity, LineChart, Wallet, LogOut, Cpu, 
    ArrowUpRight, CreditCard, Key, Save, AlertTriangle, CheckCircle, History, PieChart, ArrowDownRight
} from 'lucide-react';

// URL de Render (Para llamar al Backend)
const API_BASE_URL = "https://nexus-ai-trading-1.onrender.com";

export default function PortfolioPage() {
  const router = useRouter();

  // ESTADO NUEVO: Controla la visibilidad del formulario de claves
  const [showKeyForm, setShowKeyForm] = useState(false); 
  
  // Estados del formulario
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ error: '', success: '' });
  
  // Datos simulados (deberías obtener el email real del usuario logueado)
  const USER_EMAIL = "ceo@nexus.com"; 
  
  // --- LÓGICA DE GUARDADO ---
  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus({ error: '', success: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/save-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: USER_EMAIL, 
            apiKey, 
            secretKey 
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || 'Error al guardar la clave.');

      setSaveStatus({ success: "Claves encriptadas y guardadas. ¡Bot listo!", error: '' });
      setShowKeyForm(false); // Ocultar formulario al guardar
    } catch (err: any) {
      setSaveStatus({ success: '', error: 'Fallo al guardar: ' + err.message });
    }
    setIsSaving(false);
  };

  // Datos simulados de tu cartera (igual que antes)
  const assets = [
    { coin: 'USDT', amount: 24500.00, value: 24500.00, color: 'bg-green-500' },
    { coin: 'BTC', amount: 0.45, value: 39150.00, color: 'bg-orange-500' },
    { coin: 'ETH', amount: 4.2, value: 12300.50, color: 'bg-blue-500' },
    { coin: 'SOL', amount: 150, value: 20400.00, color: 'bg-purple-500' },
  ];

  const history = [
    { type: 'COMPRA', asset: 'BTC/USDT', amount: 0.1, price: 86500, date: 'Hace 2h', profit: null },
    { type: 'VENTA', asset: 'ETH/USDT', amount: 2.0, price: 2950, date: 'Hace 5h', profit: '+12.5%' },
    { type: 'COMPRA', asset: 'SOL/USDT', amount: 50, price: 135, date: 'Ayer', profit: null },
    { type: 'VENTA', asset: 'BTC/USDT', amount: 0.05, price: 87100, date: 'Ayer', profit: '-1.2%' },
  ];
  
  const totalBalance = assets.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="min-h-screen bg-black text-white flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col p-4 hidden md:flex">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
            <Cpu className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-xl tracking-tighter">NEXUS <span className="text-blue-500">AI</span></h1>
        </div>

        <nav className="space-y-2 flex-1">
          <button onClick={() => router.push('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-900 rounded-lg transition">
            <Activity className="w-5 h-5" /> Dashboard
          </button>
          <button onClick={() => router.push('/estrategias')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-900 rounded-lg transition">
            <LineChart className="w-5 h-5" /> Estrategias
          </button>
          <button onClick={() => router.push('/cartera')} className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-lg transition">
            <Wallet className="w-5 h-5" /> Cartera
          </button>
        </nav>

        <button onClick={() => router.push('/')} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg mt-auto">
          <LogOut className="w-5 h-5" /> Cerrar Sesión
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black pointer-events-none"></div>

        <header className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h2 className="text-2xl font-bold">Mi Cartera</h2>
            <p className="text-slate-400 text-sm">Gestión de activos y balance.</p>
          </div>
          {/* BOTÓN QUE CONTROLA LA VISIBILIDAD */}
          <button 
            onClick={() => setShowKeyForm(!showKeyForm)} // <-- TOGGLE
            className={`px-6 py-2 rounded-lg font-bold text-sm transition shadow-lg flex items-center gap-2 ${
                showKeyForm ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20'
            }`}
          >
            <Key className="w-4 h-4" /> 
            {showKeyForm ? 'Cerrar Configuración' : 'Configurar API Keys'}
          </button>
        </header>

        {/* --- 1. FORMULARIO DE CLAVES (SECCIÓN CONDICIONAL) --- */}
        {showKeyForm && (
            <form onSubmit={handleSaveKeys} className="lg:col-span-3 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl mb-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
                    <Key className="w-5 h-5 text-red-400" /> API Keys de Binance (Modo Bot)
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                    Introduce tus claves para activar la ejecución automática. Las claves se guardarán **encriptadas** en MongoDB.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        type="text" 
                        placeholder="API Key Pública" 
                        value={apiKey} 
                        onChange={(e) => setApiKey(e.target.value)}
                        className="bg-black/40 border border-slate-700 p-3 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                    />
                    <input 
                        type="password" 
                        placeholder="Secret Key Privada" 
                        value={secretKey} 
                        onChange={(e) => setSecretKey(e.target.value)}
                        className="bg-black/40 border border-slate-700 p-3 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isSaving || !apiKey || !secretKey}
                    className="mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg transition flex items-center gap-2 shadow-lg disabled:bg-slate-700 disabled:cursor-not-allowed"
                >
                    <Save className="w-4 h-4" /> 
                    {isSaving ? 'GUARDANDO...' : 'GUARDAR CLAVES ENCRIPTADAS'}
                </button>
                
                {saveStatus.success && (
                    <p className="mt-3 text-green-400 font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {saveStatus.success}</p>
                )}
                {saveStatus.error && (
                    <p className="mt-3 text-red-400 font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {saveStatus.error}</p>
                )}
            </form>
        )}
        
        {/* --- 2. RESTO DEL CONTENIDO (BALANCE Y HISTORIAL) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Wallet className="w-32 h-32 text-white" /></div>
                    <h3 className="text-slate-400 mb-2 font-medium">Balance Total Estimado</h3>
                    <div className="text-5xl font-mono font-bold text-white mb-4">
                        ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm flex items-center gap-1 border border-green-500/30">
                            <ArrowUpRight className="w-4 h-4" /> +$1,240.50 (Hoy)
                        </div>
                        <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm flex items-center gap-1 border border-blue-500/30">
                            PNL Total: +12.4%
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-500" /> Distribución de Activos
                    </h3>
                    <div className="space-y-4">
                        {assets.map((asset) => (
                            <div key={asset.coin}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold text-white">{asset.coin}</span>
                                    <span className="text-slate-400">${asset.value.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${asset.color}`} 
                                        style={{ width: `${(asset.value / totalBalance) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* HISTORIAL LATERAL */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full flex flex-col">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <History className="w-5 h-5 text-orange-500" /> Historial Reciente
                </h3>
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    {history.map((trade, i) => (
                        <div key={i} className="p-4 bg-black/40 rounded-xl border border-slate-800 hover:border-slate-600 transition">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${trade.type === 'COMPRA' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {trade.type}
                                    </span>
                                    <span className="text-white font-bold ml-2">{trade.asset}</span>
                                </div>
                                <span className="text-xs text-slate-500">{trade.date}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="text-sm text-slate-400">
                                    {trade.amount} @ ${trade.price}
                                </div>
                                {trade.profit && (
                                    <div className={`text-sm font-bold ${trade.profit.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                        {trade.profit}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <button className="mt-auto w-full py-3 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
                    Ver todo el historial
                </button>
            </div>
        </div>
      </main>
    </div>
  );
}