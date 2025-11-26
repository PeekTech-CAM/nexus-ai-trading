"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Activity,
  Cpu,
  Wallet,
  Bell,
  LogOut,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  BarChart3,
  RefreshCw,
  Download,
  Play,
  Pause,
  Settings2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line,
  CartesianGrid,
  Area,
} from "recharts";

/**
 * Powerful Dashboard (single-file)
 *
 * Features:
 * - Real-time BTC price + RSI + AI text + confidence
 * - Candlestick-like historical area chart (using OHLCV -> synthetic)
 * - Market list (top markets) with online/offline handling
 * - Controls: refresh, pause/resume auto-update, export CSV, toggle update interval
 * - Robust error handling, skeleton states and notifications
 * - Clean, professional UI using Tailwind classes (assumes Tailwind available)
 *
 * Notes:
 * - Uses NEXT_PUBLIC_API_BASE_URL or fallback constant
 * - Requires lucide-react + recharts installed in your project
 *    npm i lucide-react recharts
 *
 * - Replace endpoints as needed in API_BASE_URL
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://nexus-ai-trading-1.onrender.com";

type Candle = {
  time: number; // seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

function formatPrice(n: number) {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { minimumFractionDigits: 2 });
}

function toCSVRows(candles: Candle[]) {
  const header = ["time_unix", "open", "high", "low", "close", "volume"];
  const rows = candles.map((c) =>
    [c.time, c.open, c.high, c.low, c.close, c.volume].join(",")
  );
  return [header.join(","), ...rows].join("\n");
}

/* -------------------------
   Mini ChartComponent (Recharts)
   Displays an area + line (close price) and bar volume
   ------------------------- */
function ChartComponent({ data }: { data: Candle[] }) {
  // Convert to recharts-friendly
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        time: new Date(d.time * 1000).toLocaleString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }),
        close: d.close,
        volume: d.volume,
      })),
    [data]
  );

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={chartData}>
        <CartesianGrid stroke="#111827" vertical={false} />
        <XAxis dataKey="time" tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <YAxis
          yAxisId="left"
          orientation="left"
          tick={{ fill: "#9ca3af", fontSize: 11 }}
          domain={["dataMin", "dataMax"]}
          width={70}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: "#9ca3af", fontSize: 11 }}
          domain={[0, "dataMax"]}
          hide
        />
        <Tooltip
          wrapperStyle={{ background: "#0f1724", border: "1px solid #1f2937" }}
          labelStyle={{ color: "#fff" }}
        />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="close"
          fill="rgba(59,130,246,0.12)"
          stroke="rgba(59,130,246,0.9)"
          strokeWidth={2}
        />
        <Line
          yAxisId="left"
          dataKey="close"
          stroke="rgba(99,102,241,0.95)"
          dot={false}
          strokeWidth={1.5}
        />
        <Bar
          yAxisId="right"
          dataKey="volume"
          barSize={8}
          fill="rgba(148,163,184,0.16)"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/* -------------------------
   MarketList: lightweight market watch
   ------------------------- */
function MarketList() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    async function fetchMarkets() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/market/overview`);
        if (!res.ok) throw new Error("Market overview failed");
        const json = await res.json();
        if (!mounted.current) return;
        setMarkets(
          json.map((m: any) => ({
            symbol: m.symbol,
            price: m.price,
            change: m.change,
            volume: m.volume,
          }))
        );
      } catch (e) {
        // fallback to sample
        setMarkets([
          { symbol: "BTC", price: 86500, change: 1.2, volume: 1200 },
          { symbol: "ETH", price: 2950, change: -0.6, volume: 820 },
          { symbol: "SOL", price: 135, change: 2.5, volume: 4300 },
        ]);
      } finally {
        if (mounted.current) setLoading(false);
      }
    }
    fetchMarkets();
    const iv = setInterval(fetchMarkets, 30_000);
    return () => {
      mounted.current = false;
      clearInterval(iv);
    };
  }, []);

  return (
    <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl h-full flex flex-col shadow">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm text-slate-300 font-semibold">Market Watch</h4>
        <div className="text-xs text-slate-500">Top pairs</div>
      </div>

      <div className="flex-1 overflow-auto space-y-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-14 bg-black/20 rounded-lg animate-pulse border border-slate-800"
              />
            ))
          : markets.map((m: any) => (
              <div
                key={m.symbol}
                className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-slate-800"
              >
                <div>
                  <div className="text-sm font-semibold">{m.symbol}/USDT</div>
                  <div className="text-xs text-slate-400">Vol: {m.volume}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">${formatPrice(m.price)}</div>
                  <div
                    className={`text-xs mt-1 ${
                      m.change >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {m.change >= 0 ? "+" : ""}
                    {Number(m.change).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 px-3 py-2 bg-slate-800/60 rounded-md text-sm"
        >
          Refresh
        </button>
        <a
          href={`${API_BASE_URL}/api/market/overview`}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-2 bg-indigo-600 rounded-md text-sm"
        >
          Open API
        </a>
      </div>
    </div>
  );
}

/* -------------------------
   Main Dashboard Component
   ------------------------- */
export default function Dashboard() {
  const router = useRouter();

  const [price, setPrice] = useState<number>(0);
  const [change24h, setChange24h] = useState<number>(0);
  const [rsi, setRsi] = useState<number>(50);
  const [signal, setSignal] = useState<string>("NEUTRAL");
  const [aiText, setAiText] = useState<string>("Sincronizando IA...");
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [candleData, setCandleData] = useState<Candle[]>([]);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [intervalMs, setIntervalMs] = useState<number>(4000);
  const [status, setStatus] = useState<"online" | "offline">("offline");
  const [notif, setNotif] = useState<{ type: "info" | "success" | "error"; message: string } | null>(null);

  const priceTimerRef = useRef<number | null>(null);
  const chartTimerRef = useRef<number | null>(null);

  // fetch single market summary
  const fetchMarketData = async (signalOnly = false) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/market/btc`);
      if (!res.ok) throw new Error("Market endpoint error");
      const data = await res.json();

      // Accept both lowercase/uppercase status variants
      if (!signalOnly) {
        setPrice(Number(data.price ?? data.last ?? price));
        setChange24h(Number(data.change_24h ?? data.percentage ?? change24h));
        setRsi(Number(data.rsi ?? rsi));
        setSignal(String(data.signal ?? data.signal?.toUpperCase() ?? signal));
        setLoading(false);
      } else {
        setSignal(String(data.signal ?? data.signal?.toUpperCase() ?? signal));
      }

      if (data.ai_analysis) {
        setAiText(String(data.ai_analysis));
        setAiConfidence(Number(data.ai_confidence ?? 0));
      }

      setStatus("online");
    } catch (e) {
      console.error("Market fetch error", e);
      setStatus("offline");
      setNotif({ type: "error", message: "No se pudo obtener datos de mercado. Mostrando local." });
    }
  };

  const fetchCandles = async () => {
    try {
      // default endpoint returns last N 1h candles
      const res = await fetch(`${API_BASE_URL}/api/market/candles?limit=120`);
      if (!res.ok) throw new Error("Candles endpoint error");
      const json = await res.json();
      // normalize to Candle[]
      const normalized: Candle[] = Array.isArray(json)
        ? json.map((c: any) => ({
            time: Math.floor((c.time ?? c[0] ?? 0)),
            open: Number(c.open ?? c[1] ?? 0),
            high: Number(c.high ?? c[2] ?? 0),
            low: Number(c.low ?? c[3] ?? 0),
            close: Number(c.close ?? c[4] ?? 0),
            volume: Number(c.volume ?? c[5] ?? 0),
          }))
        : [];
      if (normalized.length === 0) throw new Error("No candles");
      setCandleData(normalized);
      setStatus("online");
    } catch (e) {
      console.error("Candles fetch error", e);
      // fallback to synthetic sample if API fails
      const sample: Candle[] = makeSampleCandles();
      setCandleData(sample);
      setNotif({ type: "info", message: "Mostrando datos históricos locales (fallback)." });
      setStatus("offline");
    }
  };

  // Manage auto-update timers
  useEffect(() => {
    // initial loads
    fetchMarketData();
    fetchCandles();

    // price updates more frequent
    function startPriceTimer() {
      stopPriceTimer();
      priceTimerRef.current = window.setInterval(() => {
        fetchMarketData(true); // maybe only signal + price
      }, intervalMs);
    }
    function stopPriceTimer() {
      if (priceTimerRef.current) {
        clearInterval(priceTimerRef.current);
        priceTimerRef.current = null;
      }
    }

    function startChartTimer() {
      stopChartTimer();
      chartTimerRef.current = window.setInterval(fetchCandles, 60_000); // every minute
    }
    function stopChartTimer() {
      if (chartTimerRef.current) {
        clearInterval(chartTimerRef.current);
        chartTimerRef.current = null;
      }
    }

    if (autoUpdate) {
      startPriceTimer();
      startChartTimer();
    } else {
      stopPriceTimer();
      stopChartTimer();
    }

    return () => {
      stopPriceTimer();
      stopChartTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoUpdate, intervalMs]);

  // dismissible notifications
  useEffect(() => {
    if (!notif) return;
    const t = setTimeout(() => setNotif(null), 4200);
    return () => clearTimeout(t);
  }, [notif]);

  // small helpers
  function makeSampleCandles(): Candle[] {
    // generate 60 synthetic candles (1h steps)
    const now = Math.floor(Date.now() / 1000);
    let base = price || 76000;
    const res: Candle[] = [];
    for (let i = 60; i >= 1; i--) {
      const ts = now - i * 3600;
      const change = (Math.random() - 0.5) * 400;
      const open = base + change * 0.5;
      const close = base + change;
      const high = Math.max(open, close) + Math.random() * 100;
      const low = Math.min(open, close) - Math.random() * 100;
      const vol = Math.round(Math.random() * 2000);
      res.push({ time: ts, open, high, low, close, volume: vol });
      base = close;
    }
    return res;
  }

  const exportCandlesCSV = () => {
    const csv = toCSVRows(candleData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candles_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setNotif({ type: "success", message: "Exportado historial (CSV)" });
  };

  const toggleAuto = () => {
    setAutoUpdate((s) => !s);
    setNotif({ type: "info", message: autoUpdate ? "Auto-update paused" : "Auto-update resumed" });
  };

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#03050A] to-black text-white flex font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-800 bg-[#071026] flex flex-col p-6 hidden lg:flex z-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center shadow-lg">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">NEXUS <span className="text-sky-400">AI</span></h1>
            <p className="text-xs text-slate-400">Trading Intelligence</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => router.push("/dashboard")} className="w-full flex items-center gap-3 px-4 py-3 bg-sky-700/8 text-sky-300 rounded-lg">
            <Activity className="w-5 h-5" /> Dashboard
          </button>
          <button onClick={() => router.push("/estrategias")} className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 rounded-lg hover:bg-slate-900/20">
            <LineChart className="w-5 h-5" /> Estrategias
          </button>
          <button onClick={() => router.push("/cartera")} className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 rounded-lg hover:bg-slate-900/20">
            <Wallet className="w-5 h-5" /> Cartera
          </button>
        </nav>

        <div className="mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/10 rounded-lg">
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-auto z-10">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Panel de Control</h2>
            <p className="text-slate-400 text-sm">Visión general del mercado y estado del bot</p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-md text-xs font-mono ${status === "online" ? "bg-green-700/10 text-green-300" : "bg-red-700/10 text-red-300"}`}>
              {status === "online" ? "ONLINE" : "OFFLINE"}
            </div>

            <button onClick={() => fetchMarketData()} title="Refrescar ahora" className="px-3 py-2 bg-slate-800 rounded-md">
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-md">
              <button onClick={toggleAuto} className="flex items-center gap-2">
                {autoUpdate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="text-xs">{autoUpdate ? "Pause" : "Resume"}</span>
              </button>
            </div>

            <div className="px-3 py-2 bg-slate-800 rounded-md flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              <select
                value={intervalMs}
                onChange={(e) => setIntervalMs(Number(e.target.value))}
                className="bg-transparent text-sm outline-none"
              >
                <option value={2000}>2s</option>
                <option value={4000}>4s</option>
                <option value={8000}>8s</option>
                <option value={15000}>15s</option>
              </select>
            </div>
          </div>
        </header>

        {/* Top cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Price */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl shadow">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-slate-400">Bitcoin • BTC/USDT</div>
                <div className="text-3xl font-mono font-bold mt-2">${formatPrice(price)}</div>
                <div className={`mt-2 text-sm ${change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                  <TrendingUp className="inline w-4 h-4 mr-1 align-middle" />
                  {change24h >= 0 ? "+" : ""}
                  {Number(change24h).toFixed(2)}% (24h)
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Signal</div>
                <div className={`mt-1 px-2 py-1 rounded text-sm font-semibold ${
                  signal.toUpperCase().includes("BUY") || signal === "COMPRA"
                    ? "bg-green-600/10 text-green-300"
                    : signal.toUpperCase().includes("SELL") || signal === "VENTA"
                    ? "bg-red-600/10 text-red-300"
                    : "bg-slate-700/10 text-slate-300"
                }`}>
                  {signal}
                </div>
              </div>
            </div>
          </div>

          {/* RSI */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl shadow">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-slate-400">RSI (1H)</div>
                <div className="text-3xl font-bold mt-2">{rsi ? rsi.toFixed(1) : "50.0"}</div>
              </div>
              <div className="w-32">
                <div className="text-xs text-slate-400 mb-2">Strength</div>
                <div className="w-full bg-slate-800 h-3 rounded overflow-hidden">
                  <div
                    className={`${rsi > 70 ? "bg-red-500" : rsi < 30 ? "bg-green-500" : "bg-blue-500"}`}
                    style={{ width: `${Math.min(Math.max(rsi, 0), 100)}%`, height: "100%" }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">Thresholds: 30 (buy), 70 (sell)</div>
          </div>

          {/* AI analysis */}
          <div className="bg-gradient-to-br from-indigo-900/10 to-sky-900/6 border border-indigo-600/10 p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-300" />
                <div className="text-sm font-semibold">Nexus Brain</div>
              </div>
              <div className="text-xs text-slate-400">{aiConfidence}%</div>
            </div>
            <div className="mt-3 text-sm text-white font-medium min-h-[3rem]">"{aiText}"</div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setNotif({ type: "success", message: "Estrategia guardada (simulado)." })} className="px-3 py-2 bg-indigo-600 rounded-md text-sm">
                Save Insight
              </button>
              <button onClick={() => navigator.clipboard?.writeText(aiText).then(() => setNotif({ type: "success", message: "Análisis copiado" }))} className="px-3 py-2 bg-slate-800 rounded-md text-sm">
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Lower area: Chart + MarketList */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-4 shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <div className="text-sm text-slate-300 font-semibold">Análisis Técnico (1H)</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => fetchCandles()} className="px-2 py-1 rounded bg-slate-800/60 text-sm">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={exportCandlesCSV} className="px-2 py-1 rounded bg-slate-800/60 text-sm">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="h-[360px]">
              {candleData.length > 0 ? (
                <ChartComponent data={candleData} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">No hay datos</div>
              )}
            </div>
          </div>

          <div className="h-[360px]">
            <MarketList />
          </div>
        </div>

        {/* Toast notifications */}
        {notif && (
          <div className={`fixed right-6 bottom-6 z-50 p-4 rounded-lg shadow-xl ${notif.type === "success" ? "bg-green-600" : notif.type === "error" ? "bg-red-600" : "bg-slate-700"}`}>
            <div className="flex items-center gap-3">
              {notif.type === "error" ? <AlertTriangle /> : <Bell />}
              <div className="text-sm">{notif.message}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* Helper: small Pause icon used above (lucide doesn't export Pause/Play in the top import block) */
function Pause(props: any) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props} className="w-4 h-4">
      <rect x="6" y="5" width="4" height="14" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" fill="currentColor" />
    </svg>
  );
}
function Play(props: any) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props} className="w-4 h-4">
      <path d="M5 3v18l15-9L5 3z" fill="currentColor" />
    </svg>
  );
}
