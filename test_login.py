import requests

url = "http://127.0.0.1:8000/api/auth/login"

# Usamos los mismos datos con los que te registraste
datos = {
    "email": "ceo@nexus.com",
    "password": "PasswordUltraSecreta123"
}

print(f"🔑 Intentando entrar como: {datos['email']}...")

try:
    res = requests.post(url, json=datos)
    print(f"\nEstado HTTP: {res.status_code}")
    print("Respuesta:", res.json())
except Exception as e:
    print(f"❌ Error: {e}")