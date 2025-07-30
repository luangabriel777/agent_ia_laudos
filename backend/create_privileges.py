#!/usr/bin/env python3
"""
Script para gerenciar privilégios de técnicos
Permite que o Admin defina quais técnicos podem finalizar laudos
"""

import sqlite3
import os

def create_privileges_table():
    """Cria a tabela de privilégios se não existir"""
    db_path = 'laudos.db'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("🔄 Criando tabela de privilégios...")
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_privileges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                privilege_type TEXT NOT NULL,
                granted_by INTEGER NOT NULL,
                granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (granted_by) REFERENCES users (id)
            )
        ''')
        
        conn.commit()
        print("✅ Tabela de privilégios criada com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao criar tabela: {e}")
    finally:
        conn.close()

def grant_finalization_privilege(user_id, granted_by):
    """Concede privilégio de finalização a um usuário"""
    db_path = 'laudos.db'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Verificar se o usuário existe
        cursor.execute('SELECT username, user_type FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        if not user:
            print(f"❌ Usuário com ID {user_id} não encontrado")
            return False
        
        username, user_type = user
        
        if user_type != 'tecnico':
            print(f"❌ Usuário {username} não é técnico")
            return False
        
        # Verificar se já tem o privilégio
        cursor.execute('''
            SELECT id FROM user_privileges 
            WHERE user_id = ? AND privilege_type = 'finalize_laudos' AND is_active = TRUE
        ''', (user_id,))
        
        if cursor.fetchone():
            print(f"⚠️ Usuário {username} já possui privilégio de finalização")
            return True
        
        # Conceder privilégio
        cursor.execute('''
            INSERT INTO user_privileges (user_id, privilege_type, granted_by)
            VALUES (?, 'finalize_laudos', ?)
        ''', (user_id, granted_by))
        
        conn.commit()
        print(f"✅ Privilégio de finalização concedido ao técnico {username}")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao conceder privilégio: {e}")
        return False
    finally:
        conn.close()

def revoke_finalization_privilege(user_id, revoked_by):
    """Revoga privilégio de finalização de um usuário"""
    db_path = 'laudos.db'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Verificar se o usuário existe
        cursor.execute('SELECT username FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        if not user:
            print(f"❌ Usuário com ID {user_id} não encontrado")
            return False
        
        username = user[0]
        
        # Revogar privilégio
        cursor.execute('''
            UPDATE user_privileges 
            SET is_active = FALSE 
            WHERE user_id = ? AND privilege_type = 'finalize_laudos' AND is_active = TRUE
        ''', (user_id,))
        
        if cursor.rowcount > 0:
            conn.commit()
            print(f"✅ Privilégio de finalização revogado do técnico {username}")
            return True
        else:
            print(f"⚠️ Usuário {username} não possui privilégio de finalização ativo")
            return False
        
    except Exception as e:
        print(f"❌ Erro ao revogar privilégio: {e}")
        return False
    finally:
        conn.close()

def list_privileges():
    """Lista todos os privilégios ativos"""
    db_path = 'laudos.db'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT up.id, u.username, up.privilege_type, g.username as granted_by, up.granted_at
            FROM user_privileges up
            JOIN users u ON up.user_id = u.id
            JOIN users g ON up.granted_by = g.id
            WHERE up.is_active = TRUE
            ORDER BY up.granted_at DESC
        ''')
        
        privileges = cursor.fetchall()
        
        print(f"\n📋 Privilégios Ativos ({len(privileges)}):")
        for privilege_id, username, privilege_type, granted_by, granted_at in privileges:
            print(f"  - {username}: {privilege_type} (concedido por {granted_by} em {granted_at})")
        
        # Listar técnicos sem privilégios
        cursor.execute('''
            SELECT u.id, u.username 
            FROM users u 
            WHERE u.user_type = 'tecnico' 
            AND u.id NOT IN (
                SELECT user_id FROM user_privileges 
                WHERE privilege_type = 'finalize_laudos' AND is_active = TRUE
            )
        ''')
        
        techs_without_privileges = cursor.fetchall()
        
        print(f"\n🔒 Técnicos sem privilégio de finalização ({len(techs_without_privileges)}):")
        for user_id, username in techs_without_privileges:
            print(f"  - {username} (ID: {user_id})")
        
    except Exception as e:
        print(f"❌ Erro ao listar privilégios: {e}")
    finally:
        conn.close()

def setup_initial_privileges():
    """Configura privilégios iniciais para demonstração"""
    db_path = 'laudos.db'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Buscar admin e técnico
        cursor.execute('SELECT id FROM users WHERE username = "admin"')
        admin = cursor.fetchone()
        
        cursor.execute('SELECT id FROM users WHERE username = "tecnico"')
        tecnico = cursor.fetchone()
        
        if admin and tecnico:
            admin_id = admin[0]
            tecnico_id = tecnico[0]
            
            # Conceder privilégio ao técnico
            if grant_finalization_privilege(tecnico_id, admin_id):
                print("✅ Privilégio inicial configurado com sucesso!")
            else:
                print("❌ Erro ao configurar privilégio inicial")
        else:
            print("❌ Usuários admin ou técnico não encontrados")
        
    except Exception as e:
        print(f"❌ Erro ao configurar privilégios iniciais: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    print("🎯 Sistema de Privilégios - RSM")
    print("=" * 50)
    
    create_privileges_table()
    setup_initial_privileges()
    list_privileges()
    
    print("\n🎉 Configuração concluída!")
    print("\n📋 Comandos disponíveis:")
    print("  - grant_finalization_privilege(user_id, admin_id)")
    print("  - revoke_finalization_privilege(user_id, admin_id)")
    print("  - list_privileges()") 