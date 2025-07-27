import React from 'react';

/**
 * Formulário para edição dos campos do laudo.
 * Recebe `data` com os valores atuais, `onChange` para atualizar
 * o estado no componente pai e `onSave` para persistir no backend.
 */
function LaudoForm({ data, onChange, onSave }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (typeof onChange === 'function') {
      onChange({ ...data, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onSave === 'function') {
      onSave();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <label>
          Cliente:
          <input
            type="text"
            name="cliente"
            value={data.cliente || ''}
            onChange={handleChange}
          />
        </label>
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <label>
          Equipamento:
          <input
            type="text"
            name="equipamento"
            value={data.equipamento || ''}
            onChange={handleChange}
          />
        </label>
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <label>
          Diagnóstico:
          <textarea
            name="diagnostico"
            value={data.diagnostico || ''}
            onChange={handleChange}
          />
        </label>
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <label>
          Solução:
          <textarea
            name="solucao"
            value={data.solucao || ''}
            onChange={handleChange}
          />
        </label>
      </div>
      <button type="submit">Salvar Laudo</button>
    </form>
  );
}

export default LaudoForm;