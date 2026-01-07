import React, { useState, useRef } from 'react';
import { validateGLBFile } from '../utils/gltfProcessor';
import './Model3DUploader.css';

const Model3DUploader = ({ onModelChange, currentModel = null, maxSizeMB = 20 }) => {
  const [model3D, setModel3D] = useState(currentModel);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const fileInputRef = useRef(null);

  // Validar arquivo .glb com suporte Draco
  const validateModel = async (file) => {
    setIsValidating(true);
    setValidationError('');
    setModelInfo(null);

    // Validar tipo
    if (!file.name.toLowerCase().endsWith('.glb')) {
      setValidationError('❌ Apenas arquivos .glb são permitidos');
      setIsValidating(false);
      return false;
    }

    // Validar tamanho (em MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setValidationError(`❌ Arquivo muito grande! Máximo: ${maxSizeMB}MB (Atual: ${fileSizeMB.toFixed(2)}MB)`);
      setIsValidating(false);
      return false;
    }

    // Validação avançada com GLTFLoader e DRACOLoader
    try {
      const validationResult = await validateGLBFile(file, {
        maxSizeMB: maxSizeMB,
        requireDracoCompression: false,
        maxTriangles: 500000
      });

      if (!validationResult.valid) {
        setValidationError(`❌ ${validationResult.error}`);
        setIsValidating(false);
        return false;
      }

      // Armazenar informações do modelo
      setModelInfo(validationResult.details);
      setIsValidating(false);
      return true;

    } catch (error) {
      setValidationError('❌ Erro ao validar modelo 3D: ' + error.message);
      setIsValidating(false);
      return false;
    }
  };

  // Processar arquivo
  const handleFile = async (file) => {
    if (!file) return;

    const isValid = await validateModel(file);
    if (!isValid) return;

    // Criar preview (URL temporária)
    const modelUrl = URL.createObjectURL(file);
    
    setModel3D({
      file,
      preview: modelUrl,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
    });

    // Notificar componente pai
    if (onModelChange) {
      onModelChange(file);
    }
  };

  // Eventos de drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Evento de seleção de arquivo
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Remover modelo
  const handleRemove = () => {
    if (model3D?.preview) {
      URL.revokeObjectURL(model3D.preview);
    }
    setModel3D(null);
    setValidationError('');
    if (onModelChange) {
      onModelChange(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Abrir seletor de arquivos
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="model-3d-uploader">
      <div className="model-3d-uploader-header">
        <h4>🎮 Modelo 3D (.glb)</h4>
        <span className="model-3d-info">Opcional - Permite visualização 360° do produto</span>
      </div>

      <div
        className={`model-3d-drop-zone ${isDragging ? 'dragging' : ''} ${validationError ? 'error' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {isValidating ? (
          <div className="model-3d-validating">
            <div className="spinner"></div>
            <p>Analisando modelo 3D com Draco...</p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
              Verificando geometria, texturas e compressão
            </p>
          </div>
        ) : model3D ? (
          <div className="model-3d-preview">
            <div className="model-3d-icon">🎯</div>
            <div className="model-3d-details">
              <p className="model-3d-name">{model3D.name}</p>
              <p className="model-3d-size">{model3D.size}</p>
              {modelInfo && (
                <div className="model-3d-stats">
                  <p>📊 {modelInfo.meshCount} meshes | {modelInfo.triangleCount?.toFixed(0)} triângulos</p>
                  <p>🎨 {modelInfo.materialCount} materiais | {modelInfo.textureCount} texturas</p>
                  <p>{modelInfo.compressionStatus}</p>
                  <p>⭐ Score: {modelInfo.optimizationScore}/100</p>
                </div>
              )}
            </div>
            <button
              type="button"
              className="model-3d-remove"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="model-3d-placeholder">
            <div className="model-3d-upload-icon">📦</div>
            <p className="model-3d-title">
              {isDragging ? 'Solte o arquivo aqui' : 'Clique ou arraste um modelo 3D'}
            </p>
            <p className="model-3d-specs">
              Formato: .glb | Tamanho máximo: {maxSizeMB}MB
            </p>
            <p className="model-3d-recommendation">
              💡 Recomendado: Modelos otimizados com menos de 10MB
            </p>
          </div>
        )}
      </div>

      {validationError && (
        <div className="model-3d-error">
          {validationError}
        </div>
      )}

      <div className="model-3d-guidelines">
        <p><strong>📋 Diretrizes para melhor resultado:</strong></p>
        <ul>
          <li>✅ Use apenas formato .glb (GL Transmission Format Binary)</li>
          <li>✅ Otimize o modelo: remova geometria desnecessária</li>
          <li>✅ Comprima texturas (use resolução máxima de 2048x2048)</li>
          <li>✅ Ideal: 5-10MB | Máximo: {maxSizeMB}MB</li>
          <li>✅ Centralize o modelo no eixo 0,0,0</li>
          <li>🔥 <strong>Use compressão Draco para reduzir até 90% do tamanho</strong></li>
          <li>📦 Suporte automático a modelos compactados com Draco</li>
          <li>⚠️ Modelos muito grandes podem demorar para carregar</li>
        </ul>
      </div>
    </div>
  );
};

export default Model3DUploader;
