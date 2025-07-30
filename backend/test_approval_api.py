#!/usr/bin/env python3
"""
Script para testar a API de aprovação
"""

import requests
import json

def test_approval_api():
    """Testa a nova rota de aprovação"""
    
    base_url = "http://localhost:8000"
    
    # Credenciais de teste
    users = [
        {"username": "encarregado", "password": "123456"},
        {"username": "vendedor", "password": "123456"},
        {"username": "admin", "password": "123456"},
        {"username": "tecnico", "password": "123456"}
    ]
    
    print("🧪 Testando API de Aprovação")
    print("=" * 50)
    
    for user in users:
        print(f"\n🔐 Testando usuário: {user['username']}")
        
        try:
            # 1. Fazer login
            login_response = requests.post(f"{base_url}/login", data={
                "username": user["username"],
                "password": user["password"]
            })
            
            if login_response.status_code != 200:
                print(f"  ❌ Erro no login: {login_response.status_code}")
                continue
            
            token = login_response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            
            # 2. Buscar informações do usuário
            me_response = requests.get(f"{base_url}/me", headers=headers)
            if me_response.status_code == 200:
                user_info = me_response.json()
                print(f"  ✅ Login bem-sucedido - Tipo: {user_info.get('user_type', 'admin')}")
            else:
                print(f"  ❌ Erro ao buscar informações do usuário")
                continue
            
            # 3. Testar rota de aprovação
            approval_response = requests.get(f"{base_url}/laudos/approval", headers=headers)
            
            if approval_response.status_code == 200:
                laudos = approval_response.json()
                print(f"  ✅ Rota de aprovação funcionando - {len(laudos)} laudos retornados")
                
                # Contar laudos por status
                status_count = {}
                for laudo in laudos:
                    status = laudo.get('status', 'unknown')
                    if status not in status_count:
                        status_count[status] = 0
                    status_count[status] += 1
                
                print(f"  📊 Laudos por status:")
                for status, count in status_count.items():
                    print(f"    - {status}: {count}")
                
                # Verificar se há laudos para aprovação
                if user_info.get('user_type') == 'encarregado':
                    em_andamento = [l for l in laudos if l.get('status') == 'em_andamento']
                    print(f"  🎯 Laudos 'em_andamento' para Encarregado aprovar: {len(em_andamento)}")
                
                elif user_info.get('user_type') == 'vendedor':
                    aprovado_manutencao = [l for l in laudos if l.get('status') == 'aprovado_manutencao']
                    print(f"  🎯 Laudos 'aprovado_manutencao' para Vendedor aprovar: {len(aprovado_manutencao)}")
                
                elif user_info.get('is_admin'):
                    print(f"  🎯 Admin pode ver todos os {len(laudos)} laudos")
                
            else:
                print(f"  ❌ Erro na rota de aprovação: {approval_response.status_code}")
                print(f"  Resposta: {approval_response.text}")
            
            # 4. Testar rota normal de laudos (para comparação)
            normal_response = requests.get(f"{base_url}/laudos", headers=headers)
            if normal_response.status_code == 200:
                normal_laudos = normal_response.json()
                print(f"  📋 Rota normal de laudos: {len(normal_laudos)} laudos")
            else:
                print(f"  ❌ Erro na rota normal: {normal_response.status_code}")
            
        except requests.exceptions.ConnectionError:
            print(f"  ❌ Erro de conexão - Backend não está rodando")
            break
        except Exception as e:
            print(f"  ❌ Erro inesperado: {e}")
    
    print(f"\n🎉 Teste concluído!")

if __name__ == "__main__":
    test_approval_api() 