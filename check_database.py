#!/usr/bin/env python3
"""
Script para verificar o banco de dados
"""

import sqlite3
import os

def check_database():
    """Verifica o banco de dados"""
    
    db_path = 'backend/laudos.db'
    
    if not os.path.exists(db_path):
        print(f"❌ Banco de dados não encontrado: {db_path}")
        return
    
    print(f"✅ Banco de dados encontrado: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar tabelas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        
        print(f"\n📋 Tabelas encontradas ({len(tables)}):")
        for table in tables:
            print(f"  - {table[0]}")
        
        # Verificar estrutura da tabela users
        if ('users',) in tables:
            print(f"\n👥 Estrutura da tabela users:")
            cursor.execute("PRAGMA table_info(users)")
            columns = cursor.fetchall()
            for col in columns:
                print(f"  - {col[1]} ({col[2]})")
            
            # Verificar usuários
            cursor.execute("SELECT id, username, user_type, created_at FROM users")
            users = cursor.fetchall()
            
            print(f"\n👤 Usuários encontrados ({len(users)}):")
            for user in users:
                print(f"  - ID: {user[0]}, Nome: {user[1]}, Tipo: {user[2]}, Criado: {user[3]}")
        
        # Verificar estrutura da tabela laudos
        if ('laudos',) in tables:
            print(f"\n📋 Estrutura da tabela laudos:")
            cursor.execute("PRAGMA table_info(laudos)")
            columns = cursor.fetchall()
            for col in columns:
                print(f"  - {col[1]} ({col[2]})")
            
            # Verificar laudos
            cursor.execute("SELECT id, cliente, status, created_at FROM laudos LIMIT 5")
            laudos = cursor.fetchall()
            
            print(f"\n📄 Laudos encontrados ({len(laudos)}):")
            for laudo in laudos:
                print(f"  - ID: {laudo[0]}, Cliente: {laudo[1]}, Status: {laudo[2]}, Criado: {laudo[3]}")
        
        # Verificar estrutura da tabela user_privileges
        if ('user_privileges',) in tables:
            print(f"\n🔐 Estrutura da tabela user_privileges:")
            cursor.execute("PRAGMA table_info(user_privileges)")
            columns = cursor.fetchall()
            for col in columns:
                print(f"  - {col[1]} ({col[2]})")
            
            # Verificar privilégios
            cursor.execute("SELECT user_id, privilege_type, is_active FROM user_privileges")
            privileges = cursor.fetchall()
            
            print(f"\n🔑 Privilégios encontrados ({len(privileges)}):")
            for priv in privileges:
                print(f"  - User ID: {priv[0]}, Tipo: {priv[1]}, Ativo: {priv[2]}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro ao verificar banco: {e}")

if __name__ == "__main__":
    check_database() 