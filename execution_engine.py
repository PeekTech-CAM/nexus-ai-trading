import ccxt
import os
import json

# --- CONFIGURACIÓN ---
# ¡IMPORTANTE! Usa claves de TESTNET primero para no perder dinero real probando
API_KEY = 'TU_BINANCE_API_KEY'
SECRET_KEY = 'TU_BINANCE_SECRET_KEY'

# Inicializamos la conexión (Usamos Binance Futures para poder hacer Short y Long)
exchange = ccxt.binance({
    'apiKey': API_KEY,
    'secret': SECRET_KEY,
    'enableRateLimit': True,
    'options': {'defaultType': 'future'} # Operar futuros
})

# Si usas Testnet (dinero ficticio), descomenta esta línea:
# exchange.set_sandbox_mode(True) 

def ejecutar_orden_ia(decision_json, symbol="BTC/USDT", cantidad_usdt=50):
    """
    Recibe el JSON de la IA (Gemini) y ejecuta la orden en Binance.
    """
    try:
        data = json.loads(decision_json) # Convertimos el texto de Gemini a objeto
        accion = data.get("decision", "ESPERAR").upper()
        confianza = int(data.get("confianza", 0))

        # --- REGLA DE ORO DE SEGURIDAD ---
        # Solo operamos si la confianza de la IA es ALTA (>80%)
        if confianza < 80:
            return f"⚠️ Orden cancelada: Confianza IA insuficiente ({confianza}%)"

        # Calculamos cantidad de cripto a comprar basada en USDT
        ticker = exchange.fetch_ticker(symbol)
        precio_actual = ticker['last']
        amount = cantidad_usdt / precio_actual 

        print(f"🤖 IA Dice: {accion} | Confianza: {confianza}% | Precio: {precio_actual}")

        order = None
        
        if accion == "COMPRAR":
            # Orden de Mercado (Market Order)
            order = exchange.create_market_buy_order(symbol, amount)
            
            # --- PROTECCIÓN AUTOMÁTICA (Stop Loss / Take Profit) ---
            # Configuración OCO (One Cancels the Other) básica
            sl_price = precio_actual * 0.98 # Stop Loss 2% abajo
            tp_price = precio_actual * 1.04 # Take Profit 4% arriba
            
            # Nota: En futuros, configurar SL/TP requiere órdenes condicionales separadas
            print(f"✅ COMPRA Ejecutada. SL: {sl_price} | TP: {tp_price}")

        elif accion == "VENDER":
            order = exchange.create_market_sell_order(symbol, amount)
            print("✅ VENTA (Short) Ejecutada.")
        
        else:
            return "⏸️ La IA decidió ESPERAR. Mercado incierto."

        return order

    except Exception as e:
        return f"❌ Error en ejecución: {str(e)}"

# Prueba rápida (Simulación)
# json_falso = '{"decision": "COMPRAR", "confianza": 85}'
# print(ejecutar_orden_ia(json_falso))