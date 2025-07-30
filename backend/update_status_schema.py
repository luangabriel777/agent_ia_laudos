#!/usr/bin/env python3
"""
Script para atualizar os status dos laudos para o novo fluxo RSM
Converte status antigos para os novos status conforme especificado
"""

import sqlite3
import os

def update_laudo_statuses():
    """Atualiza os status dos laudos para o novo fluxo RSM"""
    db_path = 'laudos.db'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("🔄 Iniciando atualização dos status dos laudos...")
        
        # Mapeamento de status antigos para novos
        status_mapping = {
            'aguardando_aprovacao': 'em_andamento',
            'ap_manutencao': 'aprovado_manutencao',
            'aguardando_orcamento': 'em_andamento',
            'ap_vendas': 'aprovado_vendas',
            'orcamento_aprovado': 'aprovado_vendas',
            'compra_finalizada': 'finalizado',
            'concluido': 'finalizado'
        }
        
        # Verificar status atuais
        cursor.execute("SELECT DISTINCT status FROM laudos")
        current_statuses = [row[0] for row in cursor.fetchall()]
        print(f"📋 Status atuais encontrados: {current_statuses}")
        
        # Atualizar cada status
        updated_count = 0
        for old_status, new_status in status_mapping.items():
            cursor.execute(
                "UPDATE laudos SET status = ? WHERE status = ?",
                (new_status, old_status)
            )
            affected_rows = cursor.rowcount
            if affected_rows > 0:
                print(f"✅ Atualizados {affected_rows} laudos de '{old_status}' para '{new_status}'")
                updated_count += affected_rows
        
        # Verificar se há status que precisam ser padronizados
        cursor.execute("SELECT COUNT(*) FROM laudos WHERE status IS NULL OR status = ''")
        null_count = cursor.fetchone()[0]
        if null_count > 0:
            cursor.execute("UPDATE laudos SET status = 'pendente' WHERE status IS NULL OR status = ''")
            print(f"✅ Definidos {null_count} laudos sem status como 'pendente'")
            updated_count += null_count
        
        # Verificar status finais
        cursor.execute("SELECT DISTINCT status FROM laudos")
        final_statuses = [row[0] for row in cursor.fetchall()]
        print(f"📋 Status após atualização: {final_statuses}")
        
        conn.commit()
        print(f"\n✅ Atualização concluída! {updated_count} laudos atualizados.")
        
        # Mostrar estatísticas finais
        cursor.execute("SELECT status, COUNT(*) FROM laudos GROUP BY status")
        stats = cursor.fetchall()
        print("\n📊 Estatísticas finais:")
        for status, count in stats:
            print(f"  - {status}: {count} laudos")
        
    except Exception as e:
        print(f"❌ Erro ao atualizar status: {e}")
        conn.rollback()
    finally:
        conn.close()

def verify_status_consistency():
    """Verifica se os status estão consistentes com o novo fluxo"""
    db_path = 'laudos.db'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("\n🔍 Verificando consistência dos status...")
        
        # Status válidos no novo fluxo
        valid_statuses = [
            'pendente',
            'em_andamento', 
            'aprovado_manutencao',
            'aprovado_vendas',
            'finalizado',
            'reprovado'
        ]
        
        # Verificar status inválidos
        cursor.execute("SELECT DISTINCT status FROM laudos")
        all_statuses = [row[0] for row in cursor.fetchall()]
        
        invalid_statuses = [status for status in all_statuses if status not in valid_statuses]
        
        if invalid_statuses:
            print(f"⚠️ Status inválidos encontrados: {invalid_statuses}")
            return False
        else:
            print("✅ Todos os status estão consistentes com o novo fluxo!")
            return True
            
    except Exception as e:
        print(f"❌ Erro ao verificar consistência: {e}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    print("🎯 Atualização de Status - Sistema RSM")
    print("=" * 50)
    
    update_laudo_statuses()
    verify_status_consistency()
    
    print("\n🎉 Processo concluído!")
    print("\n📋 Novo fluxo de status implementado:")
    print("  1. pendente → OS criada")
    print("  2. em_andamento → OS sendo preenchida")
    print("  3. aprovado_manutencao → Encarregado aprovou")
    print("  4. aprovado_vendas → Vendas aprovou orçamento")
    print("  5. finalizado → OS finalizada")
    print("  6. reprovado → OS reprovada") 