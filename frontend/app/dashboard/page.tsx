import React, { useState, useEffect } from 'react';
import { 
  Activity, TrendingUp, TrendingDown, DollarSign, BarChart3, 
  Zap, Shield, Brain, ChevronRight, ArrowUpRight, ArrowDownRight,
  Eye, EyeOff, RefreshCw, Settings, Bell, Moon, Sun, Maximize2,
  Minimize2, Filter, Download, Upload, Play, Pause, AlertCircle,
  CheckCircle2, XCircle, Clock, Target, Award, Sparkles, Rocket,
  LineChart, PieChart, Wallet, Percent, Hash
} from 'lucide-react';

export default function AdvancedDashboard() {
  const [balance, setBalance] = useState(156842.50);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAutoTrading, setIsAutoTrading] = useState(true);
  const [timeframe, setTimeframe] = useState('1H');
  const [selectedMetric, setSelectedMetric] = useState('portfolio');

  // Simulated real-time data
  const [btcPrice, setBtcPrice] = useState(89942.83);
  const [btcChange, setBtcChange] = useState(3.52);
  
  const portfolioData = [
    { symbol: 'BTC', name: 'Bitcoin', amount: 1.245, value: 111957.42, change: 3.54, alloc: 35, color: 'bg-orange-500' },
    { symbol: 'ETH', name: 'Ethereum', amount: 28.5, value: 86832.00, change: 3.75, alloc: 28, color: 'bg-blue-500' },
    { symbol: 'SOL', name: 'Solana', amount: 412, value: 59228.00, change: 5.33, alloc: 19, color: 'bg-purple-500' },
    { symbol: 'BNB', name: 'Binance', amount: 98.2, value: 88024.64, change: 4.82, alloc: 11, color: 'bg-yellow-500' },
    { symbol: 'USDT', name: 'Tether', amount: 10800, value: 10800.00, change: 0.0, alloc: 7, color: 'bg-green-500' }
  ];

  const recentTrades = [
    { type: 'BUY', pair: 'BTC/USDT', amount: 0.125, price: 89650, pnl: '+2.8%', time: '2m ago', status: 'success' },
    { type: 'SELL', pair: 'ETH/USDT', amount: 3.5, price: 3045, pnl: '+5.2%', time: '15m ago', status: 'success' },
    { type: 'BUY', pair: 'SOL/USDT', amount: 45, price: 143.80, pnl: '+1.2%', time: '28m ago', status: 'success' },
    { type: 'SELL', pair: 'BNB/USDT', amount: 12, price: 896.50, pnl: '-0.8%', time: '1h ago', status: 'loss' },
    { type: 'BUY', pair: 'MATIC/USDT', amount: 850, price: 0.92, pnl: '+3.1%', time: '2h ago', status: 'success' }
  ];

  const aiSignals = [
    { pair: 'BTC/USDT', action: 'LONG', confidence: 94, entry: 89500, target: 92000, stop: 87500, timeframe: '4H' },
    { pair: 'ETH/USDT', action: 'LONG', confidence: 87, entry: 3040, target: 3180, stop: 2980, timeframe: '1H' },
    { pair: 'SOL/USDT', action: 'SHORT', confidence: 78, entry: 144.50, target: 138, stop: 147, timeframe: '30M' }
  ];

  const metrics = [
    { label: 'Win Rate', value: '73.8%', change: '+2.1%', icon: Target, color: 'text-green-400' },
    { label: 'Sharpe Ratio', value: '2.34', change: '+0.18', icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Max Drawdown', value: '-8.2%', change: '-1.3%', icon: TrendingDown, color: 'text-red-400' },
    { label: 'Total Trades', value: '1,247', change: '+89', icon: Hash, color: 'text-purple-400' }
  ];

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBtcPrice(prev => prev + (Math.random() - 0.5) * 100);
      setBtcChange(prev => prev + (Math.random() - 0.5) * 0.1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Advanced Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Status */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-slate-950"></div>
                </div>
                <div>
                  <h1 className="font-bold text-xl tracking-tight">NEXUS AI</h1>
                  <p className="text-xs text-slate-400">Advanced Trading v3.0</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-400">SYSTEM ONLINE</span>
              </div>

              <button
                onClick={() => setIsAutoTrading(!isAutoTrading)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isAutoTrading 
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30' 
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {isAutoTrading ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                Auto-Trade {isAutoTrading ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-slate-800 rounded-lg transition">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-slate-800 rounded-lg transition">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-slate-800 rounded-lg transition">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-slate-700"></div>
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold">
                  CE
                </div>
                <div>
                  <p className="text-sm font-medium">CEO</p>
                  <p className="text-xs text-slate-400">Premium</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Portfolio Value */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/10 rounded-lg">
                    <Wallet className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-slate-400">Portfolio Value</span>
                </div>
                <button
                  onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition"
                >
                  {isBalanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="mb-4">
                <div className="text-4xl font-bold mb-2">
                  {isBalanceVisible ? `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••••'}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-green-400">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="font-semibold">+$12,842.50</span>
                    <span className="text-sm">(+8.92% Today)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-950/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">24h High</p>
                  <p className="text-lg font-bold text-green-400">$158,420</p>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">24h Low</p>
                  <p className="text-lg font-bold text-red-400">$154,280</p>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">24h Vol</p>
                  <p className="text-lg font-bold">$89.2M</p>
                </div>
              </div>
            </div>
          </div>

          {/* BTC Price Card */}
          <div className="bg-gradient-to-br from-orange-900/20 to-slate-900 border border-orange-800/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
                <span className="font-semibold">Bitcoin</span>
                <span className="text-xs text-slate-400">BTC/USDT</span>
              </div>
              <div className="text-3xl font-bold mb-2">${btcPrice.toFixed(2)}</div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 ${btcChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {btcChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span className="font-semibold">{btcChange >= 0 ? '+' : ''}{btcChange.toFixed(2)}%</span>
                </div>
                <span className="text-xs text-slate-400">24h</span>
              </div>
            </div>
          </div>

          {/* AI Brain Status */}
          <div className="bg-gradient-to-br from-purple-900/20 to-slate-900 border border-purple-800/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <span className="font-semibold">AI Analysis</span>
              </div>
              <div className="mb-3">
                <div className="text-2xl font-bold mb-1">BULLISH</div>
                <p className="text-sm text-slate-400">Market sentiment strong</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-950/50 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-full w-[92%] rounded-full"></div>
                </div>
                <span className="text-sm font-bold text-purple-400">92%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">{metric.label}</span>
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
              </div>
              <div className="text-2xl font-bold mb-1">{metric.value}</div>
              <div className={`text-sm ${metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {metric.change} vs last week
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assets Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-400" />
                  Asset Allocation
                </h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition">
                    All Assets
                  </button>
                  <button className="p-2 hover:bg-slate-800 rounded-lg transition">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {portfolioData.map((asset, idx) => (
                  <div key={idx} className="bg-slate-950/50 rounded-xl p-4 hover:bg-slate-950/70 transition group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${asset.color} rounded-full flex items-center justify-center text-sm font-bold`}>
                          {asset.symbol[0]}
                        </div>
                        <div>
                          <div className="font-semibold">{asset.symbol}</div>
                          <div className="text-xs text-slate-400">{asset.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${asset.value.toLocaleString()}</div>
                        <div className={`text-sm flex items-center gap-1 justify-end ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {asset.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {asset.change >= 0 ? '+' : ''}{asset.change}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className={`${asset.color} h-full rounded-full transition-all duration-500`} style={{ width: `${asset.alloc}%` }}></div>
                      </div>
                      <span className="text-sm font-medium text-slate-400">{asset.alloc}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                      <span>{asset.amount} {asset.symbol}</span>
                      <span>Avg: ${(asset.value / asset.amount).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Recent Trades
                </h3>
                <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {recentTrades.map((trade, idx) => (
                  <div key={idx} className="bg-slate-950/50 rounded-lg p-3 hover:bg-slate-950/70 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                          trade.type === 'BUY' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                        }`}>
                          {trade.type}
                        </div>
                        <div>
                          <div className="font-semibold">{trade.pair}</div>
                          <div className="text-xs text-slate-400">{trade.amount} @ ${trade.price.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${trade.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.pnl}
                        </div>
                        <div className="text-xs text-slate-400">{trade.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Signals & Sidebar */}
          <div className="space-y-6">
            {/* AI Trading Signals */}
            <div className="bg-gradient-to-br from-purple-900/20 to-slate-900 border border-purple-800/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold">AI Signals</h3>
              </div>

              <div className="space-y-4">
                {aiSignals.map((signal, idx) => (
                  <div key={idx} className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold">{signal.pair}</div>
                      <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                        signal.action === 'LONG' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                      }`}>
                        {signal.action}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-400">Confidence</span>
                        <span className="font-bold text-purple-400">{signal.confidence}%</span>
                      </div>
                      <div className="bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full"
                          style={{ width: `${signal.confidence}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-slate-900/50 rounded p-2">
                        <p className="text-slate-500 mb-1">Entry</p>
                        <p className="font-bold">${signal.entry}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded p-2">
                        <p className="text-slate-500 mb-1">Target</p>
                        <p className="font-bold text-green-400">${signal.target}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded p-2">
                        <p className="text-slate-500 mb-1">Stop</p>
                        <p className="font-bold text-red-400">${signal.stop}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-slate-400">{signal.timeframe}</span>
                      <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-medium transition">
                        Execute
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Today's Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Active Positions</span>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Pending Orders</span>
                  <span className="font-bold">7</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Completed Trades</span>
                  <span className="font-bold text-green-400">89</span>
                </div>
                <div className="h-px bg-slate-800"></div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Total P&L</span>
                  <span className="font-bold text-green-400">+$12,842.50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Win/Loss Ratio</span>
                  <span className="font-bold">3.2</span>
                </div>
              </div>

              <button className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-medium transition flex items-center justify-center gap-2">
                <Rocket className="w-4 h-4" />
                View Full Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}