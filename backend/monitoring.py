"""
Sistema de Monitoramento Avançado - RSM
Monitoramento de performance, alertas e health checks
"""

import time
import psutil
import sqlite3
import logging
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from pathlib import Path
import json

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class SystemMetrics:
    """Métricas do sistema"""
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    network_sent: int
    network_recv: int
    timestamp: datetime

@dataclass
class ApplicationMetrics:
    """Métricas da aplicação"""
    active_connections: int
    requests_per_minute: int
    average_response_time: float
    error_rate: float
    database_connections: int
    timestamp: datetime

@dataclass
class BusinessMetrics:
    """Métricas de negócio"""
    total_laudos: int
    laudos_today: int
    pending_approvals: int
    active_users: int
    conversion_rate: float
    timestamp: datetime

class RSMHealthCheck:
    """Sistema de health check para o RSM"""
    
    def __init__(self):
        self.db_path = Path(__file__).parent / "monitoring.db"
        self.init_monitoring_db()
        self.metrics_history: List[Dict[str, Any]] = []
        self.alerts: List[Dict[str, Any]] = []
        self.is_monitoring = False
        
    def init_monitoring_db(self):
        """Inicializa banco de dados de monitoramento"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabela de métricas do sistema
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS system_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cpu_percent REAL,
                memory_percent REAL,
                disk_percent REAL,
                network_sent INTEGER,
                network_recv INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Tabela de métricas da aplicação
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS app_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                active_connections INTEGER,
                requests_per_minute INTEGER,
                average_response_time REAL,
                error_rate REAL,
                database_connections INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Tabela de métricas de negócio
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS business_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                total_laudos INTEGER,
                laudos_today INTEGER,
                pending_approvals INTEGER,
                active_users INTEGER,
                conversion_rate REAL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Tabela de alertas
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_type TEXT NOT NULL,
                severity TEXT NOT NULL,
                message TEXT NOT NULL,
                is_resolved BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def get_system_metrics(self) -> SystemMetrics:
        """Coleta métricas do sistema"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            network = psutil.net_io_counters()
            
            return SystemMetrics(
                cpu_percent=cpu_percent,
                memory_percent=memory.percent,
                disk_percent=disk.percent,
                network_sent=network.bytes_sent,
                network_recv=network.bytes_recv,
                timestamp=datetime.now()
            )
        except Exception as e:
            logger.error(f"Erro ao coletar métricas do sistema: {e}")
            return SystemMetrics(0, 0, 0, 0, 0, datetime.now())
    
    def get_application_metrics(self) -> ApplicationMetrics:
        """Coleta métricas da aplicação"""
        try:
            # Simular métricas da aplicação (em produção, seria coletado do FastAPI)
            active_connections = len(psutil.net_connections())
            requests_per_minute = 0  # Seria coletado do middleware
            average_response_time = 0.15  # Seria calculado
            error_rate = 0.02  # Seria calculado
            database_connections = 1  # Seria verificado
            
            return ApplicationMetrics(
                active_connections=active_connections,
                requests_per_minute=requests_per_minute,
                average_response_time=average_response_time,
                error_rate=error_rate,
                database_connections=database_connections,
                timestamp=datetime.now()
            )
        except Exception as e:
            logger.error(f"Erro ao coletar métricas da aplicação: {e}")
            return ApplicationMetrics(0, 0, 0, 0, 0, datetime.now())
    
    def get_business_metrics(self) -> BusinessMetrics:
        """Coleta métricas de negócio"""
        try:
            from database import get_db_connection
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Total de laudos
            cursor.execute('SELECT COUNT(*) FROM laudos')
            total_laudos = cursor.fetchone()[0]
            
            # Laudos hoje
            today = datetime.now().strftime('%Y-%m-%d')
            cursor.execute('SELECT COUNT(*) FROM laudos WHERE DATE(created_at) = ?', (today,))
            laudos_today = cursor.fetchone()[0]
            
            # Pendentes de aprovação
            cursor.execute('SELECT COUNT(*) FROM laudos WHERE status = "em_andamento"')
            pending_approvals = cursor.fetchone()[0]
            
            # Usuários ativos (últimas 24h)
            yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S')
            cursor.execute('SELECT COUNT(DISTINCT user_id) FROM laudos WHERE created_at > ?', (yesterday,))
            active_users = cursor.fetchone()[0]
            
            # Taxa de conversão (aprovados / total)
            cursor.execute('SELECT COUNT(*) FROM laudos WHERE status IN ("aprovado_manutencao", "aprovado_vendas")')
            approved = cursor.fetchone()[0]
            conversion_rate = (approved / total_laudos * 100) if total_laudos > 0 else 0
            
            conn.close()
            
            return BusinessMetrics(
                total_laudos=total_laudos,
                laudos_today=laudos_today,
                pending_approvals=pending_approvals,
                active_users=active_users,
                conversion_rate=conversion_rate,
                timestamp=datetime.now()
            )
        except Exception as e:
            logger.error(f"Erro ao coletar métricas de negócio: {e}")
            return BusinessMetrics(0, 0, 0, 0, 0, datetime.now())
    
    def save_metrics(self, system_metrics: SystemMetrics, app_metrics: ApplicationMetrics, business_metrics: BusinessMetrics):
        """Salva métricas no banco de dados"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Salvar métricas do sistema
            cursor.execute('''
                INSERT INTO system_metrics (cpu_percent, memory_percent, disk_percent, network_sent, network_recv, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (system_metrics.cpu_percent, system_metrics.memory_percent, system_metrics.disk_percent,
                  system_metrics.network_sent, system_metrics.network_recv, system_metrics.timestamp))
            
            # Salvar métricas da aplicação
            cursor.execute('''
                INSERT INTO app_metrics (active_connections, requests_per_minute, average_response_time, error_rate, database_connections, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (app_metrics.active_connections, app_metrics.requests_per_minute, app_metrics.average_response_time,
                  app_metrics.error_rate, app_metrics.database_connections, app_metrics.timestamp))
            
            # Salvar métricas de negócio
            cursor.execute('''
                INSERT INTO business_metrics (total_laudos, laudos_today, pending_approvals, active_users, conversion_rate, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (business_metrics.total_laudos, business_metrics.laudos_today, business_metrics.pending_approvals,
                  business_metrics.active_users, business_metrics.conversion_rate, business_metrics.timestamp))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Erro ao salvar métricas: {e}")
    
    def check_alerts(self, system_metrics: SystemMetrics, app_metrics: ApplicationMetrics, business_metrics: BusinessMetrics):
        """Verifica e cria alertas baseados nas métricas"""
        alerts = []
        
        # Alertas do sistema
        if system_metrics.cpu_percent > 80:
            alerts.append({
                'type': 'system',
                'severity': 'warning',
                'message': f'CPU usage alto: {system_metrics.cpu_percent:.1f}%'
            })
        
        if system_metrics.memory_percent > 85:
            alerts.append({
                'type': 'system',
                'severity': 'critical',
                'message': f'Memória crítica: {system_metrics.memory_percent:.1f}%'
            })
        
        if system_metrics.disk_percent > 90:
            alerts.append({
                'type': 'system',
                'severity': 'critical',
                'message': f'Disco quase cheio: {system_metrics.disk_percent:.1f}%'
            })
        
        # Alertas da aplicação
        if app_metrics.error_rate > 5:
            alerts.append({
                'type': 'application',
                'severity': 'warning',
                'message': f'Taxa de erro alta: {app_metrics.error_rate:.1f}%'
            })
        
        if app_metrics.average_response_time > 2.0:
            alerts.append({
                'type': 'application',
                'severity': 'warning',
                'message': f'Tempo de resposta lento: {app_metrics.average_response_time:.2f}s'
            })
        
        # Alertas de negócio
        if business_metrics.conversion_rate < 70:
            alerts.append({
                'type': 'business',
                'severity': 'warning',
                'message': f'Taxa de conversão baixa: {business_metrics.conversion_rate:.1f}%'
            })
        
        if business_metrics.pending_approvals > 50:
            alerts.append({
                'type': 'business',
                'severity': 'info',
                'message': f'Muitos laudos pendentes: {business_metrics.pending_approvals}'
            })
        
        # Salvar alertas
        if alerts:
            self.save_alerts(alerts)
    
    def save_alerts(self, alerts: List[Dict[str, Any]]):
        """Salva alertas no banco de dados"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            for alert in alerts:
                cursor.execute('''
                    INSERT INTO alerts (alert_type, severity, message, created_at)
                    VALUES (?, ?, ?, ?)
                ''', (alert['type'], alert['severity'], alert['message'], datetime.now()))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Erro ao salvar alertas: {e}")
    
    def get_health_status(self) -> Dict[str, Any]:
        """Retorna status geral de saúde do sistema"""
        try:
            system_metrics = self.get_system_metrics()
            app_metrics = self.get_application_metrics()
            business_metrics = self.get_business_metrics()
            
            # Calcular score de saúde (0-100)
            health_score = 100
            
            # Penalizar por métricas ruins
            if system_metrics.cpu_percent > 80:
                health_score -= 10
            if system_metrics.memory_percent > 85:
                health_score -= 15
            if app_metrics.error_rate > 5:
                health_score -= 10
            if business_metrics.conversion_rate < 70:
                health_score -= 5
            
            health_score = max(0, health_score)
            
            # Determinar status
            if health_score >= 90:
                status = 'healthy'
                status_color = 'green'
            elif health_score >= 70:
                status = 'warning'
                status_color = 'yellow'
            else:
                status = 'critical'
                status_color = 'red'
            
            return {
                'status': status,
                'status_color': status_color,
                'health_score': health_score,
                'timestamp': datetime.now().isoformat(),
                'system': {
                    'cpu_percent': system_metrics.cpu_percent,
                    'memory_percent': system_metrics.memory_percent,
                    'disk_percent': system_metrics.disk_percent
                },
                'application': {
                    'active_connections': app_metrics.active_connections,
                    'error_rate': app_metrics.error_rate,
                    'average_response_time': app_metrics.average_response_time
                },
                'business': {
                    'total_laudos': business_metrics.total_laudos,
                    'laudos_today': business_metrics.laudos_today,
                    'conversion_rate': business_metrics.conversion_rate
                }
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter status de saúde: {e}")
            return {
                'status': 'error',
                'status_color': 'red',
                'health_score': 0,
                'timestamp': datetime.now().isoformat(),
                'error': str(e)
            }
    
    def get_recent_alerts(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Retorna alertas recentes"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT alert_type, severity, message, created_at, is_resolved
                FROM alerts
                ORDER BY created_at DESC
                LIMIT ?
            ''', (limit,))
            
            alerts = []
            for row in cursor.fetchall():
                alerts.append({
                    'type': row[0],
                    'severity': row[1],
                    'message': row[2],
                    'created_at': row[3],
                    'is_resolved': bool(row[4])
                })
            
            conn.close()
            return alerts
            
        except Exception as e:
            logger.error(f"Erro ao obter alertas: {e}")
            return []
    
    def start_monitoring(self, interval: int = 60):
        """Inicia monitoramento contínuo"""
        if self.is_monitoring:
            return
        
        self.is_monitoring = True
        
        def monitor_loop():
            while self.is_monitoring:
                try:
                    # Coletar métricas
                    system_metrics = self.get_system_metrics()
                    app_metrics = self.get_application_metrics()
                    business_metrics = self.get_business_metrics()
                    
                    # Salvar métricas
                    self.save_metrics(system_metrics, app_metrics, business_metrics)
                    
                    # Verificar alertas
                    self.check_alerts(system_metrics, app_metrics, business_metrics)
                    
                    logger.info(f"Monitoramento: CPU {system_metrics.cpu_percent:.1f}%, "
                              f"Memória {system_metrics.memory_percent:.1f}%, "
                              f"Laudos hoje: {business_metrics.laudos_today}")
                    
                except Exception as e:
                    logger.error(f"Erro no loop de monitoramento: {e}")
                
                time.sleep(interval)
        
        # Iniciar thread de monitoramento
        monitor_thread = threading.Thread(target=monitor_loop, daemon=True)
        monitor_thread.start()
        
        logger.info(f"Monitoramento iniciado com intervalo de {interval} segundos")
    
    def stop_monitoring(self):
        """Para o monitoramento"""
        self.is_monitoring = False
        logger.info("Monitoramento parado")

# Instância global do monitoramento
health_checker = RSMHealthCheck() 