import React, { useState, useRef } from 'react';
import '../ModernLaudoForm.css';

const FormularioLaudoAvancado = ({ userInfo, onClose }) => {
  const [formData, setFormData] = useState({
    // A. Identificação do Cliente
    nomeCliente: '',
    data: new Date().toISOString().split('T')[0],
    
    // Múltiplas baterias
    baterias: [
      {
        id: 1,
        // B.1 Dados da Bateria
        numeroIdentificacao: '',
        tensaoNominal: '',
        modeloTipo: '',
        numeroSerie: '',
        fabricante: '',
        tipoValvula: '',
        capacidadeNominal8h: '',
        numeroElementos: 6,
        dataFabricacao: '',
        tipoPolo: '',
        tipoAtividade: '',
        
        // B.2 Avaliação Inicial (até 12 elementos)
        avaliacaoElementos: Array.from({length: 12}, (_, i) => ({
          numero: i + 1,
          densidade: '',
          tensao: ''
        })),
        
        // B.3 Tensão Total
        tensaoTotal: '',
        
        // B.4 Temperatura
        temperatura: '',
        
        // B.5 Situação Atual
        situacaoAtual: [
          { componente: 'Caixa', estado: '', acoes: [] },
          { componente: 'Cabos', estado: '', acoes: [] },
          { componente: 'Interligação', estado: '', acoes: [] },
          { componente: 'Tomada', estado: '', acoes: [] },
          { componente: 'Válvulas', estado: '', acoes: [] },
          { componente: 'Terminais', estado: '', acoes: [] },
          { componente: 'Elementos', estado: '', acoes: [] },
          { componente: 'Limpeza', estado: '', acoes: [] },
          { componente: 'Nível de Água', estado: '', acoes: [] },
          { componente: 'Contatos', estado: '', acoes: [] }
        ],
        
        // B.6 Evidências Fotográficas
        fotosAntes: [],
        fotosDepois: [],
        
        // B.7-9 Textos
        observacoes: '',
        conclusao: '',
        sugestao: ''
      }
    ],
    
    // D. Técnico Responsável
    tecnicoResponsavel: userInfo?.username || '',
    
    // E. Manutenção Preventiva
    manutencaoPreventiva: [],
    
    // F. Manutenção Corretiva Realizada
    manutencaoCorretiva: [],
    
    // G. Conclusão Final
    conclusaoFinal: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [currentBateria, setCurrentBateria] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const fileInputAfterRef = useRef(null);

  // Opções para selects
  const opcoesEstado = [
    '', 'Excelente', 'Bom', 'Regular', 'Precisa Atenção', 'Ruim', 'Crítico'
  ];

  const opcoesAcoes = [
    'Substituição', 'Reparo', 'Limpeza', 'Ajuste', 'Outros'
  ];

  const opcoesValvula = [
    '', 'Automática', 'Manual', 'Fliptop', 'Rosqueável'
  ];

  const opcoesPolo = [
    '', 'Parafuso', 'Cone', 'Lateral', 'Superior'
  ];

  const opcoesAtividade = [
    '', 'Manutenção Preventiva', 'Manutenção Corretiva', 'Inspeção', 'Teste', 'Outros'
  ];

  // ✅ CORREÇÃO: Função para adicionar item de manutenção
  const addManutencaoItem = (tipo) => {
    const newItem = {
      id: Date.now(),
      descricao: '',
      observacoes: ''
    };

    if (tipo === 'preventiva') {
      setFormData(prev => ({
        ...prev,
        manutencaoPreventiva: [...prev.manutencaoPreventiva, newItem]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        manutencaoCorretiva: [...prev.manutencaoCorretiva, newItem]
      }));
    }
  };

  // ✅ CORREÇÃO: Função para remover item de manutenção
  const removeManutencaoItem = (tipo, index) => {
    if (tipo === 'preventiva') {
      setFormData(prev => ({
        ...prev,
        manutencaoPreventiva: prev.manutencaoPreventiva.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        manutencaoCorretiva: prev.manutencaoCorretiva.filter((_, i) => i !== index)
      }));
    }
  };

  // ✅ CORREÇÃO: Função para atualizar item de manutenção
  const updateManutencaoItem = (tipo, index, field, value) => {
    if (tipo === 'preventiva') {
      setFormData(prev => ({
        ...prev,
        manutencaoPreventiva: prev.manutencaoPreventiva.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        manutencaoCorretiva: prev.manutencaoCorretiva.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }));
    }
  };

  const handleInputChange = (e, bateriaIndex = null, elementoIndex = null, situacaoIndex = null) => {
    const { name, value } = e.target;
    
    if (bateriaIndex !== null) {
      setFormData(prev => ({
        ...prev,
        baterias: prev.baterias.map((bateria, index) => {
          if (index === bateriaIndex) {
            if (elementoIndex !== null) {
              // Atualizar elemento específico
              return {
                ...bateria,
                avaliacaoElementos: bateria.avaliacaoElementos.map((elemento, elemIndex) => 
                  elemIndex === elementoIndex ? { ...elemento, [name]: value } : elemento
                )
              };
            } else if (situacaoIndex !== null) {
              // Atualizar situação específica
              return {
                ...bateria,
                situacaoAtual: bateria.situacaoAtual.map((situacao, sitIndex) => 
                  sitIndex === situacaoIndex ? { ...situacao, [name]: value } : situacao
                )
              };
            } else {
              // Atualizar dados gerais da bateria
              return { ...bateria, [name]: value };
            }
          }
          return bateria;
        })
      }));
    } else {
      // Atualizar dados gerais do formulário
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addBateria = () => {
    const newBateria = {
      id: Date.now(),
      numeroIdentificacao: '',
      tensaoNominal: '',
      modeloTipo: '',
      numeroSerie: '',
      fabricante: '',
      tipoValvula: '',
      capacidadeNominal8h: '',
      numeroElementos: 6,
      dataFabricacao: '',
      tipoPolo: '',
      tipoAtividade: '',
      avaliacaoElementos: Array.from({length: 12}, (_, i) => ({
        numero: i + 1,
        densidade: '',
        tensao: ''
      })),
      tensaoTotal: '',
      temperatura: '',
      situacaoAtual: [
        { componente: 'Caixa', estado: '', acoes: [] },
        { componente: 'Cabos', estado: '', acoes: [] },
        { componente: 'Interligação', estado: '', acoes: [] },
        { componente: 'Tomada', estado: '', acoes: [] },
        { componente: 'Válvulas', estado: '', acoes: [] },
        { componente: 'Terminais', estado: '', acoes: [] },
        { componente: 'Elementos', estado: '', acoes: [] },
        { componente: 'Limpeza', estado: '', acoes: [] },
        { componente: 'Nível de Água', estado: '', acoes: [] },
        { componente: 'Contatos', estado: '', acoes: [] }
      ],
      fotosAntes: [],
      fotosDepois: [],
      observacoes: '',
      conclusao: '',
      sugestao: ''
    };

    setFormData(prev => ({
      ...prev,
      baterias: [...prev.baterias, newBateria]
    }));
  };

  const removeBateria = (index) => {
    if (formData.baterias.length > 1) {
      setFormData(prev => ({
        ...prev,
        baterias: prev.baterias.filter((_, i) => i !== index)
      }));
      if (currentBateria >= index && currentBateria > 0) {
        setCurrentBateria(currentBateria - 1);
      }
    }
  };

  const handleFileUpload = (e, bateriaIndex, tipo) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      url: URL.createObjectURL(file)
    }));

    setFormData(prev => ({
      ...prev,
      baterias: prev.baterias.map((bateria, index) => {
        if (index === bateriaIndex) {
          return {
            ...bateria,
            [tipo]: [...bateria[tipo], ...newPhotos]
          };
        }
        return bateria;
      })
    }));
  };

  const removePhoto = (bateriaIndex, tipo, photoIndex) => {
    setFormData(prev => ({
      ...prev,
      baterias: prev.baterias.map((bateria, index) => {
        if (index === bateriaIndex) {
          const updatedPhotos = bateria[tipo].filter((_, i) => i !== photoIndex);
          return { ...bateria, [tipo]: updatedPhotos };
        }
        return bateria;
      })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      // Preparar dados para envio
      const submitData = {
        ...formData,
        tipo: 'avancado',
        status: 'pendente'
      };

      const response = await fetch('/laudos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('✅ Laudo avançado criado com sucesso!');
        onClose();
        
        // Disparar evento para atualizar a lista de laudos
        window.dispatchEvent(new CustomEvent('laudo-created', { 
          detail: { laudoId: result.id } 
        }));
      } else {
        const errorData = await response.json();
        alert(`❌ Erro ao criar laudo: ${errorData.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao criar laudo:', error);
      alert('❌ Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderProgressBar = () => (
    <div className="progress-container">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${(currentStep / 5) * 100}%` }}
        ></div>
      </div>
      <div className="progress-steps">
        {[1, 2, 3, 4, 5].map(step => (
          <div 
            key={step} 
            className={`progress-step ${currentStep >= step ? 'active' : ''}`}
          >
            {step}
          </div>
        ))}
      </div>
      <div className="progress-labels">
        <span className={currentStep === 1 ? 'active' : ''}>Cliente</span>
        <span className={currentStep === 2 ? 'active' : ''}>Baterias</span>
        <span className={currentStep === 3 ? 'active' : ''}>Evidências</span>
        <span className={currentStep === 4 ? 'active' : ''}>Manutenção</span>
        <span className={currentStep === 5 ? 'active' : ''}>Conclusão</span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="form-step">
      <h3>👤 Identificação do Cliente</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="nomeCliente">Nome do Cliente *</label>
          <input
            type="text"
            id="nomeCliente"
            name="nomeCliente"
            value={formData.nomeCliente}
            onChange={handleInputChange}
            placeholder="Digite o nome completo do cliente"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="data">Data da Inspeção *</label>
          <input
            type="date"
            id="data"
            name="data"
            value={formData.data}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="tecnicoResponsavel">Técnico Responsável *</label>
          <input
            type="text"
            id="tecnicoResponsavel"
            name="tecnicoResponsavel"
            value={formData.tecnicoResponsavel}
            onChange={handleInputChange}
            placeholder="Nome do técnico"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const bateria = formData.baterias[currentBateria];
    
    return (
      <div className="form-step">
        <div className="bateria-header">
          <h3>🔋 Bateria {currentBateria + 1} de {formData.baterias.length}</h3>
          <div className="bateria-controls">
            {formData.baterias.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeBateria(currentBateria)}
                className="btn-danger-small"
              >
                🗑️ Remover
              </button>
            )}
            <button 
              type="button" 
              onClick={addBateria}
              className="btn-primary-small"
            >
              ➕ Adicionar Bateria
            </button>
          </div>
        </div>

        {/* Navegação entre baterias */}
        {formData.baterias.length > 1 && (
          <div className="bateria-navigation">
            {formData.baterias.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`bateria-tab ${currentBateria === index ? 'active' : ''}`}
                onClick={() => setCurrentBateria(index)}
              >
                Bateria {index + 1}
              </button>
            ))}
          </div>
        )}

        {/* Dados da Bateria */}
        <div className="bateria-section">
          <h4>📋 Dados da Bateria</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Número de Identificação</label>
              <input
                type="text"
                name="numeroIdentificacao"
                value={bateria.numeroIdentificacao || ''}
                onChange={(e) => handleInputChange(e, currentBateria)}
                placeholder="Ex: BAT001"
              />
            </div>
            <div className="form-group">
              <label>Tensão Nominal</label>
              <select
                name="tensaoNominal"
                value={bateria.tensaoNominal || ''}
                onChange={(e) => handleInputChange(e, currentBateria)}
              >
                <option value="">Selecione</option>
                <option value="6V">6V</option>
                <option value="12V">12V</option>
                <option value="24V">24V</option>
                <option value="48V">48V</option>
              </select>
            </div>
            <div className="form-group">
              <label>Modelo/Bateria Tipo</label>
              <input
                type="text"
                name="modeloTipo"
                value={bateria.modeloTipo || ''}
                onChange={(e) => handleInputChange(e, currentBateria)}
                placeholder="Ex: Moura Clean"
              />
            </div>
            <div className="form-group">
              <label>Número de Série</label>
              <input
                type="text"
                name="numeroSerie"
                value={bateria.numeroSerie || ''}
                onChange={(e) => handleInputChange(e, currentBateria)}
                placeholder="Ex: MX123456789"
              />
            </div>
            <div className="form-group">
              <label>Fabricante</label>
              <input
                type="text"
                name="fabricante"
                value={bateria.fabricante || ''}
                onChange={(e) => handleInputChange(e, currentBateria)}
                placeholder="Ex: Moura"
              />
            </div>
            <div className="form-group">
              <label>Tipo de Válvula</label>
              <select
                name="tipoValvula"
                value={bateria.tipoValvula || ''}
                onChange={(e) => handleInputChange(e, currentBateria)}
              >
                {opcoesValvula.map(opcao => (
                  <option key={opcao} value={opcao}>{opcao}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Capacidade Nominal (8h)</label>
              <input
                type="text"
                name="capacidadeNominal8h"
                value={bateria.capacidadeNominal8h || ''}
                onChange={(e) => handleInputChange(e, currentBateria)}
                placeholder="Ex: 100Ah"
              />
            </div>
            <div className="form-group">
              <label>Número de Elementos</label>
              <select
                name="numeroElementos"
                value={bateria.numeroElementos || 6}
                onChange={(e) => handleInputChange(e, currentBateria)}
              >
                {Array.from({length: 12}, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Data de Fabricação</label>
              <input
                type="date"
                name="dataFabricacao"
                value={bateria.dataFabricacao || ''}
                onChange={(e) => handleInputChange(e, currentBateria)}
              />
            </div>
            <div className="form-group">
              <label>Tipo de Polo</label>
              <select
                name="tipoPolo"
                value={bateria.tipoPolo || ''}
                onChange={(e) => handleInputChange(e, currentBateria)}
              >
                {opcoesPolo.map(opcao => (
                  <option key={opcao} value={opcao}>{opcao}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tipo de Atividade</label>
              <select
                name="tipoAtividade"
                value={bateria.tipoAtividade || ''}
                onChange={(e) => handleInputChange(e, currentBateria)}
              >
                {opcoesAtividade.map(opcao => (
                  <option key={opcao} value={opcao}>{opcao}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Avaliação dos Elementos */}
        <div className="bateria-section">
          <h4>🔍 Avaliação dos Elementos</h4>
          <div className="elementos-grid">
            {bateria.avaliacaoElementos.slice(0, bateria.numeroElementos).map((elemento, index) => (
              <div key={elemento.numero} className="elemento-card">
                <h5>Elemento {elemento.numero}</h5>
                <div className="elemento-inputs">
                  <div className="form-group">
                    <label>Densidade (g/cm³)</label>
                    <input
                      type="text"
                      name="densidade"
                      value={elemento.densidade || ''}
                      onChange={(e) => handleInputChange(e, currentBateria, index)}
                      placeholder="Ex: 1.28"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tensão (V)</label>
                    <input
                      type="text"
                      name="tensao"
                      value={elemento.tensao || ''}
                      onChange={(e) => handleInputChange(e, currentBateria, index)}
                      placeholder="Ex: 2.1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tensão Total e Temperatura */}
        <div className="bateria-section">
          <h4>⚡ Medições Gerais</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Tensão Total (V)</label>
              <input
                type="text"
                name="tensaoTotal"
                value={bateria.tensaoTotal || ''}
                onChange={(e) => handleInputChange(e, currentBateria)}
                placeholder="Ex: 12.6"
              />
            </div>
            <div className="form-group">
              <label>Temperatura (°C)</label>
              <input
                type="text"
                name="temperatura"
                value={bateria.temperatura || ''}
                onChange={(e) => handleInputChange(e, currentBateria)}
                placeholder="Ex: 25"
              />
            </div>
          </div>
        </div>

        {/* Situação Atual */}
        <div className="bateria-section">
          <h4>🔧 Situação Atual dos Componentes</h4>
          <div className="situacao-grid">
            {bateria.situacaoAtual.map((situacao, index) => (
              <div key={situacao.componente} className="situacao-card">
                <h5>{situacao.componente}</h5>
                <div className="form-group">
                  <label>Estado</label>
                  <select
                    name="estado"
                    value={situacao.estado || ''}
                    onChange={(e) => handleInputChange(e, currentBateria, null, index)}
                  >
                    {opcoesEstado.map(opcao => (
                      <option key={opcao} value={opcao}>{opcao}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ações Necessárias</label>
                  <div className="checkbox-group">
                    {opcoesAcoes.map(acao => (
                      <label key={acao} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={situacao.acoes.includes(acao)}
                          onChange={(e) => {
                            const newAcoes = e.target.checked
                              ? [...situacao.acoes, acao]
                              : situacao.acoes.filter(a => a !== acao);
                            
                            setFormData(prev => ({
                              ...prev,
                              baterias: prev.baterias.map((b, i) => 
                                i === currentBateria 
                                  ? {
                                      ...b,
                                      situacaoAtual: b.situacaoAtual.map((s, j) => 
                                        j === index ? { ...s, acoes: newAcoes } : s
                                      )
                                    }
                                  : b
                              )
                            }));
                          }}
                        />
                        {acao}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Observações, Conclusão e Sugestão */}
        <div className="bateria-section">
          <h4>📝 Análise Técnica</h4>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Observações</label>
              <textarea
                name="observacoes"
                value={bateria.observacoes || ''}
                onChange={(e) => handleInputChange(e, currentBateria)}
                rows="4"
                placeholder="Observações sobre o estado geral da bateria..."
              />
            </div>
            <div className="form-group full-width">
              <label>Conclusão</label>
              <textarea
                name="conclusao"
                value={bateria.conclusao || ''}
                onChange={(e) => handleInputChange(e, currentBateria)}
                rows="4"
                placeholder="Conclusão sobre a análise técnica..."
              />
            </div>
            <div className="form-group full-width">
              <label>Sugestão</label>
              <textarea
                name="sugestao"
                value={bateria.sugestao || ''}
                onChange={(e) => handleInputChange(e, currentBateria)}
                rows="4"
                placeholder="Sugestões de manutenção ou substituição..."
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    const bateria = formData.baterias[currentBateria];
    
    return (
      <div className="form-step">
        <div className="bateria-header">
          <h3>📸 Evidências Fotográficas - Bateria {currentBateria + 1}</h3>
          {formData.baterias.length > 1 && (
            <div className="bateria-navigation">
              {formData.baterias.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`bateria-tab ${currentBateria === index ? 'active' : ''}`}
                  onClick={() => setCurrentBateria(index)}
                >
                  Bateria {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="evidencias-section">
          {/* Fotos Antes */}
          <div className="fotos-group">
            <h4>📷 Fotos Antes da Intervenção</h4>
            <div className="upload-area">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e, currentBateria, 'fotosAntes')}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                📁 Selecionar Fotos
              </button>
            </div>
            <div className="fotos-preview">
              {bateria.fotosAntes.map((foto, index) => (
                <div key={foto.id} className="foto-preview">
                  <img src={foto.url} alt={`Antes ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-foto"
                    onClick={() => removePhoto(currentBateria, 'fotosAntes', index)}
                  >
                    ✖️
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Fotos Depois */}
          <div className="fotos-group">
            <h4>📷 Fotos Depois da Intervenção</h4>
            <div className="upload-area">
              <input
                ref={fileInputAfterRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e, currentBateria, 'fotosDepois')}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn-upload"
                onClick={() => fileInputAfterRef.current?.click()}
              >
                📁 Selecionar Fotos
              </button>
            </div>
            <div className="fotos-preview">
              {bateria.fotosDepois.map((foto, index) => (
                <div key={foto.id} className="foto-preview">
                  <img src={foto.url} alt={`Depois ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-foto"
                    onClick={() => removePhoto(currentBateria, 'fotosDepois', index)}
                  >
                    ✖️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="form-step">
      <h3>🔧 Manutenção Realizada</h3>
      
      {/* Manutenção Preventiva */}
      <div className="manutencao-section">
        <h4>🛡️ Manutenção Preventiva</h4>
        <button
          type="button"
          className="btn-primary-small"
          onClick={() => addManutencaoItem('preventiva')}
        >
          ➕ Adicionar Item
        </button>
        
        {formData.manutencaoPreventiva.map((item, index) => (
          <div key={item.id} className="manutencao-item">
            <div className="form-grid">
              <div className="form-group">
                <label>Descrição</label>
                <input
                  type="text"
                  value={item.descricao}
                  onChange={(e) => updateManutencaoItem('preventiva', index, 'descricao', e.target.value)}
                  placeholder="Descreva a manutenção preventiva realizada"
                />
              </div>
              <div className="form-group">
                <label>Observações</label>
                <textarea
                  value={item.observacoes}
                  onChange={(e) => updateManutencaoItem('preventiva', index, 'observacoes', e.target.value)}
                  placeholder="Observações adicionais"
                  rows="3"
                />
              </div>
            </div>
            <button
              type="button"
              className="btn-danger-small"
              onClick={() => removeManutencaoItem('preventiva', index)}
            >
              🗑️ Remover
            </button>
          </div>
        ))}
      </div>

      {/* Manutenção Corretiva */}
      <div className="manutencao-section">
        <h4>🔧 Manutenção Corretiva</h4>
        <button
          type="button"
          className="btn-primary-small"
          onClick={() => addManutencaoItem('corretiva')}
        >
          ➕ Adicionar Item
        </button>
        
        {formData.manutencaoCorretiva.map((item, index) => (
          <div key={item.id} className="manutencao-item">
            <div className="form-grid">
              <div className="form-group">
                <label>Descrição</label>
                <input
                  type="text"
                  value={item.descricao}
                  onChange={(e) => updateManutencaoItem('corretiva', index, 'descricao', e.target.value)}
                  placeholder="Descreva a manutenção corretiva realizada"
                />
              </div>
              <div className="form-group">
                <label>Observações</label>
                <textarea
                  value={item.observacoes}
                  onChange={(e) => updateManutencaoItem('corretiva', index, 'observacoes', e.target.value)}
                  placeholder="Observações adicionais"
                  rows="3"
                />
              </div>
            </div>
            <button
              type="button"
              className="btn-danger-small"
              onClick={() => removeManutencaoItem('corretiva', index)}
            >
              🗑️ Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="form-step">
      <h3>✅ Conclusão Final</h3>
      
      <div className="form-group full-width">
        <label>Conclusão Final do Laudo</label>
        <textarea
          name="conclusaoFinal"
          value={formData.conclusaoFinal}
          onChange={handleInputChange}
          rows="6"
          placeholder="Digite a conclusão final do laudo técnico..."
          style={{ resize: 'vertical', minHeight: '150px' }}
        />
      </div>

      {/* Resumo */}
      <div className="resumo-section">
        <h4>📊 Resumo do Laudo</h4>
        <div className="resumo-grid">
          <div className="resumo-item">
            <strong>Cliente:</strong>
            <span>{formData.nomeCliente || 'Não informado'}</span>
          </div>
          <div className="resumo-item">
            <strong>Data:</strong>
            <span>{formData.data}</span>
          </div>
          <div className="resumo-item">
            <strong>Técnico:</strong>
            <span>{formData.tecnicoResponsavel}</span>
          </div>
          <div className="resumo-item">
            <strong>Número de Baterias:</strong>
            <span>{formData.baterias.length}</span>
          </div>
          <div className="resumo-item">
            <strong>Manutenção Preventiva:</strong>
            <span>{formData.manutencaoPreventiva.length} itens</span>
          </div>
          <div className="resumo-item">
            <strong>Manutenção Corretiva:</strong>
            <span>{formData.manutencaoCorretiva.length} itens</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modern-laudo-form-overlay">
      <div className="modern-laudo-form">
        <div className="form-header">
          <div className="header-content">
            <h2>🔋 Laudo Técnico Avançado - RSM</h2>
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
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}

          <div className="form-actions">
            {currentStep > 1 && (
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={prevStep}
              >
                ← Anterior
              </button>
            )}
            
            {currentStep < 5 ? (
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
                {isSubmitting ? '⏳ Salvando...' : '✅ Criar Laudo Avançado'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioLaudoAvancado; 