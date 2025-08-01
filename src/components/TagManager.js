import React, { useState } from 'react';
import api from '../api';

const TagManager = ({ laudoId, currentTag, onTagUpdate }) => {
  const [tag, setTag] = useState(currentTag || '');
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const predefinedTags = [
    'Urgente',
    'Crítico',
    'Importante',
    'Manutenção',
    'Venda',
    'Reparo',
    'Preventiva',
    'Corretiva',
    'Garantia',
    'Prioridade'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tag.trim()) {
      setMessage('Por favor, insira uma tag');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await api.post(`/laudos/${laudoId}/tag`, {
        laudo_id: laudoId,
        tag: tag.trim(),
        description: description.trim() || null
      });

      setMessage('✅ Tag adicionada com sucesso! Todos os usuários foram notificados.');
      setDescription('');
      
      // Notificar o componente pai
      if (onTagUpdate) {
        onTagUpdate(response.data);
      }

      // Fechar o modal após 2 segundos
      setTimeout(() => {
        setIsOpen(false);
        setMessage('');
      }, 2000);

    } catch (error) {
      console.error('Erro ao adicionar tag:', error);
      setMessage('❌ Erro ao adicionar tag. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const selectPredefinedTag = (predefinedTag) => {
    setTag(predefinedTag);
  };

  return (
    <div className="tag-manager">
      {!isOpen ? (
        <button 
          className="btn-add-tag"
          onClick={() => setIsOpen(true)}
          title="Adicionar tag"
        >
          {currentTag ? `🏷️ ${currentTag}` : '🏷️ Adicionar Tag'}
        </button>
      ) : (
        <div className="tag-modal">
          <div className="tag-modal-content">
            <div className="tag-modal-header">
              <h3>🏷️ Adicionar Tag ao Laudo #{laudoId}</h3>
              <button 
                className="btn-close"
                onClick={() => setIsOpen(false)}
                disabled={loading}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="tag-form">
              <div className="form-group">
                <label>Tag:</label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Digite ou selecione uma tag"
                  maxLength={50}
                  required
                />
              </div>

              <div className="predefined-tags">
                <label>Tags Predefinidas:</label>
                <div className="tags-grid">
                  {predefinedTags.map((predefinedTag) => (
                    <button
                      key={predefinedTag}
                      type="button"
                      className={`tag-option ${tag === predefinedTag ? 'selected' : ''}`}
                      onClick={() => selectPredefinedTag(predefinedTag)}
                    >
                      {predefinedTag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Descrição (opcional):</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição adicional da tag..."
                  maxLength={200}
                  rows={3}
                />
              </div>

              {message && (
                <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}

              <div className="tag-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-save-tag"
                  disabled={loading || !tag.trim()}
                >
                  {loading ? 'Adicionando...' : 'Adicionar Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager; 