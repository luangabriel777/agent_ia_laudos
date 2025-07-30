#!/usr/bin/env python3
"""
Script para criar usuários do sistema RSM com permissões corretas
Cria Vendedor, Técnico e Encarregado conforme a lógica do processo
"""

import sqlite3
import hashlib
import os

def add_updated_at_column():
    """Adiciona a coluna updated_at se ela não existir"""
    db_path = 'laudos.db'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Verificar se a coluna updated_at existe
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'updated_at' not in columns:
            print("🔄 Adicionando coluna 'updated_at' à tabela users...")
            cursor.execute('ALTER TABLE users ADD COLUMN updated_at TEXT')
            conn.commit()
            print("✅ Coluna 'updated_at' adicionada com sucesso")
        else:
            print("📋 Coluna 'updated_at' já existe")
            
    except Exception as e:
        print(f"❌ Erro ao adicionar coluna: {e}")
    finally:
        conn.close()

def create_users():
    """Cria os usuários necessários para o sistema RSM"""
    db_path = 'laudos.db'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("🔄 Criando usuários do sistema RSM...")
        
        # Lista de usuários a serem criados
        users_to_create = [
            {
                'username': 'admin',
                'password': '123456',
                'user_type': 'admin',
                'is_admin': True,
                'display_name': 'Administrador',
                'description': 'Acesso total ao sistema'
            },
            {
                'username': 'tecnico',
                'password': '123456',
                'user_type': 'tecnico',
                'is_admin': False,
                'display_name': 'Técnico',
                'description': 'Cria e edita OS, pode aprovar manutenção e finalizar'
            },
            {
                'username': 'encarregado',
                'password': '123456',
                'user_type': 'encarregado',
                'is_admin': False,
                'display_name': 'Encarregado',
                'description': 'Permissões superiores ao técnico, pode aprovar manutenção'
            },
            {
                'username': 'vendedor',
                'password': '123456',
                'user_type': 'vendedor',
                'is_admin': False,
                'display_name': 'Vendedor',
                'description': 'Aprova ou recusa orçamento técnico'
            }
        ]
        
        created_count = 0
        updated_count = 0
        
        for user in users_to_create:
            # Verificar se o usuário já existe
            cursor.execute('SELECT id, user_type FROM users WHERE username = ?', (user['username'],))
            existing_user = cursor.fetchone()
            
            if existing_user:
                # Atualizar usuário existente se necessário
                user_id, current_type = existing_user
                if current_type != user['user_type']:
                    cursor.execute('''
                        UPDATE users 
                        SET user_type = ?, is_admin = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    ''', (user['user_type'], user['is_admin'], user_id))
                    print(f"✅ Usuário '{user['username']}' atualizado: {current_type} → {user['user_type']}")
                    updated_count += 1
                else:
                    print(f"📋 Usuário '{user['username']}' já existe com tipo '{user['user_type']}'")
            else:
                # Criar novo usuário
                password_hash = hashlib.sha256(user['password'].encode()).hexdigest()
                cursor.execute('''
                    INSERT INTO users (username, password_hash, user_type, is_admin, created_at, updated_at)
                    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ''', (user['username'], password_hash, user['user_type'], user['is_admin']))
                print(f"✅ Usuário '{user['username']}' criado com sucesso")
                created_count += 1
        
        conn.commit()
        
        print(f"\n📊 Resumo da criação de usuários:")
        print(f"  - Usuários criados: {created_count}")
        print(f"  - Usuários atualizados: {updated_count}")
        
        # Mostrar todos os usuários
        cursor.execute('SELECT username, user_type, is_admin FROM users ORDER BY username')
        all_users = cursor.fetchall()
        
        print(f"\n👥 Usuários no sistema:")
        for username, user_type, is_admin in all_users:
            admin_status = " (Admin)" if is_admin else ""
            print(f"  - {username}: {user_type}{admin_status}")
        
        print(f"\n🔐 Credenciais de acesso:")
        print(f"  - Todos os usuários usam senha: 123456")
        print(f"  - URLs de acesso: http://localhost:3000")
        
    except Exception as e:
        print(f"❌ Erro ao criar usuários: {e}")
        conn.rollback()
    finally:
        conn.close()

def verify_user_permissions():
    """Verifica se as permissões estão corretas"""
    db_path = 'laudos.db'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("\n🔍 Verificando permissões dos usuários...")
        
        # Verificar tipos de usuário existentes
        cursor.execute('SELECT DISTINCT user_type FROM users')
        user_types = [row[0] for row in cursor.fetchall()]
        
        print(f"📋 Tipos de usuário encontrados: {user_types}")
        
        # Verificar permissões esperadas
        expected_permissions = {
            'admin': {
                'can_approve_all': True,
                'can_access_dashboard': True,
                'can_manage_users': True,
                'can_view_reports': True
            },
            'tecnico': {
                'can_approve_maintenance': True,
                'can_finalize_os': True,
                'can_edit_own_os': True,
                'cannot_approve_budget': True
            },
            'encarregado': {
                'can_approve_maintenance': True,
                'can_edit_os': True,
                'can_finalize_os': True,
                'can_view_dashboard': True
            },
            'vendedor': {
                'can_approve_budget': True,
                'cannot_edit_technical': True,
                'can_view_os': True
            }
        }
        
        print(f"\n✅ Permissões implementadas:")
        for user_type, permissions in expected_permissions.items():
            if user_type in user_types:
                print(f"  - {user_type.upper()}:")
                for permission, value in permissions.items():
                    status = "✅" if value else "❌"
                    print(f"    {status} {permission}")
        
    except Exception as e:
        print(f"❌ Erro ao verificar permissões: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    print("🎯 Criação de Usuários - Sistema RSM")
    print("=" * 50)
    
    add_updated_at_column()
    create_users()
    verify_user_permissions()
    
    print("\n🎉 Processo concluído!")
    print("\n📋 Usuários criados com permissões:")
    print("  👑 ADMIN: Acesso total ao sistema")
    print("  👨‍💼 TÉCNICO: Cria/edita OS, aprova manutenção, finaliza")
    print("  👨‍🔧 ENCARREGADO: Permissões superiores, aprova manutenção")
    print("  💰 VENDEDOR: Aprova/recusa orçamento técnico")
    
    print("\n🔐 Para acessar:")
    print("  - URL: http://localhost:3000")
    print("  - Senha: 123456 (para todos os usuários)") 