#!/usr/bin/env python3
"""
Configuração da OpenAI para ART-Laudo-Técnico-Pro
==================================================

INSTRUÇÕES PARA CONFIGURAR:

1. Obtenha sua chave da OpenAI:
   - Acesse: https://platform.openai.com/api-keys
   - Faça login na sua conta OpenAI
   - Clique em "Create new secret key"
   - Copie a chave gerada

2. Configure a chave de uma das formas abaixo:

OPÇÃO A - Variável de Ambiente (Windows):
   set OPENAI_API_KEY=sk-sua-chave-aqui
   
OPÇÃO B - PowerShell:
   $env:OPENAI_API_KEY="sk-sua-chave-aqui"
   
OPÇÃO C - Editar este arquivo:
   Substitua None pela sua chave na linha abaixo

"""

import os

# CONFIGURAÇÃO DA CHAVE OPENAI
# Substitua None pela sua chave entre aspas, ex: "sk-sua-chave-aqui"
OPENAI_API_KEY = None

def get_openai_key():
    """Retorna a chave da OpenAI configurada"""
    # Primeiro tenta variável de ambiente
    env_key = os.getenv("OPENAI_API_KEY")
    if env_key:
        return env_key
    
    # Depois tenta a configuração local
    if OPENAI_API_KEY:
        return OPENAI_API_KEY
    
    return None

def is_openai_configured():
    """Verifica se a OpenAI está configurada"""
    return get_openai_key() is not None

def get_status():
    """Retorna o status da configuração"""
    key = get_openai_key()
    if key:
        return f"✅ OpenAI configurada (chave: {key[:7]}...{key[-4:]})"
    else:
        return "❌ OpenAI não configurada - usando simulação"

if __name__ == "__main__":
    print("🔑 Status da Configuração OpenAI")
    print("=" * 40)
    print(get_status())
    
    if not is_openai_configured():
        print("\n📋 Para configurar:")
        print("1. Obtenha sua chave em: https://platform.openai.com/api-keys")
        print("2. Execute: $env:OPENAI_API_KEY=\"sk-sua-chave-aqui\"")
        print("3. Ou edite este arquivo e defina OPENAI_API_KEY")
        print("4. Reinicie o servidor backend") 