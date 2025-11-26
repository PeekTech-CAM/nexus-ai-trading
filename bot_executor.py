import time
import ccxt
import numpy as np
import os
from database_manager import db_manager # Importamos la DB con encriptación
from main import calculate_rsi, get_ai_analysis # Reutilizamos las funciones de análisis

# --- 1. CONFIGURACIÓN DEL ENTORNO ---
# La URL de la API de Binance es pública y se usa aquí
exchange = ccxt.binance()
TIME_FRAME = '5m' # Marco de tiempo para trading activo
LIMIT = 30 # Cuántas velas históricas necesitamos
SIMULATE_ORDER = True # Cambiar a False para ejecutar ÓRDENES REALES

def execute_bot_cycle(user_email: str):
    """
    Ejecuta el ciclo de trading para un usuario específico.
    """
    print(f"\n[🔄 {time.strftime('%H:%M:%S')}] Iniciando ciclo para {user_email}")
    
    # 2. Desencriptar las Claves
    credentials = db_manager.obtener_credenciales_usuario(user_email)
    
    if not credentials:
        print("    [❌] Error: Claves no encontradas/encriptadas.")
        return

    # 3. Inicializar el Exchange con las claves DESENCRIPTADAS
    # Nota: Usar ccxt.binance({ 'apiKey': '...', 'secret': '...' })
    user_exchange = ccxt.binance({
        'apiKey': credentials['apiKey'],
        'secret': credentials['secret'],
        'enableRateLimit': True
    })

    # 4. Obtener Datos y Calcular Señal
    try:
        ohlcv = exchange.fetch_ohlcv('BTC/USDT', timeframe=TIME_FRAME, limit=LIMIT)
        closes = np.array([x[4] for x in ohlcv])
        rsi = calculate_rsi(closes)

        # Usar la lógica de señal desarrollada anteriormente
        if rsi < 30: signal = "COMPRA"
        elif rsi > 70: signal = "VENTA"
        else: signal = "NEUTRAL"

        ai_msg = get_ai_analysis(closes[-1], closes[-1] - closes[0], rsi) # Análisis rápido de IA

        print(f"    [📊] RSI: {rsi:.2f} | Señal: {signal} | IA: {ai_msg[:30]}...")

    except Exception as e:
        print(f"    [🛑] Fallo en cálculo de mercado: {e}")
        return

    # 5. Lógica de Ejecución (Solo si es Señal Fuerte)
    if signal == "COMPRA" or signal == "VENTA":
        side = 'buy' if signal == "COMPRA" else 'sell'
        amount = 0.001 # Cantidad de BTC a comprar (ejemplo)

        if SIMULATE_ORDER:
            print(f"    [⚙️] SIMULACIÓN DE ORDEN: {side.upper()} {amount} BTC. (Clave segura).")
            return
        
        # --- LÍNEA DE EJECUCIÓN REAL EN BINANCE ---
        order = user_exchange.create_market_order('BTC/USDT', side, amount)
        print(f"    [🚀] ORDEN REAL EJECUTADA: {order['id']}")
        
    else:
        print("    [😴] Señal NEUTRAL. Esperando próximo ciclo.")


def main_bot_loop():
    """Bucle principal del bot 24/7."""
    print("--- 🤖 NEXUS EXECUTION BOT ACTIVADO 24/7 ---")
    
    # Lista de usuarios a operar (Debería ser dinámica en prod)
    # Usamos el usuario de prueba que registraste:
    USERS_TO_OPERATE = ["ceo@nexus.com"] 
    
    while True:
        for user_email in USERS_TO_OPERATE:
            execute_bot_cycle(user_email)
        
        # Esperar 60 segundos antes del siguiente ciclo
        time.sleep(60)
        print("\n-------------------------------------------------")


if __name__ == "__main__":
    # Necesitas instalar numpy si no lo hiciste: pip install numpy
    # Si quieres que esto corra 24/7, debes desplegarlo en Render
    main_bot_loop()