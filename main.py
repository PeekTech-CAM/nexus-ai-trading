import uvicorn
import ccxt
import requests
import json
import random
import numpy as np 
import stripe 
import os
import traceback
from fastapi import FastAPI, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from pydantic import BaseModel

# ==========================================
# ⚙️ 1. CONFIGURACIÓN DE ENTORNO Y CLAVES
# ==========================================
# Las claves se leen de las variables de entorno de Render
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") 

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

# Conexión a Base de Datos
try:
    from database_manager import db_manager
except ImportError: 
    print("🔥 Error: No se encuentra database_manager.py")
    exit()

# ==========================================
# 🚀 2. INICIALIZACIÓN DEL SERVIDOR (FASTAPI)
# ==========================================
app = FastAPI(title="NEXUS AI TRADING CORE")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicialización de servicios
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
exchange = ccxt.binance() # Instancia pública para market data

# --- MODELOS DE DATOS ---
class UserAuth(BaseModel):
    email: str
    password: str

class StrategyRequest(BaseModel):
    prompt: str

# ==========================================
# 🧠 3. LÓGICA DE NEGOCIO Y RUTAS
# ==========================================

# --- FUNCIONES AUXILIARES DE CÁLCULO ---

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
    # Lógica de AI (Multi-Model / Fallback)
    modelos = ["gemini-pro"]
    headers = {'Content-Type': 'application/json'}
    prompt_text = f"Bitcoin a ${price} ({change}%). RSI: {rsi:.2f}. Dame 1 frase CORTA de análisis técnico financiero."
    data = { "contents": [{ "parts": [{"text": prompt_text}] }] }

    for modelo in modelos:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent?key={GOOGLE_API_KEY}"
            response = requests.post(url, headers=headers, json=data, timeout=5)
            if response.status_code == 200:
                return response.json()['candidates'][0]['content']['parts'][0]['text'].strip()
        except:
            continue
    
    # FALLBACK INTELIGENTE
    if rsi > 70: return "Sobrecompra detectada, posible corrección."
    if rsi < 30: return "Sobrevendida, posible rebote."
    return "Mercado en rango, esperando ruptura."


# --- 📡 RUTAS DE DATOS Y EJECUCIÓN ---

@app.get("/api/market/btc")
async def get_btc_data():
    try:
        ticker = exchange.fetch_ticker('BTC/USDT')
        price = ticker['last']
        change = ticker['percentage']
        
        ohlcv_20 = exchange.fetch_ohlcv('BTC/USDT', timeframe='1h', limit=20)
        closes = np.array([x[4] for x in ohlcv_20])
        rsi = calculate_rsi(closes)
        
        ai_message = get_ai_analysis(price, change, rsi)
        confidence = 90
        signal = "NEUTRAL"
        if rsi > 70: signal = "VENTA"
        if rsi < 30: signal = "COMPRA"
        
        return {
            "symbol": "BTC/USDT",
            "price": price,
            "change_24h": change,
            "rsi": rsi,
            "signal": signal,
            "ai_analysis": ai_message,
            "ai_confidence": confidence,
            "status": "LIVE"
        }
    except Exception as e: return {"price": 0, "change_24h": 0, "status": "ERROR"}

@app.get("/api/market/candles")
async def get_candles():
    try:
        ohlcv = exchange.fetch_ohlcv('BTC/USDT', timeframe='1h', limit=100)
        formatted_data = []
        for candle in ohlcv:
            formatted_data.append({
                "time": candle[0] // 1000,
                "open": candle[1],
                "high": candle[2],
                "low": candle[3],
                "close": candle[4]
            })
        return formatted_data
    except: return []

@app.get("/api/market/overview")
async def get_market_overview():
    try:
        symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT']
        market_data = []
        for sym in symbols:
            ticker = exchange.fetch_ticker(sym)
            market_data.append({
                "symbol": sym.replace('/USDT', ''), 
                "price": ticker['last'],
                "change": ticker['percentage'],
                "volume": ticker['quoteVolume'] 
            })
        return market_data
    except: return []

# 🔥 RUTA NUEVA: OBTENER BALANCE REAL DE USUARIO 🔥
@app.get("/api/user/balance/{user_email}")
async def get_user_balance(user_email: str):
    """
    Desencripta las claves y consulta el saldo real en Binance Testnet.
    """
    try:
        # 1. Obtener y Desencriptar Claves
        credentials = db_manager.obtener_credenciales_usuario(user_email)
        
        if not credentials:
            raise HTTPException(status_code=404, detail="Claves no guardadas para este usuario.")
            
        # 2. Inicializar Exchange con credenciales (Configurado para TESTNET)
        user_exchange = ccxt.binance({
            'apiKey': credentials['apiKey'],
            'secret': credentials['secret'],
            'options': {
                'defaultType': 'future', 
                'urls': {'api': 'https://testnet.binancefuture.com'} # <--- TESTNET URL
            }
        })
        
        # 3. Consultar el saldo (Wallet/Margin)
        balance = user_exchange.fetch_balance()
        
        # 4. Procesar y devolver el saldo total
        total_equity = balance['total'].get('USDT', 0)
        
        return {
            "status": "success",
            "total_balance_usd": total_equity,
            "assets": balance['total'], 
            "free_margin": balance['free'].get('USDT', 0)
        }
        
    except ccxt.AuthenticationError:
        raise HTTPException(status_code=401, detail="Error de autenticación. Claves de Binance incorrectas.")
    except Exception as e:
        print(f"Error al obtener balance: {e}")
        raise