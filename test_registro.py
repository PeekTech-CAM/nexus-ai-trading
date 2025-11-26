import requests

url = "http://127.0.0.1:8000/api/auth/register"

datos = {
    "email": "ceo@nexus.com",
    "password": "PasswordUltraSecreta123"
}

print(f"📡 Intentando registrar a: {datos['email']}...")

try:
    res = requests.post(url, json=datos)
    print(f"\nEstado HTTP: {res.status_code}")
    print("Respuesta:", res.text) # Usamos .text para ver el error crudo si falla JSON
except Exception as e:
    print(f"❌ Error de conexión: {e}")