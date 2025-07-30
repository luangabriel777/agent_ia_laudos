#!/usr/bin/env python3
"""
Script para testar a conexão com o banco de dados
"""

import sqlite3
import os

def test_db_connection():
    """Testa a conexão com o banco de dados"""
    
    db_path = 'backend/laudos.db'
    
    print("🧪 Testando Conexão com Banco de Dados")
    print("=" * 50)
    
    if not os.path.exists(db_path):
        print(f"❌ Banco de dados não encontrado: {db_path}")
        return
    
    print(f"✅ Banco de dados encontrado: {db_path}")
    
    try:
        # Teste 1: Conexão simples
        print("\n🔗 Teste 1: Conexão simples")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        print("✅ Conexão estabelecida")
        
        # Teste 2: Contar laudos
        print("\n📊 Teste 2: Contar laudos")
        cursor.execute("SELECT COUNT(*) FROM laudos")
        total_laudos = cursor.fetchone()[0]
        print(f"✅ Total de laudos: {total_laudos}")
        
        # Teste 3: Laudos por status
        print("\n📋 Teste 3: Laudos por status")
        cursor.execute("SELECT status, COUNT(*) FROM laudos GROUP BY status")
        status_counts = cursor.fetchall()
        for status, count in status_counts:
            print(f"  - {status}: {count}")
        
        # Teste 4: Laudos hoje
        print("\n📅 Teste 4: Laudos hoje")
        cursor.execute("SELECT COUNT(*) FROM laudos WHERE DATE(created_at) = DATE('now')")
        laudos_hoje = cursor.fetchone()[0]
        print(f"✅ Laudos hoje: {laudos_hoje}")
        
        # Teste 5: Laudos da semana
        print("\n📅 Teste 5: Laudos da semana")
        cursor.execute("SELECT COUNT(*) FROM laudos WHERE created_at >= DATE('now', '-7 days')")
        laudos_semana = cursor.fetchone()[0]
        print(f"✅ Laudos da semana: {laudos_semana}")
        
        # Teste 6: Laudos do mês
        print("\n📅 Teste 6: Laudos do mês")
        cursor.execute("SELECT COUNT(*) FROM laudos WHERE created_at >= DATE('now', '-30 days')")
        laudos_mes = cursor.fetchone()[0]
        print(f"✅ Laudos do mês: {laudos_mes}")
        
        # Teste 7: Laudos pendentes
        print("\n⏳ Teste 7: Laudos pendentes")
        cursor.execute("SELECT COUNT(*) FROM laudos WHERE status = 'em_andamento'")
        laudos_pendentes = cursor.fetchone()[0]
        print(f"✅ Laudos pendentes: {laudos_pendentes}")
        
        # Teste 8: Laudos aprovados
        print("\n✅ Teste 8: Laudos aprovados")
        cursor.execute("SELECT COUNT(*) FROM laudos WHERE status IN ('aprovado_manutencao', 'aprovado_vendas', 'finalizado')")
        laudos_aprovados = cursor.fetchone()[0]
        print(f"✅ Laudos aprovados: {laudos_aprovados}")
        
        # Teste 9: Fechar conexão
        print("\n🔒 Teste 9: Fechar conexão")
        conn.close()
        print("✅ Conexão fechada")
        
        # Teste 10: Tentar usar cursor após fechar
        print("\n❌ Teste 10: Tentar usar cursor após fechar")
        try:
            cursor.execute("SELECT COUNT(*) FROM laudos")
            print("❌ Erro: Cursor ainda funcionando após fechar conexão")
        except sqlite3.OperationalError as e:
            print(f"✅ Erro esperado: {e}")
        
        print("\n🎉 Todos os testes concluídos!")
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    test_db_connection() 