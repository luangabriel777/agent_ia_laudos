#!/usr/bin/env python3
"""
Teste simples para criação de usuários
"""

import requests
import json

def test_simple_user_creation():
    """Teste simples para criação de usuários"""
    
    base_url = "http://localhost:8000"
    
    print("🧪 Teste Simples de Criação de Usuários")
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
            return
        
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("✅ Login OK")
        
        # 2. Criar usuário
        print("\n👨‍🔧 Criando usuário...")
        new_user = {
            "username": "teste_simples",
            "password": "123456",
            "user_type": "tecnico"
        }
        
        create_response = requests.post(f"{base_url}/admin/users", 
            json=new_user, headers=headers)
        
        print(f"Status: {create_response.status_code}")
        print(f"Resposta: {create_response.text}")
        
        if create_response.status_code == 200:
            print("✅ Usuário criado!")
            user_id = create_response.json().get("user_id")
            print(f"ID: {user_id}")
        else:
            print("❌ Falha na criação")
            return
        
        # 3. Listar usuários
        print("\n📋 Listando usuários...")
        users_response = requests.get(f"{base_url}/admin/users", headers=headers)
        
        if users_response.status_code == 200:
            users = users_response.json()
            print(f"Total de usuários: {len(users)}")
            
            # Procurar o usuário criado
            found = False
            for user in users:
                if user['username'] == 'teste_simples':
                    print(f"✅ Usuário encontrado: {user}")
                    found = True
                    break
            
            if not found:
                print("❌ Usuário não encontrado na lista!")
        else:
            print(f"❌ Erro ao listar: {users_response.status_code}")
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    test_simple_user_creation() 