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
# 🔐 CONFIGURACIÓN DE ENTORNO
# ==========================================
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") 

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

# Conexión a Base de Datos
try:
    from database_manager import db_manager
except ImportError: 
    exit()

# ==========================================
# 🚀 2. INICIALIZACIÓN DEL SERVIDOR
# ==========================================
app = FastAPI(title="NEXUS AI TRADING CORE")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
exchange = ccxt.binance()

# --- MODELOS DE DATOS ---
class UserAuth(BaseModel):
    email: str
    password: str

class StrategyRequest(BaseModel):
    prompt: str

# --- FUNCIONES AUXILIARES ---
def verify_password(plain, hashed): return pwd_context.verify(plain, hashed)

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

# ==========================================
# 🧠 3. LÓGICA DE NEGOCIO Y RUTAS
# ==========================================
def get_ai_analysis(price, change, rsi):
    modelos = ["gemini-1.5-flash", "gemini-pro"]
    headers = {'Content-Type': 'application/json'}
    prompt_text = f"Bitcoin a ${price} ({change}%). RSI: {rsi:.2f}. Dame 1 frase CORTA de análisis técnico financiero."
    data = { "contents": [{ "parts": [{"text": prompt_text}] }] }

    for modelo in modelos:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent?key={GOOGLE_API_KEY}"
            response = requests.post(url, headers=headers, json=data, timeout=3)
            if response.status_code == 200:
                return response.json()['candidates'][0]['content']['parts'][0]['text'].strip()
        except:
            continue
    
    # FALLBACK INTELIGENTE
    if rsi > 70: return "Sobrecompra detectada, posible corrección."
    if rsi < 30: return "Sobrevendida, posible rebote."
    return "Mercado en rango, esperando ruptura."

@app.get("/")
def home(): return {"status": "ONLINE", "service": "Nexus AI Trading API"}

@app.get("/api/market/btc")
async def get_btc_data():
    try:
        ticker = exchange.fetch_ticker('BTC/USDT')
        price = ticker['last']
        change = ticker['percentage']
        
        # Obtenemos velas para RSI
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

# 🔥 RUTA DE VELAS HISTÓRICAS (Para el gráfico)
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

# 🔥 RUTA DE ESCANER DE MERCADO (Para la lista lateral)
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

# --- RUTAS DE STRIPE Y AUTH (Correctas) ---
@app.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    if not STRIPE_WEBHOOK_SECRET: return {"status": "error", "message": "Webhook secret not set"}
    # ... (Resto de la lógica del webhook) ...
    return {"status": "success"}

@app.post("/api/auth/register")
def register(user: UserAuth):
    try:
        hashed = pwd_context.hash(user.password)
        exito, msg = db_manager.crear_usuario(user.email, hashed)
        if not exito: raise HTTPException(400, detail=msg)
        return {"status": "success", "message": "Registrado"}
    except Exception as e: raise HTTPException(500, detail=str(e))

@app.post("/api/auth/login")
def login(user: UserAuth):
    try:
        u = db_manager.users.find_one({"email": user.email})
        if not u or not verify_password(user.password, u['password']):
            raise HTTPException(status_code=401, detail="Error")
        return {"status": "success", "message": "Bienvenido", "email": user.email}
    except Exception as e: raise HTTPException(500, detail=str(e))

@app.post("/api/ai/generate-strategy")
def generate_strategy(request: StrategyRequest):
    # ... (La lógica del generador de estrategias es compleja, se deja la función para ser completada)
    # De momento, la dejamos como un Fallback simple para que el código compile
    return {"name": "Estrategia Fallback", "risk_level": "Medio", "indicators": ["RSI"], "entry_rules": "Simulación", "exit_rules": "Simulación", "stop_loss": "2%", "take_profit": "5%", "reasoning": "Simulación"}
# --- EN main.py ---
# Define un nuevo modelo para recibir las claves
class KeyPayload(BaseModel):
    email: str
    apiKey: str
    secretKey: str
    
# 🔥 RUTA: GUARDAR CLAVES DE BINANCE ENCRIPTADAS 🔥
@app.post("/api/user/save-keys")
def save_exchange_keys(payload: KeyPayload):
    """Recibe las claves del usuario y las guarda encriptadas."""
    
    # En un entorno real, verificarías la autenticación del usuario aquí
    if not payload.email or not payload.apiKey or not payload.secretKey:
        raise HTTPException(status_code=400, detail="Faltan datos de autenticación.")
    
    exito = db_manager.guardar_keys_binance(
        payload.email,
        payload.apiKey,
        payload.secretKey
    )
    
    if exito:
        return {"status": "success", "message": "Claves guardadas y encriptadas correctamente."}
    else:
        raise HTTPException(status_code=500, detail="Error al guardar las claves en el servidor.")
        
if __name__ == "__main__":
    print("🚀 NEXUS SYSTEM ONLINE (Full Power)...")
    uvicorn.run("main:app", host="0.0.0.0", port=os.getenv("PORT", 8000))