"""
Nexus Trading Bot - Professional Production Version
Advanced AI-Powered Cryptocurrency Trading System
"""

import time
import ccxt
import numpy as np
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass
from enum import Enum
import asyncio
from concurrent.futures import ThreadPoolExecutor
import json

# Configuración de logging profesional
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
    handlers=[
        logging.FileHandler('nexus_bot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('NexusBot')


# ==================== ENUMS Y CONSTANTES ====================

class TradingSignal(Enum):
    """Señales de trading disponibles"""
    STRONG_BUY = "STRONG_BUY"
    BUY = "BUY"
    NEUTRAL = "NEUTRAL"
    SELL = "SELL"
    STRONG_SELL = "STRONG_SELL"


class OrderStatus(Enum):
    """Estados de órdenes"""
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    PENDING = "PENDING"


# ==================== DATACLASSES ====================

@dataclass
class BotConfig:
    """Configuración del bot"""
    timeframe: str = '5m'
    limit: int = 100
    min_trade_amount: float = 0.001
    max_trade_amount: float = 0.01
    rsi_oversold: int = 30
    rsi_overbought: int = 70
    rsi_strong_oversold: int = 20
    rsi_strong_overbought: int = 80
    cycle_interval: int = 60
    testnet_mode: bool = True
    risk_percentage: float = 0.02  # 2% del balance por operación
    stop_loss_percentage: float = 0.02  # 2% stop loss
    take_profit_percentage: float = 0.04  # 4% take profit


@dataclass
class MarketData:
    """Datos de mercado procesados"""
    symbol: str
    current_price: float
    rsi: float
    sma_20: float
    sma_50: float
    ema_12: float
    ema_26: float
    macd: float
    signal_line: float
    volume_avg: float
    volatility: float
    trend: str
    timestamp: datetime


@dataclass
class TradeSignal:
    """Señal de trading completa"""
    signal: TradingSignal
    confidence: float
    entry_price: float
    stop_loss: float
    take_profit: float
    position_size: float
    reasoning: str
    indicators: Dict[str, float]


# ==================== INDICADORES TÉCNICOS AVANZADOS ====================

class TechnicalIndicators:
    """Calculadora de indicadores técnicos avanzados"""
    
    @staticmethod
    def calculate_rsi(prices: np.ndarray, period: int = 14) -> float:
        """RSI mejorado con manejo de errores"""
        try:
            deltas = np.diff(prices)
            gains = np.where(deltas > 0, deltas, 0)
            losses = np.where(deltas < 0, -deltas, 0)
            
            avg_gain = np.mean(gains[-period:])
            avg_loss = np.mean(losses[-period:])
            
            if avg_loss == 0:
                return 100.0
            
            rs = avg_gain / avg_loss
            rsi = 100 - (100 / (1 + rs))
            return float(rsi)
        except Exception as e:
            logger.error(f"Error calculando RSI: {e}")
            return 50.0
    
    @staticmethod
    def calculate_sma(prices: np.ndarray, period: int) -> float:
        """Media Móvil Simple"""
        return float(np.mean(prices[-period:]))
    
    @staticmethod
    def calculate_ema(prices: np.ndarray, period: int) -> float:
        """Media Móvil Exponencial"""
        multiplier = 2 / (period + 1)
        ema = prices[0]
        for price in prices[1:]:
            ema = (price - ema) * multiplier + ema
        return float(ema)
    
    @staticmethod
    def calculate_macd(prices: np.ndarray) -> Tuple[float, float, float]:
        """MACD y Signal Line"""
        ema_12 = TechnicalIndicators.calculate_ema(prices, 12)
        ema_26 = TechnicalIndicators.calculate_ema(prices, 26)
        macd = ema_12 - ema_26
        
        # Signal line (EMA 9 del MACD)
        macd_history = [macd]  # Simplificado
        signal = macd * 0.9  # Aproximación
        histogram = macd - signal
        
        return macd, signal, histogram
    
    @staticmethod
    def calculate_volatility(prices: np.ndarray) -> float:
        """Volatilidad basada en desviación estándar"""
        returns = np.diff(prices) / prices[:-1]
        return float(np.std(returns) * 100)
    
    @staticmethod
    def detect_trend(prices: np.ndarray, sma_20: float, sma_50: float) -> str:
        """Detecta la tendencia del mercado"""
        current_price = prices[-1]
        
        if sma_20 > sma_50 and current_price > sma_20:
            return "UPTREND"
        elif sma_20 < sma_50 and current_price < sma_20:
            return "DOWNTREND"
        else:
            return "SIDEWAYS"


# ==================== ANÁLISIS AI AVANZADO ====================

class AIAnalyzer:
    """Sistema de análisis AI avanzado"""
    
    def __init__(self, config: BotConfig):
        self.config = config
    
    def analyze_market(self, market_data: MarketData) -> TradeSignal:
        """
        Análisis AI completo con múltiples factores
        """
        # Cálculo de señal base
        signal = self._determine_signal(market_data)
        
        # Cálculo de confianza
        confidence = self._calculate_confidence(market_data)
        
        # Cálculo de niveles de entrada/salida
        entry_price = market_data.current_price
        stop_loss = self._calculate_stop_loss(entry_price, signal)
        take_profit = self._calculate_take_profit(entry_price, signal)
        
        # Cálculo de tamaño de posición
        position_size = self._calculate_position_size(confidence)
        
        # Razonamiento
        reasoning = self._generate_reasoning(market_data, signal, confidence)
        
        # Indicadores utilizados
        indicators = {
            'rsi': market_data.rsi,
            'macd': market_data.macd,
            'volatility': market_data.volatility,
            'trend': market_data.trend
        }
        
        return TradeSignal(
            signal=signal,
            confidence=confidence,
            entry_price=entry_price,
            stop_loss=stop_loss,
            take_profit=take_profit,
            position_size=position_size,
            reasoning=reasoning,
            indicators=indicators
        )
    
    def _determine_signal(self, data: MarketData) -> TradingSignal:
        """Determina la señal de trading"""
        score = 0
        
        # RSI scoring
        if data.rsi < self.config.rsi_strong_oversold:
            score += 2
        elif data.rsi < self.config.rsi_oversold:
            score += 1
        elif data.rsi > self.config.rsi_strong_overbought:
            score -= 2
        elif data.rsi > self.config.rsi_overbought:
            score -= 1
        
        # MACD scoring
        if data.macd > data.signal_line:
            score += 1
        else:
            score -= 1
        
        # Trend scoring
        if data.trend == "UPTREND":
            score += 1
        elif data.trend == "DOWNTREND":
            score -= 1
        
        # Moving averages scoring
        if data.current_price > data.sma_50:
            score += 1
        else:
            score -= 1
        
        # Convertir score a señal
        if score >= 3:
            return TradingSignal.STRONG_BUY
        elif score >= 1:
            return TradingSignal.BUY
        elif score <= -3:
            return TradingSignal.STRONG_SELL
        elif score <= -1:
            return TradingSignal.SELL
        else:
            return TradingSignal.NEUTRAL
    
    def _calculate_confidence(self, data: MarketData) -> float:
        """Calcula la confianza de la señal (0-1)"""
        confidence_factors = []
        
        # RSI extremo = más confianza
        rsi_extreme = abs(data.rsi - 50) / 50
        confidence_factors.append(rsi_extreme)
        
        # Baja volatilidad = más confianza
        vol_confidence = 1 - min(data.volatility / 10, 1)
        confidence_factors.append(vol_confidence)
        
        # MACD divergencia clara = más confianza
        macd_divergence = abs(data.macd - data.signal_line) / max(abs(data.macd), 1)
        confidence_factors.append(min(macd_divergence, 1))
        
        # Tendencia definida = más confianza
        trend_confidence = 0.8 if data.trend != "SIDEWAYS" else 0.3
        confidence_factors.append(trend_confidence)
        
        return float(np.mean(confidence_factors))
    
    def _calculate_stop_loss(self, entry: float, signal: TradingSignal) -> float:
        """Calcula stop loss dinámico"""
        sl_pct = self.config.stop_loss_percentage
        
        if signal in [TradingSignal.BUY, TradingSignal.STRONG_BUY]:
            return entry * (1 - sl_pct)
        elif signal in [TradingSignal.SELL, TradingSignal.STRONG_SELL]:
            return entry * (1 + sl_pct)
        return entry
    
    def _calculate_take_profit(self, entry: float, signal: TradingSignal) -> float:
        """Calcula take profit dinámico"""
        tp_pct = self.config.take_profit_percentage
        
        if signal in [TradingSignal.BUY, TradingSignal.STRONG_BUY]:
            return entry * (1 + tp_pct)
        elif signal in [TradingSignal.SELL, TradingSignal.STRONG_SELL]:
            return entry * (1 - tp_pct)
        return entry
    
    def _calculate_position_size(self, confidence: float) -> float:
        """Calcula tamaño de posición basado en confianza"""
        base_size = self.config.min_trade_amount
        max_size = self.config.max_trade_amount
        
        # Escala linealmente con la confianza
        position_size = base_size + (max_size - base_size) * confidence
        return round(position_size, 4)
    
    def _generate_reasoning(self, data: MarketData, signal: TradingSignal, 
                           confidence: float) -> str:
        """Genera explicación AI del análisis"""
        reasoning_parts = []
        
        # Señal principal
        reasoning_parts.append(
            f"Señal {signal.value} detectada con {confidence*100:.1f}% confianza."
        )
        
        # RSI
        if data.rsi < 30:
            reasoning_parts.append(
                f"RSI en sobreventa ({data.rsi:.1f}) sugiere reversión alcista."
            )
        elif data.rsi > 70:
            reasoning_parts.append(
                f"RSI en sobrecompra ({data.rsi:.1f}) indica posible corrección."
            )
        
        # Tendencia
        reasoning_parts.append(f"Tendencia actual: {data.trend}.")
        
        # MACD
        macd_status = "alcista" if data.macd > data.signal_line else "bajista"
        reasoning_parts.append(f"MACD muestra momentum {macd_status}.")
        
        # Volatilidad
        if data.volatility > 5:
            reasoning_parts.append(
                f"Alta volatilidad ({data.volatility:.2f}%) requiere precaución."
            )
        
        return " ".join(reasoning_parts)


# ==================== GESTOR DE ÓRDENES ====================

class OrderManager:
    """Gestiona la ejecución de órdenes"""
    
    def __init__(self, exchange: ccxt.Exchange, config: BotConfig):
        self.exchange = exchange
        self.config = config
    
    def execute_order(self, symbol: str, signal: TradeSignal) -> Dict[str, Any]:
        """
        Ejecuta una orden con manejo avanzado de errores
        """
        try:
            if signal.signal == TradingSignal.NEUTRAL:
                return {'status': OrderStatus.PENDING, 'message': 'Sin señal de trading'}
            
            # Determinar side
            side = 'buy' if signal.signal in [TradingSignal.BUY, TradingSignal.STRONG_BUY] else 'sell'
            amount = signal.position_size
            
            logger.info(f"Ejecutando orden {side.upper()} de {amount} {symbol}")
            logger.info(f"Stop Loss: {signal.stop_loss:.2f} | Take Profit: {signal.take_profit:.2f}")
            
            # Ejecutar orden principal
            order = self.exchange.create_market_order(symbol, side, amount)
            
            # Intentar colocar stop loss y take profit
            try:
                self._place_stop_loss(symbol, side, amount, signal.stop_loss)
                self._place_take_profit(symbol, side, amount, signal.take_profit)
            except Exception as e:
                logger.warning(f"No se pudieron colocar órdenes SL/TP: {e}")
            
            return {
                'status': OrderStatus.SUCCESS,
                'order_id': order['id'],
                'symbol': symbol,
                'side': side,
                'amount': amount,
                'price': order.get('price', signal.entry_price),
                'timestamp': datetime.now().isoformat(),
                'stop_loss': signal.stop_loss,
                'take_profit': signal.take_profit
            }
            
        except ccxt.InsufficientFunds as e:
            logger.error(f"Fondos insuficientes: {e}")
            return {'status': OrderStatus.FAILED, 'error': 'Fondos insuficientes'}
        
        except ccxt.NetworkError as e:
            logger.error(f"Error de red: {e}")
            return {'status': OrderStatus.FAILED, 'error': 'Error de conexión'}
        
        except Exception as e:
            logger.error(f"Error ejecutando orden: {e}")
            return {'status': OrderStatus.FAILED, 'error': str(e)}
    
    def _place_stop_loss(self, symbol: str, side: str, amount: float, price: float):
        """Coloca orden de stop loss"""
        sl_side = 'sell' if side == 'buy' else 'buy'
        self.exchange.create_order(
            symbol, 'stop_market', sl_side, amount, 
            params={'stopPrice': price}
        )
    
    def _place_take_profit(self, symbol: str, side: str, amount: float, price: float):
        """Coloca orden de take profit"""
        tp_side = 'sell' if side == 'buy' else 'buy'
        self.exchange.create_order(
            symbol, 'limit', tp_side, amount, price
        )


# ==================== BOT PRINCIPAL ====================

class NexusTradingBot:
    """Bot de trading principal con arquitectura profesional"""
    
    def __init__(self, config: BotConfig):
        self.config = config
        self.indicators = TechnicalIndicators()
        self.ai_analyzer = AIAnalyzer(config)
        self.running = False
        
    def initialize_exchange(self, api_key: str, secret: str) -> ccxt.Exchange:
        """Inicializa la conexión con el exchange"""
        exchange_config = {
            'apiKey': api_key,
            'secret': secret,
            'enableRateLimit': True,
            'options': {'defaultType': 'future'}
        }
        
        if self.config.testnet_mode:
            exchange_config['options']['urls'] = {
                'api': 'https://testnet.binancefuture.com'
            }
            logger.info("🧪 Modo TESTNET activado")
        else:
            logger.warning("⚠️  Modo PRODUCCIÓN activado - Operando con dinero real")
        
        return ccxt.binance(exchange_config)
    
    def fetch_market_data(self, exchange: ccxt.Exchange, symbol: str) -> Optional[MarketData]:
        """Obtiene y procesa datos de mercado"""
        try:
            ohlcv = exchange.fetch_ohlcv(symbol, self.config.timeframe, self.config.limit)
            closes = np.array([x[4] for x in ohlcv])
            volumes = np.array([x[5] for x in ohlcv])
            
            # Calcular todos los indicadores
            rsi = self.indicators.calculate_rsi(closes)
            sma_20 = self.indicators.calculate_sma(closes, 20)
            sma_50 = self.indicators.calculate_sma(closes, 50)
            ema_12 = self.indicators.calculate_ema(closes, 12)
            ema_26 = self.indicators.calculate_ema(closes, 26)
            macd, signal_line, _ = self.indicators.calculate_macd(closes)
            volatility = self.indicators.calculate_volatility(closes)
            trend = self.indicators.detect_trend(closes, sma_20, sma_50)
            
            return MarketData(
                symbol=symbol,
                current_price=float(closes[-1]),
                rsi=rsi,
                sma_20=sma_20,
                sma_50=sma_50,
                ema_12=ema_12,
                ema_26=ema_26,
                macd=macd,
                signal_line=signal_line,
                volume_avg=float(np.mean(volumes)),
                volatility=volatility,
                trend=trend,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error obteniendo datos de mercado: {e}")
            return None
    
    def execute_trading_cycle(self, user_email: str, api_key: str, secret: str, symbol: str = 'BTC/USDT'):
        """
        Ejecuta un ciclo completo de trading
        """
        logger.info(f"{'='*60}")
        logger.info(f"🔄 Ciclo de trading para {user_email}")
        logger.info(f"{'='*60}")
        
        try:
            # 1. Inicializar exchange
            exchange = self.initialize_exchange(api_key, secret)
            
            # 2. Obtener datos de mercado
            market_data = self.fetch_market_data(exchange, symbol)
            if not market_data:
                logger.error("No se pudieron obtener datos de mercado")
                return
            
            # 3. Mostrar datos de mercado
            logger.info(f"📊 Datos de Mercado:")
            logger.info(f"   Precio: ${market_data.current_price:,.2f}")
            logger.info(f"   RSI: {market_data.rsi:.2f}")
            logger.info(f"   MACD: {market_data.macd:.4f}")
            logger.info(f"   Tendencia: {market_data.trend}")
            logger.info(f"   Volatilidad: {market_data.volatility:.2f}%")
            
            # 4. Análisis AI
            trade_signal = self.ai_analyzer.analyze_market(market_data)
            
            logger.info(f"🤖 Análisis AI:")
            logger.info(f"   Señal: {trade_signal.signal.value}")
            logger.info(f"   Confianza: {trade_signal.confidence*100:.1f}%")
            logger.info(f"   Tamaño posición: {trade_signal.position_size} BTC")
            logger.info(f"   💭 {trade_signal.reasoning}")
            
            # 5. Ejecutar orden si hay señal
            if trade_signal.signal != TradingSignal.NEUTRAL:
                order_manager = OrderManager(exchange, self.config)
                result = order_manager.execute_order(symbol, trade_signal)
                
                if result['status'] == OrderStatus.SUCCESS:
                    logger.info(f"✅ Orden ejecutada exitosamente")
                    logger.info(f"   ID: {result['order_id']}")
                    logger.info(f"   Tipo: {result['side'].upper()}")
                    logger.info(f"   Cantidad: {result['amount']}")
                else:
                    logger.error(f"❌ Orden falló: {result.get('error')}")
            else:
                logger.info("😴 Sin señal de trading - Esperando oportunidad")
                
        except Exception as e:
            logger.error(f"❌ Error en ciclo de trading: {e}", exc_info=True)
    
    def start(self, users: List[Dict[str, str]]):
        """
        Inicia el bot en modo 24/7
        """
        self.running = True
        logger.info("🚀 NEXUS TRADING BOT INICIADO")
        logger.info(f"⏰ Intervalo: {self.config.cycle_interval}s")
        logger.info(f"📈 Timeframe: {self.config.timeframe}")
        
        while self.running:
            try:
                for user in users:
                    self.execute_trading_cycle(
                        user['email'],
                        user['api_key'],
                        user['secret']
                    )
                
                logger.info(f"⏳ Esperando {self.config.cycle_interval}s hasta próximo ciclo...")
                time.sleep(self.config.cycle_interval)
                
            except KeyboardInterrupt:
                logger.info("⛔ Deteniendo bot...")
                self.running = False
                break
            except Exception as e:
                logger.error(f"Error crítico: {e}", exc_info=True)
                time.sleep(10)
    
    def stop(self):
        """Detiene el bot"""
        self.running = False
        logger.info("Bot detenido")


# ==================== MAIN ====================

def main():
    """Función principal"""
    
    # Configuración
    config = BotConfig(
        timeframe='5m',
        limit=100,
        testnet_mode=True,  # Cambiar a False para producción real
        cycle_interval=60,
        risk_percentage=0.02,
        stop_loss_percentage=0.02,
        take_profit_percentage=0.04
    )
    
    # Usuarios (en producción, leer desde MongoDB)
    users = [
        {
            'email': 'ceo@nexus.com',
            'api_key': 'TU_API_KEY_AQUI',  # Reemplazar con credenciales reales
            'secret': 'TU_SECRET_AQUI'
        }
    ]
    
    # Iniciar bot
    bot = NexusTradingBot(config)
    
    try:
        bot.start(users)
    except KeyboardInterrupt:
        logger.info("Deteniendo bot por interrupción del usuario")
        bot.stop()


if __name__ == "__main__":
    main()