#!/usr/bin/env python3
"""
Script Interativo para Configurar OpenAI
========================================
"""

import os
import sys

def print_header():
    print("🔑 Configurador de OpenAI - ART-Laudo-Técnico-Pro")
    print("=" * 55)
    print()

def check_current_status():
    """Verifica o status atual da configuração"""
    sys.path.insert(0, './backend')
    try:
        from config_openai import get_status, is_openai_configured
        print("📊 Status Atual:")
        print(f"   {get_status()}")
        print()
        return is_openai_configured()
    except ImportError:
        print("❌ Erro: Não foi possível importar a configuração")
        return False

def get_openai_instructions():
    """Mostra instruções para obter a chave"""
    print("📋 Como obter sua chave da OpenAI:")
    print("   1. Acesse: https://platform.openai.com/api-keys")
    print("   2. Faça login na sua conta OpenAI")
    print("   3. Clique em 'Create new secret key'")
    print("   4. Dê um nome para a chave (ex: 'ART-Laudo-Pro')")
    print("   5. Copie a chave gerada (começa com 'sk-')")
    print()

def configure_environment_variable():
    """Configura via variável de ambiente"""
    print("🔧 Configuração via Variável de Ambiente")
    print("-" * 45)
    
    key = input("Cole sua chave da OpenAI aqui: ").strip()
    
    if not key:
        print("❌ Chave não fornecida!")
        return False
    
    if not key.startswith('sk-'):
        print("⚠️  Aviso: A chave não parece válida (deve começar com 'sk-')")
        continue_anyway = input("Continuar mesmo assim? (y/N): ").lower().strip()
        if continue_anyway != 'y':
            return False
    
    print("\n🔄 Configurando...")
    
    # Para Windows
    try:
        os.environ['OPENAI_API_KEY'] = key
        print("✅ Chave configurada na sessão atual!")
        print()
        print("📝 Para tornar permanente, execute no PowerShell:")
        print(f'   [System.Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "{key}", "User")')
        print()
        print("🔄 Ou adicione ao seu profile do PowerShell:")
        print(f'   $env:OPENAI_API_KEY="{key}"')
        return True
    except Exception as e:
        print(f"❌ Erro ao configurar: {e}")
        return False

def configure_file():
    """Configura editando o arquivo diretamente"""
    print("📝 Configuração via Arquivo")
    print("-" * 30)
    
    key = input("Cole sua chave da OpenAI aqui: ").strip()
    
    if not key:
        print("❌ Chave não fornecida!")
        return False
    
    if not key.startswith('sk-'):
        print("⚠️  Aviso: A chave não parece válida (deve começar com 'sk-')")
        continue_anyway = input("Continuar mesmo assim? (y/N): ").lower().strip()
        if continue_anyway != 'y':
            return False
    
    config_file = './backend/config_openai.py'
    
    try:
        # Ler arquivo atual
        with open(config_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Substituir a linha da chave
        new_content = content.replace(
            'OPENAI_API_KEY = None',
            f'OPENAI_API_KEY = "{key}"'
        )
        
        # Escrever arquivo modificado
        with open(config_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print("✅ Chave salva no arquivo de configuração!")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao salvar: {e}")
        return False

def test_configuration():
    """Testa a configuração"""
    print("🧪 Testando configuração...")
    
    try:
        # Recarregar o módulo
        if 'config_openai' in sys.modules:
            del sys.modules['config_openai']
        
        from backend.config_openai import get_status, is_openai_configured
        
        print(f"   {get_status()}")
        
        if is_openai_configured():
            print("✅ Configuração válida!")
            print("\n🚀 Próximos passos:")
            print("   1. Reinicie o servidor backend")
            print("   2. Teste a gravação de áudio no frontend")
            print("   3. Verifique se os campos são preenchidos automaticamente")
            return True
        else:
            print("❌ Configuração não detectada")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao testar: {e}")
        return False

def main():
    print_header()
    
    # Verificar status atual
    is_configured = check_current_status()
    
    if is_configured:
        print("✅ OpenAI já está configurada!")
        reconfigure = input("Deseja reconfigurar? (y/N): ").lower().strip()
        if reconfigure != 'y':
            print("👋 Saindo...")
            return
    
    # Mostrar instruções
    get_openai_instructions()
    
    # Escolher método de configuração
    print("⚙️  Métodos de Configuração:")
    print("   1. Variável de Ambiente (temporária)")
    print("   2. Arquivo de Configuração (permanente)")
    print("   3. Cancelar")
    
    choice = input("\nEscolha uma opção (1-3): ").strip()
    
    success = False
    
    if choice == '1':
        success = configure_environment_variable()
    elif choice == '2':
        success = configure_file()
    elif choice == '3':
        print("👋 Cancelado pelo usuário")
        return
    else:
        print("❌ Opção inválida!")
        return
    
    if success:
        print("\n" + "="*50)
        test_configuration()
    else:
        print("❌ Configuração falhou!")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Configuração cancelada pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}") 