#!/usr/bin/env python3
"""
Script para testar as permissões do Encarregado
"""

import requests
import json

def test_encarregado_permissions():
    """Testa as permissões do Encarregado"""
    
    base_url = "http://localhost:8000"
    
    print("🧪 Testando Permissões do Encarregado")
    print("=" * 50)
    
    try:
        # 1. Fazer login como Encarregado
        print("🔐 Fazendo login como Encarregado...")
        login_response = requests.post(f"{base_url}/login", data={
            "username": "encarregado",
            "password": "123456"
        })
        
        if login_response.status_code != 200:
            print(f"❌ Erro no login: {login_response.status_code}")
            return
        
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        print("✅ Login bem-sucedido como Encarregado")
        
        # 2. Testar criação de novo técnico
        print("\n👨‍🔧 Testando criação de novo técnico...")
        new_tecnico = {
            "username": "tecnico_encarregado",
            "password": "123456",
            "user_type": "tecnico"
        }
        
        create_response = requests.post(f"{base_url}/admin/users", 
            json=new_tecnico, headers=headers)
        
        if create_response.status_code == 200:
            print("✅ Técnico criado com sucesso pelo Encarregado!")
            new_user_id = create_response.json().get("user_id")
        else:
            print(f"❌ Erro ao criar técnico: {create_response.status_code}")
            print(f"Resposta: {create_response.text}")
            return
        
        # 3. Testar concessão de privilégio
        print(f"\n🔐 Testando concessão de privilégio ao técnico (ID: {new_user_id})...")
        privilege_response = requests.post(f"{base_url}/admin/privileges", 
            json={"user_id": new_user_id, "privilege_type": "finalize_laudos"}, 
            headers=headers)
        
        if privilege_response.status_code == 200:
            print("✅ Privilégio concedido com sucesso pelo Encarregado!")
        else:
            print(f"❌ Erro ao conceder privilégio: {privilege_response.status_code}")
            print(f"Resposta: {privilege_response.text}")
        
        # 4. Testar listagem de privilégios
        print("\n📋 Testando listagem de privilégios...")
        privileges_response = requests.get(f"{base_url}/admin/privileges", headers=headers)
        
        if privileges_response.status_code == 200:
            privileges = privileges_response.json()
            print(f"✅ {len(privileges)} privilégios listados pelo Encarregado")
        else:
            print(f"❌ Erro ao listar privilégios: {privileges_response.status_code}")
        
        # 5. Testar listagem de usuários
        print("\n👥 Testando listagem de usuários...")
        users_response = requests.get(f"{base_url}/admin/users", headers=headers)
        
        if users_response.status_code == 200:
            users = users_response.json()
            print(f"✅ {len(users)} usuários listados pelo Encarregado")
        else:
            print(f"❌ Erro ao listar usuários: {users_response.status_code}")
        
        # 6. Testar promoção de técnico para encarregado
        print(f"\n⬆️ Testando promoção do técnico para Encarregado...")
        promote_response = requests.put(f"{base_url}/admin/users/{new_user_id}", 
            json={"user_type": "encarregado"}, headers=headers)
        
        if promote_response.status_code == 200:
            print("✅ Técnico promovido para Encarregado com sucesso!")
        else:
            print(f"❌ Erro ao promover técnico: {promote_response.status_code}")
            print(f"Resposta: {promote_response.text}")
        
        # 7. Testar revogação de privilégio
        print(f"\n🚫 Testando revogação de privilégio...")
        revoke_response = requests.delete(f"{base_url}/admin/privileges/{new_user_id}/finalize_laudos", 
            headers=headers)
        
        if revoke_response.status_code == 200:
            print("✅ Privilégio revogado com sucesso pelo Encarregado!")
        else:
            print(f"❌ Erro ao revogar privilégio: {revoke_response.status_code}")
            print(f"Resposta: {revoke_response.text}")
        
        print("\n🎉 Teste das permissões do Encarregado concluído!")
        print("\n✅ Encarregados agora podem:")
        print("  - Cadastrar novos técnicos")
        print("  - Promover técnicos para Encarregado")
        print("  - Gerenciar privilégios de finalização")
        print("  - Listar usuários e privilégios")
        
    except requests.exceptions.ConnectionError:
        print("❌ Erro de conexão - Backend não está rodando")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    test_encarregado_permissions() 