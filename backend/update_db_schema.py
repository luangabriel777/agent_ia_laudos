#!/usr/bin/env python3
"""
Script para atualizar o esquema do banco de dados
Adiciona suporte para laudos avançados com múltiplas baterias e notificações
"""

import sqlite3
import os

def update_database_schema():
    """Atualiza o esquema do banco de dados para suportar laudos avançados e notificações"""
    db_path = 'laudos.db'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # ✅ CORREÇÃO: Criar tabela de notificações
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                read BOOLEAN DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        print("✅ Tabela 'notifications' criada/verificada com sucesso")
        
        # Criar índices para melhor performance
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
            ON notifications (user_id)
        ''')
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
            ON notifications (created_at)
        ''')
        print("✅ Índices de notificações criados/verificados")
        
        # Verificar se as colunas já existem na tabela laudos
        cursor.execute("PRAGMA table_info(laudos)")
        columns = [column[1] for column in cursor.fetchall()]
        
        print("Colunas atuais na tabela 'laudos':", columns)
        
        # Adicionar novas colunas se não existirem
        new_columns = [
            ('tipo', 'TEXT DEFAULT "simples"'),
            ('nomeCliente', 'TEXT'),
            ('baterias', 'TEXT'),  # JSON das baterias
            ('tecnicoResponsavel', 'TEXT'),
            ('manutencaoPreventiva', 'TEXT'),  # JSON dos itens de manutenção preventiva
            ('manutencaoCorretiva', 'TEXT'),   # JSON dos itens de manutenção corretiva
            ('conclusaoFinal', 'TEXT'),
            ('numeroTotalBaterias', 'INTEGER DEFAULT 0'),
            ('updated_at', 'DATETIME')
        ]
        
        for column_name, column_type in new_columns:
            if column_name not in columns:
                try:
                    cursor.execute(f'ALTER TABLE laudos ADD COLUMN {column_name} {column_type}')
                    print(f"✅ Coluna '{column_name}' adicionada com sucesso")
                except sqlite3.OperationalError as e:
                    print(f"⚠️ Erro ao adicionar coluna '{column_name}': {e}")
            else:
                print(f"📋 Coluna '{column_name}' já existe")
        
        # Verificar novamente as colunas
        cursor.execute("PRAGMA table_info(laudos)")
        columns_after = [column[1] for column in cursor.fetchall()]
        print("\nColunas após atualização:", columns_after)
        
        conn.commit()
        print("\n✅ Esquema do banco de dados atualizado com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao atualizar esquema: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("🔄 Iniciando atualização do esquema do banco de dados...")
    update_database_schema()
    print("🎉 Atualização concluída!") 