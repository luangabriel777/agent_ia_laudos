import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import SkeletonLoader from './SkeletonLoader';
import DataTable from './DataTable';
import Modal from './Modal';

const ExampleUsage = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dados de exemplo para a tabela
  const sampleData = [
    { id: 1, cliente: 'João Silva', equipamento: 'Bateria 60Ah', status: 'Finalizado', data: '2024-01-15' },
    { id: 2, cliente: 'Maria Santos', equipamento: 'Bateria 100Ah', status: 'Em Andamento', data: '2024-01-16' },
    { id: 3, cliente: 'Pedro Costa', equipamento: 'Bateria 45Ah', status: 'Pendente', data: '2024-01-17' },
    { id: 4, cliente: 'Ana Oliveira', equipamento: 'Bateria 75Ah', status: 'Finalizado', data: '2024-01-18' },
    { id: 5, cliente: 'Carlos Lima', equipamento: 'Bateria 90Ah', status: 'Em Andamento', data: '2024-01-19' },
  ];

  // Configuração das colunas da tabela
  const columns = [
    { key: 'id', label: 'ID', render: (value) => `#${value}` },
    { key: 'cliente', label: 'Cliente' },
    { key: 'equipamento', label: 'Equipamento' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`status-badge status-${value.toLowerCase().replace(' ', '-')}`}>
          {value}
        </span>
      )
    },
    { key: 'data', label: 'Data' },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, row) => (
        <div className="table-actions">
          <button className="btn-primary btn-sm">Ver</button>
          <button className="btn-secondary btn-sm">Editar</button>
        </div>
      )
    }
  ];

  const handleLoadingExample = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className="example-usage">
      <div className="example-section">
        <h2>Componentes Modernos - RSM v3.0</h2>
        <p>Exemplos de uso dos novos componentes implementados</p>
      </div>

      {/* Loading Spinner */}
      <div className="example-section">
        <h3>Loading Spinner</h3>
        <div className="example-grid">
          <div className="example-item">
            <h4>Pequeno</h4>
            <LoadingSpinner size="small" />
          </div>
          <div className="example-item">
            <h4>Médio</h4>
            <LoadingSpinner size="medium" />
          </div>
          <div className="example-item">
            <h4>Grande</h4>
            <LoadingSpinner size="large" />
          </div>
          <div className="example-item">
            <h4>Com Texto</h4>
            <LoadingSpinner size="medium" text="Carregando dados..." />
          </div>
        </div>
      </div>

      {/* Skeleton Loaders */}
      <div className="example-section">
        <h3>Skeleton Loaders</h3>
        <div className="example-grid">
          <div className="example-item">
            <h4>Card</h4>
            <SkeletonLoader type="card" lines={3} />
          </div>
          <div className="example-item">
            <h4>Lista</h4>
            <SkeletonLoader type="list" lines={4} />
          </div>
          <div className="example-item">
            <h4>Tabela</h4>
            <SkeletonLoader type="table" />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="example-section">
        <h3>Data Table Moderna</h3>
        <DataTable
          data={sampleData}
          columns={columns}
          loading={loading}
          searchable={true}
          sortable={true}
          pagination={true}
          itemsPerPage={3}
        />
        <div className="example-actions">
          <button 
            className="btn-primary"
            onClick={handleLoadingExample}
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Simular Loading'}
          </button>
        </div>
      </div>

      {/* Modal */}
      <div className="example-section">
        <h3>Modal Moderno</h3>
        <div className="example-actions">
          <button 
            className="btn-primary"
            onClick={() => setShowModal(true)}
          >
            Abrir Modal
          </button>
        </div>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Exemplo de Modal"
          size="medium"
        >
          <div className="modal-example-content">
            <p>Este é um exemplo de modal moderno com backdrop blur e animações suaves.</p>
            
            <div className="modal-features">
              <h4>Funcionalidades:</h4>
              <ul>
                <li>Backdrop blur</li>
                <li>Animações suaves</li>
                <li>Fechamento com ESC</li>
                <li>Fechamento com clique no backdrop</li>
                <li>Responsivo</li>
                <li>Acessível</li>
              </ul>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary"
                onClick={() => setShowModal(false)}
              >
                Confirmar
              </button>
            </div>
          </div>
        </Modal>
      </div>

      {/* Tema Escuro */}
      <div className="example-section">
        <h3>Suporte a Tema Escuro</h3>
        <p>O sistema suporta alternância automática entre tema claro e escuro. Use o toggle no header para testar.</p>
        
        <div className="theme-info">
          <div className="info-card">
            <h4>Tema Claro</h4>
            <p>Cores claras e contrastes suaves para ambientes bem iluminados</p>
          </div>
          <div className="info-card">
            <h4>Tema Escuro</h4>
            <p>Cores escuras e contrastes otimizados para ambientes com pouca luz</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleUsage; 