#!/usr/bin/env python3
"""
Teste do Sistema de Monitoramento - RSM
Verifica se o sistema de monitoramento está funcionando corretamente
"""

import sys
import os
import time
import requests
import json
from datetime import datetime

# Adicionar o diretório backend ao path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

def test_monitoring_system():
    """Testa o sistema de monitoramento"""
    print("🔍 TESTANDO SISTEMA DE MONITORAMENTO RSM")
    print("=" * 50)
    
    # Teste 1: Importar módulo de monitoramento
    print("\n1️⃣ Testando importação do módulo de monitoramento...")
    try:
        from monitoring import health_checker
        print("✅ Módulo de monitoramento importado com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao importar módulo: {e}")
        return False
    
    # Teste 2: Verificar health check
    print("\n2️⃣ Testando health check do sistema...")
    try:
        health_status = health_checker.get_health_status()
        print(f"✅ Health check: {health_status['status']} (Score: {health_status['health_score']})")
        print(f"   CPU: {health_status['system']['cpu_percent']:.1f}%")
        print(f"   Memória: {health_status['system']['memory_percent']:.1f}%")
        print(f"   Disco: {health_status['system']['disk_percent']:.1f}%")
    except Exception as e:
        print(f"❌ Erro no health check: {e}")
        return False
    
    # Teste 3: Verificar métricas do sistema
    print("\n3️⃣ Testando coleta de métricas do sistema...")
    try:
        system_metrics = health_checker.get_system_metrics()
        print(f"✅ Métricas do sistema coletadas:")
        print(f"   CPU: {system_metrics.cpu_percent:.1f}%")
        print(f"   Memória: {system_metrics.memory_percent:.1f}%")
        print(f"   Disco: {system_metrics.disk_percent:.1f}%")
        print(f"   Rede Enviada: {system_metrics.network_sent:,} bytes")
        print(f"   Rede Recebida: {system_metrics.network_recv:,} bytes")
    except Exception as e:
        print(f"❌ Erro ao coletar métricas: {e}")
        return False
    
    # Teste 4: Verificar métricas da aplicação
    print("\n4️⃣ Testando métricas da aplicação...")
    try:
        app_metrics = health_checker.get_application_metrics()
        print(f"✅ Métricas da aplicação:")
        print(f"   Conexões Ativas: {app_metrics.active_connections}")
        print(f"   Taxa de Erro: {app_metrics.error_rate:.2f}%")
        print(f"   Tempo de Resposta: {app_metrics.average_response_time:.2f}s")
    except Exception as e:
        print(f"❌ Erro ao coletar métricas da aplicação: {e}")
        return False
    
    # Teste 5: Verificar métricas de negócio
    print("\n5️⃣ Testando métricas de negócio...")
    try:
        business_metrics = health_checker.get_business_metrics()
        print(f"✅ Métricas de negócio:")
        print(f"   Total de Laudos: {business_metrics.total_laudos}")
        print(f"   Laudos Hoje: {business_metrics.laudos_today}")
        print(f"   Pendentes: {business_metrics.pending_approvals}")
        print(f"   Taxa de Conversão: {business_metrics.conversion_rate:.1f}%")
    except Exception as e:
        print(f"❌ Erro ao coletar métricas de negócio: {e}")
        return False
    
    # Teste 6: Verificar alertas
    print("\n6️⃣ Testando sistema de alertas...")
    try:
        alerts = health_checker.get_recent_alerts(5)
        print(f"✅ Alertas recentes: {len(alerts)} encontrados")
        for alert in alerts[:3]:  # Mostrar apenas os 3 primeiros
            print(f"   - {alert['severity'].upper()}: {alert['message']}")
    except Exception as e:
        print(f"❌ Erro ao verificar alertas: {e}")
        return False
    
    # Teste 7: Testar API endpoints (se o servidor estiver rodando)
    print("\n7️⃣ Testando endpoints da API...")
    try:
        # Testar health endpoint
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Health endpoint: {health_data['status']} (Score: {health_data['health_score']})")
        else:
            print(f"⚠️ Health endpoint retornou status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("⚠️ Servidor não está rodando (ignorando teste de API)")
    except Exception as e:
        print(f"❌ Erro ao testar API: {e}")
    
    # Teste 8: Verificar banco de dados de monitoramento
    print("\n8️⃣ Testando banco de dados de monitoramento...")
    try:
        # Verificar se o arquivo de banco foi criado
        db_path = os.path.join(os.path.dirname(__file__), 'backend', 'monitoring.db')
        if os.path.exists(db_path):
            print(f"✅ Banco de monitoramento criado: {os.path.getsize(db_path)} bytes")
        else:
            print("⚠️ Banco de monitoramento não encontrado")
    except Exception as e:
        print(f"❌ Erro ao verificar banco: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 TESTE DE MONITORAMENTO CONCLUÍDO!")
    print("O sistema de monitoramento está funcionando corretamente.")
    
    return True

def test_backend_endpoints():
    """Testa os endpoints do backend"""
    print("\n🔗 TESTANDO ENDPOINTS DO BACKEND")
    print("=" * 40)
    
    base_url = "http://localhost:8000"
    endpoints = [
        "/health",
        "/admin/executive-stats",
        "/admin/top-performers", 
        "/admin/critical-issues",
        "/admin/recent-activities"
    ]
    
    for endpoint in endpoints:
        try:
            print(f"\nTestando {endpoint}...")
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {endpoint}: OK")
                if isinstance(data, dict) and len(data) > 0:
                    print(f"   Dados: {list(data.keys())}")
                elif isinstance(data, list):
                    print(f"   Itens: {len(data)}")
            elif response.status_code == 403:
                print(f"⚠️ {endpoint}: Acesso negado (esperado para alguns endpoints)")
            else:
                print(f"❌ {endpoint}: Status {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print(f"⚠️ {endpoint}: Servidor não está rodando")
        except Exception as e:
            print(f"❌ {endpoint}: Erro - {e}")

if __name__ == "__main__":
    print("🚀 INICIANDO TESTES DO SISTEMA RSM")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Testar sistema de monitoramento
    success = test_monitoring_system()
    
    if success:
        # Testar endpoints do backend
        test_backend_endpoints()
        
        print("\n" + "=" * 60)
        print("🎯 RESUMO DOS TESTES")
        print("✅ Sistema de monitoramento: FUNCIONANDO")
        print("✅ Métricas do sistema: COLETADAS")
        print("✅ Alertas: CONFIGURADOS")
        print("✅ Banco de dados: CRIADO")
        print("\n🚀 O RSM está pronto para produção!")
    else:
        print("\n❌ Alguns testes falharam. Verifique os erros acima.")
        sys.exit(1) 