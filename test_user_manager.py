#!/usr/bin/env python3
"""
Script para testar o gerenciador de usuários
"""

import requests
import json

def test_user_manager():
    """Testa o gerenciador de usuários"""
    
    base_url = "http://localhost:8000"
    
    print("🧪 Testando Gerenciador de Usuários")
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
        
        # 2. Testar criação de novo técnico
        print("\n👨‍🔧 Testando criação de novo técnico...")
        new_tecnico = {
            "username": "tecnico_teste",
            "password": "123456",
            "user_type": "tecnico"
        }
        
        create_response = requests.post(f"{base_url}/admin/users", 
            json=new_tecnico, headers=headers)
        
        if create_response.status_code == 200:
            print("✅ Técnico criado com sucesso!")
            new_user_id = create_response.json().get("id")
        else:
            print(f"❌ Erro ao criar técnico: {create_response.status_code}")
            print(f"Resposta: {create_response.text}")
            return
        
        # 3. Testar criação de novo encarregado
        print("\n👨‍🔧 Testando criação de novo encarregado...")
        new_encarregado = {
            "username": "encarregado_teste",
            "password": "123456",
            "user_type": "encarregado"
        }
        
        create_encarregado_response = requests.post(f"{base_url}/admin/users", 
            json=new_encarregado, headers=headers)
        
        if create_encarregado_response.status_code == 200:
            print("✅ Encarregado criado com sucesso!")
        else:
            print(f"❌ Erro ao criar encarregado: {create_encarregado_response.status_code}")
        
        # 4. Testar promoção de técnico para encarregado
        print(f"\n⬆️ Testando promoção do técnico (ID: {new_user_id})...")
        promote_response = requests.put(f"{base_url}/admin/users/{new_user_id}", 
            json={"user_type": "encarregado"}, headers=headers)
        
        if promote_response.status_code == 200:
            print("✅ Técnico promovido para Encarregado com sucesso!")
        else:
            print(f"❌ Erro ao promover técnico: {promote_response.status_code}")
            print(f"Resposta: {promote_response.text}")
        
        # 5. Listar todos os usuários
        print("\n👥 Listando todos os usuários...")
        users_response = requests.get(f"{base_url}/admin/users", headers=headers)
        
        if users_response.status_code == 200:
            users = users_response.json()
            print(f"✅ {len(users)} usuários encontrados:")
            
            tecnicos = [u for u in users if u.get('user_type') == 'tecnico']
            encarregados = [u for u in users if u.get('user_type') == 'encarregado']
            admins = [u for u in users if u.get('user_type') == 'admin']
            vendedores = [u for u in users if u.get('user_type') == 'vendedor']
            
            print(f"  👨‍🔧 Técnicos: {len(tecnicos)}")
            for tecnico in tecnicos:
                print(f"    - {tecnico['username']} (ID: {tecnico['id']})")
            
            print(f"  👨‍🔧 Encarregados: {len(encarregados)}")
            for encarregado in encarregados:
                print(f"    - {encarregado['username']} (ID: {encarregado['id']})")
            
            print(f"  👑 Admins: {len(admins)}")
            for admin in admins:
                print(f"    - {admin['username']} (ID: {admin['id']})")
            
            print(f"  💰 Vendedores: {len(vendedores)}")
            for vendedor in vendedores:
                print(f"    - {vendedor['username']} (ID: {vendedor['id']})")
        else:
            print(f"❌ Erro ao listar usuários: {users_response.status_code}")
        
        # 6. Testar login com o novo usuário
        print(f"\n🔐 Testando login com o novo técnico...")
        login_tecnico_response = requests.post(f"{base_url}/login", data={
            "username": "tecnico_teste",
            "password": "123456"
        })
        
        if login_tecnico_response.status_code == 200:
            print("✅ Login do novo técnico funcionando!")
        else:
            print(f"❌ Erro no login do técnico: {login_tecnico_response.status_code}")
        
        print("\n🎉 Teste do Gerenciador de Usuários concluído!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Erro de conexão - Backend não está rodando")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    test_user_manager() 