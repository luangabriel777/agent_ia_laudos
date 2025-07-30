#!/usr/bin/env python3
"""
Script para testar as rotas do backend
"""

import requests
import json

def test_backend_routes():
    """Testa as rotas do backend"""
    
    base_url = "http://localhost:8000"
    
    print("🧪 Testando Rotas do Backend")
    print("=" * 50)
    
    try:
        # 1. Login como Admin
        print("🔐 Login como Admin...")
        login_response = requests.post(f"{base_url}/login", data={
            "username": "admin",
            "password": "123456"
        })
        
        if login_response.status_code != 200:
            print(f"❌ Erro no login: {login_response.status_code}")
            print(f"Resposta: {login_response.text}")
            return
        
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("✅ Login OK")
        
        # 2. Testar rota /admin/stats
        print("\n📊 Testando /admin/stats...")
        stats_response = requests.get(f"{base_url}/admin/stats", headers=headers)
        
        print(f"Status: {stats_response.status_code}")
        if stats_response.status_code == 200:
            stats = stats_response.json()
            print(f"✅ Estatísticas: {stats}")
        else:
            print(f"❌ Erro: {stats_response.text}")
        
        # 3. Testar rota /admin/users
        print("\n👥 Testando /admin/users...")
        users_response = requests.get(f"{base_url}/admin/users", headers=headers)
        
        print(f"Status: {users_response.status_code}")
        if users_response.status_code == 200:
            users = users_response.json()
            print(f"✅ Usuários ({len(users)}):")
            for user in users:
                print(f"  - {user['username']} ({user['user_type']})")
        else:
            print(f"❌ Erro: {users_response.text}")
        
        # 4. Testar rota /admin/privileges
        print("\n🔐 Testando /admin/privileges...")
        privileges_response = requests.get(f"{base_url}/admin/privileges", headers=headers)
        
        print(f"Status: {privileges_response.status_code}")
        if privileges_response.status_code == 200:
            privileges = privileges_response.json()
            print(f"✅ Privilégios ({len(privileges)}):")
            for priv in privileges:
                print(f"  - {priv['user_name']}: {priv['privilege_type']}")
        else:
            print(f"❌ Erro: {privileges_response.text}")
        
        # 5. Testar criação de usuário
        print("\n👨‍🔧 Testando criação de usuário...")
        new_user = {
            "username": "teste_rota",
            "password": "123456",
            "user_type": "tecnico"
        }
        
        create_response = requests.post(f"{base_url}/admin/users", 
            json=new_user, headers=headers)
        
        print(f"Status: {create_response.status_code}")
        if create_response.status_code == 200:
            print(f"✅ Usuário criado: {create_response.json()}")
        else:
            print(f"❌ Erro: {create_response.text}")
        
        # 6. Testar listagem novamente
        print("\n👥 Testando /admin/users novamente...")
        users_response2 = requests.get(f"{base_url}/admin/users", headers=headers)
        
        print(f"Status: {users_response2.status_code}")
        if users_response2.status_code == 200:
            users2 = users_response2.json()
            print(f"✅ Usuários ({len(users2)}):")
            for user in users2:
                print(f"  - {user['username']} ({user['user_type']})")
        else:
            print(f"❌ Erro: {users_response2.text}")
        
    except requests.exceptions.ConnectionError:
        print("❌ Erro de conexão - Backend não está rodando")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    test_backend_routes() 