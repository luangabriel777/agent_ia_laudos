#!/usr/bin/env python3
"""
Script de teste para verificar se a aplicação está pronta para deploy no Railway
"""

import os
import sys
import subprocess
import requests
import time
from pathlib import Path

def test_requirements():
    """Testa se todas as dependências estão corretas"""
    print("🔍 Testando requirements.txt...")
    
    try:
        with open("backend/requirements.txt", "r") as f:
            requirements = f.read()
        
        # Verificar se as dependências principais estão presentes
        required_packages = [
            "fastapi",
            "uvicorn",
            "python-dotenv",
            "python-jose",
            "python-multipart",
            "pydantic",
            "openai",
            "requests",
            "reportlab",
            "psutil"
        ]
        
        missing_packages = []
        for package in required_packages:
            if package not in requirements:
                missing_packages.append(package)
        
        if missing_packages:
            print(f"❌ Pacotes faltando: {missing_packages}")
            return False
        else:
            print("✅ Requirements.txt está correto")
            return True
            
    except FileNotFoundError:
        print("❌ Arquivo requirements.txt não encontrado")
        return False

def test_python_version():
    """Testa se a versão do Python está correta"""
    print("🔍 Testando versão do Python...")
    
    try:
        with open("backend/runtime.txt", "r") as f:
            runtime = f.read().strip()
        
        if "python-3.11" in runtime:
            print("✅ Versão do Python 3.11 configurada")
            return True
        else:
            print(f"❌ Versão incorreta: {runtime}")
            return False
            
    except FileNotFoundError:
        print("❌ Arquivo runtime.txt não encontrado")
        return False

def test_config_files():
    """Testa se os arquivos de configuração estão presentes"""
    print("🔍 Testando arquivos de configuração...")
    
    required_files = [
        "nixpacks.toml",
        "railway.json",
        ".dockerignore",
        "backend/app.py",
        "backend/database.py",
        "backend/requirements.txt"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print(f"❌ Arquivos faltando: {missing_files}")
        return False
    else:
        print("✅ Todos os arquivos de configuração estão presentes")
        return True

def test_nixpacks_config():
    """Testa se o nixpacks.toml está configurado corretamente"""
    print("🔍 Testando configuração do Nixpacks...")
    
    try:
        with open("nixpacks.toml", "r") as f:
            config = f.read()
        
        required_sections = [
            "[phases.setup]",
            "[phases.install]",
            "[start]"
        ]
        
        missing_sections = []
        for section in required_sections:
            if section not in config:
                missing_sections.append(section)
        
        if missing_sections:
            print(f"❌ Seções faltando no nixpacks.toml: {missing_sections}")
            return False
        else:
            print("✅ Nixpacks.toml está configurado corretamente")
            return True
            
    except FileNotFoundError:
        print("❌ Arquivo nixpacks.toml não encontrado")
        return False

def test_health_endpoint():
    """Testa se o endpoint de health check está presente"""
    print("🔍 Testando endpoint de health check...")
    
    try:
        with open("backend/app.py", "r", encoding="utf-8") as f:
            app_content = f.read()
        
        if "@app.get(\"/health\")" in app_content:
            print("✅ Endpoint /health encontrado")
            return True
        else:
            print("❌ Endpoint /health não encontrado")
            return False
            
    except FileNotFoundError:
        print("❌ Arquivo app.py não encontrado")
        return False

def test_environment_variables():
    """Testa se as variáveis de ambiente estão configuradas corretamente"""
    print("🔍 Testando configuração de variáveis de ambiente...")
    
    try:
        with open("backend/env.production.example", "r") as f:
            env_content = f.read()
        
        required_vars = [
            "ENVIRONMENT=production",
            "SECRET_KEY=",
            "ACCESS_TOKEN_EXPIRE_MINUTES=",
            "FRONTEND_URL=",
            "CORS_ORIGINS="
        ]
        
        missing_vars = []
        for var in required_vars:
            if var not in env_content:
                missing_vars.append(var)
        
        if missing_vars:
            print(f"❌ Variáveis faltando: {missing_vars}")
            return False
        else:
            print("✅ Variáveis de ambiente configuradas")
            return True
            
    except FileNotFoundError:
        print("❌ Arquivo env.production.example não encontrado")
        return False

def test_database_connection():
    """Testa se a conexão com o banco de dados funciona"""
    print("🔍 Testando conexão com banco de dados...")
    
    try:
        # Adicionar o diretório backend ao path
        sys.path.insert(0, "backend")
        
        from database import init_database, get_db_connection
        
        # Inicializar banco
        init_database()
        
        # Testar conexão
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        conn.close()
        
        if result and result[0] == 1:
            print("✅ Conexão com banco de dados funcionando")
            return True
        else:
            print("❌ Falha na conexão com banco de dados")
            return False
            
    except Exception as e:
        print(f"❌ Erro na conexão com banco: {str(e)}")
        return False

def main():
    """Executa todos os testes"""
    print("🚀 Iniciando testes para deploy no Railway...\n")
    
    tests = [
        test_requirements,
        test_python_version,
        test_config_files,
        test_nixpacks_config,
        test_health_endpoint,
        test_environment_variables,
        test_database_connection
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Erro no teste {test.__name__}: {str(e)}")
        print()
    
    print("=" * 50)
    print(f"📊 Resultado dos testes: {passed}/{total} passaram")
    
    if passed == total:
        print("🎉 Todos os testes passaram! A aplicação está pronta para deploy.")
        print("\n📋 Próximos passos:")
        print("1. Commit e push das alterações")
        print("2. Conectar repositório ao Railway")
        print("3. Configurar variáveis de ambiente")
        print("4. Fazer deploy")
        return True
    else:
        print("⚠️  Alguns testes falharam. Corrija os problemas antes do deploy.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 