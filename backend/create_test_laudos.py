#!/usr/bin/env python3
"""
Script para criar laudos de teste para demonstrar o painel de aprovação
Cria laudos em diferentes status para testar o fluxo de aprovação
"""

import sqlite3
import os
from datetime import datetime, timedelta

def create_test_laudos():
    """Cria laudos de teste para demonstrar o painel de aprovação"""
    db_path = 'laudos.db'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("🔄 Criando laudos de teste para demonstração...")
        
        # Buscar IDs dos usuários
        cursor.execute('SELECT id, username FROM users WHERE user_type IN ("tecnico", "encarregado", "vendedor")')
        users = cursor.fetchall()
        
        if not users:
            print("❌ Nenhum usuário encontrado. Execute primeiro o script create_users.py")
            return
        
        tecnico_id = None
        for user_id, username in users:
            if username == 'tecnico':
                tecnico_id = user_id
                break
        
        if not tecnico_id:
            print("❌ Usuário técnico não encontrado")
            return
        
        # Verificar se já existem laudos de teste
        cursor.execute('SELECT COUNT(*) FROM laudos')
        total_laudos = cursor.fetchone()[0]
        
        if total_laudos > 0:
            print(f"📋 Já existem {total_laudos} laudos no sistema")
            response = input("Deseja adicionar mais laudos de teste? (s/n): ")
            if response.lower() != 's':
                print("Operação cancelada")
                return
        
        # Dados de teste para diferentes status
        test_laudos = [
            # 1. Laudo em andamento (para Encarregado aprovar)
            {
                'user_id': tecnico_id,
                'cliente': 'Empresa ABC Ltda',
                'equipamento': 'Empilhadeira Elétrica XYZ-200',
                'diagnostico': 'Bateria tracionária apresentando perda de capacidade significativa após 2 anos de uso. Tensão nominal de 12V caiu para 10.5V sob carga. Células apresentam desequilíbrio de carga.',
                'solucao': 'Recomendada substituição da bateria por modelo 12V 100Ah com tecnologia AGM. Incluir sistema de equalização automática para prolongar vida útil.',
                'status': 'em_andamento',
                'created_at': datetime.now() - timedelta(days=2)
            },
            # 2. Laudo em andamento (para Encarregado aprovar)
            {
                'user_id': tecnico_id,
                'cliente': 'Transportadora Delta',
                'equipamento': 'Empilhadeira Toyota 2T Diesel',
                'diagnostico': 'Sistema de bateria com células danificadas por sulfatação. Terminais oxidados e cabos com isolamento comprometido. Sistema de carga funcionando adequadamente.',
                'solucao': 'Substituição completa do banco de baterias 24V 200Ah. Troca de cabos e terminais. Limpeza e proteção dos conectores.',
                'status': 'em_andamento',
                'created_at': datetime.now() - timedelta(days=1)
            },
            # 3. Laudo aprovado manutenção (para Vendedor aprovar orçamento)
            {
                'user_id': tecnico_id,
                'cliente': 'Armazém Central',
                'equipamento': 'Empilhadeira Hyster 1.5T',
                'diagnostico': 'Necessidade de manutenção preventiva. Bateria com 80% da capacidade original. Sistema de carga operacional mas com sinais de desgaste.',
                'solucao': 'Limpeza de terminais e check-up geral. Substituição de cabos se necessário. Aplicação de proteção anticorrosiva.',
                'status': 'aprovado_manutencao',
                'created_at': datetime.now() - timedelta(days=3)
            },
            # 4. Laudo aprovado vendas (para finalizar)
            {
                'user_id': tecnico_id,
                'cliente': 'Indústria Sigma',
                'equipamento': 'Empilhadeira Still 2T',
                'diagnostico': 'Manutenção corretiva em cabos de alimentação. Isolamento danificado em múltiplos pontos. Risco de curto-circuito.',
                'solucao': 'Substituição de cabos danificados por modelo de alta qualidade. Instalação de proteção adicional contra abrasão.',
                'status': 'aprovado_vendas',
                'created_at': datetime.now() - timedelta(days=4)
            },
            # 5. Laudo finalizado
            {
                'user_id': tecnico_id,
                'cliente': 'Logística Express',
                'equipamento': 'Empilhadeira Jungheinrich 1.8T',
                'diagnostico': 'Bateria com fim de vida útil. Capacidade reduzida a 30%. Células com vazamento de eletrólito.',
                'solucao': 'Substituição completa da bateria por modelo 48V 400Ah. Atualização do sistema de carga.',
                'status': 'finalizado',
                'created_at': datetime.now() - timedelta(days=7)
            },
            # 6. Laudo reprovado
            {
                'user_id': tecnico_id,
                'cliente': 'Comércio Local',
                'equipamento': 'Empilhadeira Pequena 1T',
                'diagnostico': 'Problema no sistema de ignição. Bateria em bom estado mas não carrega adequadamente.',
                'solucao': 'Diagnóstico adicional necessário. Possível problema no alternador ou regulador de tensão.',
                'status': 'reprovado',
                'created_at': datetime.now() - timedelta(days=5)
            }
        ]
        
        created_count = 0
        for i, laudo in enumerate(test_laudos, 1):
            try:
                cursor.execute('''
                    INSERT INTO laudos (
                        user_id, cliente, equipamento, diagnostico, solucao, 
                        status, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    laudo['user_id'],
                    laudo['cliente'],
                    laudo['equipamento'],
                    laudo['diagnostico'],
                    laudo['solucao'],
                    laudo['status'],
                    laudo['created_at'].strftime('%Y-%m-%d %H:%M:%S'),
                    laudo['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                ))
                created_count += 1
                print(f"✅ Laudo #{i} criado: {laudo['cliente']} - {laudo['status']}")
                
            except Exception as e:
                print(f"❌ Erro ao criar laudo #{i}: {e}")
        
        conn.commit()
        print(f"\n✅ {created_count} laudos de teste criados com sucesso!")
        
        # Mostrar estatísticas
        cursor.execute("SELECT status, COUNT(*) FROM laudos GROUP BY status")
        stats = cursor.fetchall()
        print("\n📊 Estatísticas dos laudos:")
        for status, count in stats:
            print(f"  - {status}: {count} laudos")
        
        print("\n🎯 Laudos criados para testar o painel de aprovação:")
        print("  - 2 laudos 'em_andamento' (para Encarregado aprovar)")
        print("  - 1 laudo 'aprovado_manutencao' (para Vendedor aprovar)")
        print("  - 1 laudo 'aprovado_vendas' (para finalizar)")
        print("  - 1 laudo 'finalizado' (exemplo completo)")
        print("  - 1 laudo 'reprovado' (exemplo de reprovação)")
        
    except Exception as e:
        print(f"❌ Erro ao criar laudos de teste: {e}")
        conn.rollback()
    finally:
        conn.close()

def verify_test_data():
    """Verifica se os dados de teste estão corretos"""
    db_path = 'laudos.db'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("\n🔍 Verificando dados de teste...")
        
        # Verificar usuários
        cursor.execute('SELECT username, user_type FROM users ORDER BY username')
        users = cursor.fetchall()
        print(f"👥 Usuários disponíveis:")
        for username, user_type in users:
            print(f"  - {username}: {user_type}")
        
        # Verificar laudos
        cursor.execute('''
            SELECT l.id, l.cliente, l.status, u.username 
            FROM laudos l 
            JOIN users u ON l.user_id = u.id 
            ORDER BY l.created_at DESC
        ''')
        laudos = cursor.fetchall()
        
        print(f"\n📋 Laudos no sistema:")
        for laudo_id, cliente, status, username in laudos:
            print(f"  - #{laudo_id}: {cliente} ({status}) - Técnico: {username}")
        
        # Verificar fluxo de aprovação
        print(f"\n🔄 Fluxo de aprovação testável:")
        print("  1. Encarregado pode aprovar laudos 'em_andamento'")
        print("  2. Vendedor pode aprovar laudos 'aprovado_manutencao'")
        print("  3. Admin pode aprovar qualquer laudo")
        
    except Exception as e:
        print(f"❌ Erro ao verificar dados: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    print("🎯 Criação de Laudos de Teste - Sistema RSM")
    print("=" * 50)
    
    create_test_laudos()
    verify_test_data()
    
    print("\n🎉 Processo concluído!")
    print("\n📋 Para testar o painel de aprovação:")
    print("  1. Acesse: http://localhost:3000")
    print("  2. Faça login com diferentes usuários:")
    print("     - encarregado / 123456")
    print("     - vendedor / 123456")
    print("     - admin / 123456")
    print("  3. Acesse 'Aprovações' no menu lateral")
    print("  4. Teste o fluxo de aprovação") 