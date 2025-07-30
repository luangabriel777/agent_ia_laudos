#!/usr/bin/env python3
"""
Script para testar se o AdminDashboard está funcionando
"""

import requests
import json

def test_admin_dashboard():
    """Testa se o AdminDashboard está funcionando"""
    
    base_url = "http://localhost:8000"
    
    print("🧪 Testando AdminDashboard")
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
        
        # 2. Testar rota de estatísticas
        print("\n📊 Testando estatísticas...")
        stats_response = requests.get(f"{base_url}/admin/stats", headers=headers)
        
        if stats_response.status_code == 200:
            stats = stats_response.json()
            print(f"✅ Estatísticas carregadas: {stats}")
        else:
            print(f"❌ Erro ao carregar estatísticas: {stats_response.status_code}")
        
        # 3. Testar rota de usuários
        print("\n👥 Testando lista de usuários...")
        users_response = requests.get(f"{base_url}/admin/users", headers=headers)
        
        if users_response.status_code == 200:
            users = users_response.json()
            print(f"✅ {len(users)} usuários carregados")
            
            # Mostrar técnicos
            tecnicos = [u for u in users if u.get('user_type') == 'tecnico']
            print(f"👨‍🔧 Técnicos encontrados: {len(tecnicos)}")
            for tecnico in tecnicos:
                print(f"  - {tecnico['username']} (ID: {tecnico['id']})")
        else:
            print(f"❌ Erro ao carregar usuários: {users_response.status_code}")
        
        # 4. Testar rota de privilégios
        print("\n🔐 Testando privilégios...")
        privileges_response = requests.get(f"{base_url}/admin/privileges", headers=headers)
        
        if privileges_response.status_code == 200:
            privileges = privileges_response.json()
            print(f"✅ {len(privileges)} privilégios carregados")
            
            for privilege in privileges:
                print(f"  - {privilege['user_name']}: {privilege['privilege_type']} (ativo: {privilege['is_active']})")
        else:
            print(f"❌ Erro ao carregar privilégios: {privileges_response.status_code}")
        
        # 5. Testar concessão de privilégio
        print("\n✅ Testando concessão de privilégio...")
        
        # Buscar um técnico sem privilégio
        if users_response.status_code == 200:
            users = users_response.json()
            tecnicos_sem_privilegio = []
            
            for tecnico in [u for u in users if u.get('user_type') == 'tecnico']:
                has_privilege = any(p['user_id'] == tecnico['id'] and p['is_active'] for p in privileges)
                if not has_privilege:
                    tecnicos_sem_privilegio.append(tecnico)
            
            if tecnicos_sem_privilegio:
                tecnico_teste = tecnicos_sem_privilegio[0]
                print(f"🎯 Testando com técnico: {tecnico_teste['username']}")
                
                grant_response = requests.post(f"{base_url}/admin/privileges", 
                    json={"user_id": tecnico_teste['id'], "privilege_type": "finalize_laudos"},
                    headers=headers)
                
                if grant_response.status_code == 200:
                    print(f"✅ Privilégio concedido com sucesso!")
                else:
                    print(f"❌ Erro ao conceder privilégio: {grant_response.status_code}")
                    print(f"Resposta: {grant_response.text}")
            else:
                print("ℹ️ Todos os técnicos já têm privilégios")
        
        print("\n🎉 Teste do AdminDashboard concluído!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Erro de conexão - Backend não está rodando")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    test_admin_dashboard() 