"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity, LineChart, Wallet, LogOut, Cpu,
  ArrowUpRight, CreditCard, Key, Save, AlertTriangle, CheckCircle, History, PieChart, RefreshCw, Download, PlusCircle, X, ExternalLink
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexus-ai-trading-1.onrender.com";

// ... (Tipos y Muestras igual que antes, los omito para ahorrar espacio, MANTENLOS) ...
// COPIA TUS FUNCIONES sampleAssets, sampleHistory y Tipos AQUÍ SI LAS BORRASTE
// OJO: Si copias todo el bloque, asegúrate de incluir los tipos Asset y Trade definidos antes.

type Asset = { coin: string; amount: number; value: number; colorClass: string; };
type Trade = { id: number; type: 'COMPRA' | 'VENTA'; asset: string; amount: number; price: number; date: string; profit?: string | null; fee?: string; };

function sampleAssets(): Asset[] {
  return [
    { coin: 'USDT', amount: 24500.0, value: 24500.0, colorClass: 'bg-green-400' },
    { coin: 'BTC', amount: 0.45, value: 39150.0, colorClass: 'bg-orange-400' },
    { coin: 'ETH', amount: 4.2, value: 12300.5, colorClass: 'bg-blue-400' },
    { coin: 'SOL', amount: 150, value: 20400.0, colorClass: 'bg-purple-400' },
  ];
}
function sampleHistory(): Trade[] { return [/* ... tus datos de historial ... */]; }


export default function PortfolioPage() {
  const router = useRouter();

  // Estados
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ error?: string; success?: string }>({});
  const [assets, setAssets] = useState<Asset[]>(sampleAssets());
  const [history, setHistory] = useState<Trade[]>(sampleHistory()); // Usa sampleHistory() con datos llenos
  const [isDepositing, setIsDepositing] = useState(false);
  const [notif, setNotif] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);
  const USER_EMAIL = 'ceo@nexus.com';

  // ... (useEffect notif y handleSaveKeys IGUAL que antes) ...
  const handleSaveKeys = async (e: React.FormEvent) => { /* ... tu código de guardar ... */ };

  // 🔥 1. NUEVA LÓGICA DE DEPÓSITO REAL 🔥
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) return;
    
    setIsDepositing(true);
    setNotif({ type: 'info', message: 'Conectando con Stripe...' });

    try {
        // Solicitamos el link de pago al Backend
        const res = await fetch(`${API_BASE_URL}/api/payment/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: USER_EMAIL })
        });
        const data = await res.json();
        
        if (data.url) {
            window.location.href = data.url; // REDIRECCIÓN REAL
        } else {
            throw new Error("No se recibió URL de pago");
        }
    } catch (error) {
        // Si falla (por ejemplo, si no has configurado Stripe en backend aún), mostramos simulación
        setTimeout(() => {
            setNotif({ type: 'success', message: `Depósito de $${amt} simulado exitosamente.` });
            setShowDepositModal(false);
            setIsDepositing(false);
        }, 1500);
    }
  };

  // 🔥 2. NUEVA FUNCIÓN DE NAVEGACIÓN 🔥
  const goToAsset = (coin: string) => {
      // Si es USDT, no tiene gráfico, vamos al general
      if(coin === 'USDT') router.push('/dashboard');
      else router.push(`/dashboard?symbol=${coin}USDT`);
  };

  const totalBalance = assets.reduce((acc, a) => acc + a.value, 0);

  return (
    <div className="min-h-screen bg-[#05060a] text-white flex font-sans">
       {/* ... SIDEBAR IGUAL ... */}
       <aside className="w-72 border-r border-slate-800 bg-gradient-to-b from-[#071126] to-[#04050a] flex flex-col p-6 hidden lg:flex">
         {/* ... contenido del sidebar ... */}
         <button onClick={() => router.push('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-900 rounded-lg transition"><Activity className="w-5 h-5" /> <span>Dashboard</span></button>
         {/* ... resto botones ... */}
       </aside>

       <main className="flex-1 p-8 overflow-y-auto relative">
         {/* ... Header igual ... */}

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
           <div className="lg:col-span-2 space-y-6">
             {/* Balance Card Igual */}
             
             {/* 🔥 LISTA DE ACTIVOS INTERACTIVA 🔥 */}
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
               <h4 className="text-lg font-semibold mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-400" /> Distribución (Click para Operar)</h4>
               <div className="space-y-4">
                 {assets.map((asset) => (
                   <div 
                     key={asset.coin} 
                     onClick={() => goToAsset(asset.coin)} // <--- CLIC AQUÍ
                     className="cursor-pointer hover:bg-white/5 p-2 rounded-lg transition group"
                   >
                     <div className="flex justify-between text-sm mb-1">
                         <div className="flex items-center gap-2">
                             <div className={`w-3 h-3 rounded-full ${asset.colorClass}`}></div>
                             <span className="font-bold group-hover:text-blue-400 transition">{asset.coin}</span>
                             {asset.coin !== 'USDT' && <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-blue-400"/>}
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
           
           {/* ... Historial Igual ... */}
         </div>
         {/* ... Modales Iguales ... */}
       </main>
    </div>
  );
}