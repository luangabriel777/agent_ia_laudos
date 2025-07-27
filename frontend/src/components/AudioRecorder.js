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
  const [message, setMessage] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = handleStop;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setMessage('Erro ao iniciar gravação de áudio');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleStop = async () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', blob, 'gravacao.webm');
    try {
      // Envia o áudio gravado para o backend usando o cliente `api`. Note que
      // definimos o cabeçalho Content-Type como multipart/form-data para que
      // o servidor receba corretamente o arquivo.
      const res = await api.post('/upload-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const transcription = res.data.transcription;
      setMessage(`Transcrição: ${transcription}`);

      // Envia a transcrição para o endpoint de parsing
      const parseRes = await api.post('/parse-laudo', {
        transcription,
      });

      if (typeof onParsed === 'function') {
        onParsed(parseRes.data);
      }
    } catch (err) {
      console.error(err);
      setMessage('Erro ao enviar áudio para o servidor');
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Parar gravação' : 'Iniciar gravação'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AudioRecorder;