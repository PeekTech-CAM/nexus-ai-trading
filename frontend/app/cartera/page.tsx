"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity, LineChart, Wallet, LogOut, Cpu,
  ArrowUpRight, CreditCard, Key, Save, AlertTriangle, CheckCircle, History, PieChart, RefreshCw, Download, PlusCircle, X
} from 'lucide-react';

// URL de Render (Para llamar al Backend)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexus-ai-trading-1.onrender.com";

// Tipos
type Asset = {
  coin: string;
  amount: number;
  value: number;
  colorClass: string;
};

type Trade = {
  id: number;
  type: 'COMPRA' | 'VENTA';
  asset: string;
  amount: number;
  price: number;
  date: string;
  profit?: string | null;
  fee?: string;
};

// --- Muestras de datos ---
function colorForIndex(i: number) {
  const colors = ['bg-green-500', 'bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500'];
  return colors[i % colors.length];
}

function sampleAssets(): Asset[] {
  return [
    { coin: 'USDT', amount: 24500.0, value: 24500.0, colorClass: 'bg-green-500' },
    { coin: 'BTC', amount: 0.45, value: 39150.0, colorClass: 'bg-orange-500' },
    { coin: 'ETH', amount: 4.2, value: 12300.5, colorClass: 'bg-blue-500' },
    { coin: 'SOL', amount: 150, value: 20400.0, colorClass: 'bg-purple-500' },
  ];
}

function sampleHistory(): Trade[] {
  return [
    { id: 1, type: 'COMPRA', asset: 'BTC/USDT', amount: 0.1, price: 86500, date: 'Hace 2h', profit: null, fee: '2.50' },
    { id: 2, type: 'VENTA', asset: 'ETH/USDT', amount: 2, price: 2950, date: 'Hace 5h', profit: '+12.5%', fee: '5.00' },
    { id: 3, type: 'COMPRA', asset: 'SOL/USDT', amount: 50, price: 135, date: 'Ayer', profit: null, fee: '1.20' },
    { id: 4, type: 'VENTA', asset: 'BTC/USDT', amount: 0.05, price: 87100, date: 'Ayer', profit: '-1.2%', fee: '1.10' },
  ];
}

export default function PortfolioPage() {
  const router = useRouter();

  // --- ESTADOS DE DATOS Y UI ---
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  
  // Clave y Secreto (Formulario)
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ error?: string; success?: string }>({});

  const [assets, setAssets] = useState<Asset[]>(sampleAssets());
  const [history, setHistory] = useState<Trade[]>(sampleHistory());
  const [isDepositing, setIsDepositing] = useState(false);
  const [notif, setNotif] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);

  const USER_EMAIL = 'ceo@nexus.com';

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
      const res = await fetch(`${API_BASE_URL}/api/user/save-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: USER_EMAIL, apiKey, secretKey }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al guardar.');

      setSaveStatus({ success: 'Claves guardadas y bot activado.' });
      setNotif({ type: 'success', message: 'Claves guardadas correctamente.' });
      setTimeout(() => setShowKeyForm(false), 1500);
    } catch (err: any) {
      setSaveStatus({ error: err.message });
      setNotif({ type: 'error', message: 'Fallo al guardar claves.' });
    }
    setIsSaving(false);
  };

  // ----- 2. Deposit logic (Simulated) -----
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) {
      setNotif({ type: 'error', message: 'Introduce una cantidad válida' });
      return;
    }
    
    setIsDepositing(true);
    // Simulación de proceso de pago
    setTimeout(() => {
        setNotif({ type: 'success', message: `Depósito de $${amt.toFixed(2)} procesado.` });
        setDepositAmount('');
        setShowDepositModal(false);
        setIsDepositing(false);
    }, 1500);
  };

  const handleExportCSV = () => {
    alert("Descargando CSV...");
  };

  const totalBalance = assets.reduce((acc, a) => acc + a.value, 0);

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
          <button onClick={() => router.push('/')} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg w-full">
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
            <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 flex items-center gap-2 text-sm">
              <RefreshCw className="w-4 h-4" /> <span>Refrescar</span>
            </button>

            {/* BOTÓN CONFIGURAR API KEYS */}
            <button onClick={() => setShowKeyForm(!showKeyForm)} className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition ${showKeyForm ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              <Key className="w-4 h-4" /> {showKeyForm ? 'Cerrar Config' : 'Configurar API Keys'}
            </button>

            {/* BOTÓN DEPOSITAR */}
            <button onClick={() => setShowDepositModal(true)} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 flex items-center gap-2 text-sm transition">
              <PlusCircle className="w-4 h-4" /> Depositar
            </button>
            
            <button onClick={handleExportCSV} className="px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" /> CSV
            </button>
          </div>
        </header>

        {/* FORMULARIO CLAVES */}
        {showKeyForm && (
          <form onSubmit={handleSaveKeys} className="bg-slate-900/80 border border-slate-700 p-6 rounded-xl mb-6 relative z-10 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><Key className="w-5 h-5 text-indigo-300" /> API Keys (Modo Bot)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API Key Pública" className="bg-black/30 border border-slate-700 p-3 rounded-lg text-white focus:border-indigo-500 outline-none" />
              <input required type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} placeholder="Secret Key Privada" className="bg-black/30 border border-slate-700 p-3 rounded-lg text-white focus:border-indigo-500 outline-none" />
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button disabled={isSaving} type="submit" className="bg-indigo-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-500 transition">
                <Save className="w-4 h-4" /> {isSaving ? 'Guardando...' : 'Guardar Claves'}
              </button>
              {saveStatus.success && <div className="text-green-400 flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4" /> {saveStatus.success}</div>}
              {saveStatus.error && <div className="text-red-400 flex items-center gap-2 text-sm"><AlertTriangle className="w-4 h-4" /> {saveStatus.error}</div>}
            </div>
          </form>
        )}

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          
          {/* COLUMNA IZQUIERDA: BALANCE Y GRÁFICO */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-4 right-6 opacity-10"><Wallet className="w-28 h-28 text-white" /></div>
              <h4 className="text-slate-400 mb-2">Balance Total Estimado</h4>
              <div className="text-4xl md:text-5xl font-mono font-bold">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div className="flex gap-4 mt-4">
                <div className="bg-green-600/10 text-green-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"> <ArrowUpRight className="w-4 h-4" /> +$1,240.50</div>
                <div className="bg-indigo-600/10 text-indigo-300 px-3 py-1 rounded-full text-sm">PNL: +12.4%</div>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-400" /> Distribución</h4>
              <div className="space-y-4">
                {assets.map((asset) => (
                  <div key={asset.coin}>
                    <div className="flex justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${asset.colorClass}`}></div>
                            <span className="font-bold">{asset.coin}</span>
                        </div>
                        <span className="text-slate-400">${asset.value.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className={`${asset.colorClass} h-full`} style={{ width: `${(asset.value / totalBalance) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: HISTORIAL */}
          <aside className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col h-full">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2"><History className="w-5 h-5 text-orange-400" /> Historial</h4>
            <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar">
              {history.map((t) => (
                <div 
                    key={t.id} 
                    onClick={() => setSelectedTrade(t)}
                    className="p-3 bg-black/30 rounded-xl border border-slate-800 hover:border-slate-600 transition cursor-pointer group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${t.type === 'COMPRA' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>{t.type}</span>
                    <span className="text-xs text-slate-500">{t.date}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                        <div className="font-bold">{t.asset}</div>
                        <div className="text-xs text-slate-400">{t.amount} @ ${t.price}</div>
                    </div>
                    {t.profit && <div className={`text-sm font-bold ${t.profit.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{t.profit}</div>}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* --- MODALES --- */}
        
        {/* Modal Detalle Trade */}
        {selectedTrade && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedTrade(null)}>
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-96 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Detalles de Orden #{selectedTrade.id}</h3>
                        <button onClick={() => setSelectedTrade(null)}><X className="w-5 h-5 text-slate-400 hover:text-white"/></button>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between p-2 bg-black/20 rounded"><span>Par:</span> <span className="font-mono font-bold">{selectedTrade.asset}</span></div>
                        <div className="flex justify-between p-2 bg-black/20 rounded"><span>Tipo:</span> <span className={`font-bold ${selectedTrade.type === 'COMPRA' ? 'text-green-400' : 'text-red-400'}`}>{selectedTrade.type}</span></div>
                        <div className="flex justify-between p-2 bg-black/20 rounded"><span>Precio:</span> <span>${selectedTrade.price}</span></div>
                        <div className="flex justify-between p-2 bg-black/20 rounded"><span>Cantidad:</span> <span>{selectedTrade.amount}</span></div>
                        <div className="flex justify-between p-2 bg-black/20 rounded"><span>Comisión:</span> <span>${selectedTrade.fee}</span></div>
                    </div>
                </div>
            </div>
        )}

        {/* Modal Depósito */}
        {showDepositModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowDepositModal(false)}>
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-96 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold mb-2">Depositar Fondos</h3>
                    <p className="text-slate-400 text-sm mb-4">Introduce la cantidad en USD.</p>
                    <form onSubmit={handleDeposit}>
                        <input 
                            type="number" 
                            autoFocus
                            className="w-full bg-black border border-slate-600 rounded-lg p-3 text-white text-lg mb-4 focus:border-green-500 outline-none" 
                            placeholder="$1000"
                            value={depositAmount}
                            onChange={e => setDepositAmount(e.target.value)}
                        />
                        <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setShowDepositModal(false)} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition">Cancelar</button>
                            <button type="submit" className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg font-bold transition">Confirmar</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Notificación Flotante */}
        {notif && (
          <div className={`fixed right-6 bottom-6 z-50 p-4 rounded-lg shadow-xl transition-all duration-300 flex items-center gap-3 ${notif.type === 'success' ? 'bg-green-600' : notif.type === 'error' ? 'bg-red-600' : 'bg-slate-700'}`}>
            {notif.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notif.type === 'error' && <AlertTriangle className="w-5 h-5" />}
            <div>{notif.message}</div>
            <button onClick={() => setNotif(null)} className="ml-2 hover:bg-white/10 rounded p-1">×</button>
          </div>
        )}

      </main>
    </div>
  );
}