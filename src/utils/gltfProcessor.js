/**
 * Processador de modelos 3D GLB/GLTF
 * Suporta descompactação Draco e validação de modelos
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

/**
 * Valida se um arquivo GLB é válido
 * @param {ArrayBuffer} arrayBuffer - Buffer do arquivo
 * @returns {boolean}
 */
export function isValidGLB(arrayBuffer) {
  if (arrayBuffer.byteLength < 12) {
    return false;
  }

  const view = new DataView(arrayBuffer);
  const magic = view.getUint32(0, true);
  
  // Magic number para GLB: 0x46546C67 ("glTF" em little-endian)
  return magic === 0x46546C67;
}

/**
 * Extrai informações de um arquivo GLB
 * @param {ArrayBuffer} arrayBuffer - Buffer do arquivo
 * @returns {Object} Informações do modelo
 */
export function getGLBInfo(arrayBuffer) {
  if (!isValidGLB(arrayBuffer)) {
    throw new Error('Arquivo GLB inválido');
  }

  const view = new DataView(arrayBuffer);
  const version = view.getUint32(4, true);
  const length = view.getUint32(8, true);

  return {
    version,
    size: arrayBuffer.byteLength,
    sizeKB: (arrayBuffer.byteLength / 1024).toFixed(2),
    sizeMB: (arrayBuffer.byteLength / (1024 * 1024)).toFixed(2),
    isValid: true
  };
}

/**
 * Carrega e processa modelo GLB usando Three.js GLTFLoader com suporte Draco
 * @param {File|Blob} file - Arquivo GLB
 * @param {Function} onProgress - Callback de progresso (opcional)
 * @returns {Promise<Object>} Modelo processado
 */
export async function loadGLBWithDraco(file, onProgress = null) {
  return new Promise(async (resolve, reject) => {
    try {
      // Criar loaders
      const dracoLoader = new DRACOLoader();
      
      // Configurar path do decoder Draco (CDN do Google)
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
      dracoLoader.setDecoderConfig({ type: 'js' });
      dracoLoader.preload();

      const gltfLoader = new GLTFLoader();
      gltfLoader.setDRACOLoader(dracoLoader);

      // Converter File para URL
      const url = URL.createObjectURL(file);

      // Carregar modelo
      gltfLoader.load(
        url,
        // onLoad
        (gltf) => {
          URL.revokeObjectURL(url);
          dracoLoader.dispose();

          // Calcular informações do modelo
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const size = new THREE.Vector3();
          box.getSize(size);

          const info = {
            scene: gltf.scene,
            animations: gltf.animations,
            meshCount: 0,
            triangleCount: 0,
            vertexCount: 0,
            materialCount: 0,
            textureCount: 0,
            hasDracoCompression: false,
            boundingBox: {
              width: size.x.toFixed(2),
              height: size.y.toFixed(2),
              depth: size.z.toFixed(2)
            }
          };

          // Contar recursos
          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              info.meshCount++;
              
              if (child.geometry) {
                const geometry = child.geometry;
                
                // Verificar se tem compressão Draco
                if (geometry.attributes.position && geometry.attributes.position.isInterleavedBufferAttribute) {
                  info.hasDracoCompression = true;
                }
                
                // Contar vértices
                if (geometry.attributes.position) {
                  info.vertexCount += geometry.attributes.position.count;
                }
                
                // Contar triângulos
                if (geometry.index) {
                  info.triangleCount += geometry.index.count / 3;
                } else if (geometry.attributes.position) {
                  info.triangleCount += geometry.attributes.position.count / 3;
                }
              }
              
              if (child.material) {
                info.materialCount++;
                
                // Contar texturas
                if (Array.isArray(child.material)) {
                  child.material.forEach(mat => {
                    if (mat.map) info.textureCount++;
                  });
                } else {
                  if (child.material.map) info.textureCount++;
                  if (child.material.normalMap) info.textureCount++;
                  if (child.material.roughnessMap) info.textureCount++;
                  if (child.material.metalnessMap) info.textureCount++;
                }
              }
            }
          });

          resolve({
            success: true,
            data: gltf,
            info
          });
        },
        // onProgress
        (xhr) => {
          if (onProgress && xhr.lengthComputable) {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            onProgress(percentComplete);
          }
        },
        // onError
        (error) => {
          URL.revokeObjectURL(url);
          dracoLoader.dispose();
          reject({
            success: false,
            error: 'Erro ao carregar modelo GLB: ' + error.message
          });
        }
      );
    } catch (error) {
      reject({
        success: false,
        error: 'Erro ao inicializar loaders: ' + error.message
      });
    }
  });
}

/**
 * Valida e analisa arquivo GLB antes do upload
 * @param {File} file - Arquivo GLB
 * @param {Object} options - Opções de validação
 * @returns {Promise<Object>} Resultado da validação
 */
export async function validateGLBFile(file, options = {}) {
  const {
    maxSizeMB = 20,
    requireDracoCompression = false,
    maxTriangles = 500000
  } = options;

  try {
    // Validar tamanho
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return {
        valid: false,
        error: `Arquivo muito grande: ${sizeMB.toFixed(2)}MB (máx: ${maxSizeMB}MB)`,
        details: { sizeMB }
      };
    }

    // Ler arquivo como ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Validar formato GLB
    if (!isValidGLB(arrayBuffer)) {
      return {
        valid: false,
        error: 'Arquivo GLB inválido ou corrompido',
        details: null
      };
    }

    // Extrair informações básicas
    const basicInfo = getGLBInfo(arrayBuffer);

    // Carregar com Three.js para análise detalhada
    const loadResult = await loadGLBWithDraco(file);

    if (!loadResult.success) {
      return {
        valid: false,
        error: loadResult.error,
        details: null
      };
    }

    const { info } = loadResult;

    // Validar compressão Draco se requerido
    if (requireDracoCompression && !info.hasDracoCompression) {
      return {
        valid: false,
        error: 'Modelo não possui compressão Draco',
        details: info
      };
    }

    // Validar contagem de triângulos
    if (info.triangleCount > maxTriangles) {
      return {
        valid: false,
        error: `Modelo muito complexo: ${info.triangleCount.toFixed(0)} triângulos (máx: ${maxTriangles})`,
        details: info
      };
    }

    // Modelo válido
    return {
      valid: true,
      message: 'Modelo GLB válido e otimizado',
      details: {
        ...basicInfo,
        ...info,
        compressionStatus: info.hasDracoCompression ? 'Draco Comprimido ✅' : 'Sem Compressão ⚠️',
        optimizationScore: calculateOptimizationScore(info, sizeMB)
      }
    };

  } catch (error) {
    return {
      valid: false,
      error: 'Erro ao validar arquivo: ' + error.message,
      details: null
    };
  }
}

/**
 * Calcula score de otimização do modelo (0-100)
 * @param {Object} info - Informações do modelo
 * @param {number} sizeMB - Tamanho em MB
 * @returns {number} Score de otimização
 */
function calculateOptimizationScore(info, sizeMB) {
  let score = 100;

  // Penalizar tamanho grande
  if (sizeMB > 10) score -= 20;
  if (sizeMB > 15) score -= 20;

  // Penalizar muitos triângulos
  if (info.triangleCount > 100000) score -= 15;
  if (info.triangleCount > 250000) score -= 15;

  // Bonificar compressão Draco
  if (info.hasDracoCompression) score += 10;

  // Penalizar muitas texturas
  if (info.textureCount > 5) score -= 10;
  if (info.textureCount > 10) score -= 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Exporta modelo processado de volta para GLB
 * @param {Object} gltfData - Dados GLTF processados
 * @returns {Promise<Blob>} Arquivo GLB
 */
export async function exportToGLB(gltfData) {
  try {
    return new Promise((resolve, reject) => {
      const exporter = new GLTFExporter();
      
      exporter.parse(
        gltfData.scene,
        (result) => {
          const blob = new Blob([result], { type: 'model/gltf-binary' });
          resolve(blob);
        },
        (error) => {
          reject(error);
        },
        { binary: true }
      );
    });
  } catch (error) {
    throw new Error('Erro ao exportar GLB: ' + error.message);
  }
}
