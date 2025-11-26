"use client";
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export const MarketList = () => {
    const [markets, setMarkets] = useState<any[]>([]);

    useEffect(() => {
        const fetchMarkets = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/market/overview');
                const data = await res.json();
                if (Array.isArray(data)) setMarkets(data);
            } catch (e) { console.error(e); }
        };

        fetchMarkets();
        const interval = setInterval(fetchMarkets, 5000); // Actualiza cada 5s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-hidden flex flex-col shadow-lg h-full">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" /> Mercado en Vivo
            </h3>
            
            <div className="space-y-1 overflow-y-auto pr-1 custom-scrollbar">
                {markets.map((coin) => (
                    <div key={coin.symbol} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg transition group cursor-pointer border-b border-slate-800/50 last:border-0">
                        <div className="flex items-center gap-3">
                            {/* Icono Simulado con iniciales */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${coin.change >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {coin.symbol.substring(0, 1)}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">{coin.symbol}</div>
                                <div className="text-xs text-slate-500">Vol: ${(coin.volume / 1000000).toFixed(1)}M</div>
                            </div>
                        </div>
                        
                        <div className="text-right">
                            <div className="text-sm font-mono text-white">${coin.price.toLocaleString()}</div>
                            <div className={`text-xs flex items-center justify-end gap-1 ${coin.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {coin.change >= 0 ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
                                {coin.change.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                ))}
                
                {markets.length === 0 && (
                    <div className="text-center text-slate-500 py-4 text-sm animate-pulse">Escaneando Exchanges...</div>
                )}
            </div>
        </div>
    );
};