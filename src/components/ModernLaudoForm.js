import React, { useState, useRef } from 'react';
import '../ModernLaudoForm.css';

const ModernLaudoForm = ({ userInfo, onClose }) => {
  const [formData, setFormData] = useState({
    cliente: '',
    equipamento: '',
    diagnostico: '',
    solucao: '',
    tecnico: userInfo?.username || '',
    dataInspecao: new Date().toISOString().split('T')[0],
    numeroSerie: '',
    modelo: '',
    marca: '',
    tensao: '',
    capacidade: '',
    idadeEquipamento: '',
    condicaoGeral: '',
    problemaReportado: '',
    testeRealizados: '',
    pecasSubstituidas: '',
    recomendacoes: '',
    observacoes: '',
    garantia: '',
    proximaManutencao: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/laudos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('✅ Laudo técnico criado com sucesso!');
        onClose();
      } else {
        throw new Error('Erro ao criar laudo');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('❌ Erro ao criar laudo técnico');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderProgressBar = () => (
    <div className="progress-container">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${(step / totalSteps) * 100}%` }}
        ></div>
      </div>
      <div className="progress-steps">
        {[1, 2, 3, 4].map(num => (
          <div 
            key={num}
            className={`progress-step ${step >= num ? 'active' : ''}`}
          >
            {num}
          </div>
        ))}
      </div>
      <div className="progress-labels">
        <span className={step === 1 ? 'active' : ''}>Dados Básicos</span>
        <span className={step === 2 ? 'active' : ''}>Equipamento</span>
        <span className={step === 3 ? 'active' : ''}>Diagnóstico</span>
        <span className={step === 4 ? 'active' : ''}>Conclusão</span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="form-step">
      <h3>📋 Dados Básicos do Laudo</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="cliente">Cliente *</label>
          <input
            type="text"
            id="cliente"
            name="cliente"
            value={formData.cliente}
            onChange={handleInputChange}
            placeholder="Nome ou empresa do cliente"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="dataInspecao">Data da Inspeção</label>
          <input
            type="date"
            id="dataInspecao"
            name="dataInspecao"
            value={formData.dataInspecao}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="tecnico">Técnico Responsável</label>
          <input
            type="text"
            id="tecnico"
            name="tecnico"
            value={formData.tecnico}
            onChange={handleInputChange}
            placeholder="Nome do técnico"
          />
        </div>
        <div className="form-group">
          <label htmlFor="problemaReportado">Problema Reportado *</label>
          <textarea
            id="problemaReportado"
            name="problemaReportado"
            value={formData.problemaReportado}
            onChange={handleInputChange}
            placeholder="Descreva o problema reportado pelo cliente"
            rows="3"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h3>🔋 Informações do Equipamento</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="equipamento">Tipo de Equipamento *</label>
          <select
            id="equipamento"
            name="equipamento"
            value={formData.equipamento}
            onChange={handleInputChange}
            required
          >
            <option value="">Selecione o tipo</option>
            <option value="Bateria Automotiva">Bateria Automotiva</option>
            <option value="Bateria Estacionária">Bateria Estacionária</option>
            <option value="Bateria Tracionária">Bateria Tracionária</option>
            <option value="Sistema Solar">Sistema Solar</option>
            <option value="Inversor/UPS">Inversor/UPS</option>
            <option value="Carregador">Carregador de Bateria</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="marca">Marca</label>
          <input
            type="text"
            id="marca"
            name="marca"
            value={formData.marca}
            onChange={handleInputChange}
            placeholder="Marca do equipamento"
          />
        </div>
        <div className="form-group">
          <label htmlFor="modelo">Modelo</label>
          <input
            type="text"
            id="modelo"
            name="modelo"
            value={formData.modelo}
            onChange={handleInputChange}
            placeholder="Modelo específico"
          />
        </div>
        <div className="form-group">
          <label htmlFor="numeroSerie">Número de Série</label>
          <input
            type="text"
            id="numeroSerie"
            name="numeroSerie"
            value={formData.numeroSerie}
            onChange={handleInputChange}
            placeholder="Número de série"
          />
        </div>
        <div className="form-group">
          <label htmlFor="tensao">Tensão (V)</label>
          <select
            id="tensao"
            name="tensao"
            value={formData.tensao}
            onChange={handleInputChange}
          >
            <option value="">Selecione</option>
            <option value="6V">6V</option>
            <option value="12V">12V</option>
            <option value="24V">24V</option>
            <option value="48V">48V</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="capacidade">Capacidade (Ah)</label>
          <input
            type="text"
            id="capacidade"
            name="capacidade"
            value={formData.capacidade}
            onChange={handleInputChange}
            placeholder="Ex: 60Ah, 100Ah"
          />
        </div>
        <div className="form-group">
          <label htmlFor="idadeEquipamento">Idade do Equipamento</label>
          <select
            id="idadeEquipamento"
            name="idadeEquipamento"
            value={formData.idadeEquipamento}
            onChange={handleInputChange}
          >
            <option value="">Selecione</option>
            <option value="Novo (0-6 meses)">Novo (0-6 meses)</option>
            <option value="Recente (6 meses - 1 ano)">Recente (6 meses - 1 ano)</option>
            <option value="Usado (1-3 anos)">Usado (1-3 anos)</option>
            <option value="Antigo (3+ anos)">Antigo (3+ anos)</option>
            <option value="Desconhecido">Desconhecido</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="condicaoGeral">Condição Geral</label>
          <select
            id="condicaoGeral"
            name="condicaoGeral"
            value={formData.condicaoGeral}
            onChange={handleInputChange}
          >
            <option value="">Selecione</option>
            <option value="Excelente">Excelente</option>
            <option value="Boa">Boa</option>
            <option value="Regular">Regular</option>
            <option value="Ruim">Ruim</option>
            <option value="Crítica">Crítica</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h3>🔍 Diagnóstico e Testes</h3>
      <div className="form-grid">
        <div className="form-group full-width">
          <label htmlFor="diagnostico">Diagnóstico Técnico *</label>
          <textarea
            id="diagnostico"
            name="diagnostico"
            value={formData.diagnostico}
            onChange={handleInputChange}
            placeholder="Descrição detalhada do diagnóstico técnico"
            rows="4"
            required
          />
        </div>
        <div className="form-group full-width">
          <label htmlFor="testeRealizados">Testes Realizados</label>
          <textarea
            id="testeRealizados"
            name="testeRealizados"
            value={formData.testeRealizados}
            onChange={handleInputChange}
            placeholder="Descreva os testes realizados (voltagem, amperagem, resistência, etc.)"
            rows="3"
          />
        </div>
        <div className="form-group full-width">
          <label htmlFor="pecasSubstituidas">Peças Substituídas</label>
          <textarea
            id="pecasSubstituidas"
            name="pecasSubstituidas"
            value={formData.pecasSubstituidas}
            onChange={handleInputChange}
            placeholder="Liste as peças que foram ou precisam ser substituídas"
            rows="2"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="form-step">
      <h3>✅ Solução e Recomendações</h3>
      <div className="form-grid">
        <div className="form-group full-width">
          <label htmlFor="solucao">Solução Aplicada *</label>
          <textarea
            id="solucao"
            name="solucao"
            value={formData.solucao}
            onChange={handleInputChange}
            placeholder="Descreva a solução aplicada ou recomendada"
            rows="4"
            required
          />
        </div>
        <div className="form-group full-width">
          <label htmlFor="recomendacoes">Recomendações</label>
          <textarea
            id="recomendacoes"
            name="recomendacoes"
            value={formData.recomendacoes}
            onChange={handleInputChange}
            placeholder="Recomendações para manutenção preventiva ou cuidados"
            rows="3"
          />
        </div>
        <div className="form-group">
          <label htmlFor="garantia">Garantia</label>
          <select
            id="garantia"
            name="garantia"
            value={formData.garantia}
            onChange={handleInputChange}
          >
            <option value="">Selecione</option>
            <option value="3 meses">3 meses</option>
            <option value="6 meses">6 meses</option>
            <option value="12 meses">12 meses</option>
            <option value="24 meses">24 meses</option>
            <option value="Sem garantia">Sem garantia</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="proximaManutencao">Próxima Manutenção</label>
          <input
            type="date"
            id="proximaManutencao"
            name="proximaManutencao"
            value={formData.proximaManutencao}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group full-width">
          <label htmlFor="observacoes">Observações Adicionais</label>
          <textarea
            id="observacoes"
            name="observacoes"
            value={formData.observacoes}
            onChange={handleInputChange}
            placeholder="Informações adicionais relevantes"
            rows="3"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="modern-laudo-form-overlay">
      <div className="modern-laudo-form">
        <div className="form-header">
          <div className="header-content">
            <h2>🔋 Novo Laudo Técnico RSM</h2>
            <button 
              className="close-btn"
              onClick={onClose}
              type="button"
            >
              ✖️
            </button>
          </div>
          {renderProgressBar()}
        </div>

        <form onSubmit={handleSubmit} className="form-content">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          <div className="form-actions">
            {step > 1 && (
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={prevStep}
              >
                ← Anterior
              </button>
            )}
            
            {step < totalSteps ? (
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={nextStep}
              >
                Próximo →
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={isSubmitting}
              >
                {isSubmitting ? '⏳ Salvando...' : '✅ Criar Laudo'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModernLaudoForm; 