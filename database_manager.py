import os
import pymongo
from pymongo import MongoClient
from cryptography.fernet import Fernet
from datetime import datetime
from dotenv import load_dotenv # <--- NUEVA LIBRERÍA

# 1. Cargamos el archivo .env
load_dotenv()

# --- CONFIGURACIÓN ---
# 2. Leemos la URI del entorno, no del código
MONGO_URI = os.getenv("MONGO_URI") 
# ... (el resto del código sigue igual) ...

# --- CONFIGURACIÓN ---
# Usamos tu conexión 'admin' que funcionó
MONGO_URI = "mongodb+srv://admin:admin12345@nexusaitrading.p8zriwr.mongodb.net/?retryWrites=true&w=majority&appName=NEXUSAITRADING"

# Clave de encriptación (Fija para evitar errores de lectura)
ENCRYPTION_KEY = b'wJ-7k8L9p0qR2s3t4u5v6w7x8y9z0A1B2C3D4E5F6G7=' 

class NexusDB:
    def __init__(self):
        print("🔵 Inicializando Database Manager...")
        try:
            # Conexión a la nube con timeout de 5 segundos para no colgarse
            self.client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            self.db = self.client["nexus_trading_platform"]
            self.users = self.db["users"]
            
            # Sistema de encriptación
            self.cipher = Fernet(ENCRYPTION_KEY)
            
            # Prueba de vida (Ping)
            self.client.admin.command('ping')
            print("✅ MONGODB CONECTADO EXITOSAMENTE")
            
        except Exception as e:
            print(f"🔥 ERROR FATAL EN BASE DE DATOS: {e}")
            self.users = None # Marcamos como fallido

    # --- SEGURIDAD ---
    def _encriptar(self, texto: str) -> str:
        if not texto: return None
        return self.cipher.encrypt(texto.encode()).decode()

    # --- USUARIOS ---
    def crear_usuario(self, email, password_hash):
        if self.users is None:
            return False, "Error de conexión con base de datos"

        # Verificar si existe
        if self.users.find_one({"email": email}):
            return False, "El usuario ya existe"
        
        nuevo_usuario = {
            "email": email,
            "password": password_hash, 
            "subscription_status": "inactive",
            "created_at": datetime.utcnow(),
            "api_keys_exchange": None 
        }
        
        try:
            self.users.insert_one(nuevo_usuario)
            return True, "Usuario creado exitosamente"
        except Exception as e:
            print(f"❌ Error insertando usuario: {e}")
            return False, str(e)

# Instancia global
db_manager = NexusDB()