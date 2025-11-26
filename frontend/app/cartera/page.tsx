"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Activity, LineChart, Wallet, LogOut, Cpu,
    ArrowUpRight, CreditCard, PieChart, History 
} from 'lucide-react';

export default function PortfolioPage() {
  const router = useRouter();

  // Datos simulados de tu cartera
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
          <button className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-bold text-sm transition shadow-lg shadow-blue-900/20 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Depositar Fondos
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            
            {/* TARJETA DE BALANCE PRINCIPAL */}
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

                {/* LISTA DE ACTIVOS */}
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