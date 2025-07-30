#!/usr/bin/env python3
"""
Script para verificar os laudos e identificar problemas no fluxo
"""

import sqlite3

def check_laudos():
    """Verifica os laudos no sistema"""
    db_path = 'laudos.db'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("🔍 Verificando laudos no sistema...")
        
        # Verificar todos os laudos
        cursor.execute('''
            SELECT id, cliente, status, created_at 
            FROM laudos 
            ORDER BY id DESC
        ''')
        all_laudos = cursor.fetchall()
        
        print(f"\n📋 Total de laudos: {len(all_laudos)}")
        
        # Agrupar por status
        status_count = {}
        for laudo_id, cliente, status, created_at in all_laudos:
            if status not in status_count:
                status_count[status] = []
            status_count[status].append((laudo_id, cliente))
        
        print(f"\n📊 Laudos por status:")
        for status, laudos in status_count.items():
            print(f"  - {status}: {len(laudos)} laudos")
            for laudo_id, cliente in laudos[:3]:  # Mostrar apenas os 3 primeiros
                print(f"    #{laudo_id}: {cliente}")
            if len(laudos) > 3:
                print(f"    ... e mais {len(laudos) - 3} laudos")
        
        # Verificar especificamente laudos aprovado_manutencao
        print(f"\n🎯 Laudos 'aprovado_manutencao' (para Vendedor aprovar):")
        cursor.execute("SELECT id, cliente, created_at FROM laudos WHERE status = 'aprovado_manutencao'")
        aprovados_manutencao = cursor.fetchall()
        
        if aprovados_manutencao:
            for laudo_id, cliente, created_at in aprovados_manutencao:
                print(f"  - #{laudo_id}: {cliente} (criado em: {created_at})")
        else:
            print("  ❌ Nenhum laudo com status 'aprovado_manutencao' encontrado!")
        
        # Verificar laudos em_andamento (para Encarregado aprovar)
        print(f"\n🔧 Laudos 'em_andamento' (para Encarregado aprovar):")
        cursor.execute("SELECT id, cliente, created_at FROM laudos WHERE status = 'em_andamento'")
        em_andamento = cursor.fetchall()
        
        if em_andamento:
            for laudo_id, cliente, created_at in em_andamento[:5]:  # Mostrar apenas 5
                print(f"  - #{laudo_id}: {cliente} (criado em: {created_at})")
            if len(em_andamento) > 5:
                print(f"  ... e mais {len(em_andamento) - 5} laudos")
        else:
            print("  ❌ Nenhum laudo com status 'em_andamento' encontrado!")
        
        # Verificar se há problemas de atualização
        print(f"\n🔍 Verificando problemas de atualização...")
        cursor.execute("SELECT id, cliente, status, updated_at FROM laudos WHERE updated_at IS NULL OR updated_at = ''")
        sem_update = cursor.fetchall()
        
        if sem_update:
            print(f"  ⚠️ {len(sem_update)} laudos sem updated_at:")
            for laudo_id, cliente, status, updated_at in sem_update[:3]:
                print(f"    #{laudo_id}: {cliente} - {status}")
        else:
            print("  ✅ Todos os laudos têm updated_at")
        
    except Exception as e:
        print(f"❌ Erro ao verificar laudos: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    print("🎯 Verificação de Laudos - Sistema RSM")
    print("=" * 50)
    
    check_laudos()
    
    print("\n🎉 Verificação concluída!") 