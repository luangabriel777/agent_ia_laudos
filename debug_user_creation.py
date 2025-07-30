#!/usr/bin/env python3
"""
Script para debugar o problema de criação de usuários
"""

import requests
import json

def debug_user_creation():
    """Debuga o problema de criação de usuários"""
    
    base_url = "http://localhost:8000"
    
    print("🔍 Debugando Criação de Usuários")
    print("=" * 50)
    
    try:
        # 1. Fazer login como Admin
        print("🔐 Fazendo login como Admin...")
        login_response = requests.post(f"{base_url}/login", data={
            "username": "admin",
            "password": "123456"
        })
        
        if login_response.status_code != 200:
            print(f"❌ Erro no login: {login_response.status_code}")
            return
        
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        print("✅ Login bem-sucedido como Admin")
        
        # 2. Listar usuários antes da criação
        print("\n📋 Listando usuários ANTES da criação...")
        users_before = requests.get(f"{base_url}/admin/users", headers=headers)
        
        if users_before.status_code == 200:
            users_before_data = users_before.json()
            print(f"✅ {len(users_before_data)} usuários encontrados ANTES:")
            for user in users_before_data:
                print(f"  - {user['username']} (ID: {user['id']}, Tipo: {user['user_type']})")
        else:
            print(f"❌ Erro ao listar usuários: {users_before.status_code}")
            return
        
        # 3. Criar novo usuário
        print("\n👨‍🔧 Criando novo usuário...")
        new_user = {
            "username": "tecnico_debug",
            "password": "123456",
            "user_type": "tecnico"
        }
        
        create_response = requests.post(f"{base_url}/admin/users", 
            json=new_user, headers=headers)
        
        print(f"Status da criação: {create_response.status_code}")
        print(f"Resposta da criação: {create_response.text}")
        
        if create_response.status_code == 200:
            print("✅ Usuário criado com sucesso!")
            new_user_id = create_response.json().get("user_id")
            print(f"ID do novo usuário: {new_user_id}")
        else:
            print(f"❌ Erro ao criar usuário: {create_response.status_code}")
            print(f"Resposta: {create_response.text}")
            return
        
        # 4. Listar usuários depois da criação
        print("\n📋 Listando usuários DEPOIS da criação...")
        users_after = requests.get(f"{base_url}/admin/users", headers=headers)
        
        if users_after.status_code == 200:
            users_after_data = users_after.json()
            print(f"✅ {len(users_after_data)} usuários encontrados DEPOIS:")
            for user in users_after_data:
                print(f"  - {user['username']} (ID: {user['id']}, Tipo: {user['user_type']})")
            
            # Verificar se o novo usuário está na lista
            new_user_found = any(u['username'] == 'tecnico_debug' for u in users_after_data)
            if new_user_found:
                print("✅ Novo usuário encontrado na lista!")
            else:
                print("❌ Novo usuário NÃO encontrado na lista!")
                
        else:
            print(f"❌ Erro ao listar usuários: {users_after.status_code}")
        
        # 5. Testar login com o novo usuário
        print(f"\n🔐 Testando login com o novo usuário...")
        login_new_user = requests.post(f"{base_url}/login", data={
            "username": "tecnico_debug",
            "password": "123456"
        })
        
        if login_new_user.status_code == 200:
            print("✅ Login do novo usuário funcionando!")
        else:
            print(f"❌ Erro no login do novo usuário: {login_new_user.status_code}")
        
        # 6. Verificar se há diferença no número de usuários
        if users_before.status_code == 200 and users_after.status_code == 200:
            diff = len(users_after_data) - len(users_before_data)
            print(f"\n📊 Diferença no número de usuários: {diff}")
            if diff == 1:
                print("✅ Número de usuários aumentou corretamente!")
            else:
                print("❌ Número de usuários não aumentou como esperado!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Erro de conexão - Backend não está rodando")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    debug_user_creation() 