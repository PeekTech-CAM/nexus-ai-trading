"""
Professional Trading API Server
A secure, scalable REST API for cryptocurrency market analysis and trading strategies.
"""

import os
import logging
import json
from typing import List
from datetime import datetime

import uvicorn
import ccxt
import requests
import numpy as np
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field

import traceback

# ==========================================
# CONFIGURATION
# ==========================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("NexusAI")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "AIzaSyASxAf-AJPcQnK1PXj_52if31-aAvgykbA")
API_TIMEOUT = 10
RSI_PERIOD = 14

# Database manager
try:
    from database_manager import db_manager
except ImportError:
    logger.critical("database_manager.py not found. Exiting.")
    raise SystemExit("Missing required database_manager module")

# ==========================================
# APPLICATION SETUP
# ==========================================

app = FastAPI(
    title="Nexus AI Trading API",
    description="Professional cryptocurrency trading analysis and strategy generation API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# Exchange setup
try:
    exchange = ccxt.binance({
        "enableRateLimit": True,
        "options": {"defaultType": "spot"},
    })
except Exception as e:
    logger.error(f"Failed to initialize exchange: {e}")
    raise


# ==========================================
# DATA MODELS
# ==========================================

class UserAuth(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)

class StrategyRequest(BaseModel):
    prompt: str = Field(..., min_length=10, max_length=500)

class MarketData(BaseModel):
    symbol: str
    price: float
    change_24h: float
    rsi: float
    signal: str
    ai_analysis: str
    ai_confidence: int
    status: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class TradingStrategy(BaseModel):
    name: str
    risk_level: str
    indicators: List[str]
    entry_rules: str
    exit_rules: str
    stop_loss: str
    take_profit: str
    reasoning: str


# ==========================================
# TECHNICAL INDICATORS
# ==========================================

class TechnicalAnalysis:

    @staticmethod
    def calculate_rsi(prices: np.ndarray, period: int = RSI_PERIOD) -> float:
        try:
            if len(prices) < period + 1:
                return 50.0
            
            deltas = np.diff(prices)
            seed = deltas[:period + 1]

            up = seed[seed >= 0].sum() / period
            down = -seed[seed < 0].sum() / period

            if down == 0:
                return 100.0

            rs = up / down
            rsi = np.zeros_like(prices)
            rsi[:period] = 100.0 - 100.0 / (1.0 + rs)

            for i in range(period, len(prices)):
                delta = deltas[i - 1]
                upval = delta if delta > 0 else 0.0
                downval = -delta if delta < 0 else 0.0

                up = (up * (period - 1) + upval) / period
                down = (down * (period - 1) + downval) / period

                if down == 0:
                    rs = 0
                else:
                    rs = up / down

                rsi[i] = 100.0 - 100.0 / (1.0 + rs)

            return float(rsi[-1])

        except Exception as e:
            logger.error(f"RSI calculation error: {e}")
            return 50.0

    @staticmethod
    def determine_signal(rsi: float) -> str:
        if rsi > 70:
            return "SELL"
        elif rsi < 30:
            return "BUY"
        return "NEUTRAL"


# ==========================================
# AI ANALYSIS SERVICE
# ==========================================

class AIAnalysisService:
    MODELS = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-pro-latest"]
    BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

    @classmethod
    def get_market_analysis(cls, price: float, change: float, rsi: float) -> str:

        prompt = (
            f"Analyze: BTC at ${price:,.2f} ({change:+.2f}% 24h), RSI: {rsi:.2f}. "
            "Provide a concise 1-sentence technical analysis."
        )

        data = {"contents": [{"parts": [{"text": prompt}]}]}
        headers = {"Content-Type": "application/json"}

        for model in cls.MODELS:
            try:
                url = f"{cls.BASE_URL}/{model}:generateContent?key={GOOGLE_API_KEY}"
                res = requests.post(url, json=data, timeout=API_TIMEOUT)

                if res.status_code == 200:
                    content = res.json()
                    txt = content["candidates"][0]["content"]["parts"][0]["text"]
                    return txt.strip()

            except Exception:
                continue

        # fallback
        if rsi > 70:
            return "Overbought conditions detected. Likely retracement."
        if rsi < 30:
            return "Oversold zone. Potential reversal incoming."
        return "Neutral consolidation phase."


# ==========================================
# ROUTES
# ==========================================

@app.get("/", tags=["Health"])
async def health_check():
    return {
        "status": "online",
        "service": "Nexus AI Trading API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/api/market/btc", response_model=MarketData, tags=["Market Data"])
async def get_btc_market_data():

    try:
        ticker = exchange.fetch_ticker("BTC/USDT")
        price = ticker["last"]
        change = ticker["percentage"]

        ohlcv = exchange.fetch_ohlcv("BTC/USDT", timeframe="1h", limit=50)
        closes = np.array([c[4] for c in ohlcv])
        rsi = TechnicalAnalysis.calculate_rsi(closes)

        ai_analysis = AIAnalysisService.get_market_analysis(price, change, rsi)
        signal = TechnicalAnalysis.determine_signal(rsi)

        return MarketData(
            symbol="BTC/USDT",
            price=price,
            change_24h=change,
            rsi=rsi,
            signal=signal,
            ai_analysis=ai_analysis,
            ai_confidence=88,
            status="live"
        )

    except ccxt.NetworkError:
        raise HTTPException(503, "Market data temporarily unavailable")

    except Exception as e:
        logger.error(f"Market data error: {e}")
        raise HTTPException(500, "Internal server error")


@app.get("/api/market/overview", tags=["Market Data"])
async def get_market_overview():

    symbols = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT"]
    results = []

    for s in symbols:
        try:
            t = exchange.fetch_ticker(s)
            results.append({
                "symbol": s.replace("/USDT", ""),
                "price": t["last"],
                "change": t["percentage"],
                "volume": t["quoteVolume"],
            })
        except Exception:
            continue

    if not results:
        raise HTTPException(503, "Unable to fetch market overview")

    return results


@app.get("/api/market/candles", tags=["Market Data"])
async def get_candlestick_data(limit: int = 100):

    try:
        limit = min(limit, 500)
        ohlcv = exchange.fetch_ohlcv("BTC/USDT", timeframe="1h", limit=limit)

        return [
            {
                "time": c[0] // 1000,
                "open": c[1],
                "high": c[2],
                "low": c[3],
                "close": c[4],
                "volume": c[5],
            }
            for c in ohlcv
        ]

    except Exception as e:
        logger.error(f"Candle error: {e}")
        raise HTTPException(500, "Failed to load candles")


@app.post("/api/ai/generate-strategy", response_model=TradingStrategy, tags=["AI Strategy"])
async def generate_trading_strategy(request: StrategyRequest):

    system_instruction = """
    You are a professional trading strategy architect. Respond ONLY with valid JSON (no markdown).

    Required JSON structure:
    {
        "name": "",
        "risk_level": "",
        "indicators": [],
        "entry_rules": "",
        "exit_rules": "",
        "stop_loss": "",
        "take_profit": "",
        "reasoning": ""
    }
    """

    full_prompt = f"{system_instruction}\n\nUser Request: {request.prompt}"

    payload = {"contents": [{"parts": [{"text": full_prompt}]}]}

    for model in AIAnalysisService.MODELS:
        try:
            url = f"{AIAnalysisService.BASE_URL}/{model}:generateContent?key={GOOGLE_API_KEY}"

            res = requests.post(url, json=payload, timeout=API_TIMEOUT)
            if res.status_code != 200:
                continue

            txt = res.json()["candidates"][0]["content"]["parts"][0]["text"]
            clean = txt.replace("```json", "").replace("```", "").strip()

            try:
                data = json.loads(clean)
            except json.JSONDecodeError:
                continue

            return TradingStrategy(**data)

        except Exception:
            continue

    return TradingStrategy(
        name="Fallback Mean Reversion",
        risk_level="Medium",
        indicators=["RSI", "EMA20", "EMA50"],
        entry_rules="RSI < 30 and price under EMA50",
        exit_rules="RSI > 70 or SL hit",
        stop_loss="2%",
        take_profit="5%",
        reasoning="AI service unavailable"
    )


# ==========================================
# AUTHENTICATION
# ==========================================

@app.post("/api/auth/register", tags=["Authentication"])
async def register_user(user: UserAuth):

    try:
        hashed = pwd_context.hash(user.password)
        success, message = db_manager.crear_usuario(user.email, hashed)

        if not success:
            raise HTTPException(400, message)

        return {"status": "success", "message": "User registered successfully"}

    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(500, "Registration failed")


@app.post("/api/auth/login", tags=["Authentication"])
async def login_user(user: UserAuth):

    try:
        db_user = db_manager.users.find_one({"email": user.email})

        if not db_user or not pwd_context.verify(user.password, db_user["password"]):
            raise HTTPException(401, "Invalid credentials")

        return {
            "status": "success",
            "message": "Authentication successful",
            "email": user.email
        }

    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(500, "Authentication failed")


# ==========================================
# APPLICATION ENTRY POINT
# ==========================================

if __name__ == "__main__":
    try:
        logger.info("Starting Nexus AI Trading API Server...")
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=int(os.getenv("PORT", 8000)),
            reload=True,
            log_level="info"
        )
    except Exception as e:
        logger.critical(f"Fatal startup error: {e}")
        traceback.print_exc()