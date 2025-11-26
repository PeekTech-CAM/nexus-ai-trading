import os
from pymongo import MongoClient
from cryptography.fernet import Fernet
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# --- 1. CONFIGURACIÓN ---
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://admin:admin12345@nexusaitrading.p8zriwr.mongodb.net/?retryWrites=true&w=majority")

# ⚠️ CLAVE DE ENCRIPTACIÓN: Esta DEBE ser la misma SIEMPRE.
# La leeremos del entorno si es posible, si no, usamos una clave de emergencia.
ENCRYPTION_KEY = os.getenv("FERNET_KEY", b'wJ-7k8L9p0qR2s3t4u5v6w7x8y9z0A1B2C3D4E5F6G7=')

class NexusDB:
    def __init__(self):
        try:
            self.client = MongoClient(MONGO_URI)
            self.db = self.client["nexus_trading_db"]
            self.users = self.db["users"]
            self.cipher = Fernet(ENCRYPTION_KEY)
            self.client.admin.command('ping')
            print("✅ MONGODB CONECTADO EXITOSAMENTE")
        except Exception as e:
            print(f"🔥 ERROR FATAL EN BASE DE DATOS: {e}")
            self.users = None

    # --- SEGURIDAD ---
    def _encriptar(self, texto: str) -> str:
        if not texto: return None
        return self.cipher.encrypt(texto.encode()).decode()

    def _desencriptar(self, token: str) -> str:
        if not token: return None
        return self.cipher.decrypt(token.encode()).decode()

    # --- GESTIÓN DE CLAVES EXCHANGE (NUEVO) ---
    def guardar_keys_binance(self, email, api_key, secret_key):
        """Guarda las claves de Binance ENCRIPTADAS con Fernet."""
        if self.users is None: return False
        
        try:
            encrypted_data = {
                "api_key": self._encriptar(api_key),
                "secret_key": self._encriptar(secret_key)
            }
            
            self.users.update_one(
                {"email": email},
                {"$set": {"exchange_keys": encrypted_data}},
                upsert=False
            )
            return True
        except Exception as e:
            print(f"Error en encriptación: {e}")
            return False

    def obtener_credenciales_usuario(self, email):
        """Recupera y DESENCRIPTA las claves para que el Bot pueda operar."""
        user = self.users.find_one({"email": email})
        
        if not user or not user.get("exchange_keys"):
            return None
        
        encrypted = user["exchange_keys"]
        
        return {
            "apiKey": self._desencriptar(encrypted["api_key"]),
            "secret": self._desencriptar(encrypted["secret_key"])
        }

    def crear_usuario(self, email, password_hash):
        # ... (Tu lógica de creación de usuario sigue aquí) ...
        # [Se asume que esta función está presente]
        # Por simplicidad, solo incluimos las funciones clave que cambian.
        if self.users is None: return False, "DB Error"
        if self.users.find_one({"email": email}): return False, "El usuario ya existe"
        
        nuevo_usuario = {
            "email": email,
            "password": password_hash, 
            "subscription_status": "inactive",
            "created_at": datetime.utcnow(),
            "exchange_keys": None 
        }
        self.users.insert_one(nuevo_usuario)
        return True, "Usuario creado exitosamente"


db_manager = NexusDB()