#!/usr/bin/env python3
"""
Script para testar a aprovação do Vendedor
"""

import requests
import json

def test_vendedor_approval():
    """Testa a aprovação do Vendedor"""
    
    base_url = "http://localhost:8000"
    
    print("🧪 Testando Aprovação do Vendedor")
    print("=" * 50)
    
    try:
        # 1. Fazer login como Vendedor
        print("🔐 Fazendo login como Vendedor...")
        login_response = requests.post(f"{base_url}/login", data={
            "username": "vendedor",
            "password": "123456"
        })
        
        if login_response.status_code != 200:
            print(f"❌ Erro no login: {login_response.status_code}")
            return
        
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Buscar informações do usuário
        me_response = requests.get(f"{base_url}/me", headers=headers)
        if me_response.status_code == 200:
            user_info = me_response.json()
            print(f"✅ Login bem-sucedido - Tipo: {user_info.get('user_type', 'admin')}")
        else:
            print(f"❌ Erro ao buscar informações do usuário")
            return
        
        # 3. Buscar laudos para aprovação
        print("\n📋 Buscando laudos para aprovação...")
        approval_response = requests.get(f"{base_url}/laudos/approval", headers=headers)
        
        if approval_response.status_code != 200:
            print(f"❌ Erro na rota de aprovação: {approval_response.status_code}")
            return
        
        laudos = approval_response.json()
        print(f"✅ {len(laudos)} laudos encontrados")
        
        # 4. Filtrar laudos aprovado_manutencao
        laudos_para_aprovar = [l for l in laudos if l.get('status') == 'aprovado_manutencao']
        print(f"🎯 Laudos 'aprovado_manutencao' para aprovar: {len(laudos_para_aprovar)}")
        
        if not laudos_para_aprovar:
            print("❌ Nenhum laudo disponível para aprovação do Vendedor")
            return
        
        # 5. Testar aprovação do primeiro laudo
        laudo_para_aprovar = laudos_para_aprovar[0]
        laudo_id = laudo_para_aprovar['id']
        
        print(f"\n✅ Testando aprovação do laudo #{laudo_id}...")
        print(f"   Cliente: {laudo_para_aprovar.get('cliente')}")
        print(f"   Status atual: {laudo_para_aprovar.get('status')}")
        
        # 6. Fazer a aprovação
        approval_data = {
            "status": "aprovado_vendas",
            "observacoes": "Aprovado pelo Vendedor - Orçamento aprovado"
        }
        
        update_response = requests.put(f"{base_url}/laudos/{laudo_id}", 
                                     json=approval_data, 
                                     headers=headers)
        
        if update_response.status_code == 200:
            print(f"✅ Laudo #{laudo_id} aprovado com sucesso!")
            
            # 7. Verificar se o status foi atualizado
            updated_laudo = update_response.json()
            print(f"   Novo status: {updated_laudo.get('status')}")
            print(f"   Observações: {updated_laudo.get('observacoes')}")
            
            if updated_laudo.get('status') == 'aprovado_vendas':
                print("🎉 APROVAÇÃO DO VENDEDOR FUNCIONANDO CORRETAMENTE!")
            else:
                print("❌ Status não foi atualizado corretamente")
                
        else:
            print(f"❌ Erro ao aprovar laudo: {update_response.status_code}")
            print(f"Resposta: {update_response.text}")
        
    except requests.exceptions.ConnectionError:
        print("❌ Erro de conexão - Backend não está rodando")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
    
    print(f"\n🎉 Teste concluído!")

if __name__ == "__main__":
    test_vendedor_approval() 