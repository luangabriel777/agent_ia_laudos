#!/usr/bin/env python3
"""
Script para verificar e popular o banco de dados com dados de teste
"""

import sqlite3
import json
from datetime import datetime, timedelta

def check_and_populate_db():
    """Verifica o banco e cria dados de teste se necessário"""
    conn = sqlite3.connect('laudos.db')
    cursor = conn.cursor()
    
    try:
        # Verificar se há laudos
        cursor.execute('SELECT COUNT(*) FROM laudos')
        laudos_count = cursor.fetchone()[0]
        print(f"📊 Laudos no banco: {laudos_count}")
        
        if laudos_count == 0:
            print("🔄 Criando dados de teste...")
            
            # Criar alguns laudos de teste
            test_laudos = [
                {
                    'user_id': 1,
                    'cliente': 'Empresa ABC Ltda',
                    'equipamento': 'Bateria Automotiva 60Ah',
                    'diagnostico': 'Bateria com baixa voltagem e sulfatação nas placas',
                    'solucao': 'Realizada carga lenta e limpeza dos terminais',
                    'status': 'finalizado',
                    'created_at': (datetime.now() - timedelta(days=2)).isoformat()
                },
                {
                    'user_id': 1,
                    'cliente': 'João Silva',
                    'equipamento': 'Bateria Motocicleta 12Ah',
                    'diagnostico': 'Bateria descarregada por falta de uso',
                    'solucao': 'Carga completa e teste de funcionamento',
                    'status': 'aprovado',
                    'created_at': (datetime.now() - timedelta(days=1)).isoformat()
                },
                {
                    'user_id': 1,
                    'cliente': 'Maria Santos',
                    'equipamento': 'Bateria Industrial 200Ah',
                    'diagnostico': 'Verificação de manutenção preventiva',
                    'solucao': 'Inspeção completa e limpeza do sistema',
                    'status': 'pendente',
                    'created_at': datetime.now().isoformat()
                }
            ]
            
            for laudo in test_laudos:
                cursor.execute('''
                    INSERT INTO laudos (user_id, cliente, equipamento, diagnostico, solucao, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    laudo['user_id'],
                    laudo['cliente'],
                    laudo['equipamento'],
                    laudo['diagnostico'],
                    laudo['solucao'],
                    laudo['status'],
                    laudo['created_at']
                ))
            
            # Criar algumas notificações de teste
            test_notifications = [
                {
                    'user_id': 1,
                    'type': 'laudo_novo',
                    'message': 'Novo laudo criado para Empresa ABC Ltda',
                    'created_at': datetime.now().isoformat(),
                    'read': 0
                },
                {
                    'user_id': 1,
                    'type': 'status_change',
                    'message': 'Laudo #2 aprovado com sucesso',
                    'created_at': (datetime.now() - timedelta(hours=2)).isoformat(),
                    'read': 0
                }
            ]
            
            for notification in test_notifications:
                cursor.execute('''
                    INSERT INTO notifications (user_id, type, message, created_at, read)
                    VALUES (?, ?, ?, ?, ?)
                ''', (
                    notification['user_id'],
                    notification['type'],
                    notification['message'],
                    notification['created_at'],
                    notification['read']
                ))
            
            conn.commit()
            print("✅ Dados de teste criados com sucesso!")
            
            # Verificar novamente
            cursor.execute('SELECT COUNT(*) FROM laudos')
            new_count = cursor.fetchone()[0]
            print(f"📊 Total de laudos após criação: {new_count}")
            
        else:
            print("✅ Banco já possui dados")
            
        # Mostrar alguns laudos
        cursor.execute('SELECT id, cliente, status, created_at FROM laudos ORDER BY created_at DESC LIMIT 5')
        laudos = cursor.fetchall()
        print("\n📋 Últimos laudos:")
        for laudo in laudos:
            print(f"  ID: {laudo[0]} | Cliente: {laudo[1]} | Status: {laudo[2]} | Data: {laudo[3]}")
            
    except Exception as e:
        print(f"❌ Erro: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    check_and_populate_db() 