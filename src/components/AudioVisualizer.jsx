import React, { useEffect, useRef, useState } from 'react'
import { isAudioPlaying, getCurrentAudioElement, stopAudio, playRandomAudio } from '../utils/audioPlayer'

// Contexto e fonte globais para evitar múltiplas conexões
let globalAudioCtx = null
let globalSource = null
let globalAnalyser = null

export default function AudioVisualizer() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const dataArrayRef = useRef(null)
  const bufferLengthRef = useRef(null)
  const [paused, setPaused] = useState(false)

  // Detectar se é um dispositivo móvel
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Retornar null se for dispositivo móvel para evitar problemas de performance
  if (isMobile) {
    return null;
  }

  useEffect(() => {
    let running = true;
    function draw() {
      if (!running) return;
      const canvas = canvasRef.current;
      const ctx2d = canvas.getContext('2d');
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      if (!paused && globalAnalyser) {
        globalAnalyser.getByteFrequencyData(dataArrayRef.current);
        // Gradiente elegante para as barras
        const gradient = ctx2d.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#00d9ff');
        gradient.addColorStop(0.4, '#00fff7');
        gradient.addColorStop(0.7, '#e322bc');
        gradient.addColorStop(1, '#ffffffcc');
        // Barras ainda mais finas, altura menor, espaçamento mínimo
        const barCount = Math.floor(canvas.width / 7);
        const barWidth = 3.5;
        const barSpacing = 2.5;
        const skip = 2;
        for (let i = 0; i < barCount; i++) {
          const dataIdx = Math.floor((i + skip) * (bufferLengthRef.current / (barCount + skip)));
          let val = dataArrayRef.current[dataIdx];
          if (dataIdx > 0 && dataIdx < bufferLengthRef.current - 1) {
            val = (dataArrayRef.current[dataIdx-1] + dataArrayRef.current[dataIdx] + dataArrayRef.current[dataIdx+1]) / 3;
          }
          // Sensibilidade e altura reduzida
          const barHeight = Math.max(1.5, val * 2.7);
          ctx2d.save();
          // Glow mais sutil nas barras mais altas
          if (barHeight > canvas.height * 0.7) {
            ctx2d.shadowColor = '#00fff7bb';
            ctx2d.shadowBlur = 8;
          } else if (barHeight > canvas.height * 0.45) {
            ctx2d.shadowColor = '#e322bc88';
            ctx2d.shadowBlur = 5;
          } else {
            ctx2d.shadowColor = '#00d9ff44';
            ctx2d.shadowBlur = 3;
          }
          ctx2d.globalAlpha = 0.88;
          ctx2d.fillStyle = gradient;
          // Barras arredondadas
          const x = i * (barWidth + barSpacing);
          const y = canvas.height - barHeight;
          const radius = barWidth / 1.5;
          ctx2d.beginPath();
          ctx2d.moveTo(x + radius, y);
          ctx2d.lineTo(x + barWidth - radius, y);
          ctx2d.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
          ctx2d.lineTo(x + barWidth, y + barHeight - radius);
          ctx2d.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - radius, y + barHeight);
          ctx2d.lineTo(x + radius, y + barHeight);
          ctx2d.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
          ctx2d.lineTo(x, y + radius);
          ctx2d.quadraticCurveTo(x, y, x + radius, y);
          ctx2d.closePath();
          ctx2d.fill();
          // Reflexo ainda mais sutil
          if (barHeight > canvas.height * 0.5) {
            ctx2d.globalAlpha = 0.10;
            ctx2d.fillStyle = '#fff';
            ctx2d.fillRect(x + 0.5, y + 1, barWidth - 1, Math.min(4, barHeight / 4));
          }
          ctx2d.restore();
        }
      }
      animationRef.current = requestAnimationFrame(draw);
    }

    function setup() {
      const audio = getCurrentAudioElement();
      if (audio) {
        if (!globalAudioCtx) {
          globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (!globalSource || globalSource.mediaElement !== audio) {
          try {
            globalSource = globalAudioCtx.createMediaElementSource(audio);
          } catch (e) {
            // Já existe uma fonte para esse elemento
          }
        }
        if (!globalAnalyser) {
          globalAnalyser = globalAudioCtx.createAnalyser();
          if (globalSource && typeof globalSource.connect === 'function') {
            try {
              globalSource.connect(globalAnalyser);
            } catch (e) {
              // já conectado
            }
          }
          globalAnalyser.connect(globalAudioCtx.destination);
          globalAnalyser.fftSize = 64;
        }
        bufferLengthRef.current = globalAnalyser.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLengthRef.current);
      }
      draw();
    }

    setup();

    return () => {
      running = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      // Não fechar o contexto global para evitar erro ao remount
    };
  }, [paused]);

  // Visualizador fixo no rodapé, VU meter moderno, com botão de pause
  return (
    <div style={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      zIndex: 9999,
      pointerEvents: 'none',
      background: 'rgba(10,18,32,0.18)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      // boxShadow removido
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      padding: '0 0 4px 0',
      transition: 'background 0.3s',
    }}>
      <div style={{
        width: window.innerWidth < 600 ? '98vw' : '95vw',
        maxWidth: 700,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        pointerEvents: 'auto',
      }}>
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerWidth < 600 ? 14 : 20}
          style={{
            width: '100%',
            height: window.innerWidth < 600 ? 14 : 20,
            background: 'transparent',
            borderRadius: 10,
            transition: 'height 0.2s, width 0.2s',
            display: 'block',
            boxShadow: '0 1px 8px #00d9ff11',
          }}
        />
        {/* Botão de pause/play neon minimalista */}
        <button
          onClick={() => {
            const audio = getCurrentAudioElement();
            if (paused) {
              setPaused(false);
              if (audio) {
                audio.play();
              } else {
                playRandomAudio();
              }
            } else {
              setPaused(true);
              if (audio) {
                audio.pause();
              } else {
                stopAudio();
              }
            }
          }}
          style={{
            position: 'absolute',
            right: 2,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'linear-gradient(135deg, #00d9ff 60%, #e322bc 100%)',
            border: 'none',
            borderRadius: '50%',
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 10,
            boxShadow: '0 0 4px #00d9ff77, 0 0 2px #e322bc44',
            outline: 'none',
            transition: 'box-shadow 0.2s',
          }}
          tabIndex={0}
          aria-label={paused ? 'Tocar música' : 'Pausar música'}
        >
          {paused ? (
            // Play icon SVG
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><polygon points="3,2 13,8 3,14" fill="#fff"/></svg>
          ) : (
            // Pause icon SVG
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="3" height="12" rx="1" fill="#fff"/><rect x="10" y="2" width="3" height="12" rx="1" fill="#fff"/></svg>
          )}
        </button>
      </div>
    </div>
  );
}
