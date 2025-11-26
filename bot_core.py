import time
from main import consult_the_oracle, MarketData # Importamos la IA del paso 1
from execution_engine import ejecutar_orden_ia # Importamos el ejecutor del paso 2

def obtener_datos_mercado(symbol):
    # Aquí conectaríamos con Binance para sacar los datos reales
    # Por ahora simulamos datos para el ejemplo
    return MarketData(
        symbol=symbol,
        current_price=65000.50,
        rsi_14=35.5, # Un RSI bajo suele indicar sobreventa (oportunidad de compra)
        market_sentiment="Miedo Extremo",
        recent_news="SEC aprueba nuevo ETF de Bitcoin"
    )

def iniciar_bot_autonomo():
    print("🚀 NEXUS AI TRADING INICIADO - 24/7 MODE")
    
    while True:
        symbol = "BTC/USDT"
        
        # 1. OBTENER DATOS
        print("🔍 Analizando mercado...")
        datos = obtener_datos_mercado(symbol)
        
        # 2. CONSULTAR AL ORÁCULO (Gemini)
        # Esto nos devuelve el JSON con la decisión
        decision_ia_texto = consult_the_oracle(datos)
        
        # 3. EJECUTAR (Si procede)
        resultado = ejecutar_orden_ia(decision_ia_texto, symbol)
        print(f"Resultado: {resultado}")
        
        # 4. ESPERAR (Para no saturar la API ni operar en exceso)
        print("⏳ Esperando siguiente ciclo (5 min)...")
        time.sleep(300) # 300 segundos = 5 minutos

if __name__ == "__main__":
    iniciar_bot_autonomo()