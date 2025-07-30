import React, { useState, useRef, useEffect } from 'react';
import api from '../api';

// === SISTEMA DE LOGGING PROFISSIONAL ===
const Logger = {
  isDevelopment: process.env.NODE_ENV === 'development',
  
  debug: (message, data = null) => {
    if (Logger.isDevelopment) {
      console.log(`🔧 [DEBUG] ${message}`, data || '');
    }
  },
  
  info: (message, data = null) => {
    if (Logger.isDevelopment) {
      console.log(`ℹ️ [INFO] ${message}`, data || '');
    }
  },
  
  warn: (message, data = null) => {
    console.warn(`⚠️ [WARN] ${message}`, data || '');
  },
  
  error: (message, error = null) => {
    console.error(`❌ [ERROR] ${message}`, error || '');
  }
};

function ContinuousAudioRecorder({ onClose }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [extractedFields, setExtractedFields] = useState({});
  const [processedChunks, setProcessedChunks] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const recordingIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunks.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        processAudioChunk(audioBlob, true);
      };
      
      setIsRecording(true);
      setProcessedChunks(0);
      setTotalChunks(0);
      
      // Iniciar gravação
      mediaRecorderRef.current.start();
      
      // Processar chunks a cada 3 segundos
      recordingIntervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          
          setTimeout(() => {
            if (isRecording) {
              mediaRecorderRef.current.start();
            }
          }, 100);
        }
      }, 3000);
      
      Logger.info('Gravação contínua iniciada com sucesso');
      
    } catch (err) {
      Logger.error('Erro ao iniciar gravação', err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    Logger.info('Gravação finalizada');
  };

  const processAudioChunk = async (blob, isFinal = false) => {
    if (!blob || blob.size === 0) {
      Logger.warn('Chunk de áudio vazio, ignorando processamento');
      return;
    }

    setIsProcessing(true);
    setTotalChunks(prev => prev + 1);
    
    const formData = new FormData();
    formData.append('file', blob, 'audio_chunk.webm');
    formData.append('isFinal', isFinal.toString());

    try {
      Logger.debug('Enviando chunk para processamento', {
        size: `${blob.size} bytes`,
        chunk: processedChunks + 1,
        isFinal: isFinal,
        format: blob.type
      });

      const res = await api.post('/audio-to-laudo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Logger.debug('Resposta do backend recebida', {
        status: res.status,
        hasTranscription: !!res.data?.transcription,
        hasFields: !!res.data?.campos
      });

      if (res.data?.transcription) {
        const newTranscription = res.data.transcription;
        const extractedFields = res.data.campos || {};
        
        if (newTranscription && newTranscription.trim().length > 0) {
          Logger.debug('Transcrição processada com sucesso', {
            transcription: newTranscription.substring(0, 50) + '...',
            fieldsCount: Object.keys(extractedFields).length
          });
          
          setTranscription(prev => {
            const updated = prev ? `${prev} ${newTranscription}` : newTranscription;
            Logger.info('Transcrição atualizada', { length: updated.length });
            return updated;
          });
          
          setExtractedFields(prev => ({
            ...prev,
            ...extractedFields
          }));
        } else {
          Logger.warn('Transcrição vazia recebida, ignorando');
        }
      }

      setProcessedChunks(prev => prev + 1);

    } catch (err) {
      Logger.error('Erro ao processar chunk de áudio', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyFields = () => {
    if (Object.keys(extractedFields).length === 0) {
      Logger.warn('Nenhum campo extraído para aplicar');
      return;
    }
    
    Logger.info('Aplicando campos extraídos', extractedFields);
    
    // Aplicar aos campos do formulário
    Object.entries(extractedFields).forEach(([key, value]) => {
      if (value && value.trim()) {
        const input = document.querySelector(`input[name="${key}"], textarea[name="${key}"]`);
        if (input) {
          input.value = value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          Logger.debug(`Campo ${key} preenchido com: ${value}`);
        }
      }
    });
    
    onClose();
  };

  return (
    <div className="continuous-recorder-overlay">
      <div className="continuous-recorder-modal">
        <div className="recorder-header">
          <h3>🎤 Gravação Contínua com IA</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="recorder-content">
          <div className="recording-controls">
            {!isRecording ? (
              <button 
                className="start-recording-btn"
                onClick={startRecording}
              >
                🎙️ Iniciar Gravação
              </button>
            ) : (
              <button 
                className="stop-recording-btn"
                onClick={stopRecording}
              >
                ⏹️ Parar Gravação
              </button>
            )}
          </div>

          {isRecording && (
            <div className="recording-status">
              <div className="recording-indicator">
                <span className="pulse-dot"></span>
                Gravando...
              </div>
              
              <div className="processing-stats">
                <p>📊 Chunks processados: {processedChunks}/{totalChunks}</p>
                {isProcessing && <p>🔄 Processando áudio...</p>}
              </div>
            </div>
          )}

          {transcription && (
            <div className="transcription-section">
              <h4>📝 Transcrição:</h4>
              <div className="transcription-text">
                {transcription}
              </div>
            </div>
          )}

          {Object.keys(extractedFields).length > 0 && (
            <div className="extracted-fields">
              <h4>🎯 Campos Extraídos:</h4>
              <div className="fields-preview">
                {Object.entries(extractedFields).map(([key, value]) => (
                  value && (
                    <div key={key} className="field-item">
                      <strong>{key}:</strong> {value}
                    </div>
                  )
                ))}
              </div>
              
              <button 
                className="apply-fields-btn"
                onClick={handleApplyFields}
              >
                ✅ Aplicar Campos no Formulário
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContinuousAudioRecorder;

// ✅ CORREÇÃO: Estilos para modo modal
const modalStyles = `
.continuous-recorder-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.continuous-recorder-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  position: relative;
}

.recorder-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #1B365D 0%, #6366F1 100%);
  color: white;
}

.recorder-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.recorder-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.recording-controls {
  margin-bottom: 2rem;
  text-align: center;
}

.start-recording-btn,
.stop-recording-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.start-recording-btn {
  background: linear-gradient(135deg, #EF4444, #DC2626);
  color: white;
}

.start-recording-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.stop-recording-btn {
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: white;
}

.stop-recording-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.recording-status {
  margin-top: 2rem;
  text-align: center;
  width: 100%;
}

.recording-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.pulse-dot {
  width: 10px;
  height: 10px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.processing-stats {
  font-size: 0.875rem;
  color: #6b7280;
}

.transcription-section {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  width: 100%;
}

.transcription-section h4 {
  margin: 0 0 1rem 0;
  color: #374151;
}

.transcription-text {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  max-height: 200px;
  overflow-y: auto;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap; /* Preserve line breaks */
}

.extracted-fields {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  width: 100%;
}

.extracted-fields h4 {
  margin: 0 0 1rem 0;
  color: #374151;
}

.fields-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px; /* Limit height for preview */
  overflow-y: auto;
}

.field-item {
  background: #e0f2fe;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1e40af;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-item strong {
  color: #1e40af;
}

.apply-fields-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #10B981, #047857);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.apply-fields-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.apply-fields-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .continuous-recorder-modal {
    max-width: 90%;
  }
}
`;

// Injetar estilos
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = modalStyles;
  if (!document.head.querySelector('style[data-continuous-recorder-modal]')) {
    styleElement.setAttribute('data-continuous-recorder-modal', 'true');
    document.head.appendChild(styleElement);
  }
} 