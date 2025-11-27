import time
import ccxt
import numpy as np
import logging
import sys
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass
from enum import Enum

# --- FIX CRÍTICO DE WINDOWS/UNICODE ---
if sys.stdout.encoding != 'utf-8':
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)
    
# --- IMPORTACIONES DE NEXUS ---
try:
    from database_manager import db_manager
    from main import calculate_rsi, get_ai_analysis # Reutilizar lógica de análisis
except ImportError as e:
    print(f"ERROR: Falta dependencia local: {e}")
    sys.exit(1)

# Configuración de logging profesional (sin emojis que fallan en Windows)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
    handlers=[
        logging.FileHandler('nexus_bot.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('NexusBot')


# ==================== CLASES Y CONSTANTES ====================

class TradingSignal(Enum):
    STRONG_BUY = "STRONG_BUY"
    BUY = "BUY"
    NEUTRAL = "NEUTRAL"
    SELL = "SELL"
    STRONG_SELL = "STRONG_SELL"

class OrderStatus(Enum):
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    PENDING = "PENDING"

@dataclass
class BotConfig:
    timeframe: str = '5m'
    limit: int = 100
    cycle_interval: int = 60
    testnet_mode: bool = True 
    min_trade_amount: float = 0.001
    max_trade_amount: float = 0.01

@dataclass
class MarketData:
    symbol: str
    current_price: float
    rsi: float
    timestamp: datetime = datetime.now()


# [Clases TechnicalIndicators, AIAnalyzer, OrderManager, NexusTradingBot simplificadas para el fix]
# [Se asume que estas clases tienen el código completo y fueron copiadas por el usuario]

class TechnicalIndicators:
    @staticmethod
    def calculate_rsi(prices: np.ndarray, period: int = 14) -> float:
        try:
            # Usamos la implementación de main.py
            return calculate_rsi(prices)
        except: return 50.0

class AIAnalyzer:
    def __init__(self, config: BotConfig): self.config = config
    def analyze_market(self, market_data: MarketData) -> TradingSignal:
        if market_data.rsi < 30: signal = TradingSignal.BUY
        elif market_data.rsi > 70: signal = TradingSignal.SELL
        else: signal = TradingSignal.NEUTRAL
        return TradeSignal(signal=signal, confidence=0.9, entry_price=market_data.current_price, stop_loss=0, take_profit=0, position_size=0.001, reasoning="RSI Signal", indicators={'rsi': market_data.rsi})

class OrderManager:
    def __init__(self, exchange: ccxt.Exchange, config: BotConfig): self.exchange = exchange; self.config = config
    def execute_order(self, symbol: str, signal: TradeSignal) -> Dict[str, Any]:
        # Esta es la parte que usa la conexión privada
        side = 'buy' if signal.signal in [TradingSignal.BUY, TradingSignal.STRONG_BUY] else 'sell'
        amount = 0.001
        try:
            order = self.exchange.create_market_order(symbol, side, amount)
            return {'status': OrderStatus.SUCCESS, 'order_id': order['id'], 'side': side, 'amount': amount, 'price': order.get('price', signal.entry_price)}
        except Exception as e:
            logger.error(f"Error ejecutando orden: {e}")
            return {'status': OrderStatus.FAILED, 'error': str(e)}

# ==================== BOT PRINCIPAL CORREGIDO ====================

class NexusTradingBot:
    
    def __init__(self, config: BotConfig):
        self.config = config
        self.ai_analyzer = AIAnalyzer(config)
        self.running = False
        self.market_exchange = ccxt.binance() # 🔥 1. INSTANCIA PÚBLICA PARA DATOS 🔥
        
    def initialize_exchange_execution(self, api_key: str, secret: str) -> ccxt.Exchange:
        """Inicializa la conexión de EJECUCIÓN (PRIVADA - TESTNET)"""
        exchange_config = {
            'apiKey': api_key,
            'secret': secret,
            'enableRateLimit': True,
            'options': {'defaultType': 'future'}
        }
        
        if self.config.testnet_mode:
            exchange_config['options']['urls'] = {
                'api': 'https://testnet.binancefuture.com' # URL de ejecución de prueba
            }
            logger.info("🧪 Modo TESTNET de ejecución activado")
        
        return ccxt.binance(exchange_config)
    
    def fetch_market_data(self, symbol: str) -> Optional[MarketData]:
        """Usa la instancia pública para obtener datos sin error."""
        try:
            # Usamos la instancia pública (self.market_exchange)
            ohlcv = self.market_exchange.fetch_ohlcv(symbol, self.config.timeframe, self.config.limit)
            closes = np.array([x[4] for x in ohlcv])
            rsi = TechnicalIndicators.calculate_rsi(closes)
            
            return MarketData(
                symbol=symbol,
                current_price=float(closes[-1]),
                rsi=rsi,
            )
        except Exception as e:
            logger.error(f"❌ Error obteniendo OHLCV: {e}")
            return None

    def execute_trading_cycle(self, user_email: str, symbol: str = 'BTC/USDT'):
        """
        Ciclo completo: Desencriptar, Analizar y Ejecutar.
        """
        logger.info(f"== Iniciando ciclo para {user_email} ==")
        
        # 1. Desencriptar las Claves
        credentials = db_manager.obtener_credenciales_usuario(user_email)
        if not credentials:
            logger.error("❌ Claves no encontradas/encriptadas en MongoDB.")
            return

        # 2. Inicializar Exchange de Ejecución (Testnet)
        execution_exchange = self.initialize_exchange_execution(
            credentials['apiKey'], 
            credentials['secret']
        )
        
        # 3. Obtener Datos (Usando instancia pública)
        market_data = self.fetch_market_data(symbol)
        if not market_data: return
        
        logger.info(f"📊 RSI: {market_data.rsi:.2f} | Precio: {market_data.current_price:,.2f}")
        
        # 4. Análisis AI
        trade_signal = self.ai_analyzer.analyze_market(market_data)
        logger.info(f"🤖 Señal: {trade_signal.signal.value} | Razonamiento: {trade_signal.reasoning[:30]}...")

        # 5. Ejecutar orden si hay señal
        if trade_signal.signal != TradingSignal.NEUTRAL:
            order_manager = OrderManager(execution_exchange, self.config) # Usamos la conexión privada
            result = order_manager.execute_order(symbol, trade_signal)
            
            if result['status'] == OrderStatus.SUCCESS:
                logger.info(f"✅ ORDEN TESTNET EXITOSA: {result['order_id']}")
            else:
                logger.error(f"❌ Orden falló: {result.get('error')}")
        else:
            logger.info("💤 Sin señal de trading - Esperando oportunidad")

    def start(self, users: List[Dict[str, str]]):
        self.running = True
        logger.info("🚀 NEXUS TRADING BOT INICIADO")
        logger.info(f"⏰ Intervalo: {self.config.cycle_interval}s")
        
        while self.running:
            for user in users:
                self.execute_trading_cycle(user['email'], symbol='BTC/USDT') # Simplificamos para BTC
            
            logger.info(f"⏳ Esperando {self.config.cycle_interval}s...")
            time.sleep(self.config.cycle_interval)
            

# ==================== MAIN ====================

def main():
    config = BotConfig(testnet_mode=True)
    
    # 🔥 Aquí simulamos la carga del usuario logueado
    users_to_run = [{'email': 'ceo@nexus.com'}] 
    
    if not users_to_run:
         logger.warning("No se encontraron usuarios activos con claves guardadas.")
         return
    
    bot = NexusTradingBot(config)
    
    try:
        # 💡 Antes de correr, asegúrate de que el usuario 'ceo@nexus.com' tenga sus claves
        #    guardadas en la Cartera de la web pública (encriptadas en MongoDB).
        bot.start(users_to_run) 
    except KeyboardInterrupt:
        logger.info("Deteniendo bot por interrupción del usuario")
        bot.stop()


if __name__ == "__main__":
    main()