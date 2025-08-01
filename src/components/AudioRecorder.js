import React, { useState, useRef } from 'react';
// Utilizamos o cliente de API configurado em ../api para que as requisições
// sejam enviadas ao backend correto (conforme REACT_APP_API_BASE_URL),
// evitando erros quando o frontend roda em uma porta diferente.
import api from '../api';

/**
 * Componente de gravação de áudio.
 *
 * Utiliza a API MediaRecorder do navegador para capturar áudio e envia o
 * arquivo gravado ao backend através de um POST em `/upload-audio`.
 * Se a gravação ou o upload falharem, mensagens de erro são exibidas.
 */
// `onParsed` recebe os campos interpretados do backend
function AudioRecorder({ onParsed }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'info', 'success', 'error'
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      setMessage('Solicitando permissão de áudio...');
      setMessageType('info');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = handleStop;
      mediaRecorder.start();
      setIsRecording(true);
      setMessage('🎤 Gravando... Clique em "Parar Gravação" quando terminar.');
      setMessageType('info');
    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      setMessage('❌ Erro ao acessar microfone. Verifique as permissões do navegador.');
      setMessageType('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setMessage('🔄 Processando áudio...');
      setMessageType('info');
    }
  };

  const handleStop = async () => {
    setIsProcessing(true);
    try {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', blob, 'gravacao.webm');
      
      setMessage('📤 Enviando áudio para processamento...');
      
      // TEMPORÁRIO: Volta para API antiga até resolver o 404
      const res = await api.post('/upload-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const transcription = res.data.transcription;
      
      // Se não há transcrição válida, para aqui
      if (!transcription || transcription.trim() === "" || transcription.includes("Transcrição simulada")) {
        setMessage('⚠️ Não foi possível transcrever o áudio. Tente gravar novamente falando mais claramente.');
        setMessageType('warning');
        return;
      }
      
      // Parse manual com IA
      const parseRes = await api.post('/parse-laudo', {
        transcription: transcription,
      });
      
      const extractedFields = parseRes.data;
      console.log('🎯 Transcrição recebida:', transcription);
      console.log('🎯 Campos extraídos:', extractedFields);
      
      if (transcription && transcription.trim() !== "" && !transcription.includes("Transcrição simulada")) {
        setMessage(`✅ Transcrição: "${transcription}"`);
        setMessageType('success');
        
        // Verificar se há dados válidos extraídos
        const hasValidData = extractedFields && (
          extractedFields.cliente || 
          extractedFields.equipamento || 
          extractedFields.diagnostico || 
          extractedFields.solucao
        );
        
        if (hasValidData) {
          setMessage('✅ Dados extraídos com sucesso! Formulário preenchido automaticamente.');
          if (typeof onParsed === 'function') {
            console.log('🎯 Chamando onParsed com dados:', extractedFields);
            onParsed(extractedFields);
          }
        } else {
          setMessage('⚠️ Nenhum dado específico foi identificado no áudio. Tente falar mais claramente sobre cliente, equipamento, diagnóstico ou solução.');
          setMessageType('warning');
        }
      } else {
        setMessage('⚠️ Não foi possível transcrever o áudio. Tente gravar novamente falando mais claramente.');
        setMessageType('warning');
      }
    } catch (err) {
      console.error('Erro ao processar áudio:', err);
      if (err.response?.status === 401) {
        setMessage('❌ Sessão expirada. Faça login novamente.');
        setMessageType('error');
      } else if (err.response?.data?.detail) {
        setMessage(`❌ Erro: ${err.response.data.detail}`);
        setMessageType('error');
      } else {
        setMessage('❌ Erro ao processar áudio. Tente novamente.');
        setMessageType('error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getMessageStyle = () => {
    const baseStyle = {
      padding: '1rem',
      borderRadius: '10px',
      marginTop: '1rem',
      fontSize: '0.9rem',
      fontWeight: '500'
    };

    switch (messageType) {
      case 'success':
        return {
          ...baseStyle,
          background: 'var(--success-color)',
          color: 'white',
          borderLeft: '4px solid #228B22'
        };
      case 'error':
        return {
          ...baseStyle,
          background: 'var(--error-color)',
          color: 'white',
          borderLeft: '4px solid #B22222'
        };
      default:
        return {
          ...baseStyle,
          background: 'var(--background-secondary)',
          color: 'var(--text-primary)',
          borderLeft: '4px solid var(--accent-color)'
        };
    }
  };

  return (
    <div>
      <div className="audio-controls">
        <button
          className={`record-btn ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          title={isRecording ? 'Parar gravação' : 'Iniciar gravação'}
        >
          {isProcessing ? (
            <>
              <span className="spinner"></span>
              Processando...
            </>
          ) : isRecording ? (
            <>
              ⏹️ Parar Gravação
            </>
          ) : (
            <>
              🎤 Iniciar Gravação
            </>
          )}
      </button>
      </div>

      {message && (
        <div style={getMessageStyle()}>
          {message}
        </div>
      )}

      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'var(--background-primary)',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)'
      }}>
        <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          💡 Dicas para melhor gravação:
        </h4>
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li>Fale claramente e em um ambiente silencioso</li>
          <li>Mantenha o microfone a uma distância adequada</li>
          <li>Descreva o problema do equipamento detalhadamente</li>
          <li>Mencione o cliente e tipo de equipamento</li>
        </ul>
      </div>
    </div>
  );
}

export default AudioRecorder;