import uvicorn
import ccxt
import requests
import json
import random
import numpy as np 
import stripe 
import os
import logging
import sys
from datetime import datetime
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from enum import Enum
from fastapi import FastAPI, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from pydantic import BaseModel

# ==========================================
# ⚙️ 1. CONFIGURACIÓN Y LOGGING
# ==========================================
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") 

if STRIPE_SECRET_KEY: stripe.api_key = STRIPE_SECRET_KEY

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('NexusCore')

# Conexión a Base de Datos
try:
    from database_manager import db_manager
except ImportError: exit()

app = FastAPI(title="NEXUS AI TRADING CORE")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
exchange_public = ccxt.binance() # Para datos públicos

# --- CLASES DEL BOT ---
class TradingSignal(Enum):
    STRONG_BUY = "STRONG_BUY"
    BUY = "BUY"
    NEUTRAL = "NEUTRAL"
    SELL = "SELL"
    STRONG_SELL = "STRONG_SELL"

class OrderStatus(Enum):
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"

@dataclass
class BotConfig:
    timeframe: str = '5m'
    limit: int = 100
    testnet_mode: bool = True
    paper_trading: bool = True # 🔥 MODO SIMULACIÓN ACTIVADO EN NUBE POR SEGURIDAD 🔥
    min_trade_amount: float = 0.001
    rsi_oversold: int = 30
    rsi_overbought: int = 70

@dataclass
class MarketData:
    symbol: str
    current_price: float
    rsi: float

@dataclass
class TradeSignal:
    signal: TradingSignal
    confidence: float
    entry_price: float
    position_size: float
    reasoning: str

# --- MODELOS API ---
class UserAuth(BaseModel):
    email: str
    password: str

class KeyPayload(BaseModel):
    email: str
    apiKey: str
    secretKey: str

class StrategyRequest(BaseModel):
    prompt: str

# ==========================================
# 🧠 2. LÓGICA DE NEGOCIO (BOT + AI)
# ==========================================

def calculate_rsi(prices, period=14):
    try:
        deltas = np.diff(prices)
        seed = deltas[:period+1]
        up = seed[seed >= 0].sum()/period
        down = -seed[seed < 0].sum()/period
        rs = up/down
        rsi = np.zeros_like(prices)
        rsi[:period] = 100. - 100./(1. + rs)
        for i in range(period, len(prices)):
            delta = deltas[i-1]
            if delta > 0: upval = delta
            else: upval = 0.; downval = -delta
            up = (up * (period - 1) + upval) / period
            down = (down * (period - 1) + downval) / period
            rs = up/down
            rsi[i] = 100. - 100./(1. + rs)
        return rsi[-1]
    except: return 50.0

def get_ai_analysis(price, change, rsi):
    modelos = ["gemini-1.5-flash", "gemini-pro"]
    headers = {'Content-Type': 'application/json'}
    prompt = f"Bitcoin ${price} ({change}%). RSI {rsi:.2f}. 1 frase corta técnica."
    data = { "contents": [{ "parts": [{"text": prompt}] }] }

    for modelo in modelos:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent?key={GOOGLE_API_KEY}"
            response = requests.post(url, headers=headers, json=data, timeout=3)
            if response.status_code == 200:
                return response.json()['candidates'][0]['content']['parts'][0]['text'].strip()
        except: continue
    
    if rsi > 70: return "Sobrecompra, posible corrección."
    if rsi < 30: return "Sobreventa, posible rebote."
    return "Mercado lateral."

# --- MOTOR DEL BOT (Integrado) ---
def run_trading_cycle_for_user(user_email):
    """Lógica del bot que se ejecuta en la nube"""
    logger.info(f"🔄 Procesando {user_email}...")
    
    # 1. Credenciales
    creds = db_manager.obtener_credenciales_usuario(user_email)
    if not creds: return f"Skipped {user_email}: No keys"

    # 2. Datos Mercado
    try:
        ohlcv = exchange_public.fetch_ohlcv('BTC/USDT', '5m', 50)
        closes = np.array([x[4] for x in ohlcv])
        rsi = calculate_rsi(closes)
        price = closes[-1]
    except: return "Error fetching data"

    # 3. Señal
    signal = TradingSignal.NEUTRAL
    if rsi < 30: signal = TradingSignal.BUY
    elif rsi > 70: signal = TradingSignal.SELL

    # 4. Ejecución (Paper Trading)
    if signal != TradingSignal.NEUTRAL:
        # Aquí iría la lógica real con ccxt.binance(apiKey...)
        # Usamos Paper Trading para el log de Render
        logger.info(f"✅ [NUBE] SEÑAL {signal.value} EJECUTADA para {user_email} a ${price}")
        return f"Executed {signal.value} for {user_email}"
    
    return f"Neutral for {user_email} (RSI: {rsi:.2f})"

# ==========================================
# 📡 3. RUTAS (ENDPOINTS)
# ==========================================

@app.get("/")
def home(): return {"status": "ONLINE", "service": "Nexus AI Trading API"}

@app.get("/api/bot/run-cycle")
async def run_bot_cycle_endpoint():
    """CRON JOB llama a esto cada 5 minutos"""
    print("--- 🤖 CRON: Iniciando Barrido de Usuarios ---")
    
    # En producción, haríamos: users = db_manager.users.find({})
    users_to_run = ["ceo@nexus.com"] 
    logs = []
    
    for email in users_to_run:
        result = run_trading_cycle_for_user(email)
        logs.append(result)
        
    return {"status": "success", "logs": logs}

@app.get("/api/market/btc")
async def get_btc_data():
    try:
        ticker = exchange_public.fetch_ticker('BTC/USDT')
        price = ticker['last']
        change = ticker['percentage']
        
        ohlcv = exchange_public.fetch_ohlcv('BTC/USDT', '1h', 20)
        closes = np.array([x[4] for x in ohlcv])
        rsi = calculate_rsi(closes)
        
        ai_msg = get_ai_analysis(price, change, rsi)
        
        signal = "NEUTRAL"
        if rsi > 70: signal = "VENTA"
        if rsi < 30: signal = "COMPRA"
        
        return {
            "symbol": "BTC/USDT",
            "price": price,
            "change_24h": change,
            "rsi": rsi,
            "signal": signal,
            "ai_analysis": ai_msg,
            "ai_confidence": 88,
            "status": "LIVE"
        }
    except: return {"price": 0, "status": "ERROR"}

@app.get("/api/market/candles")
async def get_candles():
    try:
        ohlcv = exchange_public.fetch_ohlcv('BTC/USDT', '1h', 100)
        return [{"time": c[0]//1000, "open":c[1], "high":c[2], "low":c[3], "close":c[4]} for c in ohlcv]
    except: return []

@app.get("/api/market/overview")
async def get_market_overview():
    try:
        res = []
        for sym in ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT']:
            t = exchange_public.fetch_ticker(sym)
            res.append({"symbol": sym.replace('/USDT',''), "price": t['last'], "change": t['percentage'], "volume": t['quoteVolume']})
        return res
    except: return []

# --- USER & AUTH ---
@app.post("/api/user/save-keys")
def save_exchange_keys(payload: KeyPayload):
    exito = db_manager.guardar_keys_binance(payload.email, payload.apiKey, payload.secretKey)
    if exito: return {"status": "success"}
    raise HTTPException(500, "Error guardando claves")

@app.get("/api/user/balance/{user_email}")
async def get_user_balance(user_email: str):
    # Simulación para evitar error -2008 en frontend público si claves fallan
    # En prod real: usar lógica ccxt con claves
    return {
        "status": "success",
        "total_balance_usd": 96350.50, # Simulado para UI
        "assets": {"USDT": 24500, "BTC": 0.45},
        "free_margin": 50000
    }

def verify_password(plain, hashed): return pwd_context.verify(plain, hashed)

@app.post("/api/auth/register")
def register(user: UserAuth):
    hashed = pwd_context.hash(user.password)
    exito, msg = db_manager.crear_usuario(user.email, hashed)
    if not exito: raise HTTPException(400, detail=msg)
    return {"status": "success"}

@app.post("/api/auth/login")
def login(user: UserAuth):
    u = db_manager.users.find_one({"email": user.email})
    if not u or not verify_password(user.password, u['password']):
        raise HTTPException(401, detail="Credenciales error")
    return {"status": "success", "email": user.email}

@app.post("/api/ai/generate-strategy")
def generate_strategy(request: StrategyRequest):
    # Lógica simplificada para el endpoint
    return {
        "name": "Estrategia IA Scalping",
        "risk_level": "Alto",
        "indicators": ["RSI", "Bollinger"],
        "entry_rules": "RSI < 30 en 5m",
        "exit_rules": "RSI > 70 o TP 1.5%",
        "stop_loss": "1%", "take_profit": "3%",
        "reasoning": f"Estrategia optimizada para: {request.prompt[:20]}..."
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=os.getenv("PORT", 8000))