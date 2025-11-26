# Añade estas importaciones al inicio de main.py
from fastapi import FastAPI, HTTPException, Body
from database_manager import db_manager # Tu archivo de base de datos
from passlib.context import CryptContext # Para encriptar contraseñas

# Configuración de seguridad (Hashing)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- FUNCIONES AUXILIARES ---
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# --- ENDPOINTS DE USUARIO ---

@app.post("/api/auth/register")
def register_user(user_data: dict = Body(...)):
    email = user_data.get("email")
    password = user_data.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Faltan datos")

    # 1. Encriptamos la contraseña (Seguridad total)
    hashed_pwd = get_password_hash(password)
    
    # 2. Guardamos en MongoDB
    exito, mensaje = db_manager.crear_usuario(email, hashed_pwd)
    
    if not exito:
        raise HTTPException(status_code=400, detail=mensaje)
        
    return {"status": "ok", "message": "Usuario registrado. ¡Bienvenido a NEXUS!"}

@app.post("/api/auth/login")
def login_user(user_data: dict = Body(...)):
    email = user_data.get("email")
    password = user_data.get("password")
    
    # 1. Buscamos al usuario en la BD (Necesitas añadir buscar_usuario en db_manager)
    user = db_manager.users.find_one({"email": email})
    
    if not user or not verify_password(password, user['password']):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
        
    return {
        "status": "ok", 
        "token": "demo_token_123", # En producción usaríamos JWT real
        "email": user["email"],
        "plan": user["subscription_status"]
    }