import pymongo
from pymongo import MongoClient
import sys

# --- CONFIGURACIÓN CON EL FIX DE AUTHSOURCE ---
# Fíjate que al final he añadido "&authSource=admin"
URI = "mongodb+srv://admin:admin12345@nexusaitrading.p8zriwr.mongodb.net/nexus_trading_platform?retryWrites=true&w=majority&appName=NEXUSAITRADING&authSource=admin"

print("--- INICIANDO PRUEBA DE DIAGNÓSTICO ---")
print(f"Intentando conectar como usuario: 'admin'...")

try:
    # Intentamos conectar
    client = MongoClient(URI, serverSelectionTimeoutMS=5000)
    
    # Forzamos una llamada al servidor para ver si responde
    info = client.server_info()
    
    print("\n✅ ¡ÉXITO! CONEXIÓN ESTABLECIDA.")
    print(f"Versión de MongoDB: {info.get('version')}")
    print("La base de datos está lista para recibir datos.")

except pymongo.errors.OperationFailure as e:
    print("\n❌ FALLO DE AUTENTICACIÓN (Contraseña/Usuario incorrectos)")
    print(f"Detalle: {e}")
    print("\nSOLUCIÓN: Vuelve a Atlas > Database Access > Edit > Edit Password y pon 'admin12345' otra vez.")

except pymongo.errors.ServerSelectionTimeoutError as e:
    print("\n❌ FALLO DE RED (IP Bloqueada o DNS)")
    print("Detalle: No se pudo conectar al servidor.")
    print("\nSOLUCIÓN: Ve a Atlas > Network Access y asegura que tienes '0.0.0.0/0' (Allow form Anywhere).")

except Exception as e:
    print(f"\n❌ OTRO ERROR: {e}")