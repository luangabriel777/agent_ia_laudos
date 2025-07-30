#!/usr/bin/env python3
"""
Teste final para verificar criação de usuários
"""

import requests
import json

def test_final_user_creation():
    """Teste final para verificar criação de usuários"""
    
    base_url = "http://localhost:8000"
    
    print("🧪 Teste Final - Criação de Usuários")
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
        
        # 2. Testar estatísticas
        print("\n📊 Testando estatísticas...")
        stats_response = requests.get(f"{base_url}/admin/stats", headers=headers)
        
        if stats_response.status_code == 200:
            stats = stats_response.json()
            print(f"✅ Estatísticas: {stats}")
        else:
            print(f"❌ Erro nas estatísticas: {stats_response.status_code}")
        
        # 3. Listar usuários antes
        print("\n📋 Usuários ANTES da criação...")
        users_before = requests.get(f"{base_url}/admin/users", headers=headers)
        
        if users_before.status_code == 200:
            users_before_data = users_before.json()
            print(f"Total: {len(users_before_data)} usuários")
            for user in users_before_data:
                print(f"  - {user['username']} ({user['user_type']})")
        else:
            print(f"❌ Erro ao listar usuários: {users_before.status_code}")
            return
        
        # 4. Criar usuário
        print("\n👨‍🔧 Criando usuário...")
        new_user = {
            "username": "teste_final",
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
        
        # 5. Listar usuários depois
        print("\n📋 Usuários DEPOIS da criação...")
        users_after = requests.get(f"{base_url}/admin/users", headers=headers)
        
        if users_after.status_code == 200:
            users_after_data = users_after.json()
            print(f"Total: {len(users_after_data)} usuários")
            
            # Procurar o usuário criado
            found = False
            for user in users_after_data:
                print(f"  - {user['username']} ({user['user_type']})")
                if user['username'] == 'teste_final':
                    found = True
            
            if found:
                print("✅ Usuário encontrado na lista!")
            else:
                print("❌ Usuário NÃO encontrado na lista!")
        else:
            print(f"❌ Erro ao listar usuários: {users_after.status_code}")
        
        # 6. Testar login com o novo usuário
        print(f"\n🔐 Testando login...")
        login_new = requests.post(f"{base_url}/login", data={
            "username": "teste_final",
            "password": "123456"
        })
        
        if login_new.status_code == 200:
            print("✅ Login do novo usuário OK!")
        else:
            print(f"❌ Erro no login: {login_new.status_code}")
        
        print("\n🎉 Teste final concluído!")
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    test_final_user_creation() 