"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Activity, LineChart, Wallet, LogOut, Cpu, 
    ArrowUpRight, CreditCard, Key, Save, AlertTriangle, CheckCircle, History, PieChart, RefreshCw, Download, PlusCircle, X
} from 'lucide-react';

const API_BASE_URL = "https://nexus-ai-trading-1.onrender.com";

export default function PortfolioPage() {
  const router = useRouter();

  // ESTADOS DE INTERACTIVIDAD
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<any>(null); // Para el popup de historial

  // Claves
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ error?: string; success?: string }>({});

  const USER_EMAIL = "ceo@nexus.com"; 

  // --- FUNCIÓN: DEPOSITAR FONDOS (SIMULACIÓN) ---
  const handleDeposit = (e: React.FormEvent) => {
      e.preventDefault();
      if(!depositAmount) return;
      alert(`💰 Solicitud de depósito de $${depositAmount} enviada a la pasarela de pago.\n\n(En la versión final, esto abriría Stripe o Coinbase)`);
      setShowDepositModal(false);
      setDepositAmount('');
  };

  // --- FUNCIÓN: GUARDAR CLAVES ---
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
      setSaveStatus({ success: "Claves guardadas y encriptadas.", error: '' });
    } catch (err: any) {
      setSaveStatus({ success: '', error: 'Error: ' + err.message });
    }
    setIsSaving(false);
  };

  const assets = [
    { coin: 'USDT', amount: 24500.00, value: 24500.00, color: 'bg-green-500' },
    { coin: 'BTC', amount: 0.45, value: 39150.00, color: 'bg-orange-500' },
    { coin: 'ETH', amount: 4.2, value: 12300.50, color: 'bg-blue-500' },
    { coin: 'SOL', amount: 150, value: 20400.00, color: 'bg-purple-500' },
  ];

  const history = [
    { id: 1, type: 'COMPRA', asset: 'BTC/USDT', amount: 0.1, price: 86500, date: 'Hace 2h', profit: null, fee: '2.50' },
    { id: 2, type: 'VENTA', asset: 'ETH/USDT', amount: 2.0, price: 2950, date: 'Hace 5h', profit: '+12.5%', fee: '5.00' },
    { id: 3, type: 'COMPRA', asset: 'SOL/USDT', amount: 50, price: 135, date: 'Ayer', profit: null, fee: '1.20' },
    { id: 4, type: 'VENTA', asset: 'BTC/USDT', amount: 0.05, price: 87100, date: 'Ayer', profit: '-1.2%', fee: '1.10' },
  ];
  
  const totalBalance = assets.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="min-h-screen bg-black text-white flex font-sans">
      
      {/* SIDEBAR (Igual que siempre) */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col p-4 hidden md:flex">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center"><Cpu className="text-white w-5 h-5" /></div>
          <h1 className="font-bold text-xl tracking-tighter">NEXUS <span className="text-blue-500">AI</span></h1>
        </div>
        <nav className="space-y-2 flex-1">
          <button onClick={() => router.push('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-900 rounded-lg transition"><Activity className="w-5 h-5" /> Dashboard</button>
          <button onClick={() => router.push('/estrategias')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-900 rounded-lg transition"><LineChart className="w-5 h-5" /> Estrategias</button>
          <button onClick={() => router.push('/cartera')} className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-lg transition"><Wallet className="w-5 h-5" /> Cartera</button>
        </nav>
        <button onClick={() => router.push('/')} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg mt-auto"><LogOut className="w-5 h-5" /> Cerrar Sesión</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black pointer-events-none"></div>

        <header className="flex justify-between items-center mb-8 relative z-10">
          <div><h2 className="text-2xl font-bold">Mi Cartera</h2><p className="text-slate-400 text-sm">Gestión de activos y balance.</p></div>
          <div className="flex gap-3">
             <button onClick={() => setShowKeyForm(!showKeyForm)} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition ${showKeyForm ? 'bg-slate-700' : 'bg-purple-600 hover:bg-purple-500'}`}>
                <Key className="w-4 h-4" /> {showKeyForm ? 'Ocultar Config' : 'API Keys'}
             </button>
             <button onClick={() => setShowDepositModal(true)} className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition">
                <PlusCircle className="w-4 h-4" /> Depositar
             </button>
          </div>
        </header>

        {/* FORMULARIO CLAVES */}
        {showKeyForm && (
            <form onSubmit={handleSaveKeys} className="bg-slate-900/80 border border-slate-700 p-6 rounded-xl mb-6 relative z-10 animate-in fade-in slide-in-from-top-4">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-purple-400"/> Configuración Binance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required placeholder="API Key" value={apiKey} onChange={e => setApiKey(e.target.value)} className="bg-black border border-slate-600 p-3 rounded-lg text-white" />
                    <input required type="password" placeholder="Secret Key" value={secretKey} onChange={e => setSecretKey(e.target.value)} className="bg-black border border-slate-600 p-3 rounded-lg text-white" />
                </div>
                <div className="mt-4 flex items-center gap-4">
                    <button type="submit" disabled={isSaving} className="bg-purple-600 px-6 py-2 rounded-lg font-bold hover:bg-purple-500 transition">{isSaving ? 'Guardando...' : 'Guardar Seguro'}</button>
                    {saveStatus.success && <span className="text-green-400 text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4"/> {saveStatus.success}</span>}
                    {saveStatus.error && <span className="text-red-400 text-sm flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> {saveStatus.error}</span>}
                </div>
            </form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {/* BALANCE */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Wallet className="w-32 h-32 text-white" /></div>
                    <h3 className="text-slate-400 mb-2 font-medium">Balance Total</h3>
                    <div className="text-5xl font-mono font-bold text-white mb-4">${totalBalance.toLocaleString()}</div>
                    <div className="flex gap-4">
                        <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm flex items-center gap-1"><ArrowUpRight className="w-4 h-4" /> +$1,240.50</div>
                        <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">PNL: +12.4%</div>
                    </div>
                </div>
                {/* BARRAS DE ACTIVOS */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-500" /> Distribución</h3>
                    <div className="space-y-4">
                        {assets.map((asset) => (
                            <div key={asset.coin}>
                                <div className="flex justify-between text-sm mb-1"><span className="font-bold text-white">{asset.coin}</span><span className="text-slate-400">${asset.value.toLocaleString()}</span></div>
                                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                    <div className={`h-full ${asset.color}`} style={{ width: `${(asset.value / totalBalance) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* HISTORIAL INTERACTIVO */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full flex flex-col">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><History className="w-5 h-5 text-orange-500" /> Historial</h3>
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    {history.map((trade, i) => (
                        <div 
                            key={i} 
                            onClick={() => setSelectedTrade(trade)} // 🔥 AQUI ESTA EL CLICK
                            className="p-4 bg-black/40 rounded-xl border border-slate-800 hover:border-slate-600 hover:bg-slate-800 transition cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${trade.type === 'COMPRA' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{trade.type}</span>
                                    <span className="text-white font-bold ml-2">{trade.asset}</span>
                                </div>
                                <span className="text-xs text-slate-500">{trade.date}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="text-sm text-slate-400">{trade.amount} @ ${trade.price}</div>
                                {trade.profit && <div className={`text-sm font-bold ${trade.profit.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{trade.profit}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* --- MODAL DE DETALLES DE TRANSACCIÓN --- */}
        {selectedTrade && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedTrade(null)}>
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Detalles de Orden</h3>
                        <button onClick={() => setSelectedTrade(null)}><X className="w-5 h-5 text-slate-400 hover:text-white"/></button>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-slate-400">Par:</span> <span className="font-mono font-bold">{selectedTrade.asset}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Tipo:</span> <span className={`font-bold ${selectedTrade.type === 'COMPRA' ? 'text-green-400' : 'text-red-400'}`}>{selectedTrade.type}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Precio:</span> <span>${selectedTrade.price}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Cantidad:</span> <span>{selectedTrade.amount}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Comisión:</span> <span>${selectedTrade.fee}</span></div>
                        <div className="h-px bg-slate-700 my-2"></div>
                        <div className="flex justify-between"><span className="text-slate-400">Estado:</span> <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Completada</span></div>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODAL DE DEPÓSITO --- */}
        {showDepositModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowDepositModal(false)}>
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
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
                        <button type="submit" className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold transition">Confirmar Depósito</button>
                    </form>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}