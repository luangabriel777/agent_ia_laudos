#!/usr/bin/env python3
"""
Script para adicionar colunas de tags ao banco de dados RSM
"""

import sqlite3
import os
from datetime import datetime

def update_tags_schema():
    print("🔄 Atualizando esquema do banco de dados para suporte a tags...")
    
    db_path = "backend/laudos.db"
    
    if not os.path.exists(db_path):
        print(f"❌ Banco de dados não encontrado: {db_path}")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar se a tabela laudos existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='laudos'")
        if not cursor.fetchone():
            print("❌ Tabela 'laudos' não encontrada!")
            return
        
        # Verificar colunas existentes
        cursor.execute("PRAGMA table_info(laudos)")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"📋 Colunas existentes: {columns}")
        
        # Colunas de tags a serem adicionadas
        tag_columns = [
            ('tag', 'TEXT'),
            ('tag_description', 'TEXT'),
            ('tag_updated_at', 'TIMESTAMP'),
            ('tag_updated_by', 'TEXT')
        ]
        
        # Adicionar colunas se não existirem
        for column_name, column_type in tag_columns:
            if column_name not in columns:
                try:
                    cursor.execute(f"ALTER TABLE laudos ADD COLUMN {column_name} {column_type}")
                    print(f"✅ Coluna '{column_name}' adicionada com sucesso!")
                except sqlite3.OperationalError as e:
                    print(f"⚠️ Erro ao adicionar coluna '{column_name}': {e}")
            else:
                print(f"ℹ️ Coluna '{column_name}' já existe")
        
        # Verificar colunas após atualização
        cursor.execute("PRAGMA table_info(laudos)")
        updated_columns = [column[1] for column in cursor.fetchall()]
        print(f"📋 Colunas após atualização: {updated_columns}")
        
        # Criar índice para tags se não existir
        try:
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_laudos_tag ON laudos(tag)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_laudos_tag_updated_at ON laudos(tag_updated_at)")
            print("✅ Índices de tags criados/verificados")
        except sqlite3.OperationalError as e:
            print(f"⚠️ Erro ao criar índices: {e}")
        
        conn.commit()
        print("✅ Esquema atualizado com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao atualizar esquema: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    update_tags_schema() 