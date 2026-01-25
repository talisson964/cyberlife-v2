import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';
import './ProductImageUploader.css';

/**
 * Componente para upload de múltiplas imagens de produtos
 * Suporta até 9 imagens com validação e preview
 * 
 * @param {Array} images - Array de objetos de imagem {url, order, file}
 * @param {Function} onChange - Callback quando as imagens mudam
 * @param {Number} maxImages - Número máximo de imagens (padrão: 9)
 */
const ProductImageUploader = ({ images = [], onChange, maxImages = 9 }) => {
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Especificações de validação
  const VALIDATION = {
    maxSize: 2 * 1024 * 1024, // 2MB
    maxSizeMB: 2,
    acceptedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    recommendedWidth: 1200,
    recommendedHeight: 1200,
    minWidth: 600,
    minHeight: 600,
  };

  /**
   * Valida uma imagem antes do upload
   */
  const validateImage = (file) => {
    return new Promise((resolve, reject) => {
      // Validar formato
      if (!VALIDATION.acceptedFormats.includes(file.type)) {
        reject(`Formato inválido. Use: JPG, PNG ou WEBP`);
        return;
      }

      // Validar tamanho
      if (file.size > VALIDATION.maxSize) {
        reject(`Imagem muito grande. Máximo: ${VALIDATION.maxSizeMB}MB`);
        return;
      }

      // Validar dimensões
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        
        if (img.width < VALIDATION.minWidth || img.height < VALIDATION.minHeight) {
          reject(`Resolução muito baixa. Mínimo: ${VALIDATION.minWidth}x${VALIDATION.minHeight}px`);
          return;
        }

        resolve({
          file,
          width: img.width,
          height: img.height,
          size: file.size,
          preview: URL.createObjectURL(file)
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject('Erro ao carregar imagem');
      };

      img.src = objectUrl;
    });
  };

  /**
   * Processa arquivos selecionados
   */
  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    const newErrors = [];

    // Verificar limite de imagens
    if (images.length + fileArray.length > maxImages) {
      newErrors.push(`Máximo de ${maxImages} imagens permitidas`);
      setErrors(newErrors);
      return;
    }

    // Validar e processar cada arquivo
    const validatedImages = [];
    for (const file of fileArray) {
      try {
        const validatedImage = await validateImage(file);
        validatedImages.push({
          file: validatedImage.file,
          preview: validatedImage.preview,
          order: images.length + validatedImages.length + 1,
          uploaded: false // Ainda não foi feito upload para o Supabase
        });
      } catch (error) {
        newErrors.push(`${file.name}: ${error}`);
      }
    }

    setErrors(newErrors);

    if (validatedImages.length > 0) {
      onChange([...images, ...validatedImages]);
    }
  };

  /**
   * Handler para input file
   */
  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFiles(files);
    }
    // Resetar input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  /**
   * Handlers para drag and drop
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  /**
   * Remove uma imagem
   */
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    // Reordenar
    const reordered = newImages.map((img, i) => ({ ...img, order: i + 1 }));
    onChange(reordered);
  };

  /**
   * Reordena imagens (drag and drop entre thumbnails)
   */
  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    // Atualizar ordem
    const reordered = newImages.map((img, i) => ({ ...img, order: i + 1 }));
    onChange(reordered);
  };

  return (
    <div className="product-image-uploader">
      <div className="uploader-header">
        <h3>📸 Imagens do Produto</h3>
        <span className="image-count">
          {images.length} / {maxImages}
        </span>
      </div>

      {/* Área de informações */}
      <div className="upload-info">
        <div className="info-item">
          <Check size={16} />
          <span>Formatos: JPG, PNG, WEBP</span>
        </div>
        <div className="info-item">
          <Check size={16} />
          <span>Tamanho máx: {VALIDATION.maxSizeMB}MB por imagem</span>
        </div>
        <div className="info-item">
          <Check size={16} />
          <span>Resolução recomendada: {VALIDATION.recommendedWidth}x{VALIDATION.recommendedHeight}px</span>
        </div>
        <div className="info-item">
          <Check size={16} />
          <span>Mínimo: {VALIDATION.minWidth}x{VALIDATION.minHeight}px</span>
        </div>
      </div>

      {/* Erros */}
      {errors.length > 0 && (
        <div className="upload-errors">
          {errors.map((error, index) => (
            <div key={index} className="error-item">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Grid de previews */}
      {images.length > 0 && (
        <div className="images-preview-grid">
          {images.map((image, index) => (
            <div
              key={index}
              className="preview-item"
              draggable
              onDragStart={(e) => e.dataTransfer.setData('imageIndex', index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('imageIndex'));
                moveImage(fromIndex, index);
              }}
            >
              <img
                src={image.preview || image.url}
                alt={`Preview ${index + 1}`}
                loading="lazy"
                decoding="async"
              />
              <div className="preview-overlay">
                <span className="image-order">#{image.order}</span>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeImage(index)}
                  title="Remover imagem"
                >
                  <X size={16} />
                </button>
              </div>
              {image.uploaded && (
                <div className="upload-badge">
                  <Check size={12} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Área de upload */}
      {images.length < maxImages && (
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={VALIDATION.acceptedFormats.join(',')}
            multiple
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
          <Upload size={48} />
          <h4>Arraste imagens aqui</h4>
          <p>ou clique para selecionar</p>
          <small>Você pode adicionar até {maxImages - images.length} imagem(ns)</small>
        </div>
      )}

      {images.length >= maxImages && (
        <div className="upload-limit-reached">
          <AlertCircle size={20} />
          <span>Limite de {maxImages} imagens atingido</span>
        </div>
      )}
    </div>
  );
};

export default ProductImageUploader;
